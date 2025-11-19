# Dokumentasi Workflow Chatbot WhatsApp - UMKM Assistant

## Overview

Workflow n8n ini menyediakan chatbot WhatsApp yang terintegrasi dengan sistem IMS (Inventory Management System) untuk membantu pelaku UMKM mengelola bisnis mereka melalui WhatsApp. Chatbot ini dilengkapi dengan AI agent menggunakan Google Gemini untuk konsultasi dan analisis penjualan.

## Fitur Utama

### 1. **Manajemen Stok**
- ✅ Tambah stok bahan
- ✅ Lihat laporan stok inventory

### 2. **Laporan**
- ✅ Laporan penjualan
- ✅ Laporan inventory

### 3. **Input Data**
- ✅ Tambah produk
- ✅ Tambah kategori
- ✅ Tambah varian produk
- ✅ Tambah komposisi produk

### 4. **AI Assistant**
- ✅ Chat dan konsultasi tentang penjualan
- ✅ Analisis data bisnis
- ✅ Saran praktis untuk UMKM

## Cara Import Workflow

1. Buka n8n dashboard
2. Klik **Workflows** → **Import from File**
3. Pilih file `n8n-workflow-chatbot.json`
4. Workflow akan di-import dengan semua node yang sudah dikonfigurasi

## Konfigurasi Environment Variables

Sebelum menggunakan workflow, pastikan untuk mengatur environment variables berikut di n8n:

```env
API_BASE_URL=http://localhost:8000
WAHA_IP=localhost
WAHA_PORT=3000
WAHA_SESSION=default
WAHA_CHAT_ID=6281380630988@c.us
```

### Cara Mengatur Environment Variables di n8n:

1. Buka **Settings** → **Environment Variables**
2. Tambahkan variable-variable di atas
3. Atau bisa juga langsung edit di setiap node yang menggunakan `$env.VARIABLE_NAME`

## Konfigurasi WAHA Webhook

Untuk menerima pesan dari WhatsApp, workflow ini menggunakan webhook dari WAHA (WhatsApp HTTP API).

### Setup WAHA Webhook:

1. Pastikan WAHA sudah berjalan dan terhubung dengan WhatsApp
2. Konfigurasi webhook di WAHA untuk mengirim pesan masuk ke:
   ```
   http://your-n8n-url/webhook/whatsapp-chatbot
   ```
3. Atau gunakan webhook URL yang ditampilkan di node "Webhook - Terima Pesan WA"

## Format Perintah

### 1. Tambah Stok
```
tambah stok [nama bahan] [jumlah]
stok tambah [nama bahan] [jumlah]
stok +[jumlah] [nama bahan]
```

**Contoh:**
- `tambah stok beras 10`
- `stok tambah minyak goreng 5`
- `stok +20 beras`

### 2. Lihat Stok
```
lihat stok
cek stok
stok apa
inventory
```

### 3. Laporan Penjualan
```
laporan penjualan
laporan sales
penjualan
sales report
```

### 4. Laporan Inventory
```
laporan inventory
laporan stok
inventory report
```

### 5. Tambah Produk
```
tambah produk [nama] harga [harga] kategori [kategori]
```

**Contoh:**
- `tambah produk nasi goreng harga 15000 kategori makanan`
- `tambah produk es teh harga 5000 kategori minuman`

### 6. Tambah Kategori
```
tambah kategori [nama]
```

**Contoh:**
- `tambah kategori makanan`
- `tambah kategori minuman`

### 7. Tambah Varian
```
tambah varian [nama] untuk [produk]
```

**Contoh:**
- `tambah varian pedas untuk nasi goreng`
- `tambah varian besar untuk es teh`

### 8. Tambah Komposisi
```
tambah komposisi produk [nama produk] bahan [nama bahan] jumlah [jumlah]
```

**Contoh:**
- `tambah komposisi produk nasi goreng bahan beras jumlah 0.5`
- `tambah komposisi produk es teh bahan gula jumlah 2`

