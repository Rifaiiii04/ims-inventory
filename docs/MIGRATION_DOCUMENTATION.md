# Dokumentasi Migrasi Database - Angkringan IMS

## Overview

Dokumentasi ini menjelaskan migrasi database yang telah dibuat untuk sistem Angkringan IMS berdasarkan SQL yang diberikan dan disesuaikan dengan struktur frontend yang sudah ada.

## Daftar Migrasi

### 1. Tabel Pengguna Sistem (`tbl_user`)
**File**: `2025_10_20_160918_create_tbl_user_table.php`

```php
Schema::create('tbl_user', function (Blueprint $table) {
    $table->id('id_user');
    $table->string('nama_user', 100);
    $table->string('username', 50)->unique();
    $table->string('password', 255);
    $table->enum('level', ['admin', 'kasir'])->default('kasir');
    $table->string('foto_profil', 255)->nullable();
    $table->enum('tema', ['terang', 'gelap'])->default('terang');
    $table->string('bahasa', 20)->default('id');
    $table->boolean('notif_aktif')->default(true);
    $table->timestamps();
    
    // Index untuk optimasi
    $table->index('username');
});
```

**Model**: `TblUser` (extends Authenticatable dengan Sanctum)

### 2. Tabel Kategori Produk (`tbl_kategori`)
**File**: `2025_10_20_160931_create_tbl_kategori_table.php`

```php
Schema::create('tbl_kategori', function (Blueprint $table) {
    $table->id('id_kategori');
    $table->string('nama_kategori', 100);
    $table->text('deskripsi')->nullable();
    $table->timestamps();
});
```

**Model**: `TblKategori`

### 3. Tabel Produk (`tbl_produk`)
**File**: `2025_10_20_160945_create_tbl_produk_table.php`

```php
Schema::create('tbl_produk', function (Blueprint $table) {
    $table->id('id_produk');
    $table->string('nama_produk', 100);
    $table->unsignedBigInteger('id_kategori');
    $table->text('deskripsi')->nullable();
    $table->unsignedBigInteger('created_by');
    $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
    $table->timestamps();
    
    // Foreign keys
    $table->foreign('id_kategori')->references('id_kategori')->on('tbl_kategori');
    $table->foreign('created_by')->references('id_user')->on('tbl_user');
    
    // Index untuk optimasi
    $table->index('id_kategori');
});
```

**Model**: `TblProduk`

### 4. Tabel Bahan Baku (`tbl_bahan`)
**File**: `2025_10_20_160949_create_tbl_bahan_table.php`

```php
Schema::create('tbl_bahan', function (Blueprint $table) {
    $table->id('id_bahan');
    $table->string('nama_bahan', 100);
    $table->unsignedBigInteger('id_kategori');
    $table->decimal('harga_beli', 10, 2)->default(0.00);
    $table->decimal('stok_bahan', 10, 2)->default(0);
    $table->string('satuan', 20);
    $table->decimal('min_stok', 10, 2)->default(0);
    $table->unsignedBigInteger('updated_by')->nullable();
    $table->timestamps();
    
    // Foreign keys
    $table->foreign('id_kategori')->references('id_kategori')->on('tbl_kategori');
    $table->foreign('updated_by')->references('id_user')->on('tbl_user');
    
    // Index untuk optimasi
    $table->index('stok_bahan');
});
```

**Model**: `TblBahan`

### 5. Tabel Varian Produk (`tbl_varian`)
**File**: `2025_10_20_160956_create_tbl_varian_table.php`

```php
Schema::create('tbl_varian', function (Blueprint $table) {
    $table->id('id_varian');
    $table->unsignedBigInteger('id_produk');
    $table->string('nama_varian', 100);
    $table->decimal('harga', 10, 2)->default(0.00);
    $table->decimal('stok_varian', 10, 2)->default(0);
    $table->timestamps();
    
    // Foreign keys
    $table->foreign('id_produk')->references('id_produk')->on('tbl_produk');
});
```

**Model**: `TblVarian`

### 6. Tabel Komposisi Bahan ke Varian (`tbl_komposisi`)
**File**: `2025_10_20_161003_create_tbl_komposisi_table.php`

```php
Schema::create('tbl_komposisi', function (Blueprint $table) {
    $table->id('id_komposisi');
    $table->unsignedBigInteger('id_varian');
    $table->unsignedBigInteger('id_bahan');
    $table->decimal('jumlah_per_porsi', 10, 2)->default(0);
    $table->string('satuan', 20);
    $table->timestamps();
    
    // Foreign keys
    $table->foreign('id_varian')->references('id_varian')->on('tbl_varian');
    $table->foreign('id_bahan')->references('id_bahan')->on('tbl_bahan');
});
```

**Model**: `TblKomposisi`

### 7. Tabel Transaksi Penjualan (`tbl_transaksi`)
**File**: `2025_10_20_161009_create_tbl_transaksi_table.php`

