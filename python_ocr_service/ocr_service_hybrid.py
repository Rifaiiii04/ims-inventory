#!/usr/bin/env python3
import json
import traceback
import os
import re
import time
import logging
from typing import List, Dict, Optional, Tuple
from flask import Flask, request, jsonify
import numpy as np
import cv2
from datetime import datetime
import uuid
import requests
from PIL import Image
from dotenv import load_dotenv
import pathlib

try:
    from rapidfuzz import process, fuzz
    rapidfuzz_available = True
except ImportError:
    rapidfuzz_available = False
    logging.warning("rapidfuzz not installed; fuzzy matching disabled")

env_path = pathlib.Path(__file__).parent.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()

log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("ocr_service")
logger.info("Environment variables loaded")
LOG_OCR_OUTPUT = os.getenv('LOG_OCR_OUTPUT', 'true').lower() == 'true'

try:
    from PIL import Image
    if not hasattr(Image, 'ANTIALIAS'):
        Image.ANTIALIAS = Image.LANCZOS
        logger.info("Pillow 10+ detected: Patched ANTIALIAS to LANCZOS")
except (ImportError, AttributeError) as e:
    logger.warning("Could not patch PIL.Image.ANTIALIAS: %s", e)

logger.info("Initializing EasyOCR...")
easyocr_available = False
easyocr_reader = None

try:
    import easyocr
    try:
        logger.info("Loading EasyOCR models...")
        easyocr_reader = easyocr.Reader(['en', 'id'], gpu=False)
        easyocr_available = True
        logger.info("EasyOCR initialized successfully")
    except Exception as e:
        logger.error("EasyOCR initialization error: %s", e)
        easyocr_available = False
except ImportError as e:
    logger.error("easyocr not installed: %s", e)
    easyocr_available = False
except Exception as e:
    logger.error("EasyOCR initialization error: %s", e)
    easyocr_available = False

if not easyocr_available:
    logger.warning("EasyOCR not available - service will not work properly")

OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434/api/generate')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'gemma3:1b')
AUTO_ACCEPT_THRESHOLD = float(os.getenv('AUTO_ACCEPT_THRESHOLD', '85'))
ASK_LLM_THRESHOLD = float(os.getenv('ASK_LLM_THRESHOLD', '60'))
RAPIDFUZZ_TOPK = int(os.getenv('RAPIDFUZZ_TOPK', '5'))
MAX_LLM_CALLS = int(os.getenv('MAX_LLM_CALLS', '8'))
PRODUCT_CATALOG_PATH = os.getenv('PRODUCT_CATALOG_PATH')
USE_FULLTEXT_CLASSIFIER = os.getenv('USE_FULLTEXT_CLASSIFIER', 'true').lower() == 'true'

DEFAULT_CATALOG = [
    "Semangka", "Melon", "Nangka", "Jambu", "Mangga", "Apel", "Salak",
    "Lengkeng", "Pisang", "Nanas", "Rambutan", "Masako", "Ketumbar",
    "Kecap", "Saos", "Cuka", "Kerupuk", "Mie Instan", "Minyak Goreng",
    "Tepung Kanji", "Indofood", "Hot Lava", "ABC Kecap", "ABC Saos"
]
PRODUCT_CATALOG: List[str] = []


