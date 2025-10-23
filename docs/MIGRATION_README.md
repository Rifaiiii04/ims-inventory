# Panduan Migrasi Database - Angkringan IMS

## 🎯 Overview

Panduan ini menjelaskan cara menggunakan migrasi database yang telah dibuat untuk sistem Angkringan IMS. Migrasi ini dibuat berdasarkan SQL yang diberikan dan disesuaikan dengan struktur frontend yang sudah ada.

## 📋 Daftar Tabel yang Dibuat

| No | Nama Tabel | Deskripsi | File Migrasi |
|----|------------|-----------|--------------|
| 1 | `tbl_user` | Data pengguna sistem (admin/kasir) | `2025_10_20_160918_create_tbl_user_table.php` |
| 2 | `tbl_kategori` | Kategori produk dan bahan | `2025_10_20_160931_create_tbl_kategori_table.php` |
| 3 | `tbl_produk` | Produk yang dijual | `2025_10_20_160945_create_tbl_produk_table.php` |
| 4 | `tbl_bahan` | Bahan baku/stok | `2025_10_20_160949_create_tbl_bahan_table.php` |
| 5 | `tbl_varian` | Varian produk (ukuran/porsi) | `2025_10_20_160956_create_tbl_varian_table.php` |
| 6 | `tbl_komposisi` | Komposisi bahan untuk varian | `2025_10_20_161003_create_tbl_komposisi_table.php` |
| 7 | `tbl_transaksi` | Transaksi penjualan | `2025_10_20_161009_create_tbl_transaksi_table.php` |
| 8 | `tbl_transaksi_detail` | Detail item dalam transaksi | `2025_10_20_161013_create_tbl_transaksi_detail_table.php` |
| 9 | `tbl_notifikasi` | Konfigurasi notifikasi stok | `2025_10_20_161019_create_tbl_notifikasi_table.php` |
| 10 | `tbl_notifikasi_log` | Log notifikasi yang dikirim | `2025_10_20_161024_create_tbl_notifikasi_log_table.php` |

## 🚀 Cara Menjalankan Migrasi

### 1. Pastikan Database Sudah Dibuat
```sql
CREATE DATABASE angkringan_ims;
```

### 2. Konfigurasi Environment
Pastikan file `.env` sudah dikonfigurasi dengan benar:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=angkringan_ims
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Jalankan Migrasi
```bash
# Jalankan semua migrasi
php artisan migrate

# Atau jalankan migrasi dengan seeder sekaligus
php artisan migrate --seed
```

### 4. Jalankan Seeder (Jika Belum)
```bash
# Jalankan seeder data awal
php artisan db:seed --class=AngkringanSeeder
```

## 📊 Data Awal yang Dimasukkan

### User Default
- **Admin**: 
  - Username: `admin`
  - Password: `admin123`
  - Level: `admin`
- **Kasir**: 
  - Username: `kasir`
  - Password: `kasir123`
  - Level: `kasir`

### Kategori (7 kategori)
1. **Makanan** - Produk makanan siap saji
2. **Minuman** - Berbagai jenis minuman
3. **Bahan Dasar** - Bahan baku dasar untuk memasak
4. **Bahan Utama** - Bahan utama seperti daging dan ikan
5. **Bumbu & Rempah** - Bumbu dan rempah-rempah
6. **Sayuran** - Berbagai jenis sayuran
7. **Ikan Asin** - Berbagai jenis ikan asin

### Bahan Baku (20 item)
Berdasarkan data yang ada di frontend:
- **Bahan Utama**: Ayam Utuh, Lele, Nila, Cumi
- **Bahan Pokok**: Beras, Tahu Bumbu Kuning, Tempe Bumbu Kuning, Tempe Bacem, Tahu Bacem
- **Bumbu & Rempah**: Bumbu Halus, Rempah Kering
- **Sayuran**: Kangkung, Terong, Timun
- **Ikan Asin**: Ikan Asin Japuh, Ikan Asin Peda, Ikan Asin Pindang
- **Minuman**: Teh, Jeruk, Es Batu

### Produk (22 item)
Berdasarkan data yang ada di frontend:
- **18 Produk Makanan**: Nasi, Ayam Bakar, Ayam Goreng, Tusukan (Sate-satean), Lele Goreng, Nila Goreng, Cobek Nila, Kepala Ayam, Tempe Goreng, Tahu Goreng, Cumi Goreng, Pencok, Receuh Timun, Asin Japuh, Asin Peda, Asin Pindang, Tumis Kangkung, Tumis Terong
- **4 Produk Minuman**: Es Teh Manis, Es Teh Tawar, Es Teh Jus, Es Jeruk