```php
Schema::create('tbl_transaksi', function (Blueprint $table) {
    $table->id('id_transaksi');
    $table->dateTime('tanggal_waktu')->useCurrent();
    $table->decimal('total_transaksi', 10, 2)->default(0.00);
    $table->enum('metode_bayar', ['cash', 'qris', 'lainnya'])->default('cash');
    $table->string('nama_pelanggan', 100)->nullable();
    $table->text('catatan')->nullable();
    $table->unsignedBigInteger('created_by');
    $table->timestamps();
    
    // Foreign keys
    $table->foreign('created_by')->references('id_user')->on('tbl_user');
    
    // Index untuk optimasi
    $table->index('tanggal_waktu');
});
```

**Model**: `TblTransaksi`

### 8. Tabel Detail Transaksi (`tbl_transaksi_detail`)
**File**: `2025_10_20_161013_create_tbl_transaksi_detail_table.php`

```php
Schema::create('tbl_transaksi_detail', function (Blueprint $table) {
    $table->id('id_detail');
    $table->unsignedBigInteger('id_transaksi');
    $table->unsignedBigInteger('id_produk');
    $table->unsignedBigInteger('id_varian');
    $table->decimal('jumlah', 10, 2)->default(0);
    $table->decimal('harga_satuan', 10, 2)->default(0.00);
    $table->decimal('total_harga', 10, 2)->default(0.00);
    $table->timestamps();
    
    // Foreign keys
    $table->foreign('id_transaksi')->references('id_transaksi')->on('tbl_transaksi');
    $table->foreign('id_produk')->references('id_produk')->on('tbl_produk');
    $table->foreign('id_varian')->references('id_varian')->on('tbl_varian');
});
```

**Model**: `TblTransaksiDetail`

### 9. Tabel Notifikasi (`tbl_notifikasi`)
**File**: `2025_10_20_161019_create_tbl_notifikasi_table.php`

```php
Schema::create('tbl_notifikasi', function (Blueprint $table) {
    $table->id('id_notifikasi');
    $table->unsignedBigInteger('id_bahan');
    $table->decimal('batas_minimum', 10, 2)->default(0);
    $table->enum('jadwal', ['harian', 'mingguan', 'real-time'])->default('real-time');
    $table->boolean('aktif')->default(true);
    $table->timestamp('terakhir_kirim')->nullable();
    $table->unsignedBigInteger('created_by');
    $table->timestamps();
    
    // Foreign keys
    $table->foreign('id_bahan')->references('id_bahan')->on('tbl_bahan');
    $table->foreign('created_by')->references('id_user')->on('tbl_user');
    
    // Index untuk optimasi
    $table->index('aktif');
});
```

**Model**: `TblNotifikasi`

### 10. Tabel Log Notifikasi (`tbl_notifikasi_log`)
**File**: `2025_10_20_161024_create_tbl_notifikasi_log_table.php`

```php
Schema::create('tbl_notifikasi_log', function (Blueprint $table) {
    $table->id('id_log');
    $table->unsignedBigInteger('id_notifikasi');
    $table->timestamp('waktu_kirim')->useCurrent();
    $table->enum('status', ['terkirim', 'gagal'])->default('terkirim');
    $table->text('pesan')->nullable();
    $table->timestamps();
    
    // Foreign keys
    $table->foreign('id_notifikasi')->references('id_notifikasi')->on('tbl_notifikasi');
});
```

**Model**: `TblNotifikasiLog`

## Seeder Data Awal

### AngkringanSeeder
**File**: `database/seeders/AngkringanSeeder.php`

Seeder ini berisi data awal yang sesuai dengan data yang ada di frontend:

#### Data User
- **Admin**: username: `admin`, password: `admin123`
- **Kasir**: username: `kasir`, password: `kasir123`

#### Data Kategori (7 kategori)
1. Makanan
2. Minuman
3. Bahan Dasar
4. Bahan Utama
5. Bumbu & Rempah
6. Sayuran
7. Ikan Asin

#### Data Bahan Baku (20 item)
Berdasarkan data yang ada di frontend StockManagement:
- Ayam Utuh, Lele, Nila, Cumi
- Beras, Tahu Bumbu Kuning, Tempe Bumbu Kuning, dll
- Bumbu Halus, Rempah Kering
- Kangkung, Terong, Timun
- Ikan Asin Japuh, Peda, Pindang
- Teh, Jeruk, Es Batu

#### Data Produk (22 item)
Berdasarkan data yang ada di frontend ProductManagement:
- 18 produk makanan (Nasi, Ayam Bakar, Lele Goreng, dll)
- 4 produk minuman (Es Teh Manis, Es Teh Tawar, dll)

#### Data Varian
Setiap produk memiliki 1 varian dengan harga yang sesuai dengan data frontend.

## Cara Menjalankan Migrasi

### 1. Jalankan Migrasi
```bash
php artisan migrate
```

### 2. Jalankan Seeder
```bash
php artisan db:seed --class=AngkringanSeeder
```

