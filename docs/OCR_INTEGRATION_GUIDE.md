# 🔍 OCR Integration Guide

## 📋 Overview

Sistem OCR terintegrasi menggunakan kombinasi **Tesseract OCR + Ollama AI** untuk memproses foto struk belanja dan mengekstrak informasi barang yang dibeli.

## 🏗️ Architecture

```
Frontend (React) → Laravel API → Python OCR Service
     ↓                ↓              ↓
StockFormModal → OcrController → Tesseract OCR + Ollama AI
```

## 🔧 Components

### 1. Python OCR Service

-   **File**: `python_ocr_service/ocr_service_hybrid.py`
-   **Port**: 5000
-   **Features**: Tesseract OCR + Ollama AI
-   **Ollama URL**: Set via `OLLAMA_URL` environment variable (default: http://localhost:11434/api/generate)
-   **Ollama Model**: Set via `OLLAMA_MODEL` environment variable (default: gemma3:1b)

### 2. Laravel API Controller

-   **File**: `app/Http/Controllers/Api/OcrController.php`
-   **Routes**: `/api/ocr/process-photo`, `/api/ocr/health`
-   **Features**: Validation, error handling, data cleaning

### 3. Frontend Integration

-   **File**: `resources/js/components/stock/StockFormModal.jsx`
-   **Endpoint**: `/api/ocr/process-photo`
-   **Features**: Image upload, OCR processing, data display

## 🚀 Setup Instructions

### 1. Start Python OCR Service

```bash
cd python_ocr_service
pip install -r requirements.txt
python ocr_service_hybrid.py
```

### 2. Start Laravel API

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

### 3. Start Frontend

```bash
npm run dev
```

## 📡 API Endpoints

### Laravel API Endpoints

#### 1. Health Check

```http
GET /api/ocr/health
```

**Response:**

```json
{
    "success": true,
    "ocr_service": {
        "status": "healthy",
        "easyocr": "ready",
        "ollama": "ready"
    },
    "laravel_api": "healthy"
}
```

#### 2. Process Photo

```http
POST /api/ocr/process-photo
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
                "jumlah": "5",
                "harga": "25000",
                "unit": "kg",
                "category_id": 1,
                "minStock": 10
            }
        ],
        "count": 1
    }
}
```

### Python OCR Service Endpoints

#### 1. Health Check

```http
GET http://127.0.0.1:5000/health
```

#### 2. Process Photo

```http
POST http://127.0.0.1:5000/process-photo
Content-Type: multipart/form-data

image: [file]
```

## 🔄 Data Flow

1. **Frontend Upload**: User uploads image via `StockFormModal`
2. **Laravel Validation**: `OcrController` validates image file
3. **OCR Service Call**: Laravel calls Python OCR service
4. **EasyOCR Processing**: Python service extracts text using EasyOCR
5. **Ollama AI Analysis**: Ollama AI classifies and structures data
6. **Data Validation**: Laravel validates and cleans OCR data
7. **Response**: Clean data returned to frontend

## 🛠️ Configuration

### Python OCR Service

```python
# Ollama configuration dari environment variable
OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434/api/generate')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'gemma3:1b')

# Tesseract OCR languages
# Lang: eng+ind (English + Indonesian)
```

### Laravel Controller

```php
// OCR Service URL
private $ocrServiceUrl = 'http://127.0.0.1:5000';

// Validation rules
'image' => 'required|image|mimes:jpeg,png,jpg|max:10240'
```

## 📊 Data Validation

### Input Validation

-   **Image Format**: JPEG, PNG, JPG only
-   **File Size**: Max 10MB
-   **Required Fields**: nama_barang, harga

### Data Cleaning

-   **Price Format**: Indonesian number format support
-   **Unit Validation**: Standard units (pcs, kg, liter, etc.)
-   **Quantity**: Minimum 1
-   **Category ID**: Default 1

## 🔍 Error Handling

### Common Errors

1. **OCR Service Not Available (503)**

    - Check if Python service is running on port 5000
    - Verify OCR service health endpoint

2. **Invalid Image File (400)**

    - Check file format (JPEG, PNG, JPG only)
    - Check file size (max 10MB)

3. **OCR Processing Failed (500)**
    - Check EasyOCR installation
    - Check Ollama service (make sure it's running and model is installed)
    - Check image quality

### Debug Steps

1. **Check OCR Service Health**

    ```bash
    curl http://127.0.0.1:5000/health
    ```

2. **Check Laravel API Health**

    ```bash
    curl http://127.0.0.1:8000/api/ocr/health
    ```

3. **Check Laravel Logs**
    ```bash
    tail -f storage/logs/laravel.log
    ```

## 🚀 Performance

-   **EasyOCR**: ~2-5 detik per gambar
-   **Ollama AI**: ~5-30 detik per request (tergantung model dan hardware)
-   **Total Processing**: ~3-8 detik per struk
-   **File Size Limit**: 10MB
-   **Timeout**: 120 detik (ditingkatkan untuk Ollama processing)

## 🔒 Security

-   **API Key**: Hardcoded in Python service
-   **File Validation**: Strict image format validation
-   **Error Logging**: Detailed error tracking
-   **Input Sanitization**: Data cleaning and validation

## 📝 Testing

### Manual Testing

1. Upload test image via frontend
2. Check browser console for errors
3. Verify OCR data extraction
4. Test with different image formats

### Health Checks

-   OCR Service: `http://127.0.0.1:5000/health`
-   Laravel API: `http://127.0.0.1:8000/api/ocr/health`

## 🐛 Troubleshooting

### OCR Service Issues

-   **EasyOCR not working**: Check internet connection for model download
-   **Ollama API error**:
    -   Pastikan Ollama service berjalan: `ollama serve`
    -   Pastikan model sudah terinstall: `ollama pull gemma3:1b`
    -   Cek koneksi ke http://localhost:11434/api/generate
-   **Memory issues**: Ensure sufficient RAM (min 2GB)

### Laravel API Issues

-   **Connection refused**: Check if OCR service is running
-   **Timeout errors**:
    -   Timeout sudah ditingkatkan menjadi 120 detik
    -   Jika masih timeout, coba:
        1. Gunakan foto yang lebih kecil dan jelas
        2. Pastikan Ollama berjalan dengan baik
        3. Pertimbangkan menggunakan model Ollama yang lebih cepat
        4. Cek log Python service untuk melihat di mana bottleneck terjadi
-   **Validation errors**: Check image file format and size

### Frontend Issues

-   **Upload not working**: Check file input and FormData
-   **No response**: Check network tab for API calls
-   **Error display**: Check error handling in component

## 📈 Monitoring

-   **Health Endpoints**: Regular health checks
-   **Error Logging**: Laravel logs for debugging
-   **Performance**: Monitor processing times
-   **Success Rate**: Track OCR accuracy

## 🔄 Maintenance

### Regular Tasks

-   Monitor OCR service health
-   Check Ollama service status
-   Update dependencies
-   Clean upload folder

### Updates

-   EasyOCR model updates
-   Gemini API improvements
-   Laravel security patches
-   Frontend optimizations
