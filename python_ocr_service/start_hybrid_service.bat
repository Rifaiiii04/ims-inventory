@echo off
echo Starting Hybrid OCR Service (EasyOCR + Gemini AI)...
echo.

REM Set your Gemini API key here
REM Using the same API key as n8n workflow
set GEMINI_API_KEY=AIzaSyBcXp7KL2rzTiQgqHEkSw-slg27K03vj0s

echo Gemini API Key: %GEMINI_API_KEY%
echo.

REM Install dependencies if needed
echo Installing/updating dependencies...
pip install -r requirements.txt

echo.
echo Starting service...
python ocr_service_hybrid.py

pause