### 3. Atau jalankan keduanya sekaligus
```bash
php artisan migrate --seed
```

## Relasi Database

### Diagram Relasi
```
tbl_user (1) ──→ (N) tbl_produk
tbl_user (1) ──→ (N) tbl_bahan
tbl_user (1) ──→ (N) tbl_transaksi
tbl_user (1) ──→ (N) tbl_notifikasi

tbl_kategori (1) ──→ (N) tbl_produk
tbl_kategori (1) ──→ (N) tbl_bahan

tbl_produk (1) ──→ (N) tbl_varian
tbl_varian (1) ──→ (N) tbl_komposisi
tbl_bahan (1) ──→ (N) tbl_komposisi

tbl_transaksi (1) ──→ (N) tbl_transaksi_detail
tbl_produk (1) ──→ (N) tbl_transaksi_detail
tbl_varian (1) ──→ (N) tbl_transaksi_detail

tbl_bahan (1) ──→ (N) tbl_notifikasi
tbl_notifikasi (1) ──→ (N) tbl_notifikasi_log
```

## Mapping dengan Frontend

### StockManagement → tbl_bahan
- `name` → `nama_bahan`
- `category` → `id_kategori` (relasi)
- `buyPrice` → `harga_beli`
- `quantity` → `stok_bahan`
- `unit` → `satuan`
- `dailyNeed` → `min_stok`
- `conversion` → (akan dibuat di tabel terpisah jika diperlukan)

### ProductManagement → tbl_produk + tbl_varian
- `name` → `nama_produk`
- `category` → `id_kategori` (relasi)
- `ingredients` → (akan dibuat relasi dengan tbl_komposisi)
- `sellPrice` → `harga` (di tbl_varian)
- `variants` → `tbl_varian`

### Dashboard Data
- `totalProducts` → count dari `tbl_produk`
- `lowStock` → count dari `tbl_bahan` dimana `stok_bahan < min_stok`
- `todaySales` → sum dari `tbl_transaksi` hari ini
- `topProducts` → dari `tbl_transaksi_detail` dengan join

## Index untuk Optimasi

### Index yang Sudah Dibuat
1. `tbl_user.username` - untuk login
2. `tbl_produk.id_kategori` - untuk filter produk
3. `tbl_bahan.stok_bahan` - untuk cek stok menipis
4. `tbl_transaksi.tanggal_waktu` - untuk laporan berdasarkan tanggal
5. `tbl_notifikasi.aktif` - untuk filter notifikasi aktif

### Index Tambahan yang Disarankan
```sql
-- Untuk pencarian produk
CREATE INDEX idx_produk_nama ON tbl_produk(nama_produk);

-- Untuk pencarian bahan
CREATE INDEX idx_bahan_nama ON tbl_bahan(nama_bahan);

-- Untuk laporan transaksi
CREATE INDEX idx_transaksi_created_by ON tbl_transaksi(created_by);
CREATE INDEX idx_transaksi_metode_bayar ON tbl_transaksi(metode_bayar);

-- Untuk komposisi
CREATE INDEX idx_komposisi_varian ON tbl_komposisi(id_varian);
CREATE INDEX idx_komposisi_bahan ON tbl_komposisi(id_bahan);
```

## Catatan Penting

1. **Primary Key**: Semua tabel menggunakan `id_*` sebagai primary key
2. **Foreign Key**: Semua relasi menggunakan foreign key constraint
3. **Timestamps**: Semua tabel memiliki `created_at` dan `updated_at`
4. **Data Type**: Menggunakan `decimal(10,2)` untuk harga dan stok
5. **Enum**: Menggunakan enum untuk status dan pilihan terbatas
6. **Nullable**: Field yang opsional menggunakan `nullable()`
7. **Default Values**: Field yang memiliki nilai default sudah diset

## Troubleshooting

### Error Foreign Key
Jika ada error foreign key, pastikan urutan migrasi sudah benar:
1. `tbl_user` (tidak ada dependency)
2. `tbl_kategori` (tidak ada dependency)
3. `tbl_produk` (dependency: tbl_user, tbl_kategori)
4. `tbl_bahan` (dependency: tbl_user, tbl_kategori)
5. `tbl_varian` (dependency: tbl_produk)
6. `tbl_komposisi` (dependency: tbl_varian, tbl_bahan)
7. `tbl_transaksi` (dependency: tbl_user)
8. `tbl_transaksi_detail` (dependency: tbl_transaksi, tbl_produk, tbl_varian)
9. `tbl_notifikasi` (dependency: tbl_bahan, tbl_user)
10. `tbl_notifikasi_log` (dependency: tbl_notifikasi)

### Error Seeder
Jika ada error seeder, pastikan:
1. Migrasi sudah berhasil dijalankan
2. Data kategori sudah ada sebelum insert produk/bahan
3. Data user sudah ada sebelum insert yang membutuhkan created_by

---

**Dokumentasi ini dibuat berdasarkan migrasi yang telah dibuat pada tanggal: $(date)**
