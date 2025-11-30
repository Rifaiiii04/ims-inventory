#!/usr/bin/env python3
import json
import traceback
import os
import re
from flask import Flask, request, jsonify, send_file
import numpy as np
import cv2
from datetime import datetime
import uuid
import google.generativeai as genai
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

print("Initializing Tesseract OCR (Lightweight & Fast)...")
tesseract_available = False

try:
    import pytesseract
    from pytesseract import image_to_string, Output
    
    try:
        pytesseract.get_tesseract_version()
        tesseract_available = True
        print("✓ Tesseract OCR initialized successfully!")
        print("  Engine: Tesseract OCR (lightweight, fast)")
        print("  Memory: Low (~50-100MB)")
    except Exception as e:
        print(f"⚠️  Tesseract not found in PATH: {e}")
        print("\nPlease install Tesseract OCR:")
        print("  Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki")
        print("  Or: choco install tesseract")
        print("  Linux: sudo apt-get install tesseract-ocr")
        print("  Mac: brew install tesseract")
        tesseract_available = False
except ImportError as e:
    print(f"⚠️  pytesseract not installed: {e}")
    print("\nPlease install: pip install pytesseract")
    tesseract_available = False
except Exception as e:
    print(f"⚠️  Tesseract initialization error: {e}")
    tesseract_available = False

if not tesseract_available:
    print("\n⚠️  Tesseract OCR not available - will use Gemini Vision API as fallback")


def mask_api_key(api_key):
    """Mask API key for logging (show first 10 and last 4 characters)"""
    if not api_key or len(api_key) <= 14:
        return "***"
    return f"{api_key[:10]}...{api_key[-4:]}"

def get_gemini_api_key():
    """
    Get Gemini API key from environment variable.
    Returns the API key string or None if not configured.
    """
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key or api_key.strip() == '':
        return None
    api_key = api_key.strip()
    if len(api_key) < 20:
        print(f"⚠️  Warning: API key seems too short ({len(api_key)} chars)")
        return None
    return api_key

def get_gemini_model():
    """
    Initialize and return Gemini GenerativeModel instance.
    Returns the model instance or None if API key is not configured or initialization fails.
    """
    api_key = get_gemini_api_key()
    if not api_key:
        print("⚠️  get_gemini_model(): API key not found")
        return None
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        return model
    except Exception as e:
        print(f"✗ Error initializing Gemini model: {e}")
        print(f"  API key length: {len(api_key) if api_key else 0}")
        print(f"  API key masked: {mask_api_key(api_key) if api_key else 'None'}")
        import traceback
        traceback.print_exc()
        return None

def is_gemini_configured():
    """Check if Gemini is properly configured (API key exists and model can be initialized)"""
    return get_gemini_model() is not None

print("Initializing Gemini AI...")
api_key = get_gemini_api_key()
if api_key:
    masked = mask_api_key(api_key)
    print(f"✓ GEMINI_API_KEY loaded: {masked}")
    test_model = get_gemini_model()
    if test_model:
        print("✓ Gemini AI initialized successfully!")
    else:
        print("⚠️  Gemini AI initialization failed - will use fallback parsing mode")
else:
    print("⚠️  GEMINI_API_KEY not found in environment variables")
    print("⚠️  Gemini AI features will not be available")

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

