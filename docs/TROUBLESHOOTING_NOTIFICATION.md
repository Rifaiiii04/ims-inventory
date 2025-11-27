# Troubleshooting Notifikasi WhatsApp

## Masalah: Notifikasi tidak terkirim ke WhatsApp

### 1. Cek WAHA Service

Pastikan WAHA (WhatsApp HTTP API) service berjalan:

```bash
# Cek apakah WAHA container running
docker ps | grep waha

# Atau cek log WAHA
docker logs angkringan_waha
```

**URL WAHA:** `http://host.docker.internal:3000` atau `http://localhost:3000`

### 2. Cek Konfigurasi n8n Workflow

Di file `n8n-workflow-stock-notification.json`, pastikan:

- **URL WAHA:** `http://host.docker.internal:3000/api/sendText`
- **Session:** `default`
- **Chat ID:** `6281380630988@c.us` (format: nomor dengan kode negara + @c.us)

### 3. Test Koneksi WAHA

Test apakah WAHA bisa diakses dari n8n:

```bash
# Test dari dalam container n8n
curl http://host.docker.internal:3000/api/sessions

# Test send message
curl -X POST http://host.docker.internal:3000/api/sendText \
  -H "Content-Type: application/json" \
  -d '{
    "session": "default",
    "chatId": "6281380630988@c.us",
    "text": "Test message"
  }'
```

### 4. Cek Log n8n

1. Buka n8n dashboard: `http://localhost:5678`
2. Buka workflow "Stock Notification Real-time"
3. Klik tab **"Executions"** untuk melihat log eksekusi
4. Cek apakah ada error di node "Kirim WhatsApp via WAHA"

### 5. Cek Session WAHA

Pastikan session WAHA sudah terhubung dengan WhatsApp:

```bash
# Cek status session
curl http://localhost:3000/api/sessions/default

# Response harus menunjukkan status: "CONNECTED"
```

Jika status bukan "CONNECTED":
1. Scan QR code di WAHA dashboard
2. Atau gunakan WhatsApp Web untuk connect

### 6. Cek Chat ID

Format chat ID harus benar:
- Format: `6281380630988@c.us`
- `62` = kode negara Indonesia
- `81380630988` = nomor tanpa 0 di depan
- `@c.us` = untuk chat personal (bukan group)

### 7. Test Manual dari n8n

1. Buka workflow di n8n
2. Klik **"Execute Workflow"**
3. Masukkan test data:
```json
{
  "items": [
    {
      "nama_bahan": "Beras",
      "stok_bahan": 2,
      "id_bahan": 1,
      "satuan": "kg",
      "min_stok": 5,
      "kategori": "Bahan Pokok"
    }
  ],
  "batch": true,
  "total_items": 1
}
```
4. Cek apakah pesan terkirim ke WhatsApp

### 8. Cek Environment Variables n8n

Pastikan di n8n Settings → Environment Variables sudah ada:
- `WAHA_IP=host.docker.internal` (atau `localhost` jika n8n tidak di Docker)
- `WAHA_PORT=3000`
- `WAHA_SESSION=default`
- `WAHA_CHAT_ID=6281380630988@c.us`

### 9. Cek Laravel Log

Cek apakah Laravel berhasil mengirim ke n8n:

```bash
# Cek log Laravel
tail -f storage/logs/laravel.log | grep -i "notification\|n8n"
```

Cari log:
- `Stock notification sent to n8n`
- `Batch stock notification sent to n8n`
- `Failed to send stock notification to n8n`

### 10. Test dari Laravel

Test endpoint notifikasi:

```bash
# Test trigger notifikasi
curl -X POST http://localhost:8000/api/notifications/trigger-all \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## Solusi Umum

### Jika WAHA tidak bisa diakses dari n8n:

1. **Jika n8n di Docker dan WAHA di host:**
   - Gunakan `host.docker.internal:3000`
   - Atau gunakan IP host machine

2. **Jika n8n dan WAHA di host yang sama:**
   - Gunakan `localhost:3000` atau `127.0.0.1:3000`

3. **Jika n8n dan WAHA di Docker yang sama:**
   - Gunakan service name: `http://waha:3000`
   - Pastikan di `docker-compose.yml` ada network yang sama

### Jika Session WAHA tidak connected:

1. Buka WAHA dashboard: `http://localhost:3000`
2. Scan QR code dengan WhatsApp
3. Tunggu sampai status "CONNECTED"

### Jika Chat ID salah:

1. Pastikan format: `6281380630988@c.us`
2. Pastikan nomor sudah terdaftar di kontak WhatsApp
3. Test dengan nomor lain untuk memastikan

## Debug Mode

Aktifkan debug logging di Laravel:

```php
// config/logging.php
'channels' => [
    'daily' => [
        'level' => 'debug', // Ubah dari 'info' ke 'debug'
    ],
],
```

Lalu cek log untuk detail lebih lengkap.

