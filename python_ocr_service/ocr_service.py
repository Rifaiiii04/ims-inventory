#!/usr/bin/env python3
"""
OCR Service - EasyOCR Only
Versi sederhana hanya untuk ekstrak text
"""

import json
import traceback
from flask import Flask, request, jsonify, send_file
import os
import easyocr
import numpy as np
import cv2
from datetime import datetime
import uuid

# Initialize EasyOCR
print("Initializing EasyOCR...")
reader = easyocr.Reader(['en', 'id'])
print("EasyOCR initialized successfully!")

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

def parse_receipt_text(text_list):
    """Parse receipt text to extract items"""
    try:
        if not text_list:
            return []

        print("=== Raw OCR Text ===")
        for i, text in enumerate(text_list):
            print(f"{i}: {text}")
        
        items = []
        import re
        
        # Look for patterns that might be items with prices
        for i, text in enumerate(text_list):
            text = text.strip()
            
            # Skip empty or very short text
            if len(text) < 3:
                continue
            
            # Look for price patterns (various formats)
            price_patterns = [
                r'[Rr][Pp]\.?\s*(\d+(?:\.\d{3})*(?:,\d{2})?)',  # Rp 1.500 or Rp. 1500
                r'(\d+(?:\.\d{3})*(?:,\d{2})?)\s*[Rr][Pp]',    # 1500 Rp
                r'(\d+(?:\.\d{3})*(?:,\d{2})?)',               # Just numbers
            ]
            
            price_value = None
            for pattern in price_patterns:
                price_match = re.search(pattern, text)
                if price_match:
                    try:
                        price_str = price_match.group(1) if price_match.groups() else price_match.group(0)
                        # Clean price string
                        price_str = price_str.replace('.', '').replace(',', '.')
                        price_value = float(price_str)
                        
                        # Only accept reasonable prices (between 1000 and 1000000)
                        if 1000 <= price_value <= 1000000:
                            break
                        else:
                            price_value = None
                    except ValueError:
                        continue
            
            if price_value:
                # Look for item name
                item_name = ""
                
                # Try to find item name in the same text (remove price part)
                clean_text = re.sub(r'[Rr][Pp]\.?\s*\d+(?:\.\d{3})*(?:,\d{2})?', '', text)
                clean_text = re.sub(r'\d+(?:\.\d{3})*(?:,\d{2})?\s*[Rr][Pp]', '', clean_text)
                clean_text = clean_text.strip()
                
                if len(clean_text) > 2:
                    item_name = clean_text
                else:
                    # Look in previous texts
                    for j in range(max(0, i-3), i):
                        if j < len(text_list):
                            prev_text = text_list[j].strip()
                            # Skip if it looks like a price or header
                            if (len(prev_text) > 3 and 
                                not re.search(r'[Rr][Pp]', prev_text) and
                                not re.search(r'^\d+$', prev_text) and
                                not prev_text.lower() in ['banyaknya', 'nama', 'barang', 'harga', 'jumlah']):
                                item_name = prev_text
                                break
                
                if item_name and len(item_name) > 2:
                    items.append({
                        'nama_barang': item_name,
                        'jumlah': '1',
                        'harga': str(int(price_value)),
                        'unit': 'pcs',
                        'category_id': 1,
                        'minStock': 10
                    })
                    print(f"Found item: {item_name} - Rp {int(price_value)}")
        
        print(f"=== Parsed {len(items)} items ===")
        for item in items:
            print(f"- {item['nama_barang']}: {item['harga']}")
            
        return items

    except Exception as e:
        print(f"Parse error: {e}")
        import traceback
        traceback.print_exc()
        return []

def process_image(image_file):
    """Process image with EasyOCR only"""
    try:
        # Save image
        image_path, saved_filename = save_image(image_file)
        if not image_path:
            return []

        # Reset file pointer
        image_file.seek(0)
        
        # Preprocess image
        processed = preprocess(image_file)
        if processed is None:
            return []

        # Extract text with EasyOCR
        result = reader.readtext(processed, detail=0)
        print(f"\n=== Hasil OCR ===")
        print(result)
        
        # If no text found, try with original image
        if not result:
            print("No text found in processed image, trying original...")
            image_file.seek(0)
            from PIL import Image
            image = Image.open(image_file)
            if image.mode != 'RGB':
                image = image.convert('RGB')
            img_array = np.array(image)
            result = reader.readtext(img_array, detail=0)
            print(f"=== Hasil OCR Original ===")
            print(result)

        if not result:
            return []

        # Parse text to extract items
        print("\n=== Parsing text to extract items ===")
        result_json = parse_receipt_text(result)
        
        return result_json

    except Exception as e:
        print(f"OCR error: {e}")
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
        
        # Process image
        result = process_image(image_file)
        
        print(f"Extracted {len(result)} items")
        
        return jsonify({
            "success": True,
            "data": {
                "items": result
            }
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "message": "OCR service is running"})

if __name__ == '__main__':
    print("Starting OCR Service...")
    print("Service: http://localhost:5000")
    print("Health: http://localhost:5000/health")
    print("Process: http://localhost:5000/process-photo")
    
    app.run(host='0.0.0.0', port=5000, debug=False)