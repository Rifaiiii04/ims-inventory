#!/usr/bin/env python3
import json
import traceback
import os
import re
import time
from flask import Flask, request, jsonify, send_file
import numpy as np
import cv2
from datetime import datetime
import uuid
import requests
from PIL import Image
import io
import base64

from dotenv import load_dotenv
import pathlib

env_path = pathlib.Path(__file__).parent.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
    print(f"✓ Loaded .env from: {env_path}")
else:
    load_dotenv()
    print("✓ Loaded .env from current directory (or using system environment variables)")
try:
    from PIL import Image
    if not hasattr(Image, 'ANTIALIAS'):
        Image.ANTIALIAS = Image.LANCZOS
        print("Pillow 10+ detected: Patched ANTIALIAS to LANCZOS")
except (ImportError, AttributeError) as e:
    print(f"Warning: Could not patch PIL.Image.ANTIALIAS: {e}")

print("Initializing EasyOCR...")
easyocr_available = False
easyocr_reader = None

try:
    import easyocr
    
    try:
        print("Loading EasyOCR models (first time may take a while)...")
        easyocr_reader = easyocr.Reader(['en', 'id'], gpu=False)  # English + Indonesian
        easyocr_available = True
        print("✓ EasyOCR initialized successfully!")
        print("  Engine: EasyOCR (high accuracy)")
        print("  Languages: English, Indonesian")
    except Exception as e:
        print(f"⚠️  EasyOCR initialization error: {e}")
        print("\nPlease install EasyOCR:")
        print("  pip install easyocr")
        easyocr_available = False
except ImportError as e:
    print(f"⚠️  easyocr not installed: {e}")
    print("\nPlease install: pip install easyocr")
    easyocr_available = False
except Exception as e:
    print(f"⚠️  EasyOCR initialization error: {e}")
    easyocr_available = False

if not easyocr_available:
    print("\n⚠️  EasyOCR not available - service will not work properly")

# Ollama configuration
OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434/api/generate')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'gemma3:1b')

def get_ollama_config():
    """Get Ollama configuration"""
    return {
        'url': OLLAMA_URL,
        'model': OLLAMA_MODEL
    }

def is_ollama_available():
    """Check if Ollama is available by calling /api/tags (lebih ringan & cepat)"""
    try:
        config = get_ollama_config()
        # Pakai GET ke /api/tags, bukan POST /api/generate (lebih ringan)
        # Dari http://localhost:11434/api/generate -> http://localhost:11434/api/tags
        base_url = config['url'].rsplit('/', 1)[0]  # Remove '/generate'
        tags_url = base_url + '/tags'
        
        resp = requests.get(tags_url, timeout=3)
        return resp.status_code == 200
    except Exception as e:
        print(f"⚠️  Ollama check failed: {e}")
        return False

print("Initializing Ollama AI...")
if is_ollama_available():
    config = get_ollama_config()
    print(f"✓ Ollama initialized successfully!")
    print(f"  URL: {config['url']}")
    print(f"  Model: {config['model']}")
else:
    print("⚠️  Ollama not available at configured URL")
    print(f"  URL: {OLLAMA_URL}")
    print(f"  Model: {OLLAMA_MODEL}")
    print("  Please make sure Ollama is running and the model is installed")

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def save_image(image_file):
    """Save uploaded image"""
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        filename = f"receipt_{timestamp}_{unique_id}.jpg"
        image_path = os.path.join(UPLOAD_FOLDER, filename)
        image_file.seek(0)
        image_file.save(image_path)
        print(f"Image saved: {image_path}")
        return image_path, filename
    except Exception as e:
        print(f"Error saving image: {e}")
        return None, None

def preprocess_method_1(image_file):
    """Preprocess method 1: OTSU Thresholding"""
    try:
        image_file.seek(0)
        image_bytes = image_file.read()
        image_file.seek(0)
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return None
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return thresh
    except Exception as e:
        print(f"Preprocess method 1 error: {e}")
        return None

def preprocess_method_2(image_file):
    """Preprocess method 2: Adaptive Thresholding"""
    try:
        image_file.seek(0)
        image_bytes = image_file.read()
        image_file.seek(0)
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return None
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Denoise first
        denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        # Adaptive threshold
        adaptive = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                        cv2.THRESH_BINARY, 11, 2)
        return adaptive
    except Exception as e:
        print(f"Preprocess method 2 error: {e}")
        return None

