# PowerShell script untuk memulai Docker environment
# Usage: .\docker-start.ps1

Write-Host "🚀 Starting Angkringan IMS Docker Environment..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  File .env tidak ditemukan!" -ForegroundColor Yellow
    Write-Host "📝 Membuat file .env dari template..." -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "✅ File .env dibuat dari .env.example" -ForegroundColor Green
    } elseif (Test-Path env.docker.example) {
        Copy-Item env.docker.example .env
        Write-Host "✅ File .env dibuat dari env.docker.example" -ForegroundColor Green
    } else {
        Write-Host "❌ File template .env tidak ditemukan!" -ForegroundColor Red
        Write-Host "📝 Silakan buat file .env secara manual" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "⚠️  Jangan lupa untuk mengisi konfigurasi di file .env!" -ForegroundColor Yellow
    Write-Host "   - APP_KEY (generate dengan: docker-compose exec app php artisan key:generate)" -ForegroundColor Yellow
    Write-Host "   - GEMINI_API_KEY (untuk OCR service)" -ForegroundColor Yellow
}

# Start Docker containers
Write-Host "🐳 Starting Docker containers..." -ForegroundColor Cyan
docker-compose up -d

# Wait for services to be ready
Write-Host "⏳ Menunggu services siap..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if app key exists and generate if needed
Write-Host "🔑 Checking application key..." -ForegroundColor Cyan
$keyCheck = docker-compose exec -T app php artisan key:generate --show 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔑 Generating application key..." -ForegroundColor Cyan
    docker-compose exec -T app php artisan key:generate
}

# Install dependencies if vendor doesn't exist
if (-not (Test-Path vendor)) {
    Write-Host "📦 Installing Composer dependencies..." -ForegroundColor Cyan
    docker-compose exec -T app composer install
}

if (-not (Test-Path node_modules)) {
    Write-Host "📦 Installing NPM dependencies..." -ForegroundColor Cyan
    docker-compose exec -T app npm install
}

# Run migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
docker-compose exec -T app php artisan migrate --force

Write-Host ""
Write-Host "✅ Docker environment siap!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Services yang tersedia:" -ForegroundColor Cyan
Write-Host "   - Laravel App: http://localhost" -ForegroundColor White
Write-Host "   - n8n: http://localhost:5678" -ForegroundColor White
Write-Host "   - OCR Service: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Cyan
Write-Host "   - View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   - Stop: docker-compose down" -ForegroundColor White
Write-Host "   - Rebuild: docker-compose up -d --build" -ForegroundColor White
Write-Host ""