### 9. Chat AI / Konsultasi
```
bagaimana penjualan hari ini?
kenapa stok turun?
apa saran untuk meningkatkan penjualan?
```

### 10. Help / Menu
```
help
bantuan
menu
perintah
```

## Struktur Workflow

### Node-node Utama:

1. **Webhook - Terima Pesan WA**: Menerima pesan dari WAHA
2. **Extract Pesan**: Mengekstrak data pesan dari webhook
3. **Deteksi Intent**: Mengenali maksud pesan pengguna
4. **Route Intent**: Mengarahkan ke handler yang sesuai
5. **Switch Nodes**: Routing ke berbagai handler berdasarkan intent
6. **Handler Nodes**: Memproses setiap jenis perintah
7. **Merge Responses**: Menggabungkan semua response
8. **Send WhatsApp Response**: Mengirim balasan ke WhatsApp

### Flow Diagram:

```
Webhook → Extract → Detect Intent → Route → Switch → Handler → Format → Merge → Send
```

## Integrasi dengan API Backend

Workflow ini terintegrasi dengan API Laravel di:
- `GET /api/stocks` - Ambil daftar stok
- `PUT /api/stocks/{id}` - Update stok
- `GET /api/products` - Ambil daftar produk
- `POST /api/products` - Tambah produk
- `GET /api/categories` - Ambil daftar kategori
- `POST /api/categories` - Tambah kategori
- `POST /api/variants` - Tambah varian
- `POST /api/compositions` - Tambah komposisi
- `GET /api/reports/sales` - Laporan penjualan
- `GET /api/reports/inventory` - Laporan inventory
- `GET /api/dashboard/summary` - Summary dashboard

## Integrasi dengan Gemini AI

Workflow menggunakan Google Gemini API untuk:
- Memahami konteks percakapan
- Menganalisis data penjualan
- Memberikan saran bisnis
- Menjawab pertanyaan kompleks

**API Key Gemini:** Sudah dikonfigurasi di node "Call Gemini AI"
- Model: `gemini-pro`
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`

## Testing

### Test Manual:

1. Kirim pesan ke nomor WhatsApp yang terhubung dengan WAHA
2. Coba berbagai perintah sesuai format di atas
3. Periksa log di n8n untuk melihat eksekusi workflow

### Test dengan cURL:

```bash
# Test webhook
curl -X POST http://localhost:5678/webhook/whatsapp-chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "text": "help"
    },
    "from": "6281380630988@c.us",
    "messageId": "test123"
  }'
```

## Troubleshooting

### Pesan tidak diterima:
1. Pastikan WAHA webhook sudah dikonfigurasi dengan benar
2. Cek URL webhook di n8n
3. Pastikan WAHA session aktif

### Error API:
1. Pastikan `API_BASE_URL` sudah benar
2. Cek apakah API Laravel berjalan
3. Periksa log error di n8n

### AI tidak merespon:
1. Pastikan API key Gemini valid
2. Cek koneksi internet
3. Periksa format request ke Gemini API

### Stok tidak terupdate:
1. Pastikan nama bahan sesuai dengan yang ada di database
2. Cek format pesan sesuai dengan yang diharapkan
3. Periksa response dari API

## Catatan Penting

1. **Keamanan**: API key Gemini sebaiknya disimpan sebagai environment variable, bukan hardcoded
2. **Rate Limiting**: Perhatikan rate limit dari Gemini API
3. **Error Handling**: Workflow sudah dilengkapi dengan error handling, tapi pastikan untuk memantau log
4. **Data Validation**: Pastikan data yang dikirim ke API sudah valid

## Pengembangan Lebih Lanjut

Fitur yang bisa ditambahkan:
- [ ] Multi-language support
- [ ] Voice message support
- [ ] Image recognition untuk input stok
- [ ] Scheduled reports
- [ ] Notifikasi otomatis
- [ ] Analytics dan insights
- [ ] Multi-user support dengan authentication

## Support

Untuk pertanyaan atau masalah, silakan buat issue di repository atau hubungi developer.

