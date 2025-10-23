# Dokumentasi Lengkap - Angkringan IMS (Inventory Management System)

## Daftar Isi
1. [Overview](#overview)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Tech Stack](#tech-stack)
4. [Struktur Database](#struktur-database)
5. [Backend (Laravel)](#backend-laravel)
6. [Frontend (React)](#frontend-react)
7. [Fitur Aplikasi](#fitur-aplikasi)
8. [API Endpoints](#api-endpoints)
9. [Komponen Frontend](#komponen-frontend)
10. [Instalasi & Setup](#instalasi--setup)
11. [Cara Menjalankan](#cara-menjalankan)
12. [Struktur File](#struktur-file)
13. [Business Logic](#business-logic)
14. [Security](#security)
15. [Performance](#performance)
16. [Troubleshooting](#troubleshooting)

---

## Overview

**Angkringan IMS** adalah sistem manajemen inventori yang dirancang khusus untuk bisnis angkringan. Sistem ini dibangun dengan teknologi modern untuk memberikan pengalaman manajemen yang efisien dan user-friendly.

### Tujuan Sistem
- Mengelola stok bahan baku dan produk jadi
- Memantau penjualan dan laporan keuangan
- Memberikan notifikasi stok menipis
- Mengelola data produk dan kategori
- Menyediakan dashboard analitik

### Target Pengguna
- **Admin**: Akses penuh ke semua fitur
- **Kasir**: Akses terbatas untuk transaksi dan laporan

---

## Arsitektur Sistem

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React 19)    │◄──►│   (Laravel 10)  │◄──►│   (MySQL)       │
│                 │    │                 │    │                 │
│ - Dashboard     │    │ - API Routes    │    │ - Users         │
│ - Stock Mgmt    │    │ - Controllers   │    │ - Products      │
│ - Product Mgmt  │    │ - Models        │    │ - Stock Items   │
│ - Reports       │    │ - Middleware    │    │ - Transactions  │
│ - Notifications │    │ - Auth (Sanctum)│    │ - Categories    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Tech Stack

### Backend
- **Framework**: Laravel 10.10
- **PHP Version**: >= 8.1
- **Authentication**: Laravel Sanctum 3.3
- **Database**: MySQL
- **API**: RESTful API

### Frontend
- **Framework**: React 19.2.0
- **Routing**: React Router DOM 7.9.4
- **Styling**: Tailwind CSS 4.1.14
- **Icons**: Heroicons 2.2.0
- **Charts**: Recharts 3.2.1
- **Animations**: Framer Motion 12.23.24

### Build Tools
- **Build Tool**: Vite 5.0.0
- **Plugin**: Laravel Vite Plugin 1.0.0
- **React Plugin**: @vitejs/plugin-react 5.0.4

---

## Struktur Database

### Tabel yang Sudah Ada (Default Laravel)
1. **users** - Data pengguna sistem
2. **password_reset_tokens** - Token reset password
3. **failed_jobs** - Log job yang gagal
4. **personal_access_tokens** - Token API untuk Sanctum

### Tabel yang Perlu Dibuat (Berdasarkan Dokumentasi)
1. **categories** - Kategori produk
2. **products** - Produk yang dijual
3. **product_variants** - Varian produk
4. **stock_items** - Bahan baku/stok
5. **stock_history** - Riwayat perubahan stok
6. **transactions** - Transaksi penjualan
7. **transaction_items** - Detail transaksi
8. **notifications** - Konfigurasi notifikasi
9. **notification_logs** - Log notifikasi

---

## Backend (Laravel)

### Struktur Aplikasi
```
app/
├── Http/
│   ├── Controllers/
│   │   └── Controller.php (Base Controller)
│   ├── Middleware/ (9 files)
│   └── Kernel.php
├── Models/
│   └── User.php (Default User Model)
├── Providers/
│   ├── AppServiceProvider.php
│   ├── AuthServiceProvider.php
│   ├── BroadcastServiceProvider.php
│   ├── EventServiceProvider.php
│   └── RouteServiceProvider.php
└── Exceptions/
    └── Handler.php
```

### Routes
- **Web Routes** (`routes/web.php`):
  - `/` - Halaman utama (React App)
  - `/test` - Halaman test
  - `/{any}` - Catch-all untuk React Router

- **API Routes** (`routes/api.php`):
  - `/api/user` - Get current user (Sanctum protected)

### Konfigurasi
- **Database**: MySQL sebagai default
- **Authentication**: Laravel Sanctum untuk API
- **Timezone**: UTC
- **Locale**: English

---

## Frontend (React)

### Struktur Aplikasi
```
resources/js/
├── app.jsx (Entry Point)
├── bootstrap.js (Axios setup)
├── components/
│   ├── account/ (4 files)
│   ├── category/ (2 files)
│   ├── common/ (2 files)
│   ├── dashboard/ (4 files)
│   ├── notification/ (2 files)
│   ├── product/ (4 files)
│   ├── sidebar/ (7 files)
│   ├── stock/ (6 files)
│   ├── variant/ (2 files)
│   ├── DecorativeImage.jsx
│   ├── Login.jsx
│   ├── LoginForm.jsx
│   ├── Sidebar.jsx
│   └── TopBar.jsx
└── pages/
    ├── AccountManagement.jsx
    ├── CategoryManagement.jsx
    ├── Dashboard.jsx
    ├── InventoryReport.jsx
    ├── NotificationManagement.jsx
    ├── ProductManagement.jsx
    ├── SalesReport.jsx
    ├── StockManagement.jsx
    └── VariantManagement.jsx
```

### Routing
```jsx
<Routes>
  <Route path="/" element={<Login />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/products/stock" element={<StockManagement />} />
  <Route path="/products" element={<ProductManagement />} />
  <Route path="/products/categories" element={<CategoryManagement />} />
  <Route path="/products/variants" element={<VariantManagement />} />
  <Route path="/reports/sales" element={<SalesReport />} />
  <Route path="/reports/inventory" element={<InventoryReport />} />
  <Route path="/notifications" element={<NotificationManagement />} />
  <Route path="/accounts" element={<AccountManagement />} />
</Routes>
```

---

## Fitur Aplikasi

### 1. Dashboard
- **Ringkasan Cepat**: Total produk, stok menipis, penjualan hari ini
- **Produk Terlaris**: Daftar produk dengan penjualan tertinggi
- **Aksi Cepat**: Tombol untuk aksi yang sering digunakan
- **Live Indicator**: Status real-time sistem

### 2. Manajemen Stok
- **Daftar Stok**: Tabel dengan semua item stok
- **Tambah/Edit Stok**: Form untuk mengelola stok
- **Riwayat Stok**: Log perubahan stok
- **Alert Stok Menipis**: Notifikasi otomatis
- **Konversi**: Informasi konversi bahan baku

### 3. Manajemen Produk
- **Daftar Produk**: Tabel dengan semua produk
- **Tambah/Edit Produk**: Form untuk mengelola produk
- **Kategori Produk**: Pengelompokan produk
- **Varian Produk**: Pilihan ukuran/porsi
- **Bahan Baku**: Daftar bahan yang dibutuhkan

### 4. Laporan
- **Laporan Penjualan**: Data penjualan harian/mingguan/bulanan
- **Laporan Inventori**: Status stok dan pergerakan
- **Export**: Download laporan dalam format PDF/Excel

### 5. Notifikasi
- **Konfigurasi**: Set jadwal notifikasi
- **Alert Stok**: Notifikasi stok menipis
- **Log Notifikasi**: Riwayat notifikasi yang dikirim

### 6. Manajemen Akun
- **Profil Pengguna**: Data dan preferensi user
- **Manajemen Kasir**: Tambah/edit kasir
- **Pengaturan**: Konfigurasi sistem

---

## API Endpoints

### Authentication
```
POST /api/auth/login - Login user
POST /api/auth/logout - Logout user
GET  /api/auth/me - Get current user
POST /api/auth/refresh - Refresh token
```

### Dashboard
```
GET /api/dashboard/summary - Get dashboard summary
GET /api/dashboard/top-products - Get top selling products
GET /api/dashboard/low-stock - Get low stock items
```

### Stock Management
```
GET    /api/stock - Get all stock items
POST   /api/stock - Create new stock item
GET    /api/stock/{id} - Get specific stock item
PUT    /api/stock/{id} - Update stock item
DELETE /api/stock/{id} - Delete stock item
POST   /api/stock/{id}/adjust - Adjust stock quantity
GET    /api/stock/{id}/history - Get stock history
```

### Product Management
```
GET    /api/products - Get all products
POST   /api/products - Create new product
GET    /api/products/{id} - Get specific product
PUT    /api/products/{id} - Update product
DELETE /api/products/{id} - Delete product
```

### Categories
```
GET    /api/categories - Get all categories
POST   /api/categories - Create new category
PUT    /api/categories/{id} - Update category
DELETE /api/categories/{id} - Delete category
```

### Reports
```
GET  /api/reports/sales/daily - Daily sales data
GET  /api/reports/sales/weekly - Weekly sales data
GET  /api/reports/sales/monthly - Monthly sales data
POST /api/reports/sales/export - Export sales report
GET  /api/reports/inventory - Inventory report
POST /api/reports/inventory/export - Export inventory report
```

---

## Komponen Frontend

### Layout Components
- **Sidebar**: Navigasi utama dengan menu collapsible
- **TopBar**: Header dengan judul dan tombol aksi
- **Login**: Halaman login dengan form
- **DecorativeImage**: Gambar dekoratif untuk login

### Dashboard Components
- **SummaryCard**: Kartu ringkasan dengan icon dan trend
- **TopProductCard**: Kartu produk terlaris
- **QuickActionButton**: Tombol aksi cepat
- **DashboardIcons**: Kumpulan icon untuk dashboard

### Table Components
- **ModernTable**: Tabel modern dengan fitur lengkap
- **StockTable**: Tabel khusus untuk stok
- **ProductTable**: Tabel khusus untuk produk
- **CategoryTable**: Tabel khusus untuk kategori

### Form Components
- **StockFormModal**: Modal form untuk stok
- **ProductFormModal**: Modal form untuk produk
- **CategoryFormModal**: Modal form untuk kategori
- **VariantFormModal**: Modal form untuk varian

### Utility Components
- **LowStockAlert**: Alert untuk stok menipis
- **StockHistoryModal**: Modal riwayat stok
- **ConversionDisplay**: Display informasi konversi
- **NotificationTable**: Tabel notifikasi

---

## Instalasi & Setup

### Prasyarat
- PHP >= 8.1
- Composer
- Node.js >= 18.x
- NPM atau Yarn
- MySQL/MariaDB

### Langkah Instalasi

1. **Clone Repository**
```bash
git clone <repository-url>
cd ims-inventory
```

2. **Install Dependencies PHP**
```bash
composer install
```

3. **Install Dependencies JavaScript**
```bash
npm install
```

4. **Setup Environment**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Konfigurasi Database**
Edit file `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=angkringan_ims
DB_USERNAME=root
DB_PASSWORD=
```

6. **Buat Database**
```sql
CREATE DATABASE angkringan_ims;
```

7. **Migrasi Database**
```bash
php artisan migrate
```

---

## Cara Menjalankan

### Development Mode

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
```bash
npm run build
```

---

## Struktur File

```
ims-inventory/
├── app/                          # Laravel Application
│   ├── Console/
│   ├── Exceptions/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   └── Kernel.php
│   ├── Models/
│   └── Providers/
├── bootstrap/
├── config/                       # Konfigurasi Laravel
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
├── docs/                         # Dokumentasi
│   ├── BACKEND_DOCUMENTATION.md
│   ├── ERD_Angkringan_IMS.md
│   └── COMPREHENSIVE_DOCUMENTATION.md
├── public/
├── resources/
│   ├── assets/                   # Gambar dan assets
│   ├── css/
│   │   └── app.css              # Tailwind CSS
│   ├── js/
│   │   ├── app.jsx              # Entry point React
│   │   ├── bootstrap.js         # Axios setup
│   │   ├── components/          # React Components
│   │   └── pages/               # React Pages
│   └── views/
│       └── app.blade.php        # Main template
├── routes/
│   ├── api.php                  # API routes
│   └── web.php                  # Web routes
├── storage/
├── tests/
├── vendor/
├── composer.json
├── package.json
├── vite.config.js
└── README.md
```

---

## Business Logic

### 1. Stock Management
- **Low Stock Alert**: Otomatis cek stok di bawah batas minimum
- **Stock History**: Setiap perubahan stok dicatat dengan detail
- **Daily Need Calculation**: Hitung kebutuhan harian berdasarkan data historis
- **Conversion Info**: Simpan informasi konversi (contoh: 1 ekor ayam = 4 bagian)

### 2. Sales Logic
- **Transaction Processing**: Proses transaksi dengan multiple items
- **Payment Methods**: Support tunai, QRIS, transfer
- **Variant Pricing**: Harga berbeda untuk setiap varian produk
- **Receipt Generation**: Generate struk transaksi

### 3. Reporting Logic
- **Real-time Data**: Data laporan real-time
- **Date Filtering**: Filter berdasarkan tanggal, minggu, bulan
- **Category Filtering**: Filter berdasarkan kategori produk
- **Export Functionality**: Export ke PDF dan Excel

### 4. Notification Logic
- **Scheduled Notifications**: Kirim notifikasi sesuai jadwal
- **Low Stock Alerts**: Alert otomatis saat stok menipis
- **Multiple Recipients**: Kirim ke multiple user (admin, kasir)

---

## Security

### Authentication
- **JWT Token**: Dengan expiration
- **Refresh Token**: Mechanism untuk refresh token
- **Password Hashing**: Menggunakan bcrypt

### Authorization
- **Role-based Access**: Admin dan Kasir memiliki akses berbeda
- **API Endpoint Protection**: Semua endpoint API dilindungi
- **Data Ownership Validation**: Validasi kepemilikan data

### Data Protection
- **Input Validation**: Validasi dan sanitasi input
- **SQL Injection Prevention**: Menggunakan Eloquent ORM
- **XSS Protection**: Laravel built-in protection
- **CSRF Protection**: Laravel built-in protection

---

## Performance

### Database
- **Index**: Pada foreign keys dan frequently queried fields
- **Pagination**: Untuk large datasets
- **Query Optimization**: Menggunakan Eloquent relationships

### Caching
- **Dashboard Summary**: Cache data ringkasan dashboard
- **Product Categories**: Cache kategori produk
- **User Sessions**: Cache session user
- **Redis**: Untuk session storage (optional)

### API Response
- **Consistent Format**: Format response yang konsisten
- **Error Handling**: Error handling yang proper
- **Response Time**: Optimasi waktu response
- **Rate Limiting**: Pembatasan rate API

---

## Troubleshooting

### Vite tidak bisa connect
- Pastikan Vite dev server berjalan dengan `npm run dev`
- Cek port 5173 tidak digunakan aplikasi lain

### Tailwind classes tidak berfungsi
1. Pastikan file `app.css` sudah di-import di `app.jsx`
2. Restart Vite dev server
3. Clear cache browser

### React component tidak muncul
1. Periksa console browser untuk error
2. Pastikan element dengan id `app` ada di `app.blade.php`
3. Clear cache browser dan reload

### Database connection error
1. Periksa konfigurasi di `.env`
2. Pastikan MySQL service berjalan
3. Cek kredensial database

### API tidak response
1. Periksa route API di `routes/api.php`
2. Cek middleware authentication
3. Periksa log Laravel di `storage/logs/`

---

## Data Sample

### Stock Items (Berdasarkan Observasi)
```javascript
const stockData = [
  {
    id: 1,
    name: "Ayam Utuh",
    category: "Bahan Utama",
    buyPrice: 25000,
    quantity: 3,
    unit: "ekor",
    dailyNeed: 3,
    conversion: "12 item (4 bagian per ekor)"
  },
  {
    id: 2,
    name: "Lele",
    category: "Bahan Utama", 
    buyPrice: 8000,
    quantity: 10,
    unit: "ekor",
    dailyNeed: 10,
    conversion: "10 porsi"
  }
  // ... dan seterusnya
];
```

### Products (Berdasarkan Menu)
```javascript
const productData = [
  {
    id: 1,
    name: "Nasi",
    category: "Makanan",
    ingredients: ["Beras"],
    initialStock: 120,
    sellPrice: 5000,
    variants: [{ name: "Porsi", price: 5000 }]
  },
  {
    id: 2,
    name: "Ayam Bakar",
    category: "Makanan",
    ingredients: ["Ayam Utuh", "Bumbu Halus", "Rempah Kering"],
    initialStock: 12,
    sellPrice: 17000,
    variants: [{ name: "Porsi", price: 17000 }]
  }
  // ... dan seterusnya
];
```

---

## Kesimpulan

Angkringan IMS adalah sistem manajemen inventori yang komprehensif dengan:

✅ **Frontend Modern**: React 19 dengan Tailwind CSS 4.1
✅ **Backend Robust**: Laravel 10 dengan Sanctum authentication
✅ **Database Design**: ERD yang well-designed untuk bisnis angkringan
✅ **User Experience**: Interface yang user-friendly dan responsive
✅ **Business Logic**: Logika bisnis yang sesuai dengan kebutuhan angkringan
✅ **Scalability**: Arsitektur yang dapat dikembangkan lebih lanjut

Sistem ini siap untuk dikembangkan lebih lanjut dengan implementasi backend API yang sesuai dengan dokumentasi yang telah dibuat.

---

**Dokumentasi ini dibuat berdasarkan analisis kode yang ada pada tanggal: $(date)**