def preprocess_method_3(image_file):
    """Preprocess method 3: Contrast Enhancement + OTSU"""
    try:
        image_file.seek(0)
        image_bytes = image_file.read()
        image_file.seek(0)
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return None
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(gray)
        # OTSU threshold
        _, thresh = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return thresh
    except Exception as e:
        print(f"Preprocess method 3 error: {e}")
        return None

def preprocess_method_4(image_file):
    """Preprocess method 4: Morphological operations"""
    try:
        image_file.seek(0)
        image_bytes = image_file.read()
        image_file.seek(0)
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return None
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Denoise
        denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        # Morphological operations to enhance text
        kernel = np.ones((2,2), np.uint8)
        morph = cv2.morphologyEx(denoised, cv2.MORPH_CLOSE, kernel)
        # OTSU
        _, thresh = cv2.threshold(morph, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return thresh
    except Exception as e:
        print(f"Preprocess method 4 error: {e}")
        return None

def preprocess_method_5(image_file):
    """Preprocess method 5: Inverted image (for dark text on light background)"""
    try:
        image_file.seek(0)
        image_bytes = image_file.read()
        image_file.seek(0)
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return None
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Invert if needed (light text on dark background)
        # Check if image is mostly dark
        mean_intensity = np.mean(gray)
        if mean_intensity < 127:
            gray = cv2.bitwise_not(gray)
        
        blur = cv2.GaussianBlur(gray, (3, 3), 0)
        _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return thresh
    except Exception as e:
        print(f"Preprocess method 5 error: {e}")
        return None

def clean_ocr_text(text):
    """Clean and normalize OCR text"""
    if not text:
        return ""
    
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text.strip())
    
    return text

def group_text_by_rows(text_results, tolerance=10):
    """Group text segments by their Y position (same row)"""
    if not text_results:
        return []
    
    # Sort by Y position (top to bottom)
    sorted_results = sorted(text_results, key=lambda x: (x[0][0][1] + x[0][2][1]) / 2)
    
    rows = []
    current_row = []
    current_y = None
    
    for result in sorted_results:
        bbox = result[0]
        text = result[1]
        confidence = result[2]
        
        # Calculate center Y
        center_y = (bbox[0][1] + bbox[2][1]) / 2
        
        if current_y is None or abs(center_y - current_y) <= tolerance:
            # Same row
            current_row.append((bbox, text, confidence, center_y))
            current_y = center_y
        else:
            # New row
            if current_row:
                rows.append(current_row)
            current_row = [(bbox, text, confidence, center_y)]
            current_y = center_y
    
    if current_row:
        rows.append(current_row)
    
    return rows

