# Troubleshooting TrOCR Initialization

## Masalah: TrOCR "not_initialized"

Jika health check menunjukkan `"trocr": "not_initialized"`, ikuti langkah-langkah berikut:

### 1. Cek Dependencies

Pastikan semua dependencies terinstall:
```bash
pip install transformers torch torchvision
```

### 2. Cek Versi PyTorch

TrOCR memerlukan PyTorch >= 2.0:
```bash
python -c "import torch; print(torch.__version__)"
```

Jika versi < 2.0, upgrade:
```bash
pip install --upgrade torch torchvision
```

### 3. Cek Koneksi Internet

Model TrOCR perlu di-download dari Hugging Face (sekitar 300-500 MB). Pastikan:
- Koneksi internet stabil
- Tidak ada firewall yang memblokir Hugging Face
- Cache Hugging Face tidak corrupt

### 4. Cek Disk Space

Pastikan ada cukup ruang disk (minimal 1 GB free):
- Model: ~300-500 MB
- Cache: ~500 MB

### 5. Clear Hugging Face Cache (Jika Perlu)

Jika model corrupt, clear cache:
```bash
# Windows
rmdir /s "%USERPROFILE%\.cache\huggingface\hub\models--microsoft--trocr-small-printed"

# Linux/Mac
rm -rf ~/.cache/huggingface/hub/models--microsoft--trocr-small-printed
```

### 6. Restart Python Service

Setelah install/upgrade dependencies, **WAJIB restart** Python service:

```bash
# Stop service (Ctrl+C)
# Then restart:
cd python_ocr_service
python ocr_service_hybrid.py
```

### 7. Cek Log Error

Saat service start, perhatikan log untuk error messages:
- ImportError: Dependencies tidak terinstall
- ConnectionError: Masalah koneksi internet
- OSError: Masalah disk space atau permission

### 8. Test Manual

Test TrOCR secara manual:
```python
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
import torch

# Test import
print(f"PyTorch: {torch.__version__}")

# Test loading
processor = TrOCRProcessor.from_pretrained('microsoft/trocr-small-printed')
model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-small-printed')
print("TrOCR loaded successfully!")
```

## Fallback: Gemini Vision API

Jika TrOCR tidak bisa diinisialisasi, service akan otomatis menggunakan **Gemini Vision API** sebagai fallback. Pastikan:
- `GEMINI_API_KEY` sudah di-set di `.env`
- API key valid dan tidak expired

## Status Service

Cek status service:
```bash
curl http://127.0.0.1:5000/health
```

Response yang diharapkan:
```json
{
  "status": "healthy",
  "trocr": "ready",
  "trocr_device": "cpu",
  "trocr_model": "microsoft/trocr-small-printed",
  "gemini": "configured"
}
```

Jika `trocr: "not_initialized"`, ikuti troubleshooting di atas.

