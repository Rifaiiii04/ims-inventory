#!/usr/bin/env python3
"""
Test text processing with Gemini (without OCR)
"""

import requests
import json

def test_text_processing():
    """Test text processing with sample receipt text"""
    try:
        print("🧪 Testing text processing with Gemini...")
        
        # Sample receipt text
        sample_text = """
        TOKO ANGKRINGAN
        ================================
        Nasi Goreng       1 x 15000
        Es Teh           2 x 5000
        Kerupuk          1 x 3000
        ================================
        Total: Rp 28000
        """
        
        # Test Python service directly
        print("\n1. Testing Python service directly...")
        response = requests.post('http://127.0.0.1:5000/process-text', 
                               json={'text': sample_text}, 
                               timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Python service test successful!")
        else:
            print("❌ Python service test failed")
            return
        
        # Test Laravel API
        print("\n2. Testing Laravel API...")
        response = requests.post('http://127.0.0.1:8000/api/ocr/process-text', 
                               json={'text': sample_text}, 
                               timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Laravel API test successful!")
        else:
            print("❌ Laravel API test failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_text_processing()
