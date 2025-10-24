@echo off
echo Starting Hybrid OCR Service (EasyOCR + Gemini AI)...
echo.

REM Set your Gemini API key here
REM Replace YOUR_GEMINI_API_KEY_HERE with your actual API key
set GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

echo Gemini API Key: %GEMINI_API_KEY%
echo.

REM Install dependencies if needed
echo Installing/updating dependencies...
pip install -r requirements.txt

echo.
echo Starting service...
python ocr_service_hybrid.py

pause


