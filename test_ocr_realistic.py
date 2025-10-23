#!/usr/bin/env python3
"""
Test OCR with a realistic receipt image
"""

import requests
import base64
import json
from PIL import Image, ImageDraw, ImageFont
import io

def create_receipt_image():
    """Create a simple receipt-like image for testing"""
    # Create a white image
    img = Image.new('RGB', (400, 300), color='white')
    draw = ImageDraw.Draw(img)
    
    # Use default font
    font = ImageFont.load_default()
    
    # Draw receipt content
    y = 20
    draw.text((20, y), "TOKO ANGKRINGAN", fill='black', font=font)
    y += 30
    draw.text((20, y), "================================", fill='black', font=font)
    y += 30
    draw.text((20, y), "Nasi Goreng       1 x 15000", fill='black', font=font)
    y += 25
    draw.text((20, y), "Es Teh           2 x 5000", fill='black', font=font)
    y += 25
    draw.text((20, y), "Kerupuk          1 x 3000", fill='black', font=font)
    y += 30
    draw.text((20, y), "================================", fill='black', font=font)
    y += 25
    draw.text((20, y), "Total: Rp 28000", fill='black', font=font)
    
    # Convert to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return base64.b64encode(img_bytes.getvalue()).decode('utf-8')

def test_ocr():
    """Test OCR with a realistic receipt image"""
    try:
        print("🧪 Testing OCR with realistic receipt image...")
        
        # Create test image
        image_data = create_receipt_image()
        
        # Send to OCR service
        response = requests.post('http://127.0.0.1:5000/process-receipt', 
                               json={'image': image_data}, 
                               timeout=60)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ OCR test successful!")
                print(f"📝 Found {len(result.get('classified_data', []))} items")
            else:
                print(f"⚠️ OCR completed but no items found: {result.get('error', 'Unknown error')}")
        else:
            print("❌ OCR test failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_ocr()