def load_catalog():
    global PRODUCT_CATALOG
    if PRODUCT_CATALOG_PATH and os.path.exists(PRODUCT_CATALOG_PATH):
        try:
            with open(PRODUCT_CATALOG_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
            if isinstance(data, list):
                PRODUCT_CATALOG = [str(item) for item in data if item]
            else:
                PRODUCT_CATALOG = DEFAULT_CATALOG
            logger.info("Loaded %s products from %s", len(PRODUCT_CATALOG), PRODUCT_CATALOG_PATH)
            return
        except Exception as exc:
            logger.warning("Failed to load catalog from %s: %s", PRODUCT_CATALOG_PATH, exc)
    PRODUCT_CATALOG = DEFAULT_CATALOG
    logger.info("Using default catalog with %s entries", len(PRODUCT_CATALOG))


load_catalog()

def get_ollama_config():
    return {
        'url': OLLAMA_URL,
        'model': OLLAMA_MODEL
    }

def is_ollama_available():
    try:
        config = get_ollama_config()
        base_url = config['url'].rsplit('/', 1)[0]
        tags_url = base_url + '/tags'
        resp = requests.get(tags_url, timeout=3)
        return resp.status_code == 200
    except Exception as e:
        logger.warning("Ollama check failed: %s", e)
        return False

logger.info("Initializing Ollama AI...")
if is_ollama_available():
    config = get_ollama_config()
    logger.info("Ollama initialized successfully at %s (model %s)", config['url'], config['model'])
else:
    logger.warning("Ollama not available at configured URL %s model %s", OLLAMA_URL, OLLAMA_MODEL)

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def save_image(image_file):
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        filename = f"receipt_{timestamp}_{unique_id}.jpg"
        image_path = os.path.join(UPLOAD_FOLDER, filename)
        image_file.seek(0)
        image_file.save(image_path)
        logger.info("Image saved: %s", image_path)
        return image_path, filename
    except Exception as e:
        logger.error("Error saving image: %s", e)
        return None, None

def clean_ocr_text(text):
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text.strip())


def generic_cleanup(text: str) -> str:
    if not text:
        return ""
    cleaned = text
    replacements = {
        'Ouu': '000',
        '0uv': '000',
        'Ouv': '000',
        'Ooo': '000',
        'Bks.': 'Bks',
        'Klg': 'Kg',
        'K9': 'Kg',
        'kg': 'Kg'
    }
    for needle, repl in replacements.items():
        cleaned = re.sub(needle, repl, cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'(?<=\d)[lI](?=\d)', '1', cleaned)
    cleaned = cleaned.replace('_', ' ').replace('-', ' - ')
    cleaned = cleaned.replace("(", " ").replace(")", " ")
    cleaned = cleaned.replace("'", "")
    cleaned = cleaned.replace("`", "")
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned.strip()


def strip_price_tokens(text: str) -> str:
    if not text:
        return ""
    cleaned = re.sub(r'(Rp|RP)\s*[\.:]?\s*\d[\d\s\.,-]*', ' ', text, flags=re.IGNORECASE)
    cleaned = re.sub(r'\d+\s?-\s?\d+d', ' ', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\d+\s?(?:000|00|0uv|Ouu)\b', ' ', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\d+(?:[.,]\d+)*', ' ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned.strip()


def _normalize_price_digits(value: str) -> Optional[int]:
    digits = re.sub(r'[^0-9]', '', value.replace('O', '0').replace('o', '0'))
    if not digits:
        return None
    try:
        amount = int(digits)
        if amount < 100 and len(digits) <= 2:
            return amount * 1000
        return amount
    except ValueError:
        return None


PRICE_PATTERNS = [
    ("rp", re.compile(r'(?:Rp|RP)\s*[\.:]?\s*([\d\.\,\s]+)', re.IGNORECASE)),
    ("range_d", re.compile(r'(\d+)\s?-\s?(\d+)d', re.IGNORECASE)),
    ("suffix_thousand", re.compile(r'(\d+)[\s\-]?(?:Ouu|0uv|000)', re.IGNORECASE)),
    ("plain", re.compile(r'(\d{4,})'))
]


def extract_harga_from_text(text: str) -> Optional[int]:
    if not text:
        return None
    for key, pattern in PRICE_PATTERNS:
        match = pattern.search(text)
        if match:
            if key == "range_d":
                left, right = match.groups()
                zeros = 2 if len(right) <= 2 else 0
                merged = f"{left}{right}{'0' * zeros}"
                amount = _normalize_price_digits(merged)
            elif key == "suffix_thousand":
                digits = match.group(1) + "000"
                amount = _normalize_price_digits(digits)
            else:
                amount = _normalize_price_digits(match.group(1))
            if amount and amount >= 100:
                return amount
    digits = re.findall(r'\d{3,}', text)
    if digits:
        candidate = _normalize_price_digits(digits[-1])
        if candidate and candidate >= 100:
            return candidate
    return None


UNIT_KEYWORDS = [
    'kg', 'g', 'gr', 'ons', 'liter', 'ltr', 'ml', 'bks', 'btl', 'pcs',
    'pack', 'pak', 'dus', 'box', 'ikat', 'sachet', 'sct', 'bal', 'karung'
]

DIGIT_PATTERN = re.compile(r'\d')


def extract_qty_from_text(text: str) -> int:
    if not text:
        return 1
    pattern = re.compile(r'(\d+)\s*(%s)\b' % "|".join(UNIT_KEYWORDS), re.IGNORECASE)
    match = pattern.search(text)
    if match:
        try:
            qty = int(match.group(1))
            if 1 <= qty <= 100:
                return qty
        except ValueError:
            pass
    leading = re.match(r'^\s*(\d+)\b', text)
    if leading:
        try:
            qty = int(leading.group(1))
            if 1 <= qty <= 100:
                return qty
        except ValueError:
            pass
    return 1


def extract_unit_from_text(text: str, qty: int) -> str:
    if not text:
        return f"{qty} pcs"
    pattern = re.compile(r'(\d+)\s*(%s)\b' % "|".join(UNIT_KEYWORDS), re.IGNORECASE)
    match = pattern.search(text)
    if match:
        unit = match.group(2).lower()
        value = match.group(1)
        return f"{value} {unit}"
    return f"{qty} pcs"


SKIP_LINE_PREFIXES = [
    'total', 'tuan', 'toko', 'nota', 'banyak', 'nama', 'barang', 'harga',
    'jumlah', 'lemon8', '@maisaspb', 'kokobit', 'odinala', 'warning',
    'torch', 'userwarning', 'perhatian', 'barang-barang', 'hormat kami'
]


def resolve_line(line: str,
                 llm_state: Dict[str, int],
                 cleaned_line: Optional[str] = None,
                 harga_override: Optional[int] = None) -> Optional[Dict]:
    if not line:
        return None
    original = line.strip()
    if len(original) < 3:
        return None
    lower = original.lower()
    if any(lower.startswith(prefix) for prefix in SKIP_LINE_PREFIXES):
        return None

    cleaned_line = cleaned_line or generic_cleanup(original)
    harga = harga_override if harga_override is not None else extract_harga_from_text(cleaned_line)
    if harga is None or harga < 100:
        return None
    qty = extract_qty_from_text(cleaned_line)
    unit = extract_unit_from_text(cleaned_line, qty)
    nama_candidate = clean_nama_barang(cleaned_line)

    if not nama_candidate or len(nama_candidate) < 2 or nama_candidate.isdigit():
        return None

    candidates = match_product_to_catalog(nama_candidate)
    result_candidates = [
        {'name': cand['name'], 'score': round(cand['score'], 2)}
        for cand in candidates[:3]
    ]

    resolved_name = nama_candidate
    resolved_by = 'user'
    confidence = 0.4

    if candidates:
        top = candidates[0]
        if top['score'] >= AUTO_ACCEPT_THRESHOLD:
            resolved_name = top['name']
            resolved_by = 'auto'
            confidence = round(top['score'] / 100.0, 2)
        elif top['score'] >= ASK_LLM_THRESHOLD:
            idx = llm_select_candidate(original, candidates[:RAPIDFUZZ_TOPK], llm_state)
            if idx is not None:
                chosen = candidates[idx]
                resolved_name = chosen['name']
                resolved_by = 'llm'
                confidence = round(0.7 * (chosen['score'] / 100.0) + 0.3, 2)
            else:
                resolved_by = 'user'
                confidence = 0.4
        else:
            resolved_name = nama_candidate

    result = {
        'nama_barang': resolved_name,
        'jumlah': qty,
        'harga': harga,
        'unit': unit,
        'category_id': 1,
        'minStock': 10,
        'confidence': confidence,
        'resolved_by': resolved_by
    }

    if result_candidates:
        result['candidates'] = result_candidates
    return result


def match_product_to_catalog(name: str, top_k: Optional[int] = None) -> List[Dict]:
    if not rapidfuzz_available or not PRODUCT_CATALOG:
        return []
    if not name:
        return []
    limit = top_k or RAPIDFUZZ_TOPK
    try:
        results = process.extract(name, PRODUCT_CATALOG, scorer=fuzz.WRatio, limit=limit)
        return [
            {"name": result[0], "score": float(result[1])}
            for result in results
        ]
    except Exception as exc:
        logger.warning("Fuzzy matching error: %s", exc)
        return []


def llm_select_candidate(noisy_input: str, candidates: List[Dict], llm_state: Dict[str, int]) -> Optional[int]:
    if llm_state.get('count', 0) >= MAX_LLM_CALLS:
        logger.warning("LLM call limit (%s) reached; skipping LLM selection", MAX_LLM_CALLS)
        return None
    if not candidates:
        return None

    candidate_lines = "\n".join(
        f"{idx + 1}. {cand['name']}"
        for idx, cand in enumerate(candidates)
    )
    prompt = f"""Tugasmu memilih kandidat terbaik yang cocok dengan teks OCR.

Noisy line:
\"\"\"{noisy_input}\"\"\"

Kandidat:
{candidate_lines}

Instruksi:
- Jawab SATU ANGKA saja (1..{len(candidates)}) yang paling cocok.
- Jawab 0 jika tidak ada yang cocok.
- Jangan tambahkan kata lain, penjelasan, atau tanda baca."""

    response = call_ollama_api(
        prompt,
        timeout=25,
        options={'temperature': 0.0, 'top_p': 0.1, 'top_k': 10, 'num_predict': 128}
    )
    if response is None:
        return None

    match = re.search(r'-?\d+', response)
    if not match:
        return None
    choice = int(match.group())
    if choice == 0:
        return None
    if 1 <= choice <= len(candidates):
        llm_state['count'] = llm_state.get('count', 0) + 1
        return choice - 1
    return None

def clean_nama_barang(name: str) -> str:
    cleaned = strip_price_tokens(generic_cleanup(name))
    cleaned = re.sub(r'\b(?:rr|rp|total|jumlah|nota|tuan|toko)\b', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'^\b(?:bks|btl|bt|pkt|pcs|slop|dus|pack)\b', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'[^\w\s\-]', ' ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned.title()

def group_text_by_rows(text_results, tolerance=15):
    if not text_results:
        return []
    
    sorted_results = sorted(text_results, key=lambda x: (x[0][0][1] + x[0][2][1]) / 2)
    rows = []
    current_row = []
    current_y = None
    
    for result in sorted_results:
        bbox = result[0]
        text = result[1]
        center_y = (bbox[0][1] + bbox[2][1]) / 2
        
        if current_y is None or abs(center_y - current_y) <= tolerance:
            current_row.append((bbox, text, result[2], center_y))
            current_y = center_y
        else:
            if current_row:
                rows.append(current_row)
            current_row = [(bbox, text, result[2], center_y)]
            current_y = center_y
    
    if current_row:
        rows.append(current_row)
    
    return rows


def build_lines_from_results(text_results, tolerance=15):
    filtered_results = [item for item in text_results if item[2] > 0.2]
    if not filtered_results:
        return []
    rows = group_text_by_rows(filtered_results, tolerance=tolerance)
    lines = []
    for row in rows:
        row_sorted = sorted(row, key=lambda x: x[0][0][0])
        row_text = " ".join([clean_ocr_text(item[1]) for item in row_sorted])
        if row_text.strip() and len(row_text.strip()) > 1:
            lines.append(row_text.strip())
    return lines


def generate_preprocessed_variants(original_img):
    variants = [('original', original_img)]
    gray = cv2.cvtColor(original_img, cv2.COLOR_BGR2GRAY)
    gray_bgr = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
    variants.append(('gray', gray_bgr))
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)
    variants.append(('clahe', cv2.cvtColor(clahe, cv2.COLOR_GRAY2BGR)))
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 25, 6
    )
    variants.append(('thresh', cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)))
    return variants

