# Update Workflow n8n untuk Batch Notification

## 📋 Overview

Workflow n8n telah diupdate untuk mendukung **batch notification** - mengirim semua stok menipis dalam **satu pesan WhatsApp** daripada mengirim satu per satu.

## 🔄 Perubahan yang Dibuat

### 1. Laravel Backend

#### Method Baru: `sendBatchStockNotification()`

Method ini mengumpulkan semua stok yang menipis (stok < 5) dan mengirimnya dalam satu request ke n8n.

**Lokasi:** `app/Http/Controllers/Api/StockController.php`

**Format Data yang Dikirim:**
```json
{
  "items": [
    {
      "nama_bahan": "Beras",
      "stok_bahan": 3,
      "id_bahan": 1,
      "satuan": "kg",
      "min_stok": 5,
      "kategori": "Bahan Pokok"
    },
    {
      "nama_bahan": "Gula",
      "stok_bahan": 2,
      "id_bahan": 2,
      "satuan": "kg",
      "min_stok": 5,
      "kategori": "Bahan Pokok"
    }
  ],
  "batch": true,
  "total_items": 2
}
```

#### Konfigurasi Baru

Tambahkan di `.env`:
```env
N8N_BATCH_NOTIFICATION=true
```

Default: `true` (mengirim batch notification)

### 2. Workflow n8n - Perubahan yang Diperlukan

Workflow n8n perlu dimodifikasi untuk handle batch data. Berikut langkah-langkahnya:

#### Langkah 1: Modifikasi Node "Extract Data"

Buka node "Extract Data" dan ganti kode dengan:

```javascript
// Handle batch data atau single data
const body = $input.item.json.body || $input.item.json;

// Cek apakah ini batch notification
if (body.batch && body.items && Array.isArray(body.items)) {
  // Batch mode: return array of items
  return body.items.map(item => ({
    json: {
      nama_bahan: item.nama_bahan,
      stok_bahan: parseFloat(item.stok_bahan || 0),
      id_bahan: item.id_bahan,
      satuan: item.satuan || '',
      min_stok: parseFloat(item.min_stok || 5),
      kategori: item.kategori || 'Tidak ada kategori',
      isBatch: true
    }
  }));
} else {
  // Single mode: backward compatible
  const stock = parseFloat(body.stok_bahan || body.stok || body.quantity || 0);
  return {
    json: {
      nama_bahan: body.nama_bahan || body.nama_produk || body.name || 'Produk Tidak Dikenal',
      stok_bahan: stock,
      id_bahan: body.id_bahan || body.id_produk || 'unknown',
      satuan: body.satuan || body.unit || '',
      min_stok: parseFloat(body.min_stok || body.minStock || 5),
      kategori: body.kategori || 'Tidak ada kategori',
      isBatch: false
    }
  };
}
```

#### Langkah 2: Modifikasi Node "Cek Stok < 5?"

Node ini tetap sama, akan memproses setiap item dari batch.

#### Langkah 3: Modifikasi Node "Format Pesan WhatsApp"

Ganti node "Format Pesan WhatsApp" dengan kode berikut:

```javascript
// Ambil semua data dari input (bisa multiple items dari batch)
const items = $input.all();

// Cek apakah ini batch atau single
const isBatch = items.length > 1 || (items[0]?.json?.isBatch === true);

if (isBatch) {
  // Format pesan untuk batch (multiple items)
  let message = "🚨 *ALERT STOK MENIPIS* 🚨\n\n";
  
  items.forEach((item, index) => {
    const data = item.json;
    message += `${index + 1}. *${data.nama_bahan}* (${data.kategori})\n`;
    message += `   Stok: ${data.stok_bahan} ${data.satuan}\n`;
    message += `   Minimum: ${data.min_stok} ${data.satuan}\n`;
    message += `   Kekurangan: ${(data.min_stok - data.stok_bahan).toFixed(2)} ${data.satuan}\n\n`;
  });
  
  message += "Segera lakukan restocking! 📦";
  
  // Return single message untuk semua items
  return {
    json: {
      message: message,
      totalItems: items.length,
      isBatch: true,
      items: items.map(item => item.json)
    }
  };
} else {
  // Format pesan untuk single item (backward compatible)
  const data = items[0].json;
  const productName = data.nama_bahan;
  const stock = data.stok_bahan;
  const satuan = data.satuan || '';
  
  const message = `⚠️ Stok produk ${productName} tersisa ${stock}${satuan ? ' ' + satuan : ''}. Segera restock sebelum habis!`;
  
  return {
    json: {
      productName: productName,
      stock: stock,
      productId: data.id_bahan,
      satuan: satuan,
      message: message,
      isBatch: false,
      timestamp: new Date().toISOString()
    }
  };
}
```

