# Panduan Testing Workflow Chatbot UMKM

## 📋 Prerequisites

### 1. Setup Environment Variables di n8n

Pastikan environment variables berikut sudah diset di n8n:

```bash
API_BASE_URL=http://localhost:8000
WAHA_IP=localhost
WAHA_PORT=3000
WAHA_SESSION=default
WAHA_CHAT_ID=6281380630988@c.us
```

**Cara set di n8n:**
- Buka Settings → Environment Variables
- Tambahkan semua variable di atas

### 2. Pastikan Services Berjalan

- ✅ n8n running (biasanya di `http://localhost:5678`)
- ✅ Backend API running (di `http://localhost:8000`)
- ✅ WAHA running (di `http://localhost:3000`)

---

## 🧪 Cara Testing

### **Metode 1: Test Manual di n8n (Recommended untuk Development)**

#### Langkah 1: Import & Aktifkan Workflow
1. Buka n8n di browser (`http://localhost:5678`)
2. Import file `n8n-workflow-chatbot.json`
3. Klik **"Active"** toggle untuk mengaktifkan workflow
4. Copy **Webhook URL** dari node "Webhook - Terima Pesan WA"

#### Langkah 2: Test dengan Execute Workflow
1. Klik tombol **"Execute Workflow"** di n8n
2. Atau klik kanan pada node "Webhook - Terima Pesan WA" → **"Test Step"**
3. Masukkan test data:

```json
{
  "body": {
    "message": {
      "text": "help",
      "from": "6281380630988@c.us"
    },
    "from": "6281380630988@c.us",
    "chatId": "6281380630988@c.us"
  }
}
```

#### Langkah 3: Lihat Execution Logs
- Klik tab **"Executions"** untuk melihat hasil
- Cek setiap node apakah berjalan dengan benar
- Lihat data yang di-pass antar node

---

### **Metode 2: Test dengan HTTP Request (Postman/curl)**

#### Langkah 1: Dapatkan Webhook URL
1. Di n8n, klik node "Webhook - Terima Pesan WA"
2. Copy **Production URL** atau **Test URL**
3. URL akan seperti: `http://localhost:5678/webhook/whatsapp-chatbot`

#### Langkah 2: Test dengan Postman

**Request:**
- Method: `POST`
- URL: `http://localhost:5678/webhook/whatsapp-chatbot`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (raw JSON):
```json
{
  "message": {
    "text": "lihat stok",
    "from": "6281380630988@c.us"
  },
  "from": "6281380630988@c.us",
  "chatId": "6281380630988@c.us"
}
```

#### Langkah 3: Test dengan curl

```bash
curl -X POST http://localhost:5678/webhook/whatsapp-chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "text": "help",
      "from": "6281380630988@c.us"
    },
    "from": "6281380630988@c.us",
    "chatId": "6281380630988@c.us"
  }'
```

---

### **Metode 3: Test dengan WAHA (Real WhatsApp)**

#### Langkah 1: Setup WAHA Webhook
1. Buka WAHA dashboard (`http://localhost:3000`)
2. Setup webhook untuk meneruskan pesan ke n8n
3. Webhook URL: `http://localhost:5678/webhook/whatsapp-chatbot`

#### Langkah 2: Kirim Pesan dari WhatsApp
1. Scan QR code di WAHA untuk connect WhatsApp
2. Kirim pesan dari WhatsApp ke nomor yang terhubung
3. Pesan akan otomatis masuk ke workflow n8n

---

## 📝 Contoh Test Cases

### **1. Test Intent Classification (AI Agent)**

**Test Case: Help**
```json
{
  "message": {
    "text": "help",
    "from": "6281380630988@c.us"
  }
}
```
**Expected:** Response dengan menu help

---

**Test Case: Lihat Stok**
```json
{
  "message": {
    "text": "lihat stok",
    "from": "6281380630988@c.us"
  }
}
```
**Expected:** Response dengan daftar stok

---

**Test Case: Tambah Stok**
```json
{
  "message": {
    "text": "tambah stok beras 10",
    "from": "6281380630988@c.us"
  }
}
```
**Expected:** Response konfirmasi stok berhasil ditambahkan

---

**Test Case: Laporan Penjualan**
```json
{
  "message": {
    "text": "laporan penjualan",
    "from": "6281380630988@c.us"
  }
}
```
**Expected:** Response dengan laporan penjualan

