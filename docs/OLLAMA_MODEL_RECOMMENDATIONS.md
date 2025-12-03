# 🎯 Ollama Model Recommendations untuk OCR Service

## 📊 Perbandingan Model

Untuk tugas OCR text classification dan JSON extraction, berikut adalah rekomendasi model berdasarkan kebutuhan:

### ⭐ Recommended Models

#### 1. **qwen3:4b** (⭐ Recommended untuk Production)
- **Speed**: ⚡⚡⚡⚡ (10-20 detik untuk 20 items)
- **Accuracy**: 🎯🎯🎯🎯 (Sangat baik)
- **JSON Output**: ✅ Excellent
- **Indonesian Support**: ✅ Good
- **Size**: ~2.5GB
- **RAM Usage**: ~4-6GB
- **Install**: `ollama pull qwen3:4b`

**Kelebihan:**
- Balance terbaik antara speed dan accuracy
- Sangat baik dalam structured output (JSON)
- Support bahasa Indonesia dengan baik
- Tidak terlalu besar untuk sistem dengan RAM terbatas

**Kekurangan:**
- Sedikit lebih lambat dari gemma3:1b
- Membutuhkan lebih banyak RAM

---

#### 2. **qwen3:8b** (Best Accuracy)
- **Speed**: ⚡⚡⚡ (15-30 detik untuk 20 items)
- **Accuracy**: 🎯🎯🎯🎯🎯 (Excellent)
- **JSON Output**: ✅ Excellent
- **Indonesian Support**: ✅ Excellent
- **Size**: ~5GB
- **RAM Usage**: ~8-10GB
- **Install**: `ollama pull qwen3:8b`

**Kelebihan:**
- Accuracy terbaik
- Sangat baik dalam memahami konteks kompleks
- Excellent untuk prompt yang panjang dan detail
- Support bahasa Indonesia dengan sangat baik

**Kekurangan:**
- Lebih lambat dari qwen3:4b
- Membutuhkan lebih banyak RAM
- Mungkin terlalu besar untuk sistem dengan RAM < 8GB

---

#### 3. **gemma3:4b** (Alternative)
- **Speed**: ⚡⚡⚡⚡ (10-20 detik untuk 20 items)
- **Accuracy**: 🎯🎯🎯 (Good)
- **JSON Output**: ✅ Good
- **Indonesian Support**: ✅ Good
- **Size**: ~2.5GB
- **RAM Usage**: ~4-6GB
- **Install**: `ollama pull gemma3:4b`

**Kelebihan:**
- Similar performance dengan qwen3:4b
- Bagus jika sudah familiar dengan Gemma series
- Size reasonable

**Kekurangan:**
- Sedikit kurang akurat dibanding qwen3:4b untuk structured output

---

#### 4. **qwen3-vl:4b** (Vision-Language, Not Recommended)
- **Speed**: ⚡⚡⚡ (15-25 detik)
- **Accuracy**: 🎯🎯🎯
- **JSON Output**: ✅ Good
- **Size**: ~2.5GB
- **Note**: ⚠️ Vision-Language model, tidak diperlukan karena kita sudah pakai EasyOCR untuk text extraction

**Tidak direkomendasikan** karena:
- Vision-Language model tidak diperlukan (kita sudah pakai EasyOCR)
- Lebih lambat dari qwen3:4b biasa
- Tidak ada keuntungan untuk tugas kita

---

### ❌ Not Recommended

#### **gemma3:1b** (Current Default - Too Small)
- **Speed**: ⚡⚡⚡⚡⚡ (5-10 detik)
- **Accuracy**: 🎯🎯 (Poor)
- **JSON Output**: ⚠️ Often fails
- **Size**: ~700MB
- **RAM Usage**: ~2GB

**Masalah:**
- Terlalu kecil untuk tugas kompleks
- Sering gagal mengikuti instruksi prompt
- Sering return hasil yang salah (misal: nama_barang jadi angka)
- Tidak direkomendasikan untuk production

---

## 🔧 Cara Mengganti Model

### Step 1: Install Model Baru

```bash
# Install model yang diinginkan
ollama pull qwen3:4b
```

### Step 2: Update Environment Variable

Edit file `.env` di root project:

```env
# Ollama Configuration
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=qwen3:4b
```

### Step 3: Restart OCR Service

```bash
cd python_ocr_service
python ocr_service_hybrid.py
```

Service akan otomatis menggunakan model baru.

---

## 📈 Performance Comparison

| Model | Speed | Accuracy | JSON Quality | RAM | Recommended For |
|-------|-------|----------|--------------|-----|-----------------|
| qwen3:8b | ⚡⚡⚡ | 🎯🎯🎯🎯🎯 | ✅ Excellent | 8-10GB | Production (High Accuracy) |
| qwen3:4b | ⚡⚡⚡⚡ | 🎯🎯🎯🎯 | ✅ Excellent | 4-6GB | **Production (Recommended)** |
| gemma3:4b | ⚡⚡⚡⚡ | 🎯🎯🎯 | ✅ Good | 4-6GB | Alternative |
| gemma3:1b | ⚡⚡⚡⚡⚡ | 🎯🎯 | ⚠️ Poor | 2GB | Development Only |

---

## 💡 Tips

1. **Untuk Production**: Gunakan `qwen3:4b` atau `qwen3:8b`
2. **Untuk Development/Testing**: `gemma3:1b` masih bisa dipakai untuk speed, tapi hasilnya kurang akurat
3. **RAM Terbatas (< 8GB)**: Gunakan `qwen3:4b` atau `gemma3:4b`
4. **RAM Cukup (>= 8GB)**: Bisa pakai `qwen3:8b` untuk accuracy terbaik
5. **Speed Critical**: Tetap pakai `gemma3:1b`, tapi siap-siap dengan hasil yang kurang akurat

---

## 🔍 Testing Model

Setelah mengganti model, test dengan:

```bash
# Test via curl
curl -X POST http://localhost:5000/test-ollama

# Atau test langsung dengan upload foto
# Via frontend: Upload foto struk dan lihat hasilnya
```

---

## 📝 Notes

- Model yang lebih besar biasanya lebih akurat tapi lebih lambat
- Model yang lebih kecil lebih cepat tapi kurang akurat
- Untuk tugas OCR classification, `qwen3:4b` adalah sweet spot
- Pastikan RAM cukup untuk model yang dipilih
- Model akan di-download otomatis saat pertama kali digunakan

