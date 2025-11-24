# Angkringan IMS

Sistem Inventory Management untuk Angkringan dibangun dengan Laravel 10, React 19, Vite, dan Tailwind CSS v4.1.

## Tech Stack

-   **Backend**: Laravel 10
-   **Frontend**: React 19.2.0
-   **Build Tool**: Vite 5.0
-   **Styling**: Tailwind CSS 4.1
-   **Database**: MySQL

## Persyaratan Sistem

### Development dengan Docker (Recommended)
-   Docker Desktop
-   Git

### Development Manual
-   PHP >= 8.1
-   Composer
-   Node.js >= 18.x
-   NPM atau Yarn
-   MySQL/MariaDB

## Instalasi

### Opsi 1: Menggunakan Docker (Recommended untuk Kolaborasi)

Setup Docker environment untuk development yang konsisten:

#### Windows (PowerShell)
```powershell
.\docker-start.ps1
```

#### Linux/Mac (Bash)
```bash
chmod +x docker-start.sh
./docker-start.sh
```

#### Manual Docker Setup
```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env dan sesuaikan konfigurasi

# 3. Start services
docker-compose up -d

# 4. Generate application key
docker-compose exec app php artisan key:generate

# 5. Install dependencies
docker-compose exec app composer install
docker-compose exec app npm install

# 6. Run migrations
docker-compose exec app php artisan migrate
```

**Dokumentasi lengkap Docker:** Lihat [docker-setup-guide.md](./docker-setup-guide.md)

**Services yang tersedia:**
- Laravel App: http://localhost
- n8n: http://localhost:5678
- OCR Service: http://localhost:5000

### Opsi 2: Instalasi Manual

### 1. Clone Repository

```bash
git clone <repository-url>
cd angkringan-ims
```

### 2. Install Dependencies PHP

```bash
composer install
```

### 3. Install Dependencies JavaScript

```bash
npm install
```

### 4. Setup Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit file `.env` dan sesuaikan konfigurasi database:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=angkringan_ims
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Buat Database

Buat database baru dengan nama `angkringan_ims` di MySQL:

```sql
CREATE DATABASE angkringan_ims;
```

### 6. Migrasi Database

```bash
php artisan migrate
```

## Menjalankan Aplikasi

### Dengan Docker

```bash
# Start semua services
docker-compose up -d

# Run Vite dev server (di container)
docker-compose exec app npm run dev

# Atau run di background
docker-compose exec -d app npm run dev
```

Aplikasi akan berjalan di: `http://localhost`

### Manual Development Mode

Buka 2 terminal:

**Terminal 1 - Laravel Server:**

```bash
php artisan serve
```

**Terminal 2 - Vite Dev Server:**

```bash
npm run dev
```

Aplikasi akan berjalan di: `http://localhost:8000`

### Production Build

Build assets untuk production:

**Docker:**
```bash
docker-compose exec app npm run build
```

**Manual:**
```bash
npm run build
```

## Struktur Folder

```
angkringan-ims/
├── app/                    # Laravel application files
├── resources/
│   ├── css/
│   │   └── app.css        # Tailwind CSS imports
│   ├── js/
│   │   ├── app.jsx        # React entry point
│   │   └── App.jsx        # Main React component
│   └── views/
│       └── app.blade.php  # Main blade template
├── routes/
│   └── web.php           # Web routes
├── vite.config.js        # Vite configuration
├── postcss.config.js     # PostCSS configuration
└── package.json          # NPM dependencies
```

## Fitur

-   ✅ Laravel 10 backend
-   ✅ React 19 dengan Hot Module Replacement (HMR)
-   ✅ Tailwind CSS v4.1 dengan CSS-first configuration
-   ✅ Vite untuk build tool yang super cepat
-   ✅ Path alias (@/) untuk import yang lebih clean
-   ✅ React Router ready (catch-all route sudah disiapkan)

## Catatan

-   Tailwind CSS v4.1 menggunakan konfigurasi CSS-first, tidak memerlukan `tailwind.config.js`
-   File `app.css` menggunakan `@import "tailwindcss"` untuk mengaktifkan Tailwind
-   React components menggunakan extension `.jsx`
-   Semua React imports menggunakan alias `@/` yang mengarah ke `resources/js/`

## Troubleshooting

### Vite tidak bisa connect

Pastikan Vite dev server berjalan di terminal kedua dengan `npm run dev`

### Tailwind classes tidak berfungsi

1. Pastikan file `app.css` sudah di-import di `app.jsx`
2. Restart Vite dev server

### React component tidak muncul

1. Periksa console browser untuk error
2. Pastikan element dengan id `app` ada di `app.blade.php`
3. Clear cache browser dan reload

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
