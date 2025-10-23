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
    print("=== Testing Health Endpoint ===")
    try:
        response = requests.get('http://localhost:5000/health')
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_gemini():
    """Test Gemini AI connection"""
    print("\n=== Testing Gemini AI ===")
    try:
        response = requests.get('http://localhost:5000/test-gemini')
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_ocr_with_image(image_path):
    """Test OCR dengan gambar"""
    print(f"\n=== Testing OCR with Image: {image_path} ===")
    
    if not os.path.exists(image_path):
        print(f"Image file not found: {image_path}")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post('http://localhost:5000/process-photo', files=files)
        
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if result.get('success') and 'data' in result:
            items = result['data'].get('items', [])
            print(f"\nExtracted {len(items)} items:")
            for i, item in enumerate(items, 1):
                print(f"{i}. {item.get('nama_barang', 'N/A')} - Rp {item.get('harga', 'N/A')}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    print("Hybrid OCR Service Test")
    print("=" * 50)
    
    # Test 1: Health check
    health_ok = test_health()
    
    # Test 2: Gemini AI
    gemini_ok = test_gemini()
    
    # Test 3: OCR dengan gambar (jika ada)
    ocr_ok = False
    uploads_dir = 'uploads'
    if os.path.exists(uploads_dir):
        image_files = [f for f in os.listdir(uploads_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if image_files:
            test_image = os.path.join(uploads_dir, image_files[0])
            ocr_ok = test_ocr_with_image(test_image)
        else:
            print(f"\nNo image files found in {uploads_dir}")
    else:
        print(f"\nUploads directory not found: {uploads_dir}")
    
    # Summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY:")
    print(f"Health Check: {'✓ PASS' if health_ok else '✗ FAIL'}")
    print(f"Gemini AI: {'✓ PASS' if gemini_ok else '✗ FAIL'}")
    print(f"OCR Test: {'✓ PASS' if ocr_ok else '✗ FAIL'}")
    
    if all([health_ok, gemini_ok, ocr_ok]):
        print("\n🎉 All tests passed! Service is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the service configuration.")

if __name__ == '__main__':
    main()
