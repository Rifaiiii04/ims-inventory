# 🚀 Implementasi OCR Service untuk Input Stok

## 📋 Overview

Service ini menggunakan kombinasi **EasyOCR** + **Gemini AI** untuk memproses foto struk belanja dan mengekstrak informasi barang yang dibeli.

### 🔧 Teknologi yang Digunakan:

-   **EasyOCR**: Ekstraksi teks dari gambar
-   **Gemini AI**: Klasifikasi dan struktur data
-   **Flask**: Web service API
-   **OpenCV**: Preprocessing gambar

## 🎯 Fitur Utama

1. **Ekstraksi Teks**: EasyOCR membaca teks dari struk
2. **Klasifikasi AI**: Gemini AI menganalisis dan struktur data
3. **Preprocessing**: Optimasi gambar untuk hasil OCR yang lebih baik
4. **API REST**: Endpoint untuk integrasi dengan Laravel

## 📁 Struktur File

```
python_ocr_service/
├── ocr_service_hybrid.py      # Service utama
├── requirements.txt           # Dependencies
├── start_hybrid_service.bat   # Script start
├── test_ocr_service.py        # Test script
├── README.md                  # Dokumentasi
└── uploads/                   # Folder upload gambar
```

## 🚀 Cara Menjalankan

### 1. Install Dependencies

```bash
cd python_ocr_service
pip install -r requirements.txt
```

### 2. Start Service

```bash
# Menggunakan batch file (Windows)
start_hybrid_service.bat

# Atau manual
python ocr_service_hybrid.py
```

### 3. Test Service

```bash
python test_ocr_service.py
```

## 📡 API Endpoints

### 1. Health Check

```http
GET http://localhost:5000/health
```

**Response:**

```json
{
    "status": "healthy",
    "message": "OCR service is running",
    "easyocr": "ready",
    "gemini": "configured"
}
```

### 2. Process Photo

```http
POST http://localhost:5000/process-photo
Content-Type: multipart/form-data

image: [file]
```

**Response:**

```json
{
    "success": true,
    "data": {
        "items": [
            {
                "nama_barang": "Nasi Putih",
                "jumlah": "2",
                "harga": "5000",
                "unit": "porsi",
                "category_id": 1,
                "minStock": 10
            }
        ]
    }
}
```

### 3. Test Gemini

```http
GET http://localhost:5000/test-gemini
```

## 🔄 Alur Kerja

1. **Upload Gambar**: Client mengirim foto struk
2. **Preprocessing**: OpenCV optimasi gambar
3. **EasyOCR**: Ekstraksi teks dari gambar
4. **Gemini AI**: Analisis teks dan struktur data
5. **Response**: Return data barang dalam format JSON

## ⚙️ Konfigurasi

### API Key Gemini

Set environment variable `GEMINI_API_KEY` di file `.env` di root project:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Atau set via command line:

```bash
set GEMINI_API_KEY=your_gemini_api_key_here
```

### Bahasa OCR

EasyOCR dikonfigurasi untuk bahasa Indonesia dan Inggris:

```python
reader = easyocr.Reader(['en', 'id'])
```

## 🧪 Testing

### Test Health

```bash
curl http://localhost:5000/health
```

### Test OCR

```bash
curl -X POST -F "image=@receipt.jpg" http://localhost:5000/process-photo
```

## 🔧 Troubleshooting

### 1. Service Tidak Start

-   Pastikan Python terinstall
-   Install dependencies: `pip install -r requirements.txt`
-   Check port 5000 tidak digunakan

### 2. EasyOCR Error

-   Pastikan internet connection untuk download model
-   Check memory cukup (min 2GB)

### 3. Gemini AI Error

-   Check API key valid
-   Check internet connection
-   Check quota API Gemini

## 📊 Performance

-   **EasyOCR**: ~2-5 detik per gambar
-   **Gemini AI**: ~1-3 detik per request
-   **Total**: ~3-8 detik per struk

## 🔒 Security

-   API key disimpan di environment variable
-   Upload folder terbatas
-   Error handling untuk input tidak valid

## 📈 Monitoring

-   Health check endpoint untuk monitoring
-   Log detail untuk debugging
-   Error tracking dengan traceback

## 🚀 Deployment

### Production

1. Gunakan Gunicorn atau uWSGI
2. Setup reverse proxy (Nginx)
3. Environment variables untuk config
4. Log rotation setup

### Docker (Optional)

```dockerfile
FROM python:3.9
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
EXPOSE 5000
CMD ["python", "ocr_service_hybrid.py"]
```

## 📝 Notes

-   Service berjalan di port 5000
-   Upload folder: `uploads/`
-   Log output ke console
-   Support format gambar: JPG, PNG, JPEG