def extract_text_with_easyocr(image_file):
    """Extract text using EasyOCR with preprocessing and post-processing"""
    try:
        # Check if EasyOCR is available
        if not easyocr_available or easyocr_reader is None:
            print("ERROR: EasyOCR not available!")
            return []
            
        image_file.seek(0)
        
        print("\n=== Step 1: EasyOCR Text Extraction with Preprocessing ===")
        
        # Load image
        image_file.seek(0)
        image_bytes = image_file.read()
        image_file.seek(0)
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        original_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if original_img is None:
            print("Failed to decode image")
            return []
        
        result = []
        best_text = ""
        best_lines = []
        best_raw_results = None
        
        # Strategy 1: Original image (no preprocessing)
        print("Trying Strategy 1: EasyOCR on original image...")
        try:
            # Extract all text with lower confidence to get everything
            text_results = easyocr_reader.readtext(
                original_img,
                detail=1,  # Get bounding boxes
                paragraph=False,  # Don't group into paragraphs
                width_ths=0.7,  # Width threshold for text grouping
                height_ths=0.7  # Height threshold
            )
            
            if text_results:
                # Lower confidence threshold to get all text (0.2 instead of 0.5)
                filtered_results = [item for item in text_results if item[2] > 0.2]
                
                if filtered_results:
                    # Group text by rows
                    rows = group_text_by_rows(filtered_results, tolerance=15)
                    
                    # Combine text in each row
                    lines = []
                    for row in rows:
                        # Sort by X position (left to right)
                        row_sorted = sorted(row, key=lambda x: x[0][0][0])
                        # Combine text in row
                        row_text = " ".join([clean_ocr_text(item[1]) for item in row_sorted])
                        if row_text.strip() and len(row_text.strip()) > 1:  # At least 2 chars
                            lines.append(row_text.strip())
                    
                    if lines:
                        print(f"  ✓ Original image: {len(lines)} text lines found (from {len(filtered_results)} segments)")
                        best_lines = lines
                        best_text = "\n".join(lines)
                        best_raw_results = filtered_results
        except Exception as e:
            print(f"  ✗ Original image error: {e}")
            import traceback
            traceback.print_exc()
        
        # Strategy 2: OTSU Thresholding
        if not best_lines or len(best_lines) < 2:
            print("Trying Strategy 2: OTSU Thresholding + EasyOCR...")
            try:
                gray = cv2.cvtColor(original_img, cv2.COLOR_BGR2GRAY)
                blur = cv2.GaussianBlur(gray, (5, 5), 0)
                _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                text_results = easyocr_reader.readtext(thresh, detail=1, paragraph=False)
                if text_results:
                    filtered_results = [item for item in text_results if item[2] > 0.2]
                    if filtered_results:
                        rows = group_text_by_rows(filtered_results, tolerance=15)
                        lines = []
                        for row in rows:
                            row_sorted = sorted(row, key=lambda x: x[0][0][0])
                            row_text = " ".join([clean_ocr_text(item[1]) for item in row_sorted])
                            if row_text.strip() and len(row_text.strip()) > 1:
                                lines.append(row_text.strip())
                        if lines and len(lines) > len(best_lines):
                            print(f"  ✓ OTSU: {len(lines)} text lines found")
                            best_lines = lines
                            best_text = "\n".join(lines)
            except Exception as e:
                print(f"  ✗ OTSU error: {e}")
                import traceback
                traceback.print_exc()
        
        # Strategy 3: Adaptive Thresholding
        if not best_lines or len(best_lines) < 2:
            print("Trying Strategy 3: Adaptive Thresholding + EasyOCR...")
            try:
                gray = cv2.cvtColor(original_img, cv2.COLOR_BGR2GRAY)
                denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
                adaptive = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                                  cv2.THRESH_BINARY, 11, 2)
                text_results = easyocr_reader.readtext(adaptive, detail=1, paragraph=False)
                if text_results:
                    filtered_results = [item for item in text_results if item[2] > 0.2]
                    if filtered_results:
                        rows = group_text_by_rows(filtered_results, tolerance=15)
                        lines = []
                        for row in rows:
                            row_sorted = sorted(row, key=lambda x: x[0][0][0])
                            row_text = " ".join([clean_ocr_text(item[1]) for item in row_sorted])
                            if row_text.strip() and len(row_text.strip()) > 1:
                                lines.append(row_text.strip())
                        if lines and len(lines) > len(best_lines):
                            print(f"  ✓ Adaptive: {len(lines)} text lines found")
                            best_lines = lines
                            best_text = "\n".join(lines)
            except Exception as e:
                print(f"  ✗ Adaptive error: {e}")
                import traceback
                traceback.print_exc()
        
        # Strategy 4: Contrast Enhancement
        if not best_lines or len(best_lines) < 2:
            print("Trying Strategy 4: Contrast Enhancement + EasyOCR...")
            try:
                gray = cv2.cvtColor(original_img, cv2.COLOR_BGR2GRAY)
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
                enhanced = clahe.apply(gray)
                _, thresh = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                text_results = easyocr_reader.readtext(thresh, detail=1, paragraph=False)
                if text_results:
                    filtered_results = [item for item in text_results if item[2] > 0.2]
                    if filtered_results:
                        rows = group_text_by_rows(filtered_results, tolerance=15)
                        lines = []
                        for row in rows:
                            row_sorted = sorted(row, key=lambda x: x[0][0][0])
                            row_text = " ".join([clean_ocr_text(item[1]) for item in row_sorted])
                            if row_text.strip() and len(row_text.strip()) > 1:
                                lines.append(row_text.strip())
                        if lines and len(lines) > len(best_lines):
                            print(f"  ✓ Contrast: {len(lines)} text lines found")
                            best_lines = lines
                            best_text = "\n".join(lines)
            except Exception as e:
                print(f"  ✗ Contrast error: {e}")
                import traceback
                traceback.print_exc()
        
        # Strategy 5: Morphological operations
        if not best_lines or len(best_lines) < 2:
            print("Trying Strategy 5: Morphological + EasyOCR...")
            try:
                gray = cv2.cvtColor(original_img, cv2.COLOR_BGR2GRAY)
                denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
                kernel = np.ones((2,2), np.uint8)
                morph = cv2.morphologyEx(denoised, cv2.MORPH_CLOSE, kernel)
                _, thresh = cv2.threshold(morph, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                text_results = easyocr_reader.readtext(thresh, detail=1, paragraph=False)
                if text_results:
                    filtered_results = [item for item in text_results if item[2] > 0.2]
                    if filtered_results:
                        rows = group_text_by_rows(filtered_results, tolerance=15)
                        lines = []
                        for row in rows:
                            row_sorted = sorted(row, key=lambda x: x[0][0][0])
                            row_text = " ".join([clean_ocr_text(item[1]) for item in row_sorted])
                            if row_text.strip() and len(row_text.strip()) > 1:
                                lines.append(row_text.strip())
                        if lines and len(lines) > len(best_lines):
                            print(f"  ✓ Morphological: {len(lines)} text lines found")
                            best_lines = lines
                            best_text = "\n".join(lines)
            except Exception as e:
                print(f"  ✗ Morphological error: {e}")
                import traceback
                traceback.print_exc()
        
        # Use best result
        if best_lines:
            result = best_lines
            print(f"\n=== Hasil OCR (Final) ===")
            print(f"Total baris ditemukan: {len(result)}")
            for i, text in enumerate(result, 1):
                print(f"{i}. {text}")
        else:
            print("Tidak ada text yang ditemukan setelah mencoba semua strategi")
            print("\nSaran:")
            print("- Pastikan foto jelas dan tidak blur")
            print("- Pastikan teks dalam foto cukup besar")
            print("- Pastikan pencahayaan cukup")
        
        return result if result else []

    except Exception as e:
        print(f"EasyOCR error: {e}")
        import traceback
        traceback.print_exc()
        return []

def call_ollama_api(prompt, timeout=45):
    """Call Ollama API with given prompt - optimized for speed"""
    try:
        config = get_ollama_config()
        print(f"⏱️  Calling Ollama with {timeout}s timeout...")
        start_time = time.time()
        
        response = requests.post(
            config['url'],
            json={
                'model': config['model'],
                'prompt': prompt,
                'stream': False,
                'options': {
                    'num_predict': 800,  # Increased to prevent truncation
                    'temperature': 0.1,  # Lower temperature for more consistent output
                    'top_p': 0.9,  # Nucleus sampling
                    'top_k': 40,  # Limit vocabulary
                }
            },
            timeout=timeout  # Reduced timeout - if too slow, use fallback
        )
        
        elapsed = time.time() - start_time
        print(f"⏱️  Ollama response received in {elapsed:.2f} seconds")
        
        if response.status_code == 200:
            result = response.json()
            return result.get('response', '').strip()
        else:
            print(f"Ollama API error: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.Timeout:
        try:
            elapsed = time.time() - start_time
        except:
            elapsed = timeout
        print(f"⚠️  Ollama API timeout after {elapsed:.2f} seconds - using fallback")
        return None
    except requests.exceptions.ConnectionError:
        print(f"⚠️  Ollama connection error - service mungkin tidak berjalan")
        return None
    except Exception as e:
        print(f"Ollama API call error: {e}")
        traceback.print_exc()
        return None

def classify_with_ollama(text_list, image_file=None):
    """Classify and structure text using Ollama AI - SIMPLE seperti contoh user"""
    try:
        if not text_list:
            return []

        # Skip health check di sini - langsung coba call API
        # Jika gagal, akan di-handle di call_ollama_api() dan fallback ke regex parsing
        # Ini menghindari delay 3-5 detik setiap request

        # Use all text - let Ollama handle filtering
        combined_text = "\n".join(text_list)
        print(f"📝 Sending {len(text_list)} text lines to Ollama for processing")
        
        # Improved prompt - STRICT: hanya return JSON, tidak ada penjelasan
        prompt = f"""Ekstrak item belanja dari teks struk berikut. Kembalikan HANYA JSON array, tanpa penjelasan apapun.

Teks struk:
{combined_text}

STRUK BELANJA TIPIKAL MEMILIKI FORMAT:
- Kolom BANYAK-NYA (Quantity): jumlah item
- Kolom NAMA BARANG (Item Name): nama produk
- Kolom HARGA (Price): harga per item (format: Rp. X.XXX atau Rp XXXX)
- Kolom JUMLAH (Total): total harga (opsional)

INSTRUKSI EKSTRAKSI:
1. IDENTIFIKASI ITEM:
   - Cari pola: [jumlah] [nama_barang] [harga]
   - Contoh: "1 Kg Semangka Rp. 7.500" → jumlah: "1", nama: "Semangka", harga: "7500"
   - Contoh: "1 Ikat Rambutan Rp. 5.000" → jumlah: "1", nama: "Rambutan", harga: "5000"

2. KOREKSI TYPO OCR:
   - "Melcn" → "Melon"
   - "Naungka" → "Nangka"
   - "Jambu" → "Jambu" (sudah benar)
   - "1-50d" atau "Rp. 1-50d" → "7500" (perbaiki format harga)
   - "28 .000" → "28000"
   - "12-00" → "12000"
   - "5.0" → "5000"

3. PARSING HARGA:
   - Hapus "Rp", "Rp.", "RP", "RP."
   - Hapus titik (.) dan koma (,) yang digunakan sebagai pemisah ribuan
   - Contoh: "Rp. 7.500" → "7500"
   - Contoh: "Rp 10.000" → "10000"
   - Contoh: "28.000" → "28000"
   - Jika harga tidak jelas atau tidak ada, gunakan "0"

4. EKSTRAKSI SEMUA ITEM:
   - Ekstrak SEMUA item yang terlihat dalam teks
   - Jangan skip item apapun yang terlihat
   - Jika ada text yang mirip item (ada nama + harga), ekstrak sebagai item
   - Abaikan hanya: header/footer murni seperti "Tuan Toko", "NOTA NO", "TANDA TERIMA", "PERHATIAN", "Hormat Kami"
   - Total keseluruhan (bukan per item) bisa diabaikan

5. FORMAT OUTPUT (JSON array):
[
  {{"nama_barang": "Semangka", "jumlah": "1", "harga": "7500"}},
  {{"nama_barang": "Melon", "jumlah": "1", "harga": "10000"}},
  {{"nama_barang": "Nangka", "jumlah": "1", "harga": "10000"}}
]

ATURAN PENTING:
- nama_barang: koreksi typo (contoh: "Melcn" → "Melon", "Naungka" → "Nangka", "K9" → "Kg")
- jumlah: angka saja (contoh: "1", "2")
- harga: angka saja tanpa simbol (contoh: "7500", bukan "Rp. 7.500")
- Parsing harga: "1-50d" → "7500", "28 .000" → "28000", "12-00" → "12000", "5.0" → "5000"

OUTPUT: Hanya kembalikan JSON array saja, TANPA penjelasan, TANPA teks sebelum/sesudah JSON.
Format: [{{"nama_barang":"...","jumlah":"...","harga":"..."}}]"""

        config = get_ollama_config()
        print(f"🔧 Using Ollama: {config['url']}")
        print(f"📦 Model: {config['model']}")
        print(f"📝 Text lines: {len(text_list)}")
        print(f"✓ Calling Ollama API (timeout: 45s)...")
        
        ollama_start = time.time()
        result_text = call_ollama_api(prompt, timeout=45)  # Reduced timeout
        ollama_elapsed = time.time() - ollama_start
        
        if not result_text:
            print(f"⚠️  Ollama API failed after {ollama_elapsed:.2f}s, using fallback parsing...")
            return parse_receipt_text_fallback(text_list)
        
        print(f"\n=== Output dari Ollama ===")
        print(result_text)
        
        try:
            # Remove any text before JSON
            cleaned_text = result_text.strip()
            
            # Remove markdown code blocks
            if '```json' in cleaned_text:
                start = cleaned_text.find('```json') + 7
                end = cleaned_text.rfind('```')
                if end > start:
                    cleaned_text = cleaned_text[start:end].strip()
            elif '```' in cleaned_text:
                start = cleaned_text.find('```') + 3
                end = cleaned_text.rfind('```')
                if end > start:
                    cleaned_text = cleaned_text[start:end].strip()
            
            # Remove any text before first [
            first_bracket = cleaned_text.find('[')
            if first_bracket > 0:
                cleaned_text = cleaned_text[first_bracket:]
            
            # Remove any text after last ]
            last_bracket = cleaned_text.rfind(']')
            if last_bracket > 0:
                cleaned_text = cleaned_text[:last_bracket + 1]
            
            cleaned_text = cleaned_text.strip()
            
            # Try to fix incomplete JSON (if cut off)
            if not cleaned_text.endswith(']'):
                # Try to close the JSON array
                if cleaned_text.count('[') > cleaned_text.count(']'):
                    # Find last complete item
                    last_complete = cleaned_text.rfind('}')
                    if last_complete > 0:
                        cleaned_text = cleaned_text[:last_complete + 1] + '\n]'
            
            result_json = json.loads(cleaned_text)
            items = []
            for item in result_json:
                harga_value = item.get('harga', None)
                if harga_value is None or harga_value == 'null' or harga_value == '':
                    harga_value = 0
                elif isinstance(harga_value, str):
                    harga_clean = re.sub(r'[^0-9]', '', str(harga_value))
                    harga_value = int(harga_clean) if harga_clean else 0
                else:
                    harga_value = int(harga_value) if harga_value else 0
                
                items.append({
                    'nama_barang': item.get('nama_barang', ''),
                    'jumlah': item.get('jumlah', '1'),
                    'harga': harga_value,
                    'unit': 'pcs',
                    'category_id': 1,
                    'minStock': 10
                })
            print(f"\n=== Parsed {len(items)} items ===")
            for item in items:
                print(f"- {item['nama_barang']}: {item['harga']}")
            return items
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            print(f"Raw response: {result_text}")
            try:
                start_idx = result_text.find('[')
                end_idx = result_text.rfind(']')
                if start_idx != -1 and end_idx != -1:
                    json_str = result_text[start_idx:end_idx+1]
                    result_json = json.loads(json_str)
                    items = []
                    for item in result_json:
                        harga_value = item.get('harga', None)
                        if harga_value is None or harga_value == 'null' or harga_value == '':
                            harga_value = 0
                        elif isinstance(harga_value, str):
                            harga_clean = re.sub(r'[^0-9]', '', str(harga_value))
                            harga_value = int(harga_clean) if harga_clean else 0
                        else:
                            harga_value = int(harga_value) if harga_value else 0
                        
                        items.append({
                            'nama_barang': item.get('nama_barang', ''),
                            'jumlah': item.get('jumlah', '1'),
                            'harga': harga_value,
                            'unit': 'pcs',
                            'category_id': 1,
                            'minStock': 10
                        })
                    print(f"\n=== Parsed {len(items)} items (after manual extraction) ===")
                    for item in items:
                        print(f"- {item['nama_barang']}: {item['harga']}")
                    return items
            except:
                pass
            return parse_receipt_text_fallback(text_list)

    except Exception as e:
        print(f"Ollama error: {e}")
        traceback.print_exc()
        return parse_receipt_text_fallback(text_list)

def parse_receipt_text_fallback(text_list):
    """Fallback parsing if Ollama fails - Simple regex-based parsing"""
    try:
        if not text_list:
            return []

        print("=== Fallback Parsing (Simple Regex) ===")
        items = []
        
        # Simple pattern matching untuk ekstrak item
        # Pattern: nama_barang (jumlah) harga atau nama_barang harga
        price_pattern = r'(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d+)'
        
        for line in text_list[:20]:  # Process max 20 lines
            line = line.strip()
            if not line or len(line) < 3:
                continue
            
            # Skip lines that are clearly not items (headers, totals, etc)
            skip_patterns = [
                r'^(total|subtotal|jumlah|bayar|kembali|diskon|pajak)',
                r'^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',  # Dates
                r'^[A-Z\s]{2,}$',  # All caps (likely header)
            ]
            
            should_skip = False
            for pattern in skip_patterns:
                if re.match(pattern, line, re.IGNORECASE):
                    should_skip = True
                    break
            
            if should_skip:
                continue
            
            # Try to extract price from line
            prices = re.findall(price_pattern, line)
            if prices:
                # Get last price as item price
                price_str = prices[-1].replace('.', '').replace(',', '')
                try:
                    harga = int(price_str)
                    # Remove price from line to get item name
                    item_name = re.sub(price_pattern, '', line).strip()
                    # Remove common words
                    item_name = re.sub(r'\b(?:x|pcs|kg|gram|liter|ml|rp|rupiah)\b', '', item_name, flags=re.IGNORECASE).strip()
                    
                    if item_name and len(item_name) > 2:
                        items.append({
                            'nama_barang': item_name,
                            'jumlah': '1',
                            'harga': harga,
                            'unit': 'pcs',
                            'category_id': 1,
                            'minStock': 10
                        })
                except ValueError:
                    continue
        
        print(f"✓ Fallback parsing found {len(items)} items")
        return items

    except Exception as e:
        print(f"Fallback parse error: {e}")
        traceback.print_exc()
        return []

def process_image_hybrid(image_file):
    """Process image with Tesseract OCR + Ollama AI"""
    try:
        import time
        start_time = time.time()
        
        image_path, saved_filename = save_image(image_file)
        if not image_path:
            return []

        # Use EasyOCR with preprocessing
        if easyocr_available:
            print("\n=== Step 1: EasyOCR Text Extraction with Preprocessing ===")
            text_list = extract_text_with_easyocr(image_file)
            ocr_time = time.time() - start_time
            print(f"⏱️  OCR extraction took {ocr_time:.2f} seconds")
        else:
            print("\n⚠️  EasyOCR not available!")
            print("⚠️  Cannot process without EasyOCR (Ollama requires text input)")
            return []
        
        if not text_list:
            print("\n⚠️  No text found by EasyOCR")
            print("⚠️  Cannot use Ollama without text input")
            return []
        else:
            print(f"\n=== Step 2: Ollama AI Classification ===")
            print(f"📝 Processing {len(text_list)} text lines...")
            ollama_start = time.time()
            result_json = classify_with_ollama(text_list, image_file)
            ollama_time = time.time() - ollama_start
            total_time = time.time() - start_time
            
            print(f"⏱️  Ollama processing took {ollama_time:.2f} seconds")
            print(f"⏱️  Total processing time: {total_time:.2f} seconds")
            
            return result_json if result_json else []

    except Exception as e:
        print(f"OCR processing error: {e}")
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
        
        # Check if EasyOCR is available
        if not easyocr_available:
            print("⚠️  Warning: EasyOCR not available, cannot process images")
        
        print(f"Processing image: {image_file.filename}")
        
        result = process_image_hybrid(image_file)
        
        print(f"Extracted {len(result)} items")
        
        if not result:
            return jsonify({
                "success": False,
                "error": "No items found",
                "message": "Tidak ada item yang ditemukan dalam foto. Pastikan foto jelas dan teks terbaca dengan baik."
            }), 200  # Return 200 but with success: false
        
        return jsonify({
            "success": True,
            "data": {
                "items": result
            }
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": str(e),
            "message": "Terjadi kesalahan saat memproses gambar. Pastikan OCR service berjalan dengan benar."
        }), 500

@app.route('/process-receipt', methods=['POST'])
def process_receipt():
    """Alias for process-photo for backward compatibility"""
    return process_photo()

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint - checks EasyOCR and Ollama status"""
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
    """Test Ollama AI connection"""
    try:
        if not is_ollama_available():
            config = get_ollama_config()
            return jsonify({
                "success": False,
                "error": f"Ollama not available at {config['url']}. Please make sure Ollama is running and model {config['model']} is installed."
            }), 400
        
        result_text = call_ollama_api("Hello, are you working? Please respond with 'Yes, I am working!'")
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
    print("Starting OCR Service (EasyOCR + Ollama AI)...")
    print("Using EasyOCR with preprocessing - high accuracy OCR")
    print("Service: http://localhost:5000")
    print("Health: http://localhost:5000/health")
    print("Process: http://localhost:5000/process-photo")
    print("Test Ollama: http://localhost:5000/test-ollama")
    
    if not easyocr_available:
        print("\n⚠️  WARNING: EasyOCR not available!")
        print("Please install EasyOCR:")
        print("  pip install easyocr")
        print("The service requires EasyOCR to extract text from images")
    else:
        print(f"\n✓ EasyOCR initialized successfully")
        print("Engine: EasyOCR (high accuracy, supports English + Indonesian)")
    
    config = get_ollama_config()
    if not is_ollama_available():
        print(f"\n⚠️  WARNING: Ollama not available at {config['url']}")
        print(f"Please make sure Ollama is running and model '{config['model']}' is installed")
        print("  Install Ollama: https://ollama.ai")
        print(f"  Install model: ollama pull {config['model']}")
    else:
        print(f"\n✓ Ollama initialized successfully")
        print(f"  URL: {config['url']}")
        print(f"  Model: {config['model']}")
    
    app.run(host='0.0.0.0', port=5000, debug=False)


