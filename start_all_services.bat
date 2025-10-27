@echo off
echo Starting All Services...

echo.
echo 1. Starting Laravel API...
start "Laravel API" cmd /k "php artisan serve --host=127.0.0.1 --port=8000"

echo.
echo 2. Starting OCR Service...
start "OCR Service" cmd /k "cd python_ocr_service && python ocr_service_hybrid.py"

echo.
echo 3. Starting Frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo All services started!
echo.
echo Laravel API: http://127.0.0.1:8000
echo OCR Service: http://127.0.0.1:5000
echo Frontend: http://localhost:5173
echo.
pause
