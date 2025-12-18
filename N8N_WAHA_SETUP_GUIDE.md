# 📋 Panduan Lengkap Setup n8n & Waha Gateway untuk Kolaborasi

Panduan lengkap dari awal hingga akhir untuk setup n8n dan Waha Gateway agar bisa digunakan di laptop teman dengan settings yang sama.

---

## 👤 BAGIAN UNTUK ANDA: Persiapan Sebelum Share ke Teman

### ✅ Checklist Persiapan

Sebelum share project ke teman, pastikan Anda sudah menyiapkan:

#### 1. Backup n8n ✅ (Sudah Selesai)

**Yang sudah Anda lakukan:**

-   ✅ Backup folder n8n: `docker cp n8n-IMS:/home/node/.n8n ./n8n-backup`
-   ✅ Zip folder backup menjadi `n8n-backup.zip`

**Yang perlu dilakukan selanjutnya:**

-   [ ] Upload `n8n-backup.zip` ke Google Drive/Dropbox
-   [ ] Share link ke teman Anda
-   [ ] Catat credentials n8n (username & password) untuk di-share ke teman

#### 2. Backup Waha Gateway

**Yang perlu Anda siapkan:**

**A. Cek Environment Variables Waha Gateway**

Jalankan command untuk melihat environment variables yang digunakan:

```bash
docker inspect waha-ims
```

Atau lihat di Docker Desktop:

1. Buka Docker Desktop
2. Klik container `waha-ims`
3. Lihat tab "Environment" atau "Inspect"

**Catat semua environment variables yang penting**, contoh:

-   `API_KEY=xxx`
-   `DATABASE_URL=xxx`
-   `WEBHOOK_URL=xxx`
-   dll

**B. Backup Config Files (Jika Ada)**

Jika waha gateway menggunakan config files, backup juga:

```bash
# Cek apakah ada config files di container
docker exec waha-ims ls -la /app/config

# Jika ada, backup config files
docker cp waha-ims:/app/config ./waha-config
```

**C. Backup Database/Data (Jika Ada)**

Jika waha gateway menggunakan database atau menyimpan data:

```bash
# Cek volume yang digunakan
docker inspect waha-ims | grep -A 10 Mounts

# Backup volume jika ada
docker run --rm -v waha_data:/data -v $(pwd):/backup alpine tar czf /backup/waha-data-backup.tar.gz /data
```

**D. Dokumentasikan Image yang Digunakan**

```bash
# Cek image yang digunakan
docker inspect waha-ims | grep Image
```

Catat:

-   Nama image: `devlikeaprc` (atau image lain)
-   Tag/version: `latest` (atau version tertentu)
-   Apakah image public atau private?

**E. Dokumentasikan Port & Network**

-   Port yang digunakan: `3000:3000`
-   Network configuration (jika ada)
-   Dependencies ke service lain (jika ada)

#### 3. Buat File Dokumentasi

Buat file `WAHA_CONFIG.md` atau tambahkan di file ini dengan informasi:

```markdown
# Waha Gateway Configuration

## Image

-   Image: devlikeaprc
-   Tag: latest

## Environment Variables

-   VARIABLE1=value1
-   VARIABLE2=value2
-   dll

## Port

-   Host: 3000
-   Container: 3000

## Config Files

-   Location: /app/config
-   Files: (list files jika ada)

## Dependencies

-   Service lain yang diperlukan: (jika ada)
```

#### 4. Upload & Share

-   [ ] Upload `n8n-backup.zip` ke drive
-   [ ] Upload `waha-config` folder (jika ada) ke drive
-   [ ] Upload `waha-data-backup.tar.gz` (jika ada) ke drive
-   [ ] Share link ke teman
-   [ ] Share credentials n8n (username & password)
-   [ ] Share file `WAHA_CONFIG.md` atau dokumentasi waha

---

## 👥 BAGIAN UNTUK TEMAN ANDA: Setup Lengkap dari Awal

### 📋 Prasyarat

Sebelum mulai, pastikan sudah terinstall:

