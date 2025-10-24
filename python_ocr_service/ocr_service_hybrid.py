#!/usr/bin/env python3
"""
OCR Service - EasyOCR + Gemini AI
Versi hybrid: EasyOCR untuk ekstraksi teks, Gemini untuk klasifikasi
"""

import json
import traceback
import os
from flask import Flask, request, jsonify, send_file
import easyocr
import numpy as np
import cv2
from datetime import datetime
import uuid
import google.generativeai as genai
from PIL import Image
import io
import base64

# Initialize EasyOCR
print("Initializing EasyOCR...")
reader = easyocr.Reader(['en', 'id'])
print("EasyOCR initialized successfully!")

# Initialize Gemini AI
print("Initializing Gemini AI...")
# Set your Gemini API key here
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyBzb2hZXhceAjTlW1nfiXdlK710-t5TQ20')
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')
print("Gemini AI initialized successfully!")

app = Flask(__name__)

# Create upload directory
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

def preprocess(image_file):
    """Preprocess image for better OCR"""
    try:
        image_bytes = image_file.read()
        image_file.seek(0)
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        return thresh
    except Exception as e:
        print(f"Preprocessing error: {e}")
        return None

def extract_text_with_easyocr(image_file):
    """Extract text using EasyOCR"""
    try:
        # Reset file pointer
        image_file.seek(0)
        
        # Preprocess image
        processed = preprocess(image_file)
        if processed is None:
            return []

        # Extract text with EasyOCR
        result = reader.readtext(processed, detail=0)
        print(f"\n=== Hasil EasyOCR ===")
        print(result)
        
        # If no text found, try with original image
        if not result:
            print("No text found in processed image, trying original...")
            image_file.seek(0)
            image = Image.open(image_file)
            if image.mode != 'RGB':
                image = image.convert('RGB')
            img_array = np.array(image)
            result = reader.readtext(img_array, detail=0)
            print(f"=== Hasil EasyOCR Original ===")
            print(result)

        return result

    except Exception as e:
        print(f"EasyOCR error: {e}")
        return []

def classify_with_gemini(text_list, image_file=None):
    """Classify and structure text using Gemini AI"""
    try:
        if not text_list:
            return []

        # Prepare text for Gemini
        combined_text = "\n".join(text_list)
        
        # Create prompt for Gemini
        prompt = f"""
        Anda adalah AI yang ahli dalam menganalisis struk belanja, kwitansi, dan daftar belanjaan TULISAN TANGAN.
        Dari teks berikut yang diekstrak dari gambar, ekstrak SEMUA item yang dibeli, bahkan jika formatnya tidak sempurna.

        Teks yang diekstrak:
        {combined_text}

        ANALISIS FLEKSIBEL:
        - Terima tulisan tangan yang tidak sempurna
        - Abaikan header, footer, total, tanda tangan
        - Fokus pada item-item yang dibeli
        - Terima singkatan (Bks, BKS, klg, Btl, dll)
        - Terima format harga yang bervariasi (Rp 1.000, 1000, 1-000, dll)

        Format output JSON:
        {{
            "items": [
                {{
                    "nama_barang": "nama item yang dibeli",
                    "jumlah": "jumlah/banyaknya",
                    "harga": "harga per item (hanya angka)",
                    "unit": "satuan (pcs, kg, liter, bungkus, kaleng, botol, dll)",
                    "category_id": 1,
                    "minStock": 10
                }}
            ]
        }}

        ATURAN FLEKSIBEL:
        1. Ekstrak SEMUA item yang terlihat seperti barang belanjaan
        2. Jika jumlah tidak jelas, gunakan "1"
        3. Harga: bersihkan dari Rp, titik, koma, strip (contoh: "Rp 1.500" → "1500")
        4. Unit: terima singkatan (Bks=bungkus, klg=kaleng, Btl=botol, kg=kilogram)
        5. Nama barang: bersihkan dari angka dan simbol, ambil nama asli
        6. Jika ada item yang meragukan, tetap masukkan dengan confidence rendah
        7. JANGAN kembalikan array kosong kecuali benar-benar tidak ada item

        CONTOH PARSING:
        - "1 Bks T.Kanji" → nama_barang: "Tepung Kanji", jumlah: "1", unit: "bungkus"
        - "2 klg olympic" → nama_barang: "Olympic", jumlah: "2", unit: "kaleng"
        - "Rp 12.000" → harga: "12000"
        - "5 Bks Mie sedap" → nama_barang: "Mie Sedap", jumlah: "5", unit: "bungkus"

        Jawab hanya dengan JSON yang valid, tanpa penjelasan tambahan.
        """

        # Call Gemini AI
        if GEMINI_API_KEY != 'YOUR_GEMINI_API_KEY_HERE':
            response = model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Clean response (remove markdown formatting if any)
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]
            
            print(f"\n=== Response Gemini ===")
            print(result_text)
            
            # Parse JSON response
            try:
                result_json = json.loads(result_text)
                items = result_json.get('items', [])
                print(f"\n=== Parsed {len(items)} items by Gemini ===")
                for item in items:
                    print(f"- {item.get('nama_barang', 'N/A')}: {item.get('harga', 'N/A')}")
                return items
            except json.JSONDecodeError as e:
                print(f"JSON parse error: {e}")
                print(f"Raw response: {result_text}")
                return []
        else:
            print("Gemini API key not configured, using fallback parsing...")
            return parse_receipt_text_fallback(text_list)

    except Exception as e:
        print(f"Gemini error: {e}")
        traceback.print_exc()
        return parse_receipt_text_fallback(text_list)