def extract_text_with_easyocr(image_file):
    try:
        if not easyocr_available or easyocr_reader is None:
            logger.error("EasyOCR not available")
            return []
        
        image_file.seek(0)
        image_bytes = image_file.read()
        image_file.seek(0)
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        original_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if original_img is None:
            logger.error("Failed to decode image for OCR")
            return []
        
        best_lines = []
        best_digit_lines = -1
        selected_variant = None
        for variant_name, variant_img in generate_preprocessed_variants(original_img):
            logger.info("EasyOCR text extraction running (%s)", variant_name)
            text_results = easyocr_reader.readtext(
                variant_img,
                detail=1,
                paragraph=False,
                width_ths=0.7,
                height_ths=0.7
            )
            if not text_results:
                continue
            variant_lines = build_lines_from_results(text_results, tolerance=18)
            digit_lines = sum(1 for line in variant_lines if DIGIT_PATTERN.search(line))
            logger.info(
                "Variant %s produced %s lines (%s with digits)",
                variant_name, len(variant_lines), digit_lines
            )
            if digit_lines > best_digit_lines or (digit_lines == best_digit_lines and len(variant_lines) > len(best_lines)):
                best_digit_lines = digit_lines
                best_lines = variant_lines
                selected_variant = variant_name
            if digit_lines >= 6:
                break
        
        if not best_lines:
            logger.warning("EasyOCR returned no usable text")
            return []

        logger.info(
            "EasyOCR produced %s text lines using variant %s",
            len(best_lines),
            selected_variant
        )
        if LOG_OCR_OUTPUT:
            logger.info("=== EasyOCR Lines ===")
            for i, text in enumerate(best_lines, 1):
                logger.info("%s. %s", i, text)
            logger.info("=== End of EasyOCR Lines ===")
        
        return best_lines

    except Exception as e:
        logger.error("EasyOCR error: %s", e)
        traceback.print_exc()
        return []

