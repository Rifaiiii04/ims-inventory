#!/usr/bin/env python3
"""
Start OCR Service
"""

import subprocess
import sys
import os
import time

def start_ocr_service():
    """Start the OCR service"""
    try:
        print("🚀 Starting OCR Service...")
        
        # Change to python_ocr_service directory
        os.chdir('python_ocr_service')
        
        # Start the service
        process = subprocess.Popen([sys.executable, 'server.py'], 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE,
                                 text=True)
        
        print("✅ OCR Service started successfully!")
        print("📍 Service URL: http://localhost:5000")
        print("🔍 Health check: http://localhost:5000/health")
        print("🛑 Press Ctrl+C to stop the service")
        
        # Wait for the process
        try:
            process.wait()
        except KeyboardInterrupt:
            print("\n🛑 Stopping OCR Service...")
            process.terminate()
            process.wait()
            print("✅ OCR Service stopped")
            
    except Exception as e:
        print(f"❌ Error starting OCR service: {e}")

if __name__ == "__main__":
    start_ocr_service()
