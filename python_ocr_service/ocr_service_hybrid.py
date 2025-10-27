#!/usr/bin/env python3
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

from dotenv import load_dotenv
load_dotenv()

print("Initializing EasyOCR...")
reader = easyocr.Reader(['en', 'id'])
print("EasyOCR initialized successfully!")


print("Initializing Gemini AI...")
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-flash-latest')
print("Gemini AI initialized successfully!")

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

def preprocess(image_file):
    """Preprocess image for better OCR - SIMPLE seperti contoh user"""
    try:
        image_file.seek(0)
        
        image_bytes = image_file.read()
        image_file.seek(0)
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            print("Failed to decode image")
            return None
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        
        _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        return thresh
    except Exception as e:
        print(f"Preprocessing error: {e}")
        return None

def extract_text_with_easyocr(image_file):
    """Extract text using EasyOCR - SIMPLE seperti contoh user"""
    try:
        image_file.seek(0)
        
        print("\n=== Step 1: EasyOCR Text Extraction ===")
        
        processed = preprocess(image_file)
        if processed is None:
            return []
        
        result = reader.readtext(processed, detail=0)
        print(f"\n=== Hasil OCR ===")
        print(result)
        
        return result

    except Exception as e:
        print(f"EasyOCR error: {e}")
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

        if GEMINI_API_KEY != 'YOUR_GEMINI_API_KEY_HERE':
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
                    items.append({
                        'nama_barang': item.get('nama_barang', ''),
                        'jumlah': item.get('jumlah', '1'),
                        'harga': item.get('harga', '0'),
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
                            items.append({
                                'nama_barang': item.get('nama_barang', ''),
                                'jumlah': item.get('jumlah', '1'),
                                'harga': item.get('harga', '0'),
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
        else:
            print("Gemini API key not configured, using fallback parsing...")
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
    """Process image with EasyOCR + Gemini AI"""
    try:
        image_path, saved_filename = save_image(image_file)
        if not image_path:
            return []

        print("\n=== Step 1: EasyOCR Text Extraction ===")
        text_list = extract_text_with_easyocr(image_file)
        
        if not text_list:
            print("No text found by EasyOCR")
            return []

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


