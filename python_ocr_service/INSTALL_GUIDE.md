# 📦 Panduan Instalasi Dependencies untuk TrOCR

## ⚠️ Error yang Terjadi

Error yang Anda alami:
```
XLMRobertaTokenizer requires the SentencePiece library but it was not found
```

## ✅ Daftar Lengkap Dependencies

Berikut adalah **SEMUA** library yang perlu diinstall untuk TrOCR:

### 1. Core Dependencies (WAJIB)

```bash
pip install transformers
pip install torch torchvision
pip install sentencepiece
```

### 2. Dependencies Lainnya (Sudah Ada)

```bash
pip install Flask
pip install Pillow
pip install opencv-python
pip install numpy
pip install google-generativeai
pip install requests
pip install python-dotenv
```

## 🚀 Instalasi Lengkap (Satu Perintah)

### Opsi 1: Install dari requirements.txt (RECOMMENDED)

```bash
cd python_ocr_service
pip install -r requirements.txt
```

### Opsi 2: Install Manual (Step by Step)

```bash
# 1. Core untuk TrOCR
pip install transformers
pip install torch torchvision
pip install sentencepiece

# 2. Dependencies lainnya
pip install Flask==2.3.3
pip install Pillow==10.0.1
pip install opencv-python==4.8.1.78
pip install numpy==1.24.3
pip install google-generativeai==0.3.2
pip install requests==2.31.0
pip install python-dotenv>=1.0.0
```

## 📋 Checklist Dependencies

Setelah install, pastikan semua terinstall dengan benar:

```bash
python -c "import transformers; print('✓ transformers:', transformers.__version__)"
python -c "import torch; print('✓ torch:', torch.__version__)"
python -c "import sentencepiece; print('✓ sentencepiece:', sentencepiece.__version__)"
python -c "import cv2; print('✓ opencv-python:', cv2.__version__)"
python -c "from PIL import Image; print('✓ Pillow: OK')"
python -c "import flask; print('✓ Flask:', flask.__version__)"
python -c "import google.generativeai; print('✓ google-generativeai: OK')"
```

## ⚡ Quick Install (Copy-Paste)

**Windows PowerShell:**
```powershell
pip install transformers torch torchvision sentencepiece Flask==2.3.3 Pillow==10.0.1 opencv-python==4.8.1.78 numpy==1.24.3 google-generativeai==0.3.2 requests==2.31.0 python-dotenv
```

**Linux/Mac:**
```bash
pip install transformers torch torchvision sentencepiece Flask==2.3.3 Pillow==10.0.1 opencv-python==4.8.1.78 numpy==1.24.3 google-generativeai==0.3.2 requests==2.31.0 python-dotenv
```

## 🔍 Verifikasi Instalasi

Setelah install, test apakah TrOCR bisa di-load:

```python
python
>>> from transformers import TrOCRProcessor, VisionEncoderDecoderModel
>>> import sentencepiece
>>> print("✓ All dependencies OK!")
>>> processor = TrOCRProcessor.from_pretrained('microsoft/trocr-small-printed')
>>> print("✓ TrOCR processor loaded!")
```

## ⚠️ Catatan Penting

1. **SentencePiece** adalah library yang **WAJIB** untuk TrOCR
2. Setelah install, **WAJIB restart** Python service
3. Model TrOCR akan di-download otomatis saat pertama kali (300-500 MB)
4. Pastikan koneksi internet stabil saat download model

## 🐛 Troubleshooting

### Jika `pip install sentencepiece` gagal:

**Windows:**
```bash
# Coba install dengan pre-built wheel
pip install sentencepiece --only-binary :all:
```

**Atau install dari source (jika perlu):**
```bash
# Install C++ build tools dulu (Visual Studio Build Tools)
pip install sentencepiece --no-binary sentencepiece
```

### Jika masih error:

1. Update pip:
```bash
python -m pip install --upgrade pip
```

2. Install ulang:
```bash
pip install --upgrade transformers torch torchvision sentencepiece
```

3. Clear cache:
```bash
pip cache purge
```

## 📝 Setelah Install

1. **Restart Python service:**
```bash
cd python_ocr_service
python ocr_service_hybrid.py
```

2. **Cek health endpoint:**
```bash
curl http://127.0.0.1:5000/health
```

3. **Pastikan output menunjukkan:**
```json
{
  "trocr": "ready",
  "trocr_device": "cpu",
  "trocr_model": "microsoft/trocr-small-printed"
}
```

## 🎯 Summary

**Yang paling penting untuk TrOCR:**
1. ✅ `transformers` - Library Hugging Face
2. ✅ `torch` - PyTorch framework
3. ✅ `torchvision` - Vision utilities untuk PyTorch
4. ✅ `sentencepiece` - **INI YANG KURANG!** ⚠️

Install dengan:
```bash
pip install sentencepiece
```

Kemudian restart service!

