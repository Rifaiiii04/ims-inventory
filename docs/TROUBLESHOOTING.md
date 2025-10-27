# 🔧 Troubleshooting OCR Service

## 📋 Common Issues & Solutions

### 1. **Error 500 Internal Server Error**

**Problem**: `POST http://127.0.0.1:8000/api/ocr/process-photo 500 (Internal Server Error)`

**Possible Causes:**

-   OCR Service tidak berjalan
-   Laravel API tidak berjalan
-   Model Gemini tidak valid
-   Import controller salah

**Solutions:**

#### A. Check Services Status

```bash
# Check Laravel API
curl http://127.0.0.1:8000/api/ocr/health

# Check OCR Service
curl http://127.0.0.1:5000/health
```

#### B. Start All Services

```bash
# Option 1: Manual
php artisan serve --host=127.0.0.1 --port=8000
cd python_ocr_service
python ocr_service_hybrid.py
npm run dev

# Option 2: Batch File
start_all_services.bat
```

#### C. Fix Model Gemini

```python
# In ocr_service_hybrid.py
model = genai.GenerativeModel('gemini-pro')  # Use gemini-pro instead of gemini-flash-latest
```

#### D. Fix Route Import

```php
// In routes/api.php
use App\Http\Controllers\Api\OcrController;
Route::post('/ocr/process-photo', [OcrController::class, 'processPhoto']);
```

### 2. **PIL.ANTIALIAS Error**

**Problem**: `AttributeError: module 'PIL.Image' has no attribute 'ANTIALIAS'`

**Solution:**

```bash
pip install Pillow==9.5.0
```

### 3. **Gemini Model Not Found**

**Problem**: `404 models/gemini-flash-latest is not found`

**Solution:**

```python
# Use supported model
model = genai.GenerativeModel('gemini-pro')
```

### 4. **EasyOCR No Text Found**

**Problem**: `No text found by EasyOCR`

**Possible Causes:**

-   Gambar tidak jelas
-   Preprocessing gagal
-   Model EasyOCR belum download

**Solutions:**

-   Gunakan gambar yang lebih jelas
-   Check internet connection untuk download model
-   Restart OCR service

### 5. **Connection Refused**

**Problem**: `Connection refused to OCR service`

**Solution:**

```bash
# Start OCR service
cd python_ocr_service
python ocr_service_hybrid.py
```

## 🔍 Debug Steps

### 1. **Check Service Status**

```bash
# Laravel API
curl http://127.0.0.1:8000/api/ocr/health

# OCR Service
curl http://127.0.0.1:5000/health

# Frontend
curl http://localhost:5173
```

### 2. **Check Logs**

```bash
# Laravel logs
tail -f storage/logs/laravel.log

# OCR service logs (in terminal where service is running)
# Look for error messages
```

### 3. **Test OCR Service Directly**

```bash
# Test with curl
curl -X POST -F "image=@test_image.jpg" http://127.0.0.1:5000/process-photo
```

### 4. **Test Laravel API**

```bash
# Test health endpoint
curl http://127.0.0.1:8000/api/ocr/health

# Test with image
curl -X POST -F "image=@test_image.jpg" http://127.0.0.1:8000/api/ocr/process-photo
```

## 🚀 Quick Fix Commands

### Start All Services

```bash
# Windows
start_all_services.bat

# Manual
php artisan serve --host=127.0.0.1 --port=8000 &
cd python_ocr_service && python ocr_service_hybrid.py &
npm run dev &
```

### Fix Dependencies

```bash
# Fix Pillow
pip install Pillow==9.5.0

# Install OCR dependencies
pip install -r python_ocr_service/requirements.txt
```

### Clear Cache

```bash
# Laravel cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Restart services
```

## 📊 Expected Status

### Healthy Services

```json
// Laravel API Health
{
    "success": true,
    "ocr_service": {
        "status": "healthy",
        "easyocr": "ready",
        "gemini": "configured"
    },
    "laravel_api": "healthy"
}

// OCR Service Health
{
    "status": "healthy",
    "message": "OCR service is running",
    "easyocr": "ready",
    "gemini": "configured"
}
```

### Successful OCR Response

```json
{
    "success": true,
    "data": {
        "items": [
            {
                "nama_barang": "Nasi Putih",
                "jumlah": "1",
                "harga": "5000",
                "unit": "pcs",
                "category_id": 1,
                "minStock": 10
            }
        ],
        "count": 1
    }
}
```

## ⚠️ Important Notes

1. **Always start OCR service first** before testing
2. **Check internet connection** for EasyOCR model download
3. **Use supported Gemini models** (gemini-pro)
4. **Check Pillow version** (9.5.0 for compatibility)
5. **Monitor logs** for detailed error information

## 🆘 If Still Not Working

1. **Restart all services**
2. **Check firewall/antivirus** blocking ports
3. **Verify API keys** are correct
4. **Check system resources** (RAM, CPU)
5. **Try with different image** format/size
