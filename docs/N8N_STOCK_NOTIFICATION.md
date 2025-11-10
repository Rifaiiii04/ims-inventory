# Dokumentasi Workflow n8n - Notifikasi Stok Real-time

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Arsitektur Sistem](#arsitektur-sistem)
4. [Konfigurasi](#konfigurasi)
5. [Workflow n8n](#workflow-n8n)
6. [Integrasi Laravel](#integrasi-laravel)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance](#maintenance)

---

## Overview

Workflow n8n ini dirancang untuk mengirimkan notifikasi WhatsApp secara otomatis setiap kali ada produk yang stoknya menipis (di bawah 5 unit). Sistem ini terintegrasi dengan:

- **Backend Laravel**: Mengirim data stok ke webhook n8n
- **n8n Workflow**: Memproses data dan mengirim notifikasi
- **WAHA API**: Gateway untuk mengirim pesan WhatsApp

### Fitur Utama

✅ **Real-time Notification**: Notifikasi langsung saat stok menipis  
✅ **Pencegahan Duplikasi**: Tidak mengirim notifikasi yang sama dalam 5 menit  
✅ **Format Pesan Otomatis**: Pesan WhatsApp terformat dengan rapi  
✅ **Error Handling**: Logging untuk monitoring dan debugging  
✅ **Fleksibel**: Mudah dikonfigurasi dan diubah  

---

## Prerequisites

### Software yang Diperlukan

1. **n8n** (versi terbaru)
   - Berjalan di Docker atau host machine
   - Port default: `5678`

2. **WAHA (WhatsApp HTTP API)**
   - Versi: 2025.9.8 atau lebih baru
   - Port: `3000`
   - Session aktif dengan status "WORKING"

3. **Laravel Backend**
   - PHP 8.1+
   - Laravel 10+
   - Extension: `guzzlehttp/guzzle` (untuk HTTP request)

### Konfigurasi WAHA

- **Session Name**: `default`
- **Bot WhatsApp**: Nomor yang terhubung ke WAHA (contoh: `6283836339182@c.us`)
- **Nomor Tujuan**: Nomor yang akan menerima notifikasi (contoh: `081380630988`)

---

## Arsitektur Sistem

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐         ┌──────────────┐
│   Laravel   │  POST   │  n8n Webhook │  Process│  n8n Workflow│  POST   │  WAHA API   │
│  Backend    │─────────>│   Receiver  │─────────>│   Engine    │────────>│  Gateway    │
│             │          │             │          │             │         │             │
└─────────────┘          └──────────────┘          └─────────────┘         └──────────────┘
                                                                                   │
                                                                                   │ WhatsApp
                                                                                   ▼
                                                                          ┌──────────────┐
                                                                          │   WhatsApp   │
                                                                          │   User       │
                                                                          │ (081380630988)│
                                                                          └──────────────┘
```

### Alur Data

1. **Laravel** mendeteksi stok menipis (< 5) saat update/create stok
2. **Laravel** mengirim POST request ke n8n webhook dengan data JSON
3. **n8n** menerima data, memproses, dan memvalidasi
4. **n8n** mengirim request ke WAHA API
5. **WAHA** mengirim pesan WhatsApp ke nomor tujuan
6. **User** menerima notifikasi di WhatsApp

---

## Konfigurasi

### 1. Konfigurasi Laravel (.env)

Tambahkan konfigurasi berikut di file `.env`:

```env
# N8N Configuration
N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/stock-notification
N8N_NOTIFICATION_ENABLED=true
N8N_TIMEOUT=5
```

**Catatan:**
- Jika n8n berjalan di Docker, gunakan: `http://host.docker.internal:5678/webhook-test/stock-notification`
- Untuk production, gunakan URL n8n yang sesuai

### 2. Konfigurasi n8n Environment Variables

Di n8n, set environment variables berikut (Settings → Environment Variables):

```env
WAHA_IP=host.docker.internal
WAHA_PORT=3000
WAHA_SESSION=default
WAHA_CHAT_ID=6281380630988@c.us
```

**Penjelasan:**
- `WAHA_IP`: IP atau hostname WAHA server
  - Jika n8n di Docker: `host.docker.internal`
  - Jika n8n di host: `localhost` atau `127.0.0.1`
- `WAHA_PORT`: Port WAHA (default: `3000`)
- `WAHA_SESSION`: Nama session WAHA (default: `default`)
- `WAHA_CHAT_ID`: Nomor tujuan dalam format `6281380630988@c.us` (62 = kode negara Indonesia)

### 3. Import Workflow n8n

1. Buka n8n dashboard
2. Klik "Workflows" → "Import from File"
3. Pilih file `n8n-workflow-stock-notification.json`
4. Workflow akan ter-import dan terbuka di editor

### 4. Aktifkan Workflow

1. Di editor workflow, klik toggle **"Active"** di kanan atas
2. Webhook URL akan muncul (contoh: `http://localhost:5678/webhook-test/stock-notification`)
3. Salin URL webhook ini dan pastikan sesuai dengan `N8N_WEBHOOK_URL` di `.env`

---

## Workflow n8n

### Struktur Workflow

Workflow terdiri dari node-node berikut:

```
1. Webhook - Terima Data Stok
   ↓
2. Respond to Webhook (parallel)
   ↓
3. Extract Data (Code Node)
   ↓
4. Cek Stok < 5? (Code Node)
   ↓
5. Format Pesan WhatsApp (Code Node)
   ↓
6. Cegah Duplikasi Pesan (Code Node)
   ↓
7. Filter - Skip jika Duplikat (IF Node)
   ↓
8. Kirim WhatsApp via WAHA (HTTP Request)
   ↓
9. Log Hasil (Code Node)
   ↓
10. Cek Sukses? (IF Node)
```

### Detail Node

#### 1. Webhook - Terima Data Stok
- **Type**: Webhook
- **Method**: POST
- **Path**: `stock-notification`
- **Fungsi**: Menerima data JSON dari Laravel

#### 2. Respond to Webhook
- **Type**: Respond to Webhook
- **Fungsi**: Mengirim response langsung ke Laravel

#### 3. Extract Data
- **Type**: Code
- **Fungsi**: Mengekstrak dan memformat data dari webhook body
- **Output**: 
  ```json
  {
    "nama_bahan": "Beras",
    "stok_bahan": 3,
    "id_bahan": 1,
    "satuan": "kg",
    "min_stok": 5
  }
  ```

#### 4. Cek Stok < 5?
- **Type**: Code
- **Fungsi**: Mengecek apakah stok < 5
- **Logic**: 
  ```javascript
  if (stock < 5) {
    return data; // Lanjut ke node berikutnya
  } else {
    return null; // Skip
  }
  ```

#### 5. Format Pesan WhatsApp
- **Type**: Code
- **Fungsi**: Memformat pesan WhatsApp
- **Output**: 
  ```
  ⚠️ Stok produk [nama_produk] tersisa [stok] [satuan]. Segera restock sebelum habis!
  ```

#### 6. Cegah Duplikasi Pesan
- **Type**: Code
- **Fungsi**: Mencegah pengiriman notifikasi duplikat dalam 5 menit
- **Logic**: Menggunakan workflow static data untuk menyimpan timestamp

#### 7. Filter - Skip jika Duplikat
- **Type**: IF
- **Fungsi**: Filter data yang sudah dikirim baru-baru ini

#### 8. Kirim WhatsApp via WAHA
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `http://host.docker.internal:3000/api/sendText`
- **Body**:
  ```json
  {
    "session": "default",
    "chatId": "6281380630988@c.us",
    "text": "{{ $json.message }}"
  }
  ```

#### 9. Log Hasil
- **Type**: Code
- **Fungsi**: Logging hasil pengiriman (sukses/gagal)

#### 10. Cek Sukses?
- **Type**: IF
- **Fungsi**: Validasi sukses/gagal pengiriman

---

## Integrasi Laravel

### 1. Konfigurasi Services

File `config/services.php` sudah dikonfigurasi dengan:

```php
'n8n' => [
    'webhook_url' => env('N8N_WEBHOOK_URL', 'http://localhost:5678/webhook-test/stock-notification'),
    'enabled' => env('N8N_NOTIFICATION_ENABLED', true),
    'timeout' => env('N8N_TIMEOUT', 5),
],
```

### 2. Method di StockController

Method `sendStockNotification()` sudah ditambahkan di `app/Http/Controllers/Api/StockController.php`:

```php
private function sendStockNotification($stock)
{
    // Cek apakah notifikasi diaktifkan
    if (!config('services.n8n.enabled', true)) {
        return;
    }

    // Hanya kirim notifikasi jika stok di bawah 5
    if ($stock->stok_bahan >= 5) {
        return;
    }

    try {
        $webhookUrl = config('services.n8n.webhook_url');
        $timeout = config('services.n8n.timeout', 5);

        if (empty($webhookUrl)) {
            Log::warning('N8N webhook URL tidak dikonfigurasi');
            return;
        }

        // Kirim data ke n8n webhook
        Http::timeout($timeout)->post($webhookUrl, [
            'nama_bahan' => $stock->nama_bahan,
            'stok_bahan' => $stock->stok_bahan,
            'id_bahan' => $stock->id_bahan,
            'satuan' => $stock->satuan,
            'min_stok' => $stock->min_stok,
        ]);

        Log::info('Stock notification sent to n8n', [
            'bahan_id' => $stock->id_bahan,
            'nama_bahan' => $stock->nama_bahan,
            'stok' => $stock->stok_bahan
        ]);

    } catch (\Exception $e) {
        Log::error('Failed to send stock notification to n8n: ' . $e->getMessage(), [
            'bahan_id' => $stock->id_bahan,
            'error' => $e->getMessage()
        ]);
    }
}
```

### 3. Panggilan Method

Method `sendStockNotification()` dipanggil di:
- `store()` - Setelah create stok baru
- `update()` - Setelah update stok
- Saat update stok yang sudah ada (di method `store()`)

### 4. Format Data yang Dikirim

Laravel mengirim data dalam format JSON:

```json
{
  "nama_bahan": "Beras",
  "stok_bahan": 3,
  "id_bahan": 1,
  "satuan": "kg",
  "min_stok": 5
}
```

---

## Testing

### 1. Test Endpoint (Paling Mudah)

Gunakan route test yang sudah dibuat:

**Menggunakan curl:**
```bash
curl -X POST http://localhost:8000/api/test/stock-notification \
  -H "Content-Type: application/json" \
  -d '{
    "nama_bahan": "Beras Test",
    "stok_bahan": 3,
    "id_bahan": 1,
    "satuan": "kg",
    "min_stok": 5
  }'
```

**Menggunakan Postman:**
- Method: `POST`
- URL: `http://localhost:8000/api/test/stock-notification`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "nama_bahan": "Beras Test",
    "stok_bahan": 3,
    "id_bahan": 1,
    "satuan": "kg",
    "min_stok": 5
  }
  ```

**Response yang Diharapkan:**
```json
{
  "success": true,
  "message": "Test notification sent to n8n",
  "test_data": {...},
  "n8n_response": {...},
  "n8n_status": 200
}
```

### 2. Test via Update Stok (Real Scenario)

1. Login ke aplikasi
2. Buka halaman Stock/Stok
3. Edit stok yang ada, ubah quantity menjadi < 5 (misal: 3)
4. Simpan
5. Cek WhatsApp nomor tujuan - harus menerima notifikasi

**Atau via API:**
```bash
# Login dulu untuk dapat token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'

# Update stok dengan stok < 5
curl -X PUT http://localhost:8000/api/stocks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Beras",
    "category_id": 1,
    "buyPrice": 15000,
    "quantity": 3,
    "unit": "kg",
    "minStock": 5
  }'
```

### 3. Test via Create Stok Baru

1. Login ke aplikasi
2. Tambah stok baru dengan quantity < 5
3. Simpan
4. Cek WhatsApp - harus menerima notifikasi

### 4. Checklist Testing

- [ ] n8n workflow sudah di-import dan aktif
- [ ] Webhook URL di n8n sesuai dengan `.env`
- [ ] WAHA berjalan dan session "default" WORKING
- [ ] Nomor tujuan sudah tersimpan di kontak bot WAHA
- [ ] Test endpoint berhasil mengirim data ke n8n
- [ ] n8n berhasil mengirim WhatsApp ke nomor tujuan
- [ ] Update stok < 5 otomatis trigger notifikasi
- [ ] Pencegahan duplikasi bekerja (tidak kirim 2x dalam 5 menit)

---

## Troubleshooting

### Masalah: Workflow tidak ter-trigger

**Gejala:** Data dari Laravel tidak masuk ke n8n

**Solusi:**
1. Pastikan workflow sudah aktif (toggle "Active" hijau)
2. Cek webhook URL di n8n sesuai dengan `.env`
3. Test webhook URL langsung dari browser/Postman
4. Cek log Laravel: `storage/logs/laravel.log`

### Masalah: Node IF selalu ke False Branch

**Gejala:** Data dengan stok < 5 tidak lanjut ke node berikutnya

**Solusi:**
1. Pastikan node "Extract Data" mengeluarkan field `stok_bahan` dengan benar
2. Gunakan Code node untuk validasi (lebih reliable daripada IF node)
3. Cek tipe data: pastikan `stok_bahan` adalah number, bukan string

### Masalah: Error ECONNREFUSED ke WAHA

**Gejala:** `connect ECONNREFUSED 127.0.0.1:3000` atau `::1:3000`

**Solusi:**
1. Jika n8n di Docker, gunakan `host.docker.internal:3000`
2. Pastikan WAHA berjalan: akses `http://localhost:3000/dashboard`
3. Test koneksi dari terminal: `curl http://127.0.0.1:3000/api/sessions`
4. Gunakan IP host machine jika perlu

### Masalah: Error "Session name is required"

**Gejala:** WAHA API mengembalikan error session required

**Solusi:**
1. Pastikan field `"session": "default"` ada di request body
2. Cek di WAHA dashboard bahwa session "default" aktif
3. Pastikan format JSON body benar di node "Kirim WhatsApp via WAHA"

### Masalah: WhatsApp tidak terkirim

**Gejala:** n8n sukses tapi pesan tidak sampai

**Solusi:**
1. Cek status session WAHA (harus WORKING)
2. Pastikan nomor tujuan sudah tersimpan di kontak bot WAHA
3. Cek log di n8n untuk error dari WAHA API
4. Test kirim manual dari WAHA dashboard

### Masalah: Notifikasi tidak terkirim saat update stok

**Gejala:** Update stok < 5 tidak trigger notifikasi

**Solusi:**
1. Cek log Laravel untuk error
2. Pastikan `N8N_NOTIFICATION_ENABLED=true` di `.env`
3. Pastikan stok benar-benar < 5
4. Cek apakah method `sendStockNotification()` dipanggil

### Masalah: Notifikasi duplikat

**Gejala:** Menerima notifikasi yang sama berkali-kali

**Solusi:**
1. Cek node "Cegah Duplikasi Pesan" berfungsi
2. Pastikan workflow static data tersimpan
3. Cek interval waktu (default: 5 menit)

---

## Maintenance

### Monitoring

1. **Laravel Logs**
   - Lokasi: `storage/logs/laravel.log`
   - Cari: "Stock notification sent to n8n" atau "Failed to send stock notification"

2. **n8n Execution Log**
   - Buka n8n dashboard → Workflows → Executions
   - Cek setiap eksekusi untuk error atau warning

3. **WAHA Dashboard**
   - Monitor status session
   - Cek log pengiriman pesan

### Backup Workflow

1. Export workflow dari n8n:
   - Klik workflow → "..." → "Download"
   - Simpan file JSON

2. Backup konfigurasi:
   - Simpan file `.env` (jangan commit ke git)
   - Dokumentasikan environment variables

### Update Workflow

1. Export workflow lama sebagai backup
2. Import workflow baru
3. Aktifkan workflow baru
4. Test dengan data sample
5. Nonaktifkan workflow lama setelah konfirmasi

### Disable Notifikasi

Untuk sementara disable tanpa hapus kode:

```env
N8N_NOTIFICATION_ENABLED=false
```

Atau di n8n, nonaktifkan workflow (toggle "Active" off).

---

## Format Pesan WhatsApp

Pesan yang dikirim memiliki format:

```
⚠️ Stok produk [nama_produk] tersisa [stok] [satuan]. Segera restock sebelum habis!
```

**Contoh:**
```
⚠️ Stok produk Beras tersisa 3 kg. Segera restock sebelum habis!
```

---

## Konfigurasi Lanjutan

### Mengubah Batas Minimum Stok

Default: stok < 5

Untuk mengubah, edit node "Cek Stok < 5?" di n8n:
- Ganti nilai `5` dengan nilai yang diinginkan
- Atau gunakan environment variable

### Mengubah Interval Pencegahan Duplikasi

Default: 5 menit

Edit node "Cegah Duplikasi Pesan":
```javascript
const fiveMinutes = 5 * 60 * 1000; // Ubah 5 menjadi nilai lain
```

### Mengubah Format Pesan

Edit node "Format Pesan WhatsApp" di n8n untuk mengubah format pesan.

---

## Support & Kontak

Jika mengalami masalah yang tidak tercakup di dokumentasi ini:

1. Cek log Laravel dan n8n
2. Cek dokumentasi WAHA: https://waha.devlike.pro/
3. Cek dokumentasi n8n: https://docs.n8n.io/

---

## Changelog

### Version 1.0 (2025-11-10)
- ✅ Initial release
- ✅ Workflow n8n untuk notifikasi stok real-time
- ✅ Integrasi dengan Laravel backend
- ✅ Integrasi dengan WAHA API
- ✅ Pencegahan duplikasi pesan
- ✅ Error handling dan logging

---

**Dokumentasi ini dibuat untuk sistem Angkringan IMS**  
**Last Updated: 10 November 2025**