def call_ollama_api(prompt: str, timeout: int = 30, options: Optional[Dict] = None) -> Optional[str]:
    try:
        config = get_ollama_config()
        logger.debug("Calling Ollama (timeout %ss)", timeout)
        start_time = time.time()

        base_options = {
            'num_predict': 1000,
            'temperature': 0.2,
            'top_p': 0.9,
            'top_k': 40,
        }
        if options:
            base_options.update(options)

        response = requests.post(
            config['url'],
            json={
                'model': config['model'],
                'prompt': prompt,
                'stream': False,
                'options': base_options
            },
            timeout=timeout
        )

        elapsed = time.time() - start_time
        logger.debug("Ollama response received in %.2fs", elapsed)

        if response.status_code == 200:
            result = response.json()
            return result.get('response', '').strip()
        else:
            error_text = response.text
            logger.error("Ollama API error %s: %s", response.status_code, error_text)
            if "memory" in error_text.lower() or "GiB" in error_text:
                logger.warning("Memory error detected from Ollama response")
            return None
    except requests.exceptions.Timeout:
        logger.warning("Ollama API timeout after %ss", timeout)
        return None
    except requests.exceptions.ConnectionError:
        logger.error("Ollama connection error")
        return None
    except Exception as e:
        logger.error("Ollama API call error: %s", e)
        return None


def extract_json_block(text: str) -> Optional[str]:
    if not text:
        return None
    cleaned = text.strip()
    if '```json' in cleaned:
        start = cleaned.find('```json') + 7
        end = cleaned.rfind('```')
        cleaned = cleaned[start:end].strip() if end > start else cleaned
    elif '```' in cleaned:
        start = cleaned.find('```') + 3
        end = cleaned.rfind('```')
        cleaned = cleaned[start:end].strip() if end > start else cleaned
    first = cleaned.find('[')
    last = cleaned.rfind(']')
    if first != -1 and last != -1 and last > first:
        return cleaned[first:last + 1]
    return None


