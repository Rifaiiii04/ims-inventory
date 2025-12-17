# PowerShell script untuk setup lengkap Docker environment
# Usage: .\setup-docker.ps1

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Angkringan IMS - Docker Setup Script                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "🔍 Checking Docker installation..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version
    Write-Host "   ✅ $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker tidak ditemukan!" -ForegroundColor Red
    Write-Host "   📥 Silakan install Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check Docker running
Write-Host "🔍 Checking Docker daemon..." -ForegroundColor Cyan
try {
    docker ps | Out-Null
    Write-Host "   ✅ Docker daemon running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker daemon tidak running!" -ForegroundColor Red
    Write-Host "   🚀 Silakan start Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# Setup .env file
Write-Host ""
Write-Host "📝 Setting up environment file..." -ForegroundColor Cyan
if (-not (Test-Path .env)) {
    if (Test-Path env.docker.example) {
        Copy-Item env.docker.example .env
        Write-Host "   ✅ File .env dibuat dari env.docker.example" -ForegroundColor Green
    } elseif (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "   ✅ File .env dibuat dari .env.example" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Template .env tidak ditemukan!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ℹ️  File .env sudah ada" -ForegroundColor Gray
}

# Start Docker containers
Write-Host ""
Write-Host "🐳 Starting Docker containers..." -ForegroundColor Cyan
docker-compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Gagal start containers!" -ForegroundColor Red
    exit 1
}

Write-Host "   ✅ Containers started" -ForegroundColor Green

# Wait for services
Write-Host ""
Write-Host "⏳ Menunggu services siap (30 detik)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Generate application key
Write-Host ""
Write-Host "🔑 Generating application key..." -ForegroundColor Cyan
docker-compose exec -T app php artisan key:generate --force 2>&1 | Out-Null
Write-Host "   ✅ Application key generated" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan

if (-not (Test-Path vendor)) {
    Write-Host "   📦 Installing Composer dependencies..." -ForegroundColor Gray
    docker-compose exec -T app composer install --no-interaction
    Write-Host "   ✅ Composer dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Composer dependencies sudah ada" -ForegroundColor Gray
}

if (-not (Test-Path node_modules)) {
    Write-Host "   📦 Installing NPM dependencies..." -ForegroundColor Gray
    docker-compose exec -T app npm install
    Write-Host "   ✅ NPM dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  NPM dependencies sudah ada" -ForegroundColor Gray
}

# Run migrations
Write-Host ""
Write-Host "🗄️  Setting up database..." -ForegroundColor Cyan
Write-Host "   ⏳ Waiting for MySQL to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 10
docker-compose exec -T app php artisan migrate --force
Write-Host "   ✅ Database migrations completed" -ForegroundColor Green

# Setup Ollama model
Write-Host ""
Write-Host "🤖 Setting up Ollama AI model..." -ForegroundColor Cyan
$ollamaModel = "gemma2:2b"
if (Test-Path .env) {
    $envContent = Get-Content .env
    $modelLine = $envContent | Select-String -Pattern "^OLLAMA_MODEL="
    if ($modelLine) {
        $ollamaModel = ($modelLine.Line -split '=')[1].Trim() -replace '^"|"$', ''
    }
}

Write-Host "   📥 Downloading model: $ollamaModel" -ForegroundColor Gray
Write-Host "   ⚠️  Ini mungkin memakan waktu beberapa menit..." -ForegroundColor Yellow
docker-compose exec -T ollama ollama pull $ollamaModel 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Model $ollamaModel ready" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Model mungkin sudah ada atau download gagal" -ForegroundColor Yellow
}

# Health check
Write-Host ""
Write-Host "🏥 Checking services health..." -ForegroundColor Cyan
$services = @(
    @{Name="MySQL"; Check="docker-compose exec -T mysql mysqladmin ping -h localhost --silent"},
    @{Name="Redis"; Check="docker-compose exec -T redis redis-cli ping"},
    @{Name="OCR Service"; Check="docker-compose exec -T ocr_service curl -f http://localhost:5000/health"},
    @{Name="Expired Prediction"; Check="docker-compose exec -T expired_prediction_service curl -f http://localhost:5001/health"},
    @{Name="Ollama"; Check="docker-compose exec -T ollama curl -f http://localhost:11434/api/tags"}
)

foreach ($service in $services) {
    $result = Invoke-Expression $service.Check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $($service.Name)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $($service.Name) - mungkin masih starting" -ForegroundColor Yellow
    }
}

# Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    Setup Selesai! ✅                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Services yang tersedia:" -ForegroundColor Cyan
Write-Host "   🌐 Laravel App:        http://localhost" -ForegroundColor White
Write-Host "   🔄 n8n:                http://localhost:5678" -ForegroundColor White
Write-Host "   👁️  OCR Service:        http://localhost:5000" -ForegroundColor White
Write-Host "   📅 Expired Prediction: http://localhost:5001" -ForegroundColor White
Write-Host "   🤖 Ollama API:         http://localhost:11434" -ForegroundColor White
Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Cyan
Write-Host "   📊 View logs:          docker-compose logs -f" -ForegroundColor White
Write-Host "   🛑 Stop services:     docker-compose down" -ForegroundColor White
Write-Host "   🔄 Rebuild:            docker-compose up -d --build" -ForegroundColor White
Write-Host "   🔍 Check status:       docker-compose ps" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   - Pastikan GEMINI_API_KEY sudah diisi di file .env untuk OCR service" -ForegroundColor Gray
Write-Host "   - Untuk download model Ollama lain: docker-compose exec ollama ollama pull <model>" -ForegroundColor Gray
Write-Host "   - Cek dokumentasi lengkap di: docker-setup-guide.md" -ForegroundColor Gray
Write-Host ""
