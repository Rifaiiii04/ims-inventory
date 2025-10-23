#!/usr/bin/env python3
"""
Test OCR Service - Simple version
"""

from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/process-photo', methods=['POST'])
def process_photo():
    try:
        if 'image' not in request.files:
            return jsonify({"success": False, "error": "No image file provided"}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({"success": False, "error": "No image file selected"}), 400
        
        print(f"Received image: {image_file.filename}")
        
        # Return sample data for testing
        result = [
            {
                "nama_barang": "Nasi Goreng",
                "jumlah": "2",
                "harga": "15000",
                "unit": "pcs",
                "category_id": 1,
                "minStock": 0
            },
            {
                "nama_barang": "Es Teh",
                "jumlah": "1",
                "harga": "5000",
                "unit": "pcs",
                "category_id": 2,
                "minStock": 0
            }
        ]
        
        print(f"Returning {len(result)} sample items")
        
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
    return jsonify({"status": "healthy", "message": "Test OCR service is running"})

if __name__ == '__main__':
    print("Starting Test OCR Service...")
    print("Service: http://localhost:5000")
    print("Health: http://localhost:5000/health")
    print("Process: http://localhost:5000/process-photo")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
