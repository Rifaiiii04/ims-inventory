#!/usr/bin/env python3
"""
Debug OCR extraction
"""

import easyocr
import cv2
import numpy as np
from PIL import Image

# Initialize EasyOCR
print("Initializing EasyOCR...")
reader = easyocr.Reader(['en', 'id'])
print("EasyOCR initialized successfully!")

def test_ocr(image_path):
    """Test OCR on image"""
    try:
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            print(f"Could not load image: {image_path}")
            return
        
        print(f"Testing OCR on: {image_path}")
        print("Image shape:", image.shape)
        
        # Extract text with EasyOCR
        result = reader.readtext(image, detail=0)
        print(f"\n=== Raw OCR Results ===")
        print(f"Total text blocks: {len(result)}")
        
        for i, text in enumerate(result):
            print(f"{i:2d}: '{text}'")
        
        # Try with preprocessing
        print(f"\n=== With Preprocessing ===")
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        result2 = reader.readtext(thresh, detail=0)
        print(f"Total text blocks (preprocessed): {len(result2)}")
        
        for i, text in enumerate(result2):
            print(f"{i:2d}: '{text}'")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_ocr("python_ocr_service/uploads/receipt_20251023_185652_e1f4a6bf.jpg")