-   [ ] **Docker Desktop** - Download: https://www.docker.com/products/docker-desktop
-   [ ] **Git** - Download: https://git-scm.com/downloads
-   [ ] **Akses ke repository GitHub** (jika repository private)

---

### 🚀 Step 1: Clone Repository dari GitHub

```bash
# Clone repository
git clone <repository-url>
cd angkringan-ims
```

**Contoh:**

```bash
git clone https://github.com/username/angkringan-ims.git
cd angkringan-ims
```

**Catatan:** Ganti `<repository-url>` dengan URL repository GitHub yang sebenarnya.

---

### 🐳 Step 2: Setup Docker Environment (Laravel, MySQL, dll)

Ikuti panduan di `docker-setup-guide.md` atau jalankan:

**Windows:**

```powershell
.\setup-docker.ps1
```

**Linux/Mac:**

```bash
chmod +x setup-docker.sh
./setup-docker.sh
```

Ini akan setup:

-   ✅ Laravel App
-   ✅ MySQL Database
-   ✅ Redis
-   ✅ OCR Service
-   ✅ Ollama AI
-   ✅ Expired Prediction Service

**Tunggu sampai semua services running!**

---

### 📦 Step 3: Setup n8n

#### 3.1 Download Backup n8n

1. Download `n8n-backup.zip` dari drive yang di-share
2. Extract ke folder (contoh: `C:\n8n-backup`)
    - Klik kanan file → "Extract All"
    - Pilih lokasi folder

#### 3.2 Pull Image n8n

```bash
docker pull n8nio/n8n:latest
```

Tunggu sampai download selesai.

#### 3.3 Run Container n8n

```bash
docker run -d --name n8n-IMS -p 5678:5678 n8nio/n8n:latest
```

**Penjelasan:**

-   `-d` = run di background (detached mode)
-   `--name n8n-IMS` = nama container (bisa diganti sesuai keinginan)
-   `-p 5678:5678` = mapping port (host:container)
-   `n8nio/n8n:latest` = image yang digunakan

#### 3.4 Stop Container

```bash
docker stop n8n-IMS
```

**Penting:** Container harus di-stop dulu sebelum restore backup.

#### 3.5 Restore Backup

```bash
docker cp C:\n8n-backup n8n-IMS:/home/node/.n8n
```

**Catatan:**

-   Ganti `C:\n8n-backup` dengan path folder backup yang sudah di-extract
-   Jika folder sudah ada di container, gunakan:
    ```bash
    docker cp C:\n8n-backup/. n8n-IMS:/home/node/.n8n/
    ```

#### 3.6 Start Container

```bash
docker start n8n-IMS
```

#### 3.7 Verifikasi n8n

1. Buka browser: http://localhost:5678
2. Login ke n8n (gunakan credentials yang di-share)
3. Cek apakah:
    - ✅ Workflows sudah muncul
    - ✅ Credentials sudah ada
    - ✅ Settings sudah sesuai

**Selesai!** n8n sudah siap digunakan dengan semua workflows dan settings yang sama.

---

### 🚪 Step 4: Setup Waha Gateway

#### 4.1 Download Config Files (Jika Ada)

1. Download folder `waha-config` dari drive (jika ada)
2. Extract ke folder (contoh: `C:\waha-config`)

#### 4.2 Download Data Backup (Jika Ada)

1. Download `waha-data-backup.tar.gz` dari drive (jika ada)
2. Simpan di folder (contoh: `C:\waha-backup`)

#### 4.3 Pull Image Waha

```bash
docker pull devlikeaprc
```

**Catatan:**

-   Ganti `devlikeaprc` dengan image yang di-share
-   Jika image private, pastikan sudah login ke registry:
    ```bash
    docker login <registry-url>
    ```

#### 4.4 Run Container Waha (Basic)

**Jika tidak ada environment variables atau config files:**

```bash
docker run -d --name waha-ims -p 3000:3000 devlikeaprc
```

#### 4.5 Run Container Waha (Dengan Environment Variables)

**Jika ada environment variables (dari dokumentasi yang di-share):**

