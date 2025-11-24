# Docker Setup Guide - Angkringan IMS

Panduan lengkap untuk setup Docker environment agar tim dapat berkolaborasi dengan mudah.

## 📋 Prasyarat

1. **Docker Desktop** terinstall di komputer Anda
   - Download: https://www.docker.com/products/docker-desktop
   - Pastikan Docker Desktop sudah running

2. **Git** terinstall (untuk clone repository)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd angkringan-ims
```

### 2. Setup Environment File
```bash
# Copy file .env.example (jika ada) atau buat file .env baru
cp .env.example .env
```

Atau buat file `.env` dengan konfigurasi berikut:
```env
APP_NAME=AngkringanIMS
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=angkringan_ims
DB_USERNAME=angkringan_user
DB_PASSWORD=angkringan_pass
DB_ROOT_PASSWORD=rootpassword

REDIS_HOST=redis
REDIS_PORT=6379

OCR_SERVICE_URL=http://ocr_service:5000
OCR_PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here

N8N_PORT=5678
N8N_USER=admin
N8N_PASSWORD=admin123
N8N_HOST=localhost

APP_PORT=80
```

### 3. Generate Application Key
```bash
docker-compose exec app php artisan key:generate
```

### 4. Install Dependencies
```bash
# Install PHP dependencies
docker-compose exec app composer install

# Install Node.js dependencies
docker-compose exec app npm install
```

### 5. Setup Database
```bash
# Run migrations
docker-compose exec app php artisan migrate

# (Optional) Run seeders
docker-compose exec app php artisan db:seed
```

### 6. Build Frontend Assets
```bash
# Development build (with hot reload)
docker-compose exec app npm run dev

# Production build
docker-compose exec app npm run build
```

## 🐳 Docker Services

Setelah menjalankan `docker-compose up`, Anda akan memiliki:

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **Laravel App** | 9000 | - | PHP-FPM service |
| **Nginx** | 80 | http://localhost | Web server |
| **MySQL** | 3306 | - | Database |
| **Redis** | 6379 | - | Cache & Queue |
| **OCR Service** | 5000 | http://localhost:5000 | Python OCR service |
| **n8n** | 5678 | http://localhost:5678 | Workflow automation |

## 📝 Perintah Docker yang Sering Digunakan

### Menjalankan Services
```bash
# Start semua services
docker-compose up -d

# Start dengan melihat logs
docker-compose up

# Stop semua services
docker-compose down

# Stop dan hapus volumes (HATI-HATI: akan menghapus data!)
docker-compose down -v
```

### Masuk ke Container
```bash
# Masuk ke Laravel container
docker-compose exec app bash

# Masuk ke MySQL container
docker-compose exec mysql bash

# Masuk ke OCR service container
docker-compose exec ocr_service bash
```

### Laravel Commands
```bash
# Artisan commands
docker-compose exec app php artisan <command>

# Contoh:
docker-compose exec app php artisan migrate
docker-compose exec app php artisan tinker
docker-compose exec app php artisan route:list
```

### Composer & NPM
```bash
# Composer
docker-compose exec app composer install
docker-compose exec app composer update

# NPM
docker-compose exec app npm install
docker-compose exec app npm run dev
docker-compose exec app npm run build
```

### Database
```bash
# Masuk ke MySQL
docker-compose exec mysql mysql -u angkringan_user -p angkringan_ims

# Backup database
docker-compose exec mysql mysqldump -u angkringan_user -p angkringan_ims > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u angkringan_user -p angkringan_ims < backup.sql
```

### Logs
```bash
# Lihat semua logs
docker-compose logs

# Lihat logs service tertentu
docker-compose logs app
docker-compose logs nginx
docker-compose logs mysql
docker-compose logs ocr_service
docker-compose logs n8n

# Follow logs (real-time)
docker-compose logs -f app
```

## 🔧 Troubleshooting

### Port Already in Use
Jika port sudah digunakan, ubah di file `.env`:
```env
APP_PORT=8080
DB_PORT=3307
REDIS_PORT=6380
OCR_PORT=5001
N8N_PORT=5679
```

### Permission Issues (Linux/Mac)
```bash
# Fix storage permissions
docker-compose exec app chmod -R 775 storage bootstrap/cache
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
```

### Rebuild Containers
```bash
# Rebuild setelah perubahan Dockerfile
docker-compose build

# Rebuild tanpa cache
docker-compose build --no-cache

# Rebuild dan restart
docker-compose up -d --build
```

### Clear Cache
```bash
# Laravel cache
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear
docker-compose exec app php artisan view:clear

# Composer cache
docker-compose exec app composer clear-cache
```

## 🔐 Environment Variables

Pastikan file `.env` sudah dikonfigurasi dengan benar. Jangan commit file `.env` ke repository!

### Required Variables:
- `APP_KEY` - Generate dengan `php artisan key:generate`
- `GEMINI_API_KEY` - API key untuk Gemini AI (OCR service)
- `DB_PASSWORD` - Password database
- `N8N_PASSWORD` - Password untuk n8n

## 📦 Volumes

Data persisten disimpan di Docker volumes:
- `mysql_data` - Database data
- `redis_data` - Redis data
- `ocr_uploads` - Uploaded images untuk OCR
- `n8n_data` - n8n workflows dan data

## 🌐 Network

Semua services terhubung melalui network `angkringan_network` dan dapat saling berkomunikasi menggunakan nama service sebagai hostname:
- `mysql` - Database host
- `redis` - Redis host
- `app` - Laravel application
- `ocr_service` - OCR service
- `n8n` - n8n service

## 🎯 Development Workflow

1. **Pull latest code**
   ```bash
   git pull origin main
   ```

2. **Update dependencies** (jika ada perubahan)
   ```bash
   docker-compose exec app composer install
   docker-compose exec app npm install
   ```

3. **Run migrations** (jika ada migration baru)
   ```bash
   docker-compose exec app php artisan migrate
   ```

4. **Start development**
   ```bash
   # Terminal 1: Start services
   docker-compose up -d
   
   # Terminal 2: Watch frontend changes
   docker-compose exec app npm run dev
   ```

5. **Access applications**
   - Laravel: http://localhost
   - n8n: http://localhost:5678
   - OCR Service: http://localhost:5000

## 📊 Monitoring dengan Portainer (Opsional)

Untuk monitoring yang lebih mudah, install Portainer:

```bash
docker volume create portainer_data
docker run -d -p 9000:9000 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce
```

Akses Portainer di: http://localhost:9000

## ✅ Checklist Setup Awal

- [ ] Docker Desktop terinstall dan running
- [ ] File `.env` sudah dibuat dan dikonfigurasi
- [ ] `docker-compose up -d` berhasil
- [ ] Application key sudah di-generate
- [ ] Dependencies terinstall (Composer & NPM)
- [ ] Database migrations sudah dijalankan
- [ ] Frontend assets sudah di-build
- [ ] Semua services dapat diakses

## 🆘 Bantuan

Jika mengalami masalah:
1. Cek logs: `docker-compose logs`
2. Pastikan Docker Desktop running
3. Pastikan port tidak conflict
4. Rebuild containers jika perlu: `docker-compose up -d --build`

---

**Happy Coding! 🚀**