def extract_text_with_tesseract(image_file):
    """Extract text using Tesseract OCR (lightweight & fast)"""
    try:
        # Check if Tesseract is available
        if not tesseract_available:
            print("ERROR: Tesseract OCR not available!")
            return []
            
        image_file.seek(0)
        
        print("\n=== Step 1: Tesseract OCR Text Extraction ===")
        
        # Load image once
        image_file.seek(0)
        image_bytes = image_file.read()
        image_file.seek(0)
        
        # Convert to PIL Image
        try:
            pil_image = Image.open(io.BytesIO(image_bytes))
            # Convert to RGB if needed
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
        except Exception as e:
            print(f"Failed to load image: {e}")
            return []
        
        result = []
        best_text = ""
        
        # Strategy 1: Direct OCR (original image) - FASTEST
        print("Trying Strategy 1: Direct Tesseract OCR (original image)...")
        try:
            import pytesseract
            # Use Tesseract with optimized config for receipts
            # PSM 6: Assume a single uniform block of text
            config = '--psm 6'
            generated_text = pytesseract.image_to_string(pil_image, config=config, lang='eng+ind')
            
            if generated_text and generated_text.strip():
                print(f"  ✓ Direct Tesseract: Text extracted ({len(generated_text)} chars)")
                print(f"  Raw text preview: {repr(generated_text[:200])}")
                best_text = generated_text
                
                # Try multiple splitting strategies
                lines = []
                
                # Strategy 1: Split by newlines
                lines_newline = [line.strip() for line in generated_text.split('\n') if line.strip()]
                if lines_newline and len(lines_newline) > len(lines):
                    lines = lines_newline
                    print(f"  Split by newline: {len(lines)} lines")
                
                # Strategy 2: If no newlines, try split by common delimiters
                if len(lines) <= 1:
                    for delimiter in ['|', ';', '\t', '  ']:  # Try pipe, semicolon, tab, double space
                        lines_delim = [line.strip() for line in generated_text.split(delimiter) if line.strip() and len(line.strip()) > 2]
                        if lines_delim and len(lines_delim) > len(lines):
                            lines = lines_delim
                            print(f"  Split by '{delimiter}': {len(lines)} lines")
                            break
                
                # Strategy 3: If still single line, try split by spaces (for long text)
                if len(lines) == 1 and len(generated_text) > 20:
                    # Split by spaces and group into potential items
                    words = generated_text.split()
                    # Group words that might be items (look for patterns like "item price" or numbers)
                    potential_items = []
                    current_item = []
                    for word in words:
                        if word and len(word) > 1:
                            current_item.append(word)
                            # If we hit a number or price-like pattern, might be new item
                            if re.search(r'\d+', word) and len(current_item) > 2:
                                potential_items.append(' '.join(current_item[:-1]))
                                current_item = [current_item[-1]]
                    if current_item:
                        potential_items.append(' '.join(current_item))
                    if potential_items and len(potential_items) > len(lines):
                        lines = potential_items
                        print(f"  Split by words: {len(lines)} potential items")
                
                if lines and len(lines) >= 1:  # Accept even 1 line if it has content
                    result = lines
                    print(f"  ✓ Parsed {len(result)} text segments")
                    # Early exit if we have good results
                    if len(result) >= 3:
                        print("  ✓ Got enough results, skipping other strategies")
                        print(f"\n=== Hasil OCR (Final) ===")
                        print(f"Total baris ditemukan: {len(result)}")
                        for i, text in enumerate(result, 1):
                            print(f"{i}. {text}")
                        return result
            else:
                print("  ✗ Direct Tesseract: No text found")
        except Exception as e:
            print(f"  ✗ Direct Tesseract error: {e}")
        
        # Strategy 2: OTSU Thresholding (if Strategy 1 didn't work well)
        if not result or len(result) < 2:
            print("Trying Strategy 2: OTSU Thresholding + Tesseract...")
            try:
                image_file.seek(0)
                image_bytes = image_file.read()
                image_file.seek(0)
                nparr = np.frombuffer(image_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if img is not None:
                    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                    pil_thresh = Image.fromarray(thresh)
                    
                    import pytesseract
                    config = '--psm 6'
                    generated_text = pytesseract.image_to_string(pil_thresh, config=config, lang='eng+ind')
                    
                    if generated_text and generated_text.strip() and len(generated_text) > len(best_text):
                        print(f"  ✓ OTSU + Tesseract: Text extracted ({len(generated_text)} chars)")
                        best_text = generated_text
                        lines = [line.strip() for line in generated_text.split('\n') if line.strip()]
                        if lines and len(lines) > len(result):
                            result = lines
            except Exception as e:
                print(f"  ✗ OTSU + Tesseract error: {e}")
        
        # Strategy 3: Contrast Enhancement if still not good
        if not result or len(result) < 2:
            print("Trying Strategy 3: Contrast Enhancement + Tesseract...")
            try:
                image_file.seek(0)
                image_bytes = image_file.read()
                image_file.seek(0)
                nparr = np.frombuffer(image_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if img is not None:
                    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
                    l, a, b = cv2.split(lab)
                    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
                    l = clahe.apply(l)
                    enhanced = cv2.merge([l, a, b])
                    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
                    pil_enhanced = Image.fromarray(cv2.cvtColor(enhanced, cv2.COLOR_BGR2RGB))
                    
                    import pytesseract
                    config = '--psm 6'
                    generated_text = pytesseract.image_to_string(pil_enhanced, config=config, lang='eng+ind')
                    
                    if generated_text and generated_text.strip() and len(generated_text) > len(best_text):
                        print(f"  ✓ Contrast + Tesseract: Text extracted ({len(generated_text)} chars)")
                        best_text = generated_text
                        lines = [line.strip() for line in generated_text.split('\n') if line.strip()]
                        if lines and len(lines) > len(result):
                            result = lines
            except Exception as e:
                print(f"  ✗ Contrast + Tesseract error: {e}")
        
        # If we got text but no lines, split by common delimiters
        if best_text and not result:
            # Try splitting by various delimiters
            for delimiter in ['\n', '|', ';', ',']:
                lines = [line.strip() for line in best_text.split(delimiter) if line.strip()]
                if len(lines) > 1:
                    result = lines
                    break
            
            # If still no lines, treat as single item
            if not result and best_text.strip():
                result = [best_text.strip()]
        
        # Remove duplicates while preserving order
        seen = set()
        unique_result = []
        for item in result:
            item_lower = item.lower().strip()
            # More lenient filter - accept items with at least 1 character (numbers/short codes are valid)
            if item_lower and item_lower not in seen:
                seen.add(item_lower)
                unique_result.append(item)
        
        result = unique_result
        
        print(f"\n=== Hasil OCR (Final) ===")
        if result:
            print(f"Total baris ditemukan: {len(result)}")
            for i, text in enumerate(result, 1):
                print(f"{i}. {text}")
            print(f"\nBest text extracted: {repr(best_text[:500])}")  # Debug: show what was actually extracted
        else:
            print("Tidak ada text yang ditemukan setelah mencoba semua strategi")
            if best_text:
                print(f"\nDebug: Tesseract extracted text but couldn't parse it:")
                print(f"Raw text: {repr(best_text)}")
                print(f"Text length: {len(best_text)} chars")
            print("\nSaran:")
            print("- Pastikan foto jelas dan tidak blur")
            print("- Pastikan teks dalam foto cukup besar")
            print("- Pastikan pencahayaan cukup")
            print("- Coba foto ulang dengan sudut yang lebih baik")
        
        return result if result else []

    except Exception as e:
        print(f"Tesseract OCR error: {e}")
        import traceback
        traceback.print_exc()
        print("TrOCR error occurred, will try Gemini Vision API...")
        return []

def classify_with_gemini_vision(image_file):
    """Use Gemini Vision API directly to extract receipt data from image"""
    try:
        api_key = get_gemini_api_key()
        if not api_key:
            return []
        
        print("Trying Gemini Vision API directly...")
        image_file.seek(0)
        image_bytes = image_file.read()
        image_file.seek(0)
        
        # Convert to PIL Image
        img = Image.open(io.BytesIO(image_bytes))
        
        prompt = """
        Analisis gambar struk belanja ini dan ekstrak semua item yang ada.
        Kembalikan dalam format JSON:
        [
        {
            "nama_barang": "...", "jumlah": "...", "harga": "..."
        }]
        
        Jika ada data yang tidak jelas, isi null. Hanya ekstrak nama barang, jumlah, dan harga.
        Kembalikan hanya JSON tanpa penjelasan apapun.
        Untuk harga, hanya angka saja tanpa simbol (contoh: 5000 bukan Rp 5.000).
        """
        
        print(f"🔑 Using API key: {mask_api_key(api_key)}")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        print(f"✓ Model created, calling generate_content...")
        response = model.generate_content([prompt, img])
        result_text = response.text.strip()
        
        print(f"\n=== Output dari Gemini Vision ===")
        print(result_text)
        
        try:
            cleaned_text = result_text.strip()
            if cleaned_text.startswith('```json'):
                cleaned_text = cleaned_text[7:]
            elif cleaned_text.startswith('```'):
                cleaned_text = cleaned_text[3:]
            
            if cleaned_text.endswith('```'):
                cleaned_text = cleaned_text[:-3]
            
            cleaned_text = cleaned_text.strip()
            
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
            
            print(f"\n=== Parsed {len(items)} items from Gemini Vision ===")
            for item in items:
                print(f"- {item['nama_barang']}: {item['harga']}")
            return items
        except json.JSONDecodeError as e:
            print(f"JSON parse error from Gemini Vision: {e}")
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
                    return items
            except:
                pass
            return []
    except Exception as e:
        print(f"Gemini Vision error: {e}")
        traceback.print_exc()
        return []

def classify_with_gemini(text_list, image_file=None):
    """Classify and structure text using Gemini AI - SIMPLE seperti contoh user"""
    try:
        if not text_list:
            return []

        combined_text = "\n".join(text_list)
        prompt = f"""
        berikut teks hasil OCR dari struk belanja:
        {combined_text}
        tolong ektrak jadi JSON dengan format:
        [
        {{
            "nama_barang": "...", "jumlah": "...", "harga": "..."
        }}]

        jika ada data yang tidak jelas, isi null. dan jika ada kata yang bukan nama barang, jumlah, atau harga, abaikan saja.
        cukup kembalikan JSON tanpa penjelasan apapun. dan juga untuk nama barang nya di koreksi lagi penulisannya jika ada yang salah. koreksi penulisan nama barang berdasarkan 
        nama barang yang relevan dengan text yang berantakan tersebut. untuk harga itu formatnya Rp / Rupiah dan hanya angka saja tanpa simbol apapun.
        """

        api_key = get_gemini_api_key()
        if not api_key:
            print("⚠️  Gemini API key not configured, using fallback parsing...")
            return parse_receipt_text_fallback(text_list)
        
        try:
            print(f"🔑 Using API key: {mask_api_key(api_key)} (length: {len(api_key)})")
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-flash-latest')
            print(f"✓ Model created, calling generate_content...")
            response = model.generate_content(prompt)
            result_text = response.text.strip()
            
            print(f"\n=== Output dari Gemini ===")
            print(result_text)
            
            try:
                cleaned_text = result_text.strip()
                if cleaned_text.startswith('```json'):
                    cleaned_text = cleaned_text[7:]
                elif cleaned_text.startswith('```'):
                    cleaned_text = cleaned_text[3:]
                
                if cleaned_text.endswith('```'):
                    cleaned_text = cleaned_text[:-3]
                
                cleaned_text = cleaned_text.strip()
                
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
                return []
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            traceback.print_exc()
            return parse_receipt_text_fallback(text_list)

    except Exception as e:
        print(f"Gemini error: {e}")
        traceback.print_exc()
        return parse_receipt_text_fallback(text_list)

def parse_receipt_text_fallback(text_list):
    """Fallback parsing if Gemini fails - SIMPLE"""
    try:
        if not text_list:
            return []

        print("=== Fallback Parsing (Simple) ===")
        items = []
        
        print("Gemini failed, returning empty array")
        return items

    except Exception as e:
        print(f"Fallback parse error: {e}")
        return []

def process_image_hybrid(image_file):
    """Process image with Tesseract OCR + Gemini AI, with Gemini Vision fallback"""
    try:
        image_path, saved_filename = save_image(image_file)
        if not image_path:
            return []

        # Use Tesseract OCR (lightweight & fast)
        if tesseract_available:
            print("\n=== Step 1: Tesseract OCR Text Extraction ===")
            text_list = extract_text_with_tesseract(image_file)
        else:
            print("\n⚠️  Tesseract OCR not available!")
            print("=== Trying Fallback: Gemini Vision API ===")
            result_json = classify_with_gemini_vision(image_file)
            return result_json if result_json else []
        
        if not text_list:
            print("\n⚠️  No text found by Tesseract OCR")
            print("=== Trying Fallback: Gemini Vision API ===")
            # Fallback to Gemini Vision API
            result_json = classify_with_gemini_vision(image_file)
            if result_json:
                print("✓ Successfully extracted using Gemini Vision API")
                return result_json
            else:
                print("✗ Gemini Vision API also failed")
                return []
        else:
            print("\n=== Step 2: Gemini AI Classification ===")
            result_json = classify_with_gemini(text_list, image_file)
            
            # If Gemini text classification fails but we have text, try Gemini Vision
            if not result_json and text_list:
                print("\n⚠️  Gemini text classification failed, trying Gemini Vision API...")
                result_json = classify_with_gemini_vision(image_file)
            
            return result_json

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
        
        # Check if Tesseract is available
        if not tesseract_available:
            print("⚠️  Warning: Tesseract OCR not available, will use Gemini Vision API only")
        
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
    """Health check endpoint - checks Tesseract and Gemini status"""
    tesseract_status = "ready" if tesseract_available else "not_available"
    gemini_status = "configured" if is_gemini_configured() else "not_configured"
    api_key = get_gemini_api_key()
    
    return jsonify({
        "status": "healthy", 
        "message": "OCR service is running (Tesseract OCR + Gemini AI)",
        "tesseract": tesseract_status,
        "tesseract_engine": "Tesseract OCR (lightweight, fast)" if tesseract_status == "ready" else None,
        "gemini": gemini_status,
        "gemini_api_key_set": api_key is not None
    })

@app.route('/test-gemini', methods=['GET'])
def test_gemini():
    """Test Gemini AI connection"""
    try:
        model = get_gemini_model()
        if not model:
            return jsonify({
                "success": False,
                "error": "Gemini API key not configured. Please set GEMINI_API_KEY environment variable."
            }), 400
        
        response = model.generate_content("Hello, are you working?")
        return jsonify({
            "success": True,
            "message": "Gemini AI is working",
            "response": response.text
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("Starting OCR Service (Tesseract OCR + Gemini AI)...")
    print("Using Tesseract OCR (lightweight & fast) - optimized for 8GB RAM systems")
    print("Service: http://localhost:5000")
    print("Health: http://localhost:5000/health")
    print("Process: http://localhost:5000/process-photo")
    print("Test Gemini: http://localhost:5000/test-gemini")
    
    if not tesseract_available:
        print("\n⚠️  WARNING: Tesseract OCR not available!")
        print("Please install Tesseract OCR:")
        print("  Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki")
        print("  Or: choco install tesseract")
        print("  Then: pip install pytesseract")
        print("The service will use Gemini Vision API as fallback")
    else:
        print(f"\n✓ Tesseract OCR initialized successfully")
        print("Engine: Tesseract OCR (lightweight, fast, optimized for 8GB RAM)")
    
    if not is_gemini_configured():
        print("\n⚠️  WARNING: GEMINI_API_KEY not configured - Gemini AI features will not be available")
        print("Please set GEMINI_API_KEY environment variable in .env file")
        print("Example: GEMINI_API_KEY=your_api_key_here")
    
    app.run(host='0.0.0.0', port=5000, debug=False)


