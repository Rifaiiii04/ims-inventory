#!/usr/bin/env python3
"""
Test script untuk Hybrid OCR Service (EasyOCR + Gemini AI)
"""

import requests
import json
import os
from PIL import Image
import io

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get('http://127.0.0.1:5000/health', timeout=5)
        print(f"Health Check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_gemini():
    """Test Gemini AI connection"""
    try:
        response = requests.get('http://127.0.0.1:5000/test-gemini', timeout=10)
        print(f"Gemini Test: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Gemini test failed: {e}")
        return False

def create_test_image():
    """Create a simple test receipt image"""
    # Create a simple receipt image
    img = Image.new('RGB', (400, 300), color='white')
    
    # You can add text here if needed
    # For now, just return a simple image
    return img

def test_ocr_with_image():
    """Test OCR with a test image"""
    try:
        # Create test image
        test_img = create_test_image()
        
        # Save to bytes
        img_byte_arr = io.BytesIO()
        test_img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        # Test OCR endpoint
        files = {'image': ('test_receipt.png', img_byte_arr, 'image/png')}
        response = requests.post('http://127.0.0.1:5000/process-photo', files=files, timeout=30)
        
        print(f"OCR Test: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
        
    except Exception as e:
        print(f"OCR test failed: {e}")
        return False

def main():
    print("🧪 Testing Hybrid OCR Service (EasyOCR + Gemini AI)...\n")
    
    # Test 1: Health check
    print("1. Testing health endpoint...")
    health_ok = test_health()
    print()
    
    if not health_ok:
        print("❌ Service is not running. Please start the service first.")
        return
    
    # Test 2: Gemini AI test
    print("2. Testing Gemini AI connection...")
    gemini_ok = test_gemini()
    print()
    
    # Test 3: OCR test
    print("3. Testing OCR with test image...")
    ocr_ok = test_ocr_with_image()
    print()
    
    # Summary
    print("=== Test Results ===")
    print(f"Health Check: {'✅' if health_ok else '❌'}")
    print(f"Gemini AI: {'✅' if gemini_ok else '❌'}")
    print(f"OCR Test: {'✅' if ocr_ok else '❌'}")
    
    if health_ok and gemini_ok and ocr_ok:
        print("\n🎉 All tests passed! Service is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Please check the service configuration.")

if __name__ == "__main__":
    main()
