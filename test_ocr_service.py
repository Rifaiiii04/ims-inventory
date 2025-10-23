#!/usr/bin/env python3
"""
Test script for OCR service
"""

import requests
import time
import json

def test_health():
    """Test health endpoint"""
    try:
        print("Testing health endpoint...")
        response = requests.get('http://localhost:5000/health', timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to OCR service. Make sure it's running on port 5000.")
        return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_ocr_with_dummy():
    """Test OCR with dummy data"""
    try:
        print("\nTesting OCR with dummy data...")
        
        # Create dummy base64 image (1x1 pixel PNG)
        dummy_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        
        response = requests.post('http://localhost:5000/process-receipt', 
                               json={'image': dummy_image}, 
                               timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ OCR test failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing OCR Service...")
    print("=" * 50)
    
    # Test health first
    if test_health():
        print("✅ Health check passed")
        
        # Wait a bit for service to be ready
        print("\n⏳ Waiting for service to be ready...")
        time.sleep(2)
        
        # Test OCR
        if test_ocr_with_dummy():
            print("✅ OCR test passed")
            print("\n🎉 OCR Service is working correctly!")
        else:
            print("❌ OCR test failed")
    else:
        print("❌ Health check failed")
        print("\n💡 Make sure to run: python server.py")
        print("   Or use: start_ocr_service.bat")