---

**Test Case: Chat AI**
```json
{
  "message": {
    "text": "bagaimana penjualan hari ini?",
    "from": "6281380630988@c.us"
  }
}
```
**Expected:** Response dari Gemini AI tentang penjualan

---

**Test Case: Tambah Produk**
```json
{
  "message": {
    "text": "tambah produk nasi goreng harga 15000 kategori makanan",
    "from": "6281380630988@c.us"
  }
}
```
**Expected:** Response konfirmasi produk berhasil ditambahkan

---

## 🔍 Debugging Tips

### 1. Cek Execution Logs
- Buka tab **"Executions"** di n8n
- Klik execution yang ingin di-debug
- Lihat data di setiap node

### 2. Cek Node Errors
- Node yang error akan ditandai dengan warna merah
- Klik node untuk melihat error message
- Cek apakah API endpoint benar dan accessible

### 3. Test Individual Nodes
- Klik kanan node → **"Test Step"**
- Masukkan test data
- Lihat output node tersebut

### 4. Cek Environment Variables
- Pastikan semua env variables sudah diset
- Cek apakah URL API benar
- Pastikan WAHA sudah running

### 5. Cek AI Agent Response
- Lihat output dari node "AI Agent - Classify Intent"
- Cek apakah Gemini API response benar
- Lihat field `aiClassification` di node "Deteksi Intent"

---

## 🐛 Common Issues & Solutions

### Issue 1: Webhook tidak menerima request
**Solution:**
- Pastikan workflow sudah diaktifkan
- Cek apakah webhook URL benar
- Pastikan n8n accessible dari luar (jika test dari external)

### Issue 2: AI Agent tidak mengklasifikasi dengan benar
**Solution:**
- Cek API key Gemini apakah valid
- Lihat response dari Gemini di execution logs
- Cek apakah prompt sudah benar

### Issue 3: API Backend tidak accessible
**Solution:**
- Pastikan backend API running
- Cek `API_BASE_URL` environment variable
- Test API endpoint langsung dengan Postman

### Issue 4: WAHA tidak mengirim response
**Solution:**
- Pastikan WAHA running
- Cek `WAHA_IP`, `WAHA_PORT`, `WAHA_SESSION`
- Pastikan WhatsApp sudah terhubung di WAHA

---

## 📊 Test Checklist

- [ ] Workflow berhasil di-import
- [ ] Workflow aktif
- [ ] Environment variables sudah diset
- [ ] Webhook URL accessible
- [ ] Test "help" intent berhasil
- [ ] Test "lihat stok" intent berhasil
- [ ] Test "tambah stok" intent berhasil
- [ ] Test "laporan penjualan" intent berhasil
- [ ] Test "chat AI" intent berhasil
- [ ] AI Agent mengklasifikasi intent dengan benar
- [ ] Response dikirim ke WhatsApp via WAHA
- [ ] Semua node tidak ada error

---

## 🚀 Quick Test Script

Buat file `test-chatbot.sh`:

```bash
#!/bin/bash

WEBHOOK_URL="http://localhost:5678/webhook/whatsapp-chatbot"

echo "Testing Chatbot Workflow..."
echo ""

# Test Help
echo "1. Testing Help Intent..."
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "message": {"text": "help", "from": "6281380630988@c.us"},
    "from": "6281380630988@c.us",
    "chatId": "6281380630988@c.us"
  }'
echo -e "\n\n"

# Test Lihat Stok
echo "2. Testing Lihat Stok Intent..."
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "message": {"text": "lihat stok", "from": "6281380630988@c.us"},
    "from": "6281380630988@c.us",
    "chatId": "6281380630988@c.us"
  }'
echo -e "\n\n"

# Test Chat AI
echo "3. Testing Chat AI Intent..."
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "message": {"text": "bagaimana penjualan hari ini?", "from": "6281380630988@c.us"},
    "from": "6281380630988@c.us",
    "chatId": "6281380630988@c.us"
  }'
echo -e "\n\n"

echo "Testing completed!"
```

Jalankan dengan:
```bash
chmod +x test-chatbot.sh
./test-chatbot.sh
```

---

## 📞 Support

Jika ada masalah:
1. Cek execution logs di n8n
2. Cek console logs di browser (F12)
3. Cek logs backend API
4. Cek logs WAHA

