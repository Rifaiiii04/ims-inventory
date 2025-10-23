@echo off
echo Starting OCR Service and Test...
echo.

echo Step 1: Starting OCR Service...
start "OCR Service" cmd /k "cd python_ocr_service && python server.py"

echo Step 2: Waiting for service to start...
timeout /t 5 /nobreak > nul

echo Step 3: Testing OCR Service...
python quick_test.py

echo.
echo If you see "Status: 200" above, the service is working!
echo You can now test OCR in the web application.
echo.
pause
