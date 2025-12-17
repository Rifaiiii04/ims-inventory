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
    Write-Host "   - APP_KEY (akan di-generate otomatis)" -ForegroundColor Yellow
    Write-Host "   - GEMINI_API_KEY (untuk OCR service)" -ForegroundColor Yellow
    Write-Host "   - OLLAMA_MODEL (default: gemma2:2b)" -ForegroundColor Yellow
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

# Setup Ollama model
Write-Host "🤖 Setting up Ollama AI model..." -ForegroundColor Cyan
$ollamaModel = (Get-Content .env | Select-String -Pattern "^OLLAMA_MODEL=" | ForEach-Object { $_.Line.Split('=')[1] }) -replace '^"|"$', ''
if (-not $ollamaModel) {
    $ollamaModel = "gemma2:2b"
}
Write-Host "   Model: $ollamaModel" -ForegroundColor Gray
Write-Host "   ⏳ Downloading model (ini mungkin memakan waktu beberapa menit)..." -ForegroundColor Yellow
docker-compose exec -T ollama ollama pull $ollamaModel 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Model $ollamaModel berhasil di-download" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Model download gagal atau sudah ada. Lanjutkan..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Docker environment siap!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Services yang tersedia:" -ForegroundColor Cyan
Write-Host "   - Laravel App: http://localhost" -ForegroundColor White
Write-Host "   - n8n: http://localhost:5678" -ForegroundColor White
Write-Host "   - OCR Service: http://localhost:5000" -ForegroundColor White
Write-Host "   - Expired Prediction: http://localhost:5001" -ForegroundColor White
Write-Host "   - Ollama API: http://localhost:11434" -ForegroundColor White
Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Cyan
Write-Host "   - View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   - Stop: docker-compose down" -ForegroundColor White
Write-Host "   - Rebuild: docker-compose up -d --build" -ForegroundColor White
Write-Host "   - Download Ollama model: docker-compose exec ollama ollama pull <model>" -ForegroundColor White
Write-Host ""

