#!/bin/bash

# Script untuk memulai Docker environment
# Usage: ./docker-start.sh

echo "🚀 Starting Angkringan IMS Docker Environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  File .env tidak ditemukan!"
    echo "📝 Membuat file .env dari template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ File .env dibuat dari .env.example"
    elif [ -f env.docker.example ]; then
        cp env.docker.example .env
        echo "✅ File .env dibuat dari env.docker.example"
    else
        echo "❌ File template .env tidak ditemukan!"
        echo "📝 Silakan buat file .env secara manual"
        exit 1
    fi
    echo "⚠️  Jangan lupa untuk mengisi konfigurasi di file .env!"
    echo "   - APP_KEY (generate dengan: docker-compose exec app php artisan key:generate)"
    echo "   - GEMINI_API_KEY (untuk OCR service)"
fi

# Start Docker containers
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Menunggu services siap..."
sleep 10

# Check if app key exists
echo "🔑 Checking application key..."
docker-compose exec -T app php artisan key:generate --show > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "🔑 Generating application key..."
    docker-compose exec -T app php artisan key:generate
fi

# Install dependencies if vendor doesn't exist
if [ ! -d "vendor" ]; then
    echo "📦 Installing Composer dependencies..."
    docker-compose exec -T app composer install
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Installing NPM dependencies..."
    docker-compose exec -T app npm install
fi

# Run migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T app php artisan migrate --force

echo ""
echo "✅ Docker environment siap!"
echo ""
echo "📋 Services yang tersedia:"
echo "   - Laravel App: http://localhost"
echo "   - n8n: http://localhost:5678"
echo "   - OCR Service: http://localhost:5000"
echo ""
echo "📝 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop: docker-compose down"
echo "   - Rebuild: docker-compose up -d --build"
echo ""

