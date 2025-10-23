#!/usr/bin/env python3
"""
Test OCR with a small image
"""

import requests
import base64
import json

def create_test_image():
    """Create a small test image (1x1 pixel PNG)"""
    # This is a minimal PNG image (1x1 pixel, transparent)
    png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
    return base64.b64encode(png_data).decode('utf-8')

def test_ocr():
    """Test OCR with a small image"""
    try:
        print("🧪 Testing OCR with small image...")
        
        # Create test image
        image_data = create_test_image()
        
        # Send to OCR service
        response = requests.post('http://127.0.0.1:5000/process-receipt', 
                               json={'image': image_data}, 
                               timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ OCR test successful!")
        else:
            print("❌ OCR test failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_ocr()
