@echo off
echo Starting Hybrid OCR Service (EasyOCR + Gemini AI)...
echo.

REM Set your Gemini API key here
set GEMINI_API_KEY=AIzaSyBzb2hZXhceAjTlW1nfiXdlK710-t5TQ20

echo Gemini API Key: %GEMINI_API_KEY%
echo.

REM Install dependencies if needed
echo Installing/updating dependencies...
pip install -r requirements.txt

echo.
echo Starting service...
python ocr_service_hybrid.py

pause