```bash
docker run -d \
  --name waha-ims \
  -p 3000:3000 \
  -e VARIABLE1=value1 \
  -e VARIABLE2=value2 \
  devlikeaprc
```

**Contoh dengan environment variables umum:**

```bash
docker run -d \
  --name waha-ims \
  -p 3000:3000 \
  -e API_KEY=your_api_key \
  -e DATABASE_URL=your_database_url \
  -e WEBHOOK_URL=http://localhost:3000 \
  devlikeaprc
```

**Catatan:** Ganti `VARIABLE1`, `VARIABLE2`, dll dengan environment variables yang di-share.

#### 4.6 Run Container Waha (Dengan Config Files)

**Jika ada config files:**

```bash
docker run -d \
  --name waha-ims \
  -p 3000:3000 \
  -v C:\waha-config:/app/config \
  devlikeaprc
```

**Catatan:** Ganti `C:\waha-config` dengan path folder config yang sudah di-extract.

#### 4.7 Run Container Waha (Dengan Data Backup)

**Jika ada data backup yang perlu di-restore:**

```bash
# Buat volume
docker volume create waha_data

# Restore data backup ke volume
docker run --rm \
  -v waha_data:/data \
  -v C:\waha-backup:/backup \
  alpine sh -c "cd /data && tar xzf /backup/waha-data-backup.tar.gz"

# Run container dengan volume
docker run -d \
  --name waha-ims \
  -p 3000:3000 \
  -v waha_data:/app/data \
  devlikeaprc
```

#### 4.8 Run Container Waha (Lengkap)

**Jika ada semua (environment variables + config + data):**

```bash
docker run -d \
  --name waha-ims \
  -p 3000:3000 \
  -e VARIABLE1=value1 \
  -e VARIABLE2=value2 \
  -v C:\waha-config:/app/config \
  -v waha_data:/app/data \
  devlikeaprc
```

#### 4.9 Verifikasi Waha Gateway

1. Buka browser: http://localhost:3000
2. Cek apakah waha gateway sudah running
3. Test koneksi jika diperlukan
4. Cek logs jika ada masalah:
    ```bash
    docker logs waha-ims
    ```

**Selesai!** Waha gateway sudah siap digunakan.

---

### ✅ Step 5: Verifikasi Semua Services

Pastikan semua services sudah running:

```bash
docker ps
```

Anda harus melihat:

-   ✅ `angkringan_app` (Laravel)
-   ✅ `angkringan_mysql` (MySQL)
-   ✅ `angkringan_redis` (Redis)
-   ✅ `angkringan_ocr` (OCR Service)
-   ✅ `angkringan_ollama` (Ollama AI)
-   ✅ `angkringan_expired_prediction` (Expired Prediction)
-   ✅ `n8n-IMS` (n8n)
-   ✅ `waha-ims` (Waha Gateway)

**Akses semua services:**

-   Laravel App: http://localhost
-   n8n: http://localhost:5678
-   Waha Gateway: http://localhost:3000
-   OCR Service: http://localhost:5000
-   Expired Prediction: http://localhost:5001
-   Ollama API: http://localhost:11434

---

## 🔧 Troubleshooting

### Port Sudah Digunakan

**Problem:** Port 5678 atau 3000 sudah digunakan

**Solusi:** Gunakan port lain saat run container:

```bash
# n8n dengan port 5679
docker run -d --name n8n-IMS -p 5679:5678 n8nio/n8n:latest

# Waha dengan port 3001
docker run -d --name waha-ims -p 3001:3000 devlikeaprc
```

Lalu akses:

-   n8n: http://localhost:5679
-   Waha: http://localhost:3001

### n8n Container Tidak Bisa Start

**Problem:** Container n8n tidak bisa start setelah restore

**Solusi:**

```bash
# Hapus container lama
docker rm n8n-IMS

# Buat container baru dengan volume
docker run -d \
  --name n8n-IMS \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n:latest

# Copy backup ke volume
docker cp C:\n8n-backup/. n8n-IMS:/home/node/.n8n/
```