def parse_receipt_text_fallback(text_list):
    """Fallback parsing if Gemini fails - FLEKSIBEL untuk tulisan tangan"""
    try:
        if not text_list:
            return []

        print("=== Fallback Parsing (Fleksibel) ===")
        items = []
        import re
        
        # Skip common non-item words
        skip_words = ['total', 'jumlah', 'rp', 'harga', 'nama', 'barang', 'banyaknya', 'tanda', 'terima', 'perhatian', 'hormat', 'kami']
        
        # Look for patterns that might be items with prices
        for i, text in enumerate(text_list):
            text = text.strip()
            
            # Skip empty or very short text
            if len(text) < 2:
                continue
                
            # Skip if it's clearly a header/footer
            if any(word in text.lower() for word in skip_words):
                continue
            
            # Look for price patterns (various formats) - LEBIH FLEKSIBEL
            price_patterns = [
                r'[Rr][Pp]\.?\s*(\d+(?:[\.\-]\d{3})*(?:,\d{2})?)',  # Rp 1.500, Rp 1-500, Rp. 1500
                r'(\d+(?:[\.\-]\d{3})*(?:,\d{2})?)\s*[Rr][Pp]',    # 1500 Rp, 1-500 Rp
                r'(\d+(?:[\.\-]\d{3})*(?:,\d{2})?)',               # Just numbers
            ]
            
            price_value = None
            for pattern in price_patterns:
                price_match = re.search(pattern, text)
                if price_match:
                    try:
                        price_str = price_match.group(1) if price_match.groups() else price_match.group(0)
                        # Clean price string - handle various formats
                        price_str = price_str.replace('.', '').replace('-', '').replace(',', '.')
                        price_value = float(price_str)
                        
                        # Accept prices from 100 to 10,000,000 (lebih fleksibel)
                        if 100 <= price_value <= 10000000:
                            break
                        else:
                            price_value = None
                    except ValueError:
                        continue
            
            if price_value:
                # Look for item name - LEBIH FLEKSIBEL
                item_name = ""
                quantity = "1"
                unit = "pcs"
                
                # Try to find item name in the same text (remove price part)
                clean_text = re.sub(r'[Rr][Pp]\.?\s*\d+(?:[\.\-]\d{3})*(?:,\d{2})?', '', text)
                clean_text = re.sub(r'\d+(?:[\.\-]\d{3})*(?:,\d{2})?\s*[Rr][Pp]', '', clean_text)
                clean_text = clean_text.strip()
                
                # Extract quantity and unit from text
                qty_match = re.search(r'^(\d+)\s*([a-zA-Z]+)', clean_text)
                if qty_match:
                    quantity = qty_match.group(1)
                    unit_text = qty_match.group(2).lower()
                    # Map common abbreviations
                    unit_map = {
                        'bks': 'bungkus', 'bks.': 'bungkus', 'bks': 'bungkus',
                        'klg': 'kaleng', 'klg.': 'kaleng',
                        'btl': 'botol', 'btl.': 'botol', 'btl': 'botol',
                        'kg': 'kg', 'kg.': 'kg',
                        'pcs': 'pcs', 'pcs.': 'pcs',
                        'ikat': 'ikat', 'ikat.': 'ikat'
                    }
                    unit = unit_map.get(unit_text, 'pcs')
                    # Remove quantity and unit from item name
                    clean_text = re.sub(r'^\d+\s*[a-zA-Z]+\.?\s*', '', clean_text)
                
                if len(clean_text) > 1:
                    item_name = clean_text
                else:
                    # Look in previous texts
                    for j in range(max(0, i-3), i):
                        if j < len(text_list):
                            prev_text = text_list[j].strip()
                            # Skip if it looks like a price or header
                            if (len(prev_text) > 2 and 
                                not re.search(r'[Rr][Pp]', prev_text) and
                                not re.search(r'^\d+$', prev_text) and
                                not any(word in prev_text.lower() for word in skip_words)):
                                item_name = prev_text
                                break
                
                # Clean item name
                if item_name:
                    # Remove common prefixes and clean up
                    item_name = re.sub(r'^\d+\.?\s*', '', item_name)  # Remove numbering
                    item_name = re.sub(r'^[a-zA-Z]+\.?\s*', '', item_name)  # Remove single letters
                    item_name = item_name.strip()
                
                if item_name and len(item_name) > 1:
                    items.append({
                        'nama_barang': item_name,
                        'jumlah': quantity,
                        'harga': str(int(price_value)),
                        'unit': unit,
                        'category_id': 1,
                        'minStock': 10
                    })
                    print(f"Found item: {item_name} - {quantity} {unit} - Rp {int(price_value)}")
        
        # If no items found with prices, try to find items without prices
        if len(items) == 0:
            print("No items with prices found, trying to find items without prices...")
            for i, text in enumerate(text_list):
                text = text.strip()
                
                # Skip empty or very short text
                if len(text) < 3:
                    continue
                    
                # Skip if it's clearly a header/footer
                if any(word in text.lower() for word in skip_words):
                    continue
                
                # Skip if it's just numbers
                if re.match(r'^\d+$', text):
                    continue
                
                # Skip if it contains price patterns
                if re.search(r'[Rr][Pp]|^\d+[\.\-]\d+', text):
                    continue
                
                # This might be an item name
                item_name = text
                quantity = "1"
                unit = "pcs"
                
                # Extract quantity and unit
                qty_match = re.search(r'^(\d+)\s*([a-zA-Z]+)', item_name)
                if qty_match:
                    quantity = qty_match.group(1)
                    unit_text = qty_match.group(2).lower()
                    unit_map = {
                        'bks': 'bungkus', 'bks.': 'bungkus',
                        'klg': 'kaleng', 'klg.': 'kaleng',
                        'btl': 'botol', 'btl.': 'botol',
                        'kg': 'kg', 'kg.': 'kg',
                        'pcs': 'pcs', 'pcs.': 'pcs',
                        'ikat': 'ikat', 'ikat.': 'ikat'
                    }
                    unit = unit_map.get(unit_text, 'pcs')
                    item_name = re.sub(r'^\d+\s*[a-zA-Z]+\.?\s*', '', item_name)
                
                # Clean item name
                item_name = re.sub(r'^\d+\.?\s*', '', item_name)
                item_name = item_name.strip()
                
                if item_name and len(item_name) > 2:
                    items.append({
                        'nama_barang': item_name,
                        'jumlah': quantity,
                        'harga': '0',  # No price found
                        'unit': unit,
                        'category_id': 1,
                        'minStock': 10
                    })
                    print(f"Found item (no price): {item_name} - {quantity} {unit}")
        
        print(f"=== Parsed {len(items)} items (fallback) ===")
        for item in items:
            print(f"- {item['nama_barang']}: {item['harga']} ({item['unit']})")
            
        return items

    except Exception as e:
        print(f"Fallback parse error: {e}")
        traceback.print_exc()
        return []

