import requests
import json

# Test Gemini Vision service
PYTHON_SERVICE_URL = "http://127.0.0.1:5000"
LARAVEL_API_URL = "http://127.0.0.1:8000/api/ocr/process-photo"

print("🧪 Testing Gemini Vision service...\n")

# Test 1: Health check
print("1. Testing health check...")
try:
    response = requests.get(f"{PYTHON_SERVICE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    if response.status_code == 200:
        print("✅ Health check successful!\n")
    else:
        print("❌ Health check failed\n")
except Exception as e:
    print(f"❌ Health check error: {e}\n")

# Test 2: Text processing (still available)
print("2. Testing text processing...")
test_text = """
TOKO ANGKRINGAN
===============================
Nasi Goreng       1 x 15000
Es Teh           2 x 5000
Kerupuk          1 x 3000
===============================
Total: Rp 28000
"""

try:
    response = requests.post(f"{PYTHON_SERVICE_URL}/process-text", json={"text": test_text})
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    if response.status_code == 200 and response.json().get("success"):
        print("✅ Text processing successful!\n")
    else:
        print("❌ Text processing failed\n")
except Exception as e:
    print(f"❌ Text processing error: {e}\n")

print("📝 Note: Photo processing requires actual image files.")
print("   Use the web interface to test photo upload functionality.")
