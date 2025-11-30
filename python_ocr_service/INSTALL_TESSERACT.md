# Instalasi Tesseract OCR

Service OCR sekarang menggunakan **Tesseract OCR** yang lebih ringan dan cepat, cocok untuk laptop dengan RAM 8GB.

## 📦 Instalasi Tesseract OCR

### Windows (Recommended)

**Option 1: Download Installer**
1. Download Tesseract installer dari: https://github.com/UB-Mannheim/tesseract/wiki
2. Pilih versi terbaru (misalnya: `tesseract-ocr-w64-setup-5.x.x.exe`)
3. Install dengan default settings
4. Pastikan menambahkan Tesseract ke PATH saat instalasi

**Option 2: Menggunakan Chocolatey**
```powershell
choco install tesseract
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
sudo apt-get install tesseract-ocr-ind  # Untuk bahasa Indonesia (opsional)
```

### MacOS
```bash
brew install tesseract
```

## 🔧 Setup Python Package

Setelah Tesseract terinstall, install Python package:

```bash
cd python_ocr_service
pip install -r requirements.txt
```

Ini akan menginstall `pytesseract` yang diperlukan.

## ✅ Verifikasi Instalasi

Test apakah Tesseract terinstall dengan benar:

```bash
python -c "import pytesseract; print(pytesseract.get_tesseract_version())"
```

Jika berhasil, akan menampilkan versi Tesseract (misalnya: `5.3.0`).

## 🚀 Menjalankan Service

Setelah Tesseract terinstall, jalankan service:

```bash
python ocr_service_hybrid.py
```

Service akan otomatis mendeteksi Tesseract dan menggunakannya untuk ekstraksi teks.

## 📝 Catatan

- **Memory Usage**: Tesseract menggunakan ~50-100MB RAM (jauh lebih ringan dari TrOCR yang menggunakan ~2-3GB)
- **Speed**: Tesseract lebih cepat untuk teks cetak (printed text) seperti struk belanja
- **Accuracy**: Tesseract sangat baik untuk teks cetak yang jelas
- **Language Support**: Default English, bisa ditambahkan bahasa Indonesia dengan install `tesseract-ocr-ind`

## 🐛 Troubleshooting

### Error: "TesseractNotFoundError"
- Pastikan Tesseract terinstall dan ada di PATH
- Windows: Cek di `C:\Program Files\Tesseract-OCR\tesseract.exe`
- Atau set path manual: `pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'`

### Error: "No module named 'pytesseract'"
```bash
pip install pytesseract
```

### OCR tidak akurat
- Pastikan foto jelas dan tidak blur
- Pastikan pencahayaan cukup
- Coba dengan preprocessing (OTSU thresholding atau contrast enhancement)