def classify_fulltext_with_ollama(text_list: List[str]) -> List[Dict]:
    if not text_list:
        return []
    try:
        combined_text = "\n".join(f"{idx + 1}. {line}" for idx, line in enumerate(text_list))
        
        # Tahap 1: Rapihkan text OCR
        prompt_clean = f"""Tugas: Rapihkan dan normalisasi hasil OCR struk belanja berikut.

Instruksi:
- Perbaiki typo dan karakter terpecah menjadi kata yang benar (bahasa Indonesia)
- Hapus karakter acak, simbol tidak perlu, dan watermark
- Gabungkan baris yang terpisah jika merupakan 1 item yang sama
- Normalisasi format angka (O→0, titik/koma dihapus untuk harga)
- Output: Text yang sudah rapih, baris per baris, tanpa penjelasan tambahan

DATA OCR:
{combined_text}

Output text yang sudah rapih:"""
        
        logger.info("Tahap 1: Normalisasi text OCR (%s lines)", len(text_list))
        cleaned_response = call_ollama_api(
            prompt_clean,
            timeout=50,
            options={'num_predict': 1200, 'temperature': 0.1, 'top_p': 0.3, 'top_k': 20}
        )
        if not cleaned_response:
            logger.warning("Tahap 1 (normalisasi) gagal, menggunakan text asli")
            cleaned_text = combined_text
        else:
            cleaned_text = cleaned_response.strip()
            logger.debug("Text setelah normalisasi: %s", cleaned_text[:200])
        
        # Tahap 2: Ekstrak JSON dari text yang sudah rapih
        prompt_json = f"""Tugas: Ekstrak semua item belanja dari text struk yang sudah rapih menjadi JSON array.

Instruksi:
- Identifikasi SEMUA item yang memiliki harga (minimal 100)
- Untuk setiap item, ekstrak: nama_barang, jumlah, satuan, harga
- Harga harus integer rupiah (tanpa titik/koma)
- Jumlah minimal 1, satuan default "1 pcs" jika tidak jelas
- Output HANYA JSON array, tanpa penjelasan apapun

Format output:
[
  {{"nama_barang":"Nama item","jumlah":1,"satuan":"1 kg","harga":12000}},
  ...
]

TEXT YANG SUDAH RAPIH:
{cleaned_text}

JSON array:"""
        
        logger.info("Tahap 2: Ekstraksi JSON dari text normalisasi")
        response = call_ollama_api(
            prompt_json,
            timeout=50,
            options={'num_predict': 1200, 'temperature': 0.0, 'top_p': 0.2, 'top_k': 10}
        )
        if not response:
            logger.warning("Tahap 2 (ekstraksi JSON) gagal")
            return []
        
        json_block = extract_json_block(response)
        if not json_block:
            logger.warning("Response tahap 2 tidak mengandung JSON block")
            return []
        try:
            parsed = json.loads(json_block)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse fulltext LLM JSON: %s", exc)
            return []

        items = []
        for entry in parsed:
            nama_raw = entry.get('nama_barang') or entry.get('nama_bahan_baku') or entry.get('nama') or ''
            nama = clean_nama_barang(str(nama_raw))
            if not nama or len(nama) < 2:
                continue

            harga_value = entry.get('harga')
            if isinstance(harga_value, str):
                harga_value = _normalize_price_digits(harga_value)
            elif isinstance(harga_value, (int, float)):
                harga_value = int(harga_value)
            else:
                harga_value = extract_harga_from_text(str(harga_value))
            if not harga_value or harga_value < 100:
                continue

            jumlah_value = entry.get('jumlah', 1)
            if isinstance(jumlah_value, str):
                digits = re.findall(r'\d+', jumlah_value)
                jumlah_value = int(digits[0]) if digits else 1
            elif isinstance(jumlah_value, (int, float)):
                jumlah_value = int(jumlah_value)
            else:
                jumlah_value = 1
            jumlah_value = max(1, min(jumlah_value, 999))

            satuan_raw = entry.get('satuan') or entry.get('unit')
            satuan_clean = ""
            if satuan_raw:
                unit_match = re.match(r'(\d+)\s*(\w+)', str(satuan_raw))
                if unit_match:
                    satuan_clean = f"{unit_match.group(1)} {unit_match.group(2)}"
            if not satuan_clean:
                satuan_clean = f"{jumlah_value} pcs"

            candidates = match_product_to_catalog(nama)
            resolved_name = nama
            resolved_by = 'llm_fulltext'
            confidence = 0.85
            if candidates:
                top = candidates[0]
                if top['score'] >= AUTO_ACCEPT_THRESHOLD:
                    resolved_name = top['name']
                    resolved_by = 'auto'
                    confidence = min(0.95, top['score'] / 100.0)
                elif top['score'] >= ASK_LLM_THRESHOLD:
                    resolved_name = top['name']
                    resolved_by = 'llm_fulltext'
                    confidence = 0.7 * (top['score'] / 100.0) + 0.2

            item = {
                'nama_barang': resolved_name,
                'jumlah': jumlah_value,
                'harga': harga_value,
                'unit': satuan_clean,
                'category_id': 1,
                'minStock': 10,
                'confidence': round(confidence, 2),
                'resolved_by': resolved_by
            }
            if candidates:
                item['candidates'] = [
                    {'name': cand['name'], 'score': round(cand['score'], 2)}
                    for cand in candidates[:3]
                ]
            items.append(item)

        if LOG_OCR_OUTPUT and items:
            logger.info("=== Fulltext LLM Items ===")
            for item in items:
                logger.info(
                    "- %s | harga=%s | qty=%s | unit=%s",
                    item['nama_barang'], item['harga'], item['jumlah'], item['unit']
                )
            logger.info("=== End of Fulltext LLM Items ===")
        return items
    except Exception as exc:
        logger.error("Fulltext classification error: %s", exc)
        traceback.print_exc()
        return []