### Backup n8n Tidak Ter-restore dengan Benar

**Problem:** Workflows tidak muncul setelah restore

**Solusi:**

1. Pastikan container di-stop sebelum restore
2. Cek path folder backup sudah benar
3. Cek permission folder backup
4. Coba restore ulang dengan command:
    ```bash
    docker cp C:\n8n-backup/. n8n-IMS:/home/node/.n8n/
    ```

### Waha Gateway Tidak Bisa Connect

**Problem:** Waha gateway tidak bisa connect ke service lain

**Solusi:**

1. Pastikan environment variables sudah benar
2. Cek network configuration
3. Pastikan service yang dihubungkan sudah running
4. Cek logs: `docker logs waha-ims`
5. Pastikan config files sudah di-mount dengan benar

### Image Waha Tidak Ditemukan

**Problem:** `docker pull devlikeaprc` gagal

**Solusi:**

1. Pastikan image name sudah benar
2. Jika image private, login dulu:
    ```bash
    docker login <registry-url>
    ```
3. Jika image custom, minta Dockerfile atau build instructions
4. Cek apakah image sudah di-push ke registry

---

## 📝 Checklist Lengkap untuk Teman Anda

### Setup Awal:

-   [ ] Install Docker Desktop
-   [ ] Install Git
-   [ ] Clone repository dari GitHub
-   [ ] Setup Docker environment (Laravel, MySQL, dll)

### Setup n8n:

-   [ ] Download `n8n-backup.zip` dari drive
-   [ ] Extract ke folder (contoh: `C:\n8n-backup`)
-   [ ] Pull image: `docker pull n8nio/n8n:latest`
-   [ ] Run container: `docker run -d --name n8n-IMS -p 5678:5678 n8nio/n8n:latest`
-   [ ] Stop container: `docker stop n8n-IMS`
-   [ ] Restore backup: `docker cp C:\n8n-backup n8n-IMS:/home/node/.n8n`
-   [ ] Start container: `docker start n8n-IMS`
-   [ ] Akses http://localhost:5678 dan verifikasi workflows
-   [ ] Login dengan credentials yang di-share

### Setup Waha Gateway:

-   [ ] Download config files dari drive (jika ada)
-   [ ] Download data backup dari drive (jika ada)
-   [ ] Pull image: `docker pull devlikeaprc` (atau image yang sesuai)
-   [ ] Run container dengan environment variables (jika ada)
-   [ ] Run container dengan config files (jika ada)
-   [ ] Restore data backup (jika ada)
-   [ ] Akses http://localhost:3000 dan verifikasi

### Verifikasi Akhir:

-   [ ] Semua services running: `docker ps`
-   [ ] Laravel App bisa diakses: http://localhost
-   [ ] n8n bisa diakses: http://localhost:5678
-   [ ] Waha Gateway bisa diakses: http://localhost:3000
-   [ ] Semua workflows n8n sudah muncul
-   [ ] Waha Gateway bisa connect ke service lain (jika diperlukan)

---

## 💡 Tips

1. **Backup Berkala:** Lakukan backup n8n secara berkala untuk menghindari kehilangan data
2. **Version Control:** Simpan workflow JSON di Git untuk version control
3. **Environment Variables:** Dokumentasikan semua environment variables yang diperlukan
4. **Port Management:** Gunakan port yang konsisten untuk memudahkan kolaborasi
5. **Docker Compose (Opsional):** Jika ingin lebih terstruktur, bisa buat docker-compose.yml untuk n8n dan waha
6. **Documentation:** Selalu dokumentasikan perubahan config atau environment variables

---

## 🆘 Bantuan

Jika mengalami masalah:

1. Cek logs container: `docker logs n8n-IMS` atau `docker logs waha-ims`
2. Cek status container: `docker ps -a`
3. Restart container: `docker restart n8n-IMS` atau `docker restart waha-ims`
4. Cek dokumentasi di `docker-setup-guide.md` untuk masalah Docker umum
5. Hubungi Anda untuk bantuan lebih lanjut

---

**Happy Collaborating! 🚀**