def process_image_hybrid(image_file):
    """Process image with EasyOCR + Gemini AI"""
    try:
        # Save image
        image_path, saved_filename = save_image(image_file)
        if not image_path:
            return []

        # Step 1: Extract text with EasyOCR
        print("\n=== Step 1: EasyOCR Text Extraction ===")
        text_list = extract_text_with_easyocr(image_file)
        
        if not text_list:
            print("No text found by EasyOCR")
            return []

        # Step 2: Classify and structure with Gemini AI
        print("\n=== Step 2: Gemini AI Classification ===")
        result_json = classify_with_gemini(text_list, image_file)
        
        return result_json

    except Exception as e:
        print(f"Hybrid OCR error: {e}")
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
        
        print(f"Processing image: {image_file.filename}")
        
        # Process image with hybrid approach
        result = process_image_hybrid(image_file)
        
        print(f"Extracted {len(result)} items")
        
        return jsonify({
            "success": True,
            "data": {
                "items": result
            }
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/process-receipt', methods=['POST'])
def process_receipt():
    """Alias for process-photo for backward compatibility"""
    return process_photo()

@app.route('/health', methods=['GET'])
def health():
    gemini_status = "configured" if GEMINI_API_KEY != 'YOUR_GEMINI_API_KEY_HERE' else "not_configured"
    return jsonify({
        "status": "healthy", 
        "message": "OCR service is running",
        "easyocr": "ready",
        "gemini": gemini_status
    })

@app.route('/test-gemini', methods=['GET'])
def test_gemini():
    """Test Gemini AI connection"""
    try:
        if GEMINI_API_KEY == 'YOUR_GEMINI_API_KEY_HERE':
            return jsonify({
                "success": False,
                "error": "Gemini API key not configured"
            }), 400
        
        # Test with simple prompt
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
    print("Starting Hybrid OCR Service (EasyOCR + Gemini AI)...")
    print("Service: http://localhost:5000")
    print("Health: http://localhost:5000/health")
    print("Process: http://localhost:5000/process-photo")
    print("Test Gemini: http://localhost:5000/test-gemini")
    
    if GEMINI_API_KEY == 'YOUR_GEMINI_API_KEY_HERE':
        print("\nWARNING: Set GEMINI_API_KEY environment variable to use Gemini AI")
        print("Example: set GEMINI_API_KEY=your_api_key_here")
    
    app.run(host='0.0.0.0', port=5000, debug=False)


