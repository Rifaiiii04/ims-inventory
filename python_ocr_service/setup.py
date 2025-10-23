#!/usr/bin/env python3
"""
Setup script for OCR Service
Run this script to install dependencies and start the service
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def check_gemini_api():
    """Check if Gemini API key is configured"""
    api_key = "AIzaSyBzb2hZXhceAjTlW1nfiXdlK710-t5TQ20"
    if not api_key or api_key == "YOUR_API_KEY_HERE":
        print("❌ Please configure your Gemini API key in ocr_service.py")
        return False
    print("✅ Gemini API key configured")
    return True

def start_service():
    """Start the OCR service"""
    print("Starting OCR service...")
    try:
        subprocess.run([sys.executable, "server.py"])
    except KeyboardInterrupt:
        print("\n🛑 Service stopped by user")
    except Exception as e:
        print(f"❌ Error starting service: {e}")

def main():
    print("🚀 Setting up OCR Service...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("ocr_service.py"):
        print("❌ Please run this script from the python_ocr_service directory")
        sys.exit(1)
    
    # Install dependencies
    if not install_requirements():
        sys.exit(1)
    
    # Check API key
    if not check_gemini_api():
        sys.exit(1)
    
    print("=" * 50)
    print("✅ Setup complete! Starting service...")
    print("📍 Service will be available at: http://localhost:5000")
    print("🛑 Press Ctrl+C to stop the service")
    print("=" * 50)
    
    # Start service
    start_service()

if __name__ == "__main__":
    main()