def classify_per_line(text_list: List[str]) -> List[Dict]:
    llm_state = {'count': 0}
    items = []
    pending_price = None
    for line in text_list:
        if not line or len(line.strip()) < 2:
            continue
        cleaned_line = generic_cleanup(line)
        lower_line = cleaned_line.lower()
        if any(lower_line.startswith(prefix) for prefix in SKIP_LINE_PREFIXES):
            continue

        price_in_line = extract_harga_from_text(cleaned_line)
        stripped = strip_price_tokens(cleaned_line)
        if price_in_line and len(stripped) <= 2:
            pending_price = price_in_line
            continue

        item = resolve_line(
            line,
            llm_state,
            cleaned_line=cleaned_line,
            harga_override=pending_price if pending_price is not None else price_in_line
        )
        pending_price = None
        if not item:
            continue
        items.append(item)

    logger.info("Resolved %s items (%s LLM calls)", len(items), llm_state.get('count', 0))
    if LOG_OCR_OUTPUT:
        if items:
            logger.info("=== Resolved Items ===")
            for item in items:
                logger.info(
                    "- %s | harga=%s | qty=%s | unit=%s | by=%s | conf=%.2f",
                    item['nama_barang'],
                    item['harga'],
                    item['jumlah'],
                    item['unit'],
                    item.get('resolved_by'),
                    item.get('confidence', 0.0)
                )
            logger.info("=== End of Resolved Items ===")
        else:
            logger.warning("No items resolved from per-line pipeline")
    return items


def classify_with_ollama(text_list):
    try:
        if not text_list:
            return []
        if USE_FULLTEXT_CLASSIFIER:
            fulltext_items = classify_fulltext_with_ollama(text_list)
            if fulltext_items:
                return fulltext_items
            logger.warning("Fulltext classifier returned no items, falling back to per-line mode")
        return classify_per_line(text_list)
    except Exception as exc:
        logger.error("Classification error: %s", exc)
        traceback.print_exc()
        return []

def parse_receipt_text_fallback(text_list):
    try:
        if not text_list:
            return []

        logger.info("Running fallback parsing")
        items = []

        pending_price = None
        for line in text_list:
            if not line or len(line.strip()) < 3:
                continue
            cleaned_line = generic_cleanup(line)
            lower_line = cleaned_line.lower()
            if any(lower_line.startswith(prefix) for prefix in SKIP_LINE_PREFIXES):
                continue

            price_in_line = extract_harga_from_text(cleaned_line)
            stripped = strip_price_tokens(cleaned_line)
            if price_in_line and len(stripped) <= 2:
                pending_price = price_in_line
                continue

            harga = pending_price if pending_price is not None else price_in_line
            pending_price = None
            if harga is None or harga < 100:
                continue

            qty = extract_qty_from_text(cleaned_line)
            unit = extract_unit_from_text(cleaned_line, qty)
            nama = clean_nama_barang(cleaned_line)
            if not nama or len(nama) < 2:
                continue

            items.append({
                'nama_barang': nama,
                'jumlah': qty,
                'harga': harga,
                'unit': unit,
                'category_id': 1,
                'minStock': 10,
                'confidence': 0.3,
                'resolved_by': 'fallback'
            })

        logger.info("Fallback parsing found %s items", len(items))
        return items

    except Exception as e:
        logger.error("Fallback parse error: %s", e)
        return []