### Varian Produk
Setiap produk memiliki 1 varian dengan harga yang sesuai dengan data frontend.

## 🔄 Rollback Migrasi

Jika perlu mengembalikan migrasi:
```bash
# Rollback migrasi terakhir
php artisan migrate:rollback

# Rollback semua migrasi
php artisan migrate:reset

# Rollback dan jalankan ulang
php artisan migrate:refresh --seed
```

## 🗂️ Model Eloquent

Model yang telah dibuat:
- `TblUser` - Model untuk tabel `tbl_user` (extends Authenticatable)
- `TblKategori` - Model untuk tabel `tbl_kategori`
- `TblProduk` - Model untuk tabel `tbl_produk`
- `TblBahan` - Model untuk tabel `tbl_bahan`
- `TblVarian` - Model untuk tabel `tbl_varian`
- `TblKomposisi` - Model untuk tabel `tbl_komposisi`
- `TblTransaksi` - Model untuk tabel `tbl_transaksi`
- `TblTransaksiDetail` - Model untuk tabel `tbl_transaksi_detail`
- `TblNotifikasi` - Model untuk tabel `tbl_notifikasi`
- `TblNotifikasiLog` - Model untuk tabel `tbl_notifikasi_log`

## 🔗 Relasi Database

### Relasi Utama
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

## 🎯 Mapping dengan Frontend

### StockManagement Component
- Data stok di frontend → `tbl_bahan`
- Alert stok menipis → query `stok_bahan < min_stok`

### ProductManagement Component
- Data produk di frontend → `tbl_produk` + `tbl_varian`
- Kategori produk → `tbl_kategori`

### Dashboard Component
- Total produk → count dari `tbl_produk`
- Stok menipis → count dari `tbl_bahan` dengan kondisi
- Penjualan hari ini → sum dari `tbl_transaksi`
- Produk terlaris → dari `tbl_transaksi_detail`

## 🔍 Query Contoh

### Cek Stok Menipis
```php
$lowStockItems = TblBahan::whereColumn('stok_bahan', '<', 'min_stok')->get();
```

### Produk Terlaris Hari Ini
```php
$topProducts = TblTransaksiDetail::join('tbl_produk', 'tbl_transaksi_detail.id_produk', '=', 'tbl_produk.id_produk')
    ->join('tbl_transaksi', 'tbl_transaksi_detail.id_transaksi', '=', 'tbl_transaksi.id_transaksi')
    ->whereDate('tbl_transaksi.tanggal_waktu', today())
    ->select('tbl_produk.nama_produk', DB::raw('SUM(tbl_transaksi_detail.jumlah) as total_terjual'))
    ->groupBy('tbl_produk.id_produk', 'tbl_produk.nama_produk')
    ->orderBy('total_terjual', 'desc')
    ->limit(5)
    ->get();
```

### Total Penjualan Hari Ini
```php
$todaySales = TblTransaksi::whereDate('tanggal_waktu', today())
    ->sum('total_transaksi');
```

## ⚠️ Troubleshooting

### Error Foreign Key Constraint
Jika ada error foreign key, pastikan urutan migrasi sudah benar. Migrasi sudah dibuat dengan urutan yang tepat.

### Error Seeder
Jika ada error seeder:
1. Pastikan migrasi sudah berhasil dijalankan
2. Pastikan data kategori sudah ada sebelum insert produk/bahan
3. Pastikan data user sudah ada sebelum insert yang membutuhkan `created_by`

### Error Database Connection
Pastikan:
1. Database `angkringan_ims` sudah dibuat
2. Konfigurasi `.env` sudah benar
3. MySQL service berjalan
4. User database memiliki permission yang cukup

## 📝 Catatan Penting

1. **Primary Key**: Semua tabel menggunakan `id_*` sebagai primary key
2. **Foreign Key**: Semua relasi menggunakan foreign key constraint
3. **Timestamps**: Semua tabel memiliki `created_at` dan `updated_at`
4. **Data Type**: Menggunakan `decimal(10,2)` untuk harga dan stok
5. **Enum**: Menggunakan enum untuk status dan pilihan terbatas
6. **Index**: Sudah dibuat index untuk optimasi query

## 🎉 Selesai!

Setelah migrasi berhasil dijalankan, database siap digunakan untuk:
- ✅ Login dengan user admin/kasir
- ✅ Mengelola stok bahan baku
- ✅ Mengelola produk dan varian
- ✅ Mencatat transaksi penjualan
- ✅ Sistem notifikasi stok menipis
- ✅ Laporan penjualan dan inventori

Database sudah sesuai dengan struktur frontend yang ada dan siap untuk development API backend.

---

**Panduan ini dibuat berdasarkan migrasi yang telah dibuat pada tanggal: $(date)**
