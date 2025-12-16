#!/bin/bash
# Script untuk menjalankan Expired Prediction Service dengan port yang bisa diatur
# Usage: ./start_service.sh [port]
# Contoh: ./start_service.sh 5001
#         ./start_service.sh 5002

PORT=${1:-5001}

echo "Starting Expired Prediction Service on port $PORT..."
python3 expired_prediction_service.py --port $PORT
