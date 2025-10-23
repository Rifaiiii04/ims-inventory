# OCR Service untuk Input Stok

Service Python untuk memproses foto struk belanja menggunakan EasyOCR + Gemini AI.

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
cd python_ocr_service
python setup.py
```

### 2. Manual Setup (jika diperlukan)

```bash
# Install dependencies
pip install -r requirements.txt

# Start service
python server.py
```

### 3. Test Service

```bash
# Health check
curl http://localhost:5000/health

# Test OCR (dengan file gambar)
python ocr_service.py path/to/receipt.jpg
```

## 📋 Requirements

-   Python 3.8+
-   EasyOCR
-   Google Generative AI
-   OpenCV
-   Flask
-   Pillow

## 🔧 Configuration

### Gemini API Key

Edit `ocr_service.py` dan ganti API key:

```python
genai.configure(api_key="YOUR_GEMINI_API_KEY")
```

### Service URL

Edit `app/Http/Controllers/Api/OcrController.php`:

```php
private $pythonServiceUrl = 'http://localhost:5000';
```

## 📡 API Endpoints

### POST /process-receipt

Memproses foto struk belanja

**Request:**

```json
{
    "image": "base64_encoded_image"
}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "raw_text": ["text1", "text2"],
        "items": [
            {
                "nama_barang": "Nasi Putih",
                "jumlah": 2,
                "harga": 15000
            }
        ]
    }
}
```

### GET /health

Health check endpoint

## 🐛 Troubleshooting

### Service tidak bisa start

1. Pastikan port 5000 tidak digunakan
2. Check Python dependencies terinstall
3. Verify Gemini API key valid

### OCR tidak akurat

1. Pastikan gambar jelas dan tidak blur
2. Struk harus dalam bahasa Indonesia/Inggris
3. Cek format gambar (PNG, JPG, JPEG)

### Laravel tidak bisa connect

1. Pastikan Python service running di port 5000
2. Check firewall settings
3. Verify service URL di OcrController

## 📝 Usage di Laravel

```php
// Test OCR service
$response = Http::post('http://localhost:5000/process-receipt', [
    'image' => base64_encode($imageData)
]);
```

## 🔄 Development

Untuk development, jalankan dengan debug mode:

```bash
python server.py
```

Service akan restart otomatis saat ada perubahan file.