#### Langkah 4: Modifikasi Node "Cegah Duplikasi Pesan"

Untuk batch notification, kita perlu cek berdasarkan total items dan timestamp:

```javascript
// Ambil data
const data = $input.item.json;
const currentTime = Date.now();
const fiveMinutes = 5 * 60 * 1000;

// Untuk batch, gunakan key khusus
const memory = $getWorkflowStaticData('global');
if (!memory.lastNotification) {
  memory.lastNotification = {};
}

// Key untuk batch: "batch_" + timestamp (dibulatkan ke menit)
// Key untuk single: productId
const key = data.isBatch ? `batch_${Math.floor(currentTime / 60000)}` : data.productId || data.items?.[0]?.id_bahan || 'unknown';

const lastSent = memory.lastNotification[key];

if (!lastSent || (currentTime - lastSent) > fiveMinutes) {
  memory.lastNotification[key] = currentTime;
  
  return {
    json: {
      ...data,
      shouldSend: true
    }
  };
} else {
  return {
    json: {
      ...data,
      shouldSend: false,
      skipReason: 'Notifikasi sudah dikirim dalam 5 menit terakhir'
    }
  };
}
```

## 📝 Cara Menggunakan

### Mode Batch (Default)

1. Pastikan `N8N_BATCH_NOTIFICATION=true` di `.env`
2. Saat ada update stok yang menipis, Laravel akan:
   - Mengumpulkan semua stok yang menipis (< 5)
   - Mengirim dalam satu request ke n8n
   - n8n akan mengirim satu pesan WhatsApp dengan semua stok menipis

### Mode Single (Backward Compatible)

1. Set `N8N_BATCH_NOTIFICATION=false` di `.env`
2. Setiap update stok akan mengirim notifikasi terpisah

### Manual Batch Notification

Anda juga bisa memanggil batch notification secara manual:

```bash
POST http://localhost:8000/api/stocks/send-batch-notification
Authorization: Bearer YOUR_TOKEN
```

## 📱 Format Pesan WhatsApp

### Batch Mode (Multiple Items)

```
🚨 *ALERT STOK MENIPIS* 🚨

1. *Beras* (Bahan Pokok)
   Stok: 3 kg
   Minimum: 5 kg
   Kekurangan: 2 kg

2. *Gula* (Bahan Pokok)
   Stok: 2 kg
   Minimum: 5 kg
   Kekurangan: 3 kg

Segera lakukan restocking! 📦
```

### Single Mode

```
⚠️ Stok produk Beras tersisa 3 kg. Segera restock sebelum habis!
```

## ✅ Keuntungan Batch Notification

1. **Lebih Efisien**: Satu pesan untuk semua stok menipis
2. **Lebih Informatif**: User melihat semua stok menipis sekaligus
3. **Mengurangi Spam**: Tidak mengirim banyak pesan terpisah
4. **Lebih Mudah Dibaca**: Format terstruktur dengan list

## 🔧 Testing

### Test Batch Notification

```bash
# Test manual batch notification
curl -X POST http://localhost:8000/api/stocks/send-batch-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Single Notification

1. Set `N8N_BATCH_NOTIFICATION=false` di `.env`
2. Update stok menjadi < 5
3. Cek WhatsApp - harus menerima pesan single

## ⚠️ Catatan Penting

1. **Backward Compatible**: Workflow tetap support single notification untuk kompatibilitas
2. **Pencegahan Duplikasi**: Batch notification menggunakan key khusus untuk mencegah duplikasi
3. **Performance**: Batch notification lebih efisien karena hanya satu request ke n8n

## 📋 Checklist Update

- [ ] Update node "Extract Data" di n8n
- [ ] Update node "Format Pesan WhatsApp" di n8n
- [ ] Update node "Cegah Duplikasi Pesan" di n8n (opsional)
- [ ] Set `N8N_BATCH_NOTIFICATION=true` di `.env`
- [ ] Test dengan update stok yang menipis
- [ ] Verifikasi pesan WhatsApp terkirim dengan format batch

---

**Last Updated: 10 November 2025**

