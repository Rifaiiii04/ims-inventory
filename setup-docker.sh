#!/bin/bash

# Bash script untuk setup lengkap Docker environment
# Usage: ./setup-docker.sh

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Angkringan IMS - Docker Setup Script                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check Docker
echo "🔍 Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "   ✅ $DOCKER_VERSION"
else
    echo "   ❌ Docker tidak ditemukan!"
    echo "   📥 Silakan install Docker: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check Docker running
echo "🔍 Checking Docker daemon..."
if docker ps &> /dev/null; then
    echo "   ✅ Docker daemon running"
else
    echo "   ❌ Docker daemon tidak running!"
    echo "   🚀 Silakan start Docker Desktop"
    exit 1
fi

# Setup .env file
echo ""
echo "📝 Setting up environment file..."
if [ ! -f .env ]; then
    if [ -f env.docker.example ]; then
        cp env.docker.example .env
        echo "   ✅ File .env dibuat dari env.docker.example"
    elif [ -f .env.example ]; then
        cp .env.example .env
        echo "   ✅ File .env dibuat dari .env.example"
    else
        echo "   ❌ Template .env tidak ditemukan!"
        exit 1
    fi
else
    echo "   ℹ️  File .env sudah ada"
fi

# Start Docker containers
echo ""
echo "🐳 Starting Docker containers..."
docker-compose up -d --build

if [ $? -ne 0 ]; then
    echo "   ❌ Gagal start containers!"
    exit 1
fi

echo "   ✅ Containers started"

# Wait for services
echo ""
echo "⏳ Menunggu services siap (30 detik)..."
sleep 30

# Generate application key
echo ""
echo "🔑 Generating application key..."
docker-compose exec -T app php artisan key:generate --force > /dev/null 2>&1
echo "   ✅ Application key generated"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."

if [ ! -d "vendor" ]; then
    echo "   📦 Installing Composer dependencies..."
    docker-compose exec -T app composer install --no-interaction
    echo "   ✅ Composer dependencies installed"
else
    echo "   ℹ️  Composer dependencies sudah ada"
fi

if [ ! -d "node_modules" ]; then
    echo "   📦 Installing NPM dependencies..."
    docker-compose exec -T app npm install
    echo "   ✅ NPM dependencies installed"
else
    echo "   ℹ️  NPM dependencies sudah ada"
fi

# Run migrations
echo ""
echo "🗄️  Setting up database..."
echo "   ⏳ Waiting for MySQL to be ready..."
sleep 10
docker-compose exec -T app php artisan migrate --force
echo "   ✅ Database migrations completed"

# Setup Ollama model
echo ""
echo "🤖 Setting up Ollama AI model..."
OLLAMA_MODEL="gemma2:2b"
if [ -f .env ]; then
    MODEL_LINE=$(grep "^OLLAMA_MODEL=" .env)
    if [ ! -z "$MODEL_LINE" ]; then
        OLLAMA_MODEL=$(echo "$MODEL_LINE" | cut -d '=' -f2 | tr -d '"')
    fi
fi

echo "   📥 Downloading model: $OLLAMA_MODEL"
echo "   ⚠️  Ini mungkin memakan waktu beberapa menit..."
docker-compose exec -T ollama ollama pull "$OLLAMA_MODEL" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Model $OLLAMA_MODEL ready"
else
    echo "   ⚠️  Model mungkin sudah ada atau download gagal"
fi

# Health check
echo ""
echo "🏥 Checking services health..."

# MySQL
if docker-compose exec -T mysql mysqladmin ping -h localhost --silent > /dev/null 2>&1; then
    echo "   ✅ MySQL"
else
    echo "   ⚠️  MySQL - mungkin masih starting"
fi

# Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "   ✅ Redis"
else
    echo "   ⚠️  Redis - mungkin masih starting"
fi

# OCR Service
if docker-compose exec -T ocr_service curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "   ✅ OCR Service"
else
    echo "   ⚠️  OCR Service - mungkin masih starting"
fi

# Expired Prediction
if docker-compose exec -T expired_prediction_service curl -f http://localhost:5001/health > /dev/null 2>&1; then
    echo "   ✅ Expired Prediction"
else
    echo "   ⚠️  Expired Prediction - mungkin masih starting"
fi

# Ollama
if docker-compose exec -T ollama curl -f http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "   ✅ Ollama"
else
    echo "   ⚠️  Ollama - mungkin masih starting"
fi

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Setup Selesai! ✅                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Services yang tersedia:"
echo "   🌐 Laravel App:        http://localhost"
echo "   🔄 n8n:                http://localhost:5678"
echo "   👁️  OCR Service:        http://localhost:5000"
echo "   📅 Expired Prediction: http://localhost:5001"
echo "   🤖 Ollama API:         http://localhost:11434"
echo ""
echo "📝 Useful commands:"
echo "   📊 View logs:          docker-compose logs -f"
echo "   🛑 Stop services:      docker-compose down"
echo "   🔄 Rebuild:            docker-compose up -d --build"
echo "   🔍 Check status:       docker-compose ps"
echo ""
echo "💡 Tips:"
echo "   - Pastikan GEMINI_API_KEY sudah diisi di file .env untuk OCR service"
echo "   - Untuk download model Ollama lain: docker-compose exec ollama ollama pull <model>"
echo "   - Cek dokumentasi lengkap di: docker-setup-guide.md"
echo ""
