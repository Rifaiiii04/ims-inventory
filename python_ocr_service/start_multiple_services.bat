@echo off
REM Script untuk menjalankan multiple instances Expired Prediction Service dengan port berbeda
REM Setiap instance akan berjalan di window terpisah

echo Starting multiple Expired Prediction Service instances...
echo.

start "Expired Prediction Service - Port 5001" cmd /k "python expired_prediction_service.py --port 5001"
timeout /t 2 /nobreak >nul

start "Expired Prediction Service - Port 5002" cmd /k "python expired_prediction_service.py --port 5002"
timeout /t 2 /nobreak >nul

echo.
echo Multiple services started!
echo - Service 1: http://127.0.0.1:5001
echo - Service 2: http://127.0.0.1:5002
echo.
echo Press any key to close this window (services will continue running)...
pause >nul