def process_image_hybrid(image_file):
    try:
        start_time = time.time()
        
        image_path, saved_filename = save_image(image_file)
        if not image_path:
            return []

        if not easyocr_available:
            logger.error("EasyOCR not available")
            return []
        
        logger.info("Step 1: EasyOCR text extraction")
        text_list = extract_text_with_easyocr(image_file)
        ocr_time = time.time() - start_time
        logger.info("OCR extraction took %.2fs", ocr_time)
        
        if not text_list:
            logger.warning("No text found by EasyOCR")
            return []
        
        logger.info("Step 2: classification on %s lines", len(text_list))
        ollama_start = time.time()
        result_json = classify_with_ollama(text_list)
        if not result_json:
            logger.warning("Classifier returned no items, running fallback parser")
            result_json = parse_receipt_text_fallback(text_list)
        ollama_time = time.time() - ollama_start
        total_time = time.time() - start_time
        
        logger.info("Classification time %.2fs, total processing %.2fs", ollama_time, total_time)
        
        return result_json if result_json else []

    except Exception as e:
        logger.error("OCR processing error: %s", e)
        traceback.print_exc()
        return []

@app.route('/process-photo', methods=['POST'])
def process_photo():
    try:
        if 'image' not in request.files:
            return jsonify({"success": False, "error": "No image file provided"}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({"success": False, "error": "No image file selected"}), 400
        
        if not easyocr_available:
            logger.warning("EasyOCR not available for incoming request")
        
        logger.info("Processing uploaded image %s", image_file.filename)
        result = process_image_hybrid(image_file)
        logger.info("Extracted %s items", len(result))
        
        if not result:
            return jsonify({
                "success": False,
                "error": "No items found",
                "message": "Tidak ada item yang ditemukan dalam foto."
            }), 200
        
        return jsonify({
            "success": True,
            "data": {
                "items": result
            }
        })
        
    except Exception as e:
        logger.error("process_photo error: %s", e)
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": str(e),
            "message": "Terjadi kesalahan saat memproses gambar."
        }), 500

@app.route('/process-receipt', methods=['POST'])
def process_receipt():
    return process_photo()

@app.route('/health', methods=['GET'])
def health():
    easyocr_status = "ready" if easyocr_available else "not_available"
    ollama_status = "ready" if is_ollama_available() else "not_available"
    config = get_ollama_config()
    
    return jsonify({
        "status": "healthy", 
        "message": "OCR service is running (EasyOCR + Ollama AI)",
        "easyocr": easyocr_status,
        "easyocr_engine": "EasyOCR (high accuracy)" if easyocr_status == "ready" else None,
        "ollama": ollama_status,
        "ollama_url": config['url'],
        "ollama_model": config['model']
    })

@app.route('/test-ollama', methods=['GET'])
def test_ollama():
    try:
        if not is_ollama_available():
            config = get_ollama_config()
            return jsonify({
                "success": False,
                "error": f"Ollama not available at {config['url']}"
            }), 400
        
        result_text = call_ollama_api("Hello, are you working?")
        if result_text:
            return jsonify({
                "success": True,
                "message": "Ollama AI is working",
                "response": result_text
            })
        else:
            return jsonify({
                "success": False,
                "error": "Ollama API returned no response"
            }), 500
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    logger.info("Starting OCR Service (EasyOCR + Ollama AI)")
    logger.info("Service endpoints: process-photo, health, test-ollama")

    if not easyocr_available:
        logger.warning("EasyOCR not available! Install via pip install easyocr")
    else:
        logger.info("EasyOCR initialized successfully")

    config = get_ollama_config()
    if not is_ollama_available():
        logger.warning("Ollama not available at %s (model %s)", config['url'], config['model'])
    else:
        logger.info("Ollama ready at %s with model %s", config['url'], config['model'])

    app.run(host='0.0.0.0', port=5000, debug=False)
