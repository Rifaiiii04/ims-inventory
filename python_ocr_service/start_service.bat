@echo off
REM Script untuk menjalankan Expired Prediction Service dengan port yang bisa diatur
REM Usage: start_service.bat [port]
REM Contoh: start_service.bat 5001
REM         start_service.bat 5002

set PORT=%1
if "%PORT%"=="" set PORT=5001

echo Starting Expired Prediction Service on port %PORT%...
python expired_prediction_service.py --port %PORT%

pause
