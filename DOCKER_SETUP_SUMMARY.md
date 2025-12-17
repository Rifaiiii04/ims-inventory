# 🐳 Docker Setup Summary - Angkringan IMS

## ✅ Yang Sudah Disetup

### 1. Docker Services

-   ✅ **MySQL 8.0** - Database
-   ✅ **Redis 7** - Cache & Queue
-   ✅ **Laravel App (PHP 8.2)** - Backend application
-   ✅ **Nginx** - Web server
-   ✅ **Python OCR Service** - OCR dengan Gemini AI
-   ✅ **Ollama AI** - AI model service (untuk expired prediction)
-   ✅ **Expired Prediction Service** - Service prediksi expired dengan AI
-   ✅ **n8n** - Workflow automation

### 2. File yang Dibuat/Diupdate

-   ✅ `docker-compose.yml` - Menambahkan Ollama & Expired Prediction Service
-   ✅ `python_ocr_service/Dockerfile.expired_prediction` - Dockerfile untuk Expired Prediction
-   ✅ `env.docker.example` - Update dengan konfigurasi Ollama & Expired Prediction
-   ✅ `docker-setup-guide.md` - Dokumentasi lengkap (diupdate)
-   ✅ `setup-docker.ps1` - Script setup lengkap untuk Windows
-   ✅ `setup-docker.sh` - Script setup lengkap untuk Linux/Mac
-   ✅ `docker-start.ps1` - Script quick start (diupdate)
-   ✅ `docker-start.sh` - Script quick start (diupdate)
-   ✅ `README.md` - Update dengan informasi services baru

## 🚀 Cara Menggunakan

### Langkah 1: Clone Repository dari GitHub

Pertama, teman Anda perlu clone repository ini dari GitHub:

```bash
# Clone repository
git clone <repository-url>
cd angkringan-ims
```

**Catatan:** Ganti `<repository-url>` dengan URL repository GitHub Anda (contoh: `https://github.com/username/angkringan-ims.git`)

### Langkah 2: Setup Docker (Untuk Teman Anda - Setup Pertama Kali)

**Windows:**

```powershell
.\setup-docker.ps1
```

**Linux/Mac:**

```bash
chmod +x setup-docker.sh
./setup-docker.sh
```

Script ini akan otomatis melakukan semua setup yang diperlukan!

### Quick Start (Setelah Setup Awal)

**Windows:**

```powershell
.\docker-start.ps1
```

**Linux/Mac:**

```bash
./docker-start.sh
```

## 📋 Services yang Tersedia

| Service            | Port  | URL                    | Description                |
| ------------------ | ----- | ---------------------- | -------------------------- |
| Laravel App        | 80    | http://localhost       | Web application            |
| n8n                | 5678  | http://localhost:5678  | Workflow automation        |
| OCR Service        | 5000  | http://localhost:5000  | Python OCR service         |
| Expired Prediction | 5001  | http://localhost:5001  | Expired prediction service |
| Ollama API         | 11434 | http://localhost:11434 | AI model API               |

## ⚙️ Konfigurasi

### File `.env` yang Perlu Dikonfigurasi

1. **APP_KEY** - Akan di-generate otomatis oleh script
2. **GEMINI_API_KEY** - API key untuk OCR service (opsional jika tidak pakai OCR)
3. **OLLAMA_MODEL** - Model AI untuk expired prediction (default: `gemma2:2b`)

### Download Ollama Model

Model akan di-download otomatis saat pertama kali setup. Jika ingin download model lain:

```bash
docker-compose exec ollama ollama pull <model-name>
```

Model yang direkomendasikan:

-   `gemma2:2b` - Default, balance antara ukuran dan performa
-   `qwen2.5:0.5b` - Lebih kecil, lebih cepat
-   `llama3.2:1b` - Alternatif yang bagus

## 🔍 Troubleshooting

### Port Already in Use

Edit file `.env` dan ubah port yang conflict:

```env
APP_PORT=8080
DB_PORT=3307
OCR_PORT=5001
OLLAMA_PORT=11435
EXPIRED_PREDICTION_PORT=5002
N8N_PORT=5679
```

### Ollama Model Tidak Terdownload

```bash
# Download manual
docker-compose exec ollama ollama pull gemma2:2b

# Cek model yang sudah terinstall
docker-compose exec ollama ollama list
```

### Expired Prediction Service Tidak Bisa Connect ke Ollama

```bash
# Cek apakah Ollama running
docker-compose ps ollama

# Test koneksi
docker-compose exec expired_prediction_service curl http://ollama:11434/api/tags
```

### Rebuild Containers

```bash
docker-compose down
docker-compose up -d --build
```

## 📚 Dokumentasi Lengkap

Lihat [docker-setup-guide.md](./docker-setup-guide.md) untuk dokumentasi lengkap.

## ✅ Checklist untuk Teman Anda

-   [ ] **Docker Desktop terinstall dan running**
    -   Download: https://www.docker.com/products/docker-desktop
-   [ ] **Git terinstall** (untuk clone repository)
-   [ ] **Clone repository dari GitHub**
    ```bash
    git clone <repository-url>
    cd angkringan-ims
    ```
-   [ ] **Jalankan script setup**
    -   Windows: `.\setup-docker.ps1`
    -   Linux/Mac: `chmod +x setup-docker.sh && ./setup-docker.sh`
-   [ ] **Pastikan semua services running**
    ```bash
    docker-compose ps
    ```
-   [ ] **Akses aplikasi**
    -   Laravel: http://localhost
    -   Cek health: http://localhost:5001/health (Expired Prediction)
-   [ ] **(Opsional) Isi GEMINI_API_KEY di `.env`** jika pakai OCR service

## 🎉 Selesai!

Setelah setup selesai, teman Anda bisa langsung mulai development tanpa perlu install PHP, MySQL, Python, dll secara manual!
