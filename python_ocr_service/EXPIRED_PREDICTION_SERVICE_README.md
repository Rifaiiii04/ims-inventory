# Expired Prediction Service

Service Python untuk memprediksi kapan bahan makanan akan expired menggunakan Ollama AI (gemma3:1b).

## Instalasi

1. Pastikan Python 3.8+ sudah terinstall
2. Install dependencies:

```bash
pip install flask requests python-dotenv
```

3. Pastikan Ollama sudah berjalan dan model gemma3:1b sudah terinstall:

```bash
ollama serve
ollama pull gemma3:1b
```

## Menjalankan Service

### Windows (PowerShell)

```powershell
cd python_ocr_service
python expired_prediction_service.py
```

### Linux/Mac

```bash
cd python_ocr_service
python3 expired_prediction_service.py
```

Service akan berjalan di port **5001** (default).

## Environment Variables

Tambahkan ke file `.env` di root project (opsional):

```env
# Ollama Configuration
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=gemma3:1b

# Expired Prediction Service Configuration
EXPIRED_PREDICTION_SERVICE_PORT=5001
EXPIRED_PREDICTION_SERVICE_HOST=0.0.0.0

# Logging
LOG_LEVEL=INFO
```

## API Endpoints

### 1. Health Check

```
GET http://localhost:5001/health
```

Response:

```json
{
    "status": "running",
    "message": "Expired Prediction Service is running",
    "ollama": "ready",
    "ollama_url": "http://localhost:11434/api/generate",
    "ollama_model": "gemma3:1b"
}
```

### 2. Test Ollama

```
GET http://localhost:5001/test-ollama
```

### 3. Predict Expiration (Single)

```
POST http://localhost:5001/predict-expiration
Content-Type: application/json

{
  "bahan": {
    "id_bahan": 1,
    "nama_bahan": "Beras",
    "kategori": "Bahan Pokok",
    "stok_bahan": 50,
    "satuan": "kg",
    "harga_beli": 12000,
    "min_stok": 10
  }
}
```

### 4. Predict Expiration (Batch)

```
POST http://localhost:5001/predict-expiration-batch
Content-Type: application/json

{
  "bahan_list": [
    {
      "id_bahan": 1,
      "nama_bahan": "Beras",
      "kategori": "Bahan Pokok",
      "stok_bahan": 50,
      "satuan": "kg",
      "harga_beli": 12000,
      "min_stok": 10
    },
    {
      "id_bahan": 2,
      "nama_bahan": "Minyak Goreng",
      "kategori": "Bahan Utama",
      "stok_bahan": 20,
      "satuan": "liter",
      "harga_beli": 25000,
      "min_stok": 5
    }
  ]
}
```

## Troubleshooting

### Service tidak bisa dihubungi

-   Pastikan service berjalan di port 5001
-   Cek firewall/antivirus yang mungkin memblokir port
-   Pastikan tidak ada service lain yang menggunakan port 5001

### Ollama tidak tersedia

-   Pastikan Ollama service berjalan: `ollama serve`
-   Pastikan model sudah terinstall: `ollama pull gemma3:1b`
-   Cek OLLAMA_URL di environment variable

### Error saat memprediksi

-   Cek log di console untuk detail error
-   Pastikan data bahan yang dikirim lengkap
-   Pastikan Ollama memiliki cukup memory

## Catatan

-   Service ini terpisah dari OCR service (yang berjalan di port 5000)
-   Timeout untuk prediksi batch adalah 300 detik (5 menit)
-   Setiap prediksi membutuhkan waktu sekitar 5-30 detik tergantung model dan hardware
