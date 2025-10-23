@echo off
echo Starting Lightweight OCR Service...
echo This service uses only Gemini Vision API (no heavy models)
echo.

cd /d "%~dp0"

echo Installing required packages...
pip install -r requirements.txt

echo.
echo Starting service...
python run_lightweight_service.py

pause
