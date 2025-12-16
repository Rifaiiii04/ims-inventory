# Menjalankan Multiple Instances Expired Prediction Service

## Cara 1: Menggunakan Command Line Argument

### Single Instance dengan Port Custom

```bash
# Port 5001 (default)
python expired_prediction_service.py

# Port 5002
python expired_prediction_service.py --port 5002

# Port 5003
python expired_prediction_service.py --port 5003
```

### Multiple Instances di Terminal Terpisah

Buka terminal/command prompt terpisah untuk setiap instance:

**Terminal 1:**

```bash
cd python_ocr_service
python expired_prediction_service.py --port 5001
```

**Terminal 2:**

```bash
cd python_ocr_service
python expired_prediction_service.py --port 5002
```

**Terminal 3:**

```bash
cd python_ocr_service
python expired_prediction_service.py --port 5003
```

## Cara 2: Menggunakan Script Batch (Windows)

### Single Instance

```bash
# Port default (5001)
start_service.bat

# Port custom
start_service.bat 5002
```

### Multiple Instances Otomatis

```bash
start_multiple_services.bat
```

Script ini akan menjalankan 2 instances di port 5001 dan 5002 secara otomatis.

## Cara 3: Menggunakan Environment Variable

Buat file `.env` di folder `python_ocr_service`:

```env
EXPIRED_PREDICTION_SERVICE_PORT=5001
EXPIRED_PREDICTION_SERVICE_HOST=0.0.0.0
```

Atau set di terminal sebelum menjalankan:

```bash
# Windows (PowerShell)
$env:EXPIRED_PREDICTION_SERVICE_PORT=5002
python expired_prediction_service.py

# Windows (CMD)
set EXPIRED_PREDICTION_SERVICE_PORT=5002
python expired_prediction_service.py

# Linux/Mac
export EXPIRED_PREDICTION_SERVICE_PORT=5002
python3 expired_prediction_service.py
```

## Prioritas Konfigurasi Port

1. **Command Line Argument** (`--port`) - Prioritas tertinggi
2. **Environment Variable** (`EXPIRED_PREDICTION_SERVICE_PORT`)
3. **Default** (5001)

## Konfigurasi Laravel untuk Multiple Instances

Jika ingin menggunakan multiple instances, Anda perlu mengubah konfigurasi di Laravel:

### Opsi 1: Load Balancing (Round Robin)

Edit `app/Http/Controllers/Api/NotificationController.php`:

```php
private $expiredPredictionServiceUrls = [
    'http://127.0.0.1:5001',
    'http://127.0.0.1:5002',
    'http://127.0.0.1:5003',
];

private $currentServiceIndex = 0;

private function getExpiredPredictionServiceUrl() {
    $url = $this->expiredPredictionServiceUrls[$this->currentServiceIndex];
    $this->currentServiceIndex = ($this->currentServiceIndex + 1) % count($this->expiredPredictionServiceUrls);
    return $url;
}
```

### Opsi 2: Failover (Primary + Backup)

Edit `app/Http/Controllers/Api/NotificationController.php`:

```php
private $expiredPredictionServiceUrls = [
    'http://127.0.0.1:5001', // Primary
    'http://127.0.0.1:5002', // Backup 1
    'http://127.0.0.1:5003', // Backup 2
];

private function getExpiredPredictionServiceUrl() {
    foreach ($this->expiredPredictionServiceUrls as $url) {
        try {
            $response = Http::timeout(2)->get($url . '/health');
            if ($response->successful()) {
                return $url;
            }
        } catch (\Exception $e) {
            continue;
        }
    }
    // Fallback ke primary jika semua gagal
    return $this->expiredPredictionServiceUrls[0];
}
```

## Testing Multiple Instances

### Test Health Check

```bash
# Instance 1
curl http://127.0.0.1:5001/health

# Instance 2
curl http://127.0.0.1:5002/health

# Instance 3
curl http://127.0.0.1:5003/health
```

### Test Prediction

```bash
# Instance 1
curl -X POST http://127.0.0.1:5001/predict-expiration \
  -H "Content-Type: application/json" \
  -d '{"id_bahan": 1, "nama_bahan": "Ayam", "kategori": "daging_segar", "stok": 10}'

# Instance 2
curl -X POST http://127.0.0.1:5002/predict-expiration \
  -H "Content-Type: application/json" \
  -d '{"id_bahan": 1, "nama_bahan": "Ayam", "kategori": "daging_segar", "stok": 10}'
```

## Catatan Penting

1. **Resource Usage**: Setiap instance menggunakan memory dan CPU terpisah
2. **Ollama Connection**: Setiap instance akan connect ke Ollama yang sama (tidak ada masalah)
3. **Database**: Semua instance akan menyimpan ke database Laravel yang sama
4. **Port Conflict**: Pastikan tidak ada aplikasi lain yang menggunakan port yang sama
5. **Load Balancing**: Untuk production, pertimbangkan menggunakan reverse proxy (Nginx/Apache) untuk load balancing

## Troubleshooting

### Port Already in Use

```bash
# Windows: Cek port yang digunakan
netstat -ano | findstr :5001

# Linux/Mac: Cek port yang digunakan
lsof -i :5001

# Kill process jika perlu
# Windows
taskkill /F /PID <PID>

# Linux/Mac
kill <PID>
```

### Service Tidak Bisa Diakses

-   Pastikan firewall tidak memblokir port
-   Pastikan host adalah `0.0.0.0` (bukan `127.0.0.1`) jika ingin diakses dari luar
-   Cek log untuk error messages
