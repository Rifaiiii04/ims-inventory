@echo off
echo Installing Python OCR Dependencies...
cd python_ocr_service
pip install -r requirements.txt
echo.
echo Dependencies installed successfully!
echo Now you can run: start_ocr_service.bat
pause
