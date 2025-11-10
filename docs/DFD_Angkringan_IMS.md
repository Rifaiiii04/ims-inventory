# DFD (Data Flow Diagram) - Angkringan IMS

## Daftar Isi

1. [DFD Level 0 (Context Diagram)](#dfd-level-0-context-diagram)
2. [DFD Level 1 (Overview Diagram)](#dfd-level-1-overview-diagram)
3. [DFD Level 2 (Detailed Processes)](#dfd-level-2-detailed-processes)
4. [DFD Level 3 (Sub-Process Details)](#dfd-level-3-sub-process-details)
5. [Keterangan Simbol DFD](#keterangan-simbol-dfd)
6. [Data Dictionary](#data-dictionary)

---

## DFD Level 0 (Context Diagram)

DFD Level 0 menunjukkan sistem secara keseluruhan dan interaksinya dengan entitas eksternal.

```mermaid
flowchart TD
    Admin[Admin]
    Kasir[Kasir]
    Supplier[Supplier]
    OCRService[OCR Service<br/>External]
    WhatsAppAgent[WhatsApp Agent<br/>External]

    System[Angkringan IMS<br/>Sistem]

    Admin -->|Login Request| System
    Admin -->|Product Data| System
    Admin -->|Stock Data| System
    Admin -->|Category Data| System
    Admin -->|User Management| System
    Admin -->|Report Request| System

    Kasir -->|Login Request| System
    Kasir -->|Transaction Data| System
    Kasir -->|Report Request| System

    Supplier -->|Purchase Receipt Image| System

    System -->|Authentication Response| Admin
    System -->|Product List| Admin
    System -->|Stock List| Admin
    System -->|Dashboard Data| Admin
    System -->|Reports| Admin
    System -->|User List| Admin

    System -->|Authentication Response| Kasir
    System -->|Product List| Kasir
    System -->|Transaction Confirmation| Kasir
    System -->|Reports| Kasir

    System -->|Image| OCRService
    OCRService -->|Extracted Items| System

    System -->|Low Stock Alert| WhatsAppAgent
    WhatsAppAgent -->|Stock Query| System
```

### Penjelasan DFD Level 0

**External Entities:**

-   **Admin**: Pengguna dengan akses penuh untuk mengelola produk, stok, kategori, dan laporan
-   **Kasir**: Pengguna dengan akses terbatas untuk melakukan transaksi dan melihat laporan
-   **Supplier**: Pemasok yang menyediakan struk belanja untuk diproses
-   **OCR Service**: Layanan eksternal untuk ekstraksi teks dari gambar struk
-   **WhatsApp Agent**: Layanan eksternal untuk mengirim notifikasi via WhatsApp

**Data Flows:**

-   Login Request: Kredensial pengguna (email, password)
-   Product Data: Data produk (nama, harga, kategori, dll)
-   Stock Data: Data stok (nama, jumlah, harga beli, dll)
-   Transaction Data: Data transaksi penjualan
-   Report Request: Permintaan laporan (penjualan, inventori)
-   Purchase Receipt Image: Gambar struk belanja dari supplier
-   Extracted Items: Data item yang diekstrak dari struk
-   Low Stock Alert: Notifikasi stok menipis

---

## DFD Level 1 (Overview Diagram)

DFD Level 1 memecah sistem menjadi proses-proses utama.

```mermaid
flowchart TD
    Admin[Admin]
    Kasir[Kasir]
    Supplier[Supplier]
    OCRService[OCR Service]
    WhatsAppAgent[WhatsApp Agent]

    P1[1.0<br/>Authentication<br/>Process]
    P2[2.0<br/>Product<br/>Management]
    P3[3.0<br/>Stock<br/>Management]
    P4[4.0<br/>Transaction<br/>Processing]
    P5[5.0<br/>Reporting]
    P6[6.0<br/>Notification<br/>Management]
    P7[7.0<br/>OCR<br/>Processing]

    D1[(D1: Users)]
    D2[(D2: Products)]
    D3[(D3: Categories)]
    D4[(D4: Stock Items)]
    D5[(D5: Stock History)]
    D6[(D6: Transactions)]
    D7[(D7: Transaction Details)]
    D8[(D8: Notifications)]
    D9[(D9: Notification Logs)]
    D10[(D10: Variants)]
    D11[(D11: Compositions)]

    Admin -->|Login Credentials| P1
    Kasir -->|Login Credentials| P1
    P1 -->|User Data| D1
    D1 -->|User Info| P1
    P1 -->|Auth Response| Admin
    P1 -->|Auth Response| Kasir

    Admin -->|Product CRUD| P2
    P2 -->|Product Data| D2
    P2 -->|Category Data| D3
    P2 -->|Variant Data| D10
    P2 -->|Composition Data| D11
    D2 -->|Product List| P2
    D3 -->|Category List| P2
    D10 -->|Variant List| P2
    P2 -->|Product Response| Admin

    Admin -->|Stock CRUD| P3
    P3 -->|Stock Data| D4
    P3 -->|Stock History| D5
    P3 -->|Category Data| D3
    D4 -->|Stock List| P3
    D5 -->|History Data| P3
    D3 -->|Category List| P3
    P3 -->|Stock Response| Admin

    Kasir -->|Transaction Data| P4
    P4 -->|Transaction Data| D6
    P4 -->|Transaction Details| D7
    P4 -->|Stock Update| D4
    P4 -->|Stock History| D5
    P4 -->|Product Data| D2
    P4 -->|Variant Data| D10
    D2 -->|Product Info| P4
    D10 -->|Variant Info| P4
    D6 -->|Transaction Confirmation| P4
    P4 -->|Transaction Response| Kasir

    Admin -->|Report Request| P5
    Kasir -->|Report Request| P5
    P5 -->|Transaction Data| D6
    P5 -->|Transaction Details| D7
    P5 -->|Stock Data| D4
    P5 -->|Product Data| D2
    D6 -->|Sales Data| P5
    D7 -->|Sales Detail| P5
    D4 -->|Inventory Data| P5
    P5 -->|Reports| Admin
    P5 -->|Reports| Kasir

    P3 -->|Low Stock Alert| P6
    P6 -->|Notification Data| D8
    P6 -->|Notification Log| D9
    P6 -->|Stock Data| D4
    D8 -->|Notification Config| P6
    D9 -->|Log Data| P6
    P6 -->|Alert Message| WhatsAppAgent
    WhatsAppAgent -->|Query Request| P6

    Supplier -->|Receipt Image| P7
    P7 -->|Image| OCRService
    OCRService -->|Extracted Items| P7
    P7 -->|Validated Items| Admin
    P7 -->|Stock Data| D4
```

### Penjelasan DFD Level 1

**Processes:**

1. **Authentication Process (1.0)**: Menangani login, logout, dan validasi pengguna
2. **Product Management (2.0)**: Mengelola produk, kategori, varian, dan komposisi
3. **Stock Management (3.0)**: Mengelola stok bahan baku, riwayat stok, dan update stok
4. **Transaction Processing (4.0)**: Memproses transaksi penjualan dan update stok otomatis
5. **Reporting (5.0)**: Menghasilkan laporan penjualan dan inventori
6. **Notification Management (6.0)**: Mengelola notifikasi stok menipis dan pengiriman alert
7. **OCR Processing (7.0)**: Memproses gambar struk dan ekstraksi data item

**Data Stores:**

-   **D1: Users**: Data pengguna (admin, kasir)
-   **D2: Products**: Data produk jadi
-   **D3: Categories**: Data kategori produk dan stok
-   **D4: Stock Items**: Data bahan baku dan stok
-   **D5: Stock History**: Riwayat perubahan stok
-   **D6: Transactions**: Data transaksi penjualan
-   **D7: Transaction Details**: Detail item dalam transaksi
-   **D8: Notifications**: Konfigurasi notifikasi
-   **D9: Notification Logs**: Log notifikasi yang dikirim
-   **D10: Variants**: Data varian produk
-   **D11: Compositions**: Data komposisi bahan baku produk

---

## DFD Level 2 (Detailed Processes)

DFD Level 2 memecah setiap proses utama menjadi sub-proses yang lebih detail.

### 2.0 Product Management - Decomposed

```mermaid
flowchart TD
    Admin[Admin]

    P2_1[2.1<br/>Manage<br/>Products]
    P2_2[2.2<br/>Manage<br/>Categories]
    P2_3[2.3<br/>Manage<br/>Variants]
    P2_4[2.4<br/>Manage<br/>Compositions]

    D2[(D2: Products)]
    D3[(D3: Categories)]
    D10[(D10: Variants)]
    D11[(D11: Compositions)]
    D4[(D4: Stock Items)]

    Admin -->|Product CRUD| P2_1
    P2_1 -->|Product Data| D2
    P2_1 -->|Category Data| D3
    D2 -->|Product List| P2_1
    D3 -->|Category List| P2_1
    P2_1 -->|Product Response| Admin

    Admin -->|Category CRUD| P2_2
    P2_2 -->|Category Data| D3
    D3 -->|Category List| P2_2
    P2_2 -->|Category Response| Admin

    Admin -->|Variant CRUD| P2_3
    P2_3 -->|Variant Data| D10
    P2_3 -->|Product Data| D2
    D10 -->|Variant List| P2_3
    D2 -->|Product List| P2_3
    P2_3 -->|Variant Response| Admin

    Admin -->|Composition CRUD| P2_4
    P2_4 -->|Composition Data| D11
    P2_4 -->|Product Data| D2
    P2_4 -->|Stock Data| D4
    D11 -->|Composition List| P2_4
    D2 -->|Product List| P2_4
    D4 -->|Stock List| P2_4
    P2_4 -->|Composition Response| Admin
```

### 3.0 Stock Management - Decomposed

```mermaid
flowchart TD
    Admin[Admin]

    P3_1[3.1<br/>Manage<br/>Stock Items]
    P3_2[3.2<br/>Update<br/>Stock]
    P3_3[3.3<br/>Track Stock<br/>History]
    P3_4[3.4<br/>Check Low<br/>Stock]

    D4[(D4: Stock Items)]
    D5[(D5: Stock History)]
    D3[(D3: Categories)]
    D1[(D1: Users)]
    D8[(D8: Notifications)]

    Admin -->|Stock CRUD| P3_1
    P3_1 -->|Stock Data| D4
    P3_1 -->|Category Data| D3
    D4 -->|Stock List| P3_1
    D3 -->|Category List| P3_1
    P3_1 -->|Stock Response| Admin

    Admin -->|Stock Update Request| P3_2
    P3_2 -->|Updated Stock| D4
    P3_2 -->|User Data| D1
    P3_2 -->|History Record| P3_3
    D4 -->|Current Stock| P3_2
    D1 -->|User Info| P3_2
    P3_2 -->|Update Response| Admin

    P3_2 -->|History Data| P3_3
    P3_3 -->|History Record| D5
    D5 -->|History List| P3_3

    P3_2 -->|Stock Data| P3_4
    P3_4 -->|Stock Data| D4
    D4 -->|Stock Status| P3_4
    P3_4 -->|Low Stock Alert| D8
    P3_4 -->|Alert Trigger| NotificationProcess
```

### 4.0 Transaction Processing - Decomposed

```mermaid
flowchart TD
    Kasir[Kasir]

    P4_1[4.1<br/>Create<br/>Transaction]
    P4_2[4.2<br/>Process<br/>Items]
    P4_3[4.3<br/>Update<br/>Stock]
    P4_4[4.4<br/>Calculate<br/>Total]
    P4_5[4.5<br/>Generate<br/>Receipt]

    D6[(D6: Transactions)]
    D7[(D7: Transaction Details)]
    D2[(D2: Products)]
    D10[(D10: Variants)]
    D4[(D4: Stock Items)]
    D5[(D5: Stock History)]
    D11[(D11: Compositions)]
    D1[(D1: Users)]

    Kasir -->|Transaction Request| P4_1
    P4_1 -->|User Data| D1
    D1 -->|User Info| P4_1
    P4_1 -->|Transaction Header| D6
    P4_1 -->|Transaction ID| P4_2

    P4_2 -->|Product Data| D2
    P4_2 -->|Variant Data| D10
    D2 -->|Product Info| P4_2
    D10 -->|Variant Info| P4_2
    P4_2 -->|Transaction Details| D7
    P4_2 -->|Item Data| P4_3
    P4_2 -->|Item Data| P4_4

    P4_3 -->|Composition Data| D11
    P4_3 -->|Stock Data| D4
    D11 -->|Ingredient List| P4_3
    D4 -->|Current Stock| P4_3
    P4_3 -->|Updated Stock| D4
    P4_3 -->|History Record| D5

    P4_4 -->|Transaction Details| D7
    D7 -->|Item Prices| P4_4
    P4_4 -->|Total Amount| P4_1
    P4_1 -->|Updated Total| D6

    P4_1 -->|Transaction Data| P4_5
    P4_5 -->|Transaction Data| D6
    P4_5 -->|Transaction Details| D7
    D6 -->|Transaction Info| P4_5
    D7 -->|Item Details| P4_5
    P4_5 -->|Receipt| Kasir
```

### 5.0 Reporting - Decomposed

```mermaid
flowchart TD
    Admin[Admin]
    Kasir[Kasir]

    P5_1[5.1<br/>Generate Sales<br/>Report]
    P5_2[5.2<br/>Generate Inventory<br/>Report]
    P5_3[5.3<br/>Export<br/>Report]

    D6[(D6: Transactions)]
    D7[(D7: Transaction Details)]
    D4[(D4: Stock Items)]
    D5[(D5: Stock History)]
    D2[(D2: Products)]
    D3[(D3: Categories)]

    Admin -->|Sales Report Request| P5_1
    Kasir -->|Sales Report Request| P5_1
    P5_1 -->|Transaction Data| D6
    P5_1 -->|Transaction Details| D7
    P5_1 -->|Product Data| D2
    D6 -->|Sales Data| P5_1
    D7 -->|Sales Detail| P5_1
    D2 -->|Product Info| P5_1
    P5_1 -->|Sales Report| Admin
    P5_1 -->|Sales Report| Kasir
    P5_1 -->|Report Data| P5_3

    Admin -->|Inventory Report Request| P5_2
    Kasir -->|Inventory Report Request| P5_2
    P5_2 -->|Stock Data| D4
    P5_2 -->|Stock History| D5
    P5_2 -->|Category Data| D3
    D4 -->|Inventory Data| P5_2
    D5 -->|History Data| P5_2
    D3 -->|Category Info| P5_2
    P5_2 -->|Inventory Report| Admin
    P5_2 -->|Inventory Report| Kasir
    P5_2 -->|Report Data| P5_3

    Admin -->|Export Request| P5_3
    P5_3 -->|Report Data| P5_1
    P5_3 -->|Report Data| P5_2
    P5_3 -->|PDF/Excel File| Admin
```

### 6.0 Notification Management - Decomposed

```mermaid
flowchart TD
    Admin[Admin]
    WhatsAppAgent[WhatsApp Agent]

    P6_1[6.1<br/>Configure<br/>Notifications]
    P6_2[6.2<br/>Monitor Stock<br/>Levels]
    P6_3[6.3<br/>Send<br/>Notifications]
    P6_4[6.4<br/>Log<br/>Notifications]

    D8[(D8: Notifications)]
    D9[(D9: Notification Logs)]
    D4[(D4: Stock Items)]

    Admin -->|Notification Config| P6_1
    P6_1 -->|Notification Data| D8
    D8 -->|Notification List| P6_1
    P6_1 -->|Config Response| Admin

    P6_2 -->|Stock Data| D4
    P6_2 -->|Notification Config| D8
    D4 -->|Stock Status| P6_2
    D8 -->|Alert Rules| P6_2
    P6_2 -->|Low Stock Alert| P6_3

    P6_3 -->|Notification Data| D8
    P6_3 -->|Alert Message| WhatsAppAgent
    P6_3 -->|Notification Data| P6_4
    WhatsAppAgent -->|Query Request| P6_3
    P6_3 -->|Query Response| WhatsAppAgent

    P6_4 -->|Log Data| D9
    D9 -->|Log List| P6_4
```

### 7.0 OCR Processing - Decomposed

```mermaid
flowchart TD
    Supplier[Supplier]
    Admin[Admin]
    OCRService[OCR Service]

    P7_1[7.1<br/>Receive<br/>Image]
    P7_2[7.2<br/>Send to OCR<br/>Service]
    P7_3[7.3<br/>Validate<br/>Data]
    P7_4[7.4<br/>Format<br/>Items]

    D4[(D4: Stock Items)]
    D3[(D3: Categories)]

    Supplier -->|Receipt Image| P7_1
    P7_1 -->|Image File| P7_2

    P7_2 -->|Image| OCRService
    OCRService -->|Extracted Text| P7_2
    P7_2 -->|Raw Items| P7_3

    P7_3 -->|Category Data| D3
    D3 -->|Category List| P7_3
    P7_3 -->|Validated Items| P7_4

    P7_4 -->|Formatted Items| Admin
    P7_4 -->|Stock Data| D4
```

---

## DFD Level 3 (Sub-Process Details)

DFD Level 3 menunjukkan detail lebih lanjut dari sub-proses yang kompleks.

### 4.2 Process Items - Decomposed

```mermaid
flowchart TD
    P4_2_1[4.2.1<br/>Validate<br/>Product]
    P4_2_2[4.2.2<br/>Get Product<br/>Price]
    P4_2_3[4.2.3<br/>Calculate<br/>Subtotal]
    P4_2_4[4.2.4<br/>Create<br/>Detail Record]

    D2[(D2: Products)]
    D10[(D10: Variants)]
    D7[(D7: Transaction Details)]

    ItemRequest[Item Request] -->|Product ID| P4_2_1
    P4_2_1 -->|Product Data| D2
    P4_2_1 -->|Variant Data| D10
    D2 -->|Product Info| P4_2_1
    D10 -->|Variant Info| P4_2_1
    P4_2_1 -->|Validated Product| P4_2_2

    P4_2_2 -->|Price Info| P4_2_3
    P4_2_3 -->|Subtotal| P4_2_4
    P4_2_4 -->|Detail Data| D7
    D7 -->|Detail Record| TransactionProcess
```

### 4.3 Update Stock - Decomposed

```mermaid
flowchart TD
    P4_3_1[4.3.1<br/>Get<br/>Composition]
    P4_3_2[4.3.2<br/>Calculate<br/>Stock Needed]
    P4_3_3[4.3.3<br/>Check Stock<br/>Availability]
    P4_3_4[4.3.4<br/>Deduct<br/>Stock]
    P4_3_5[4.3.5<br/>Record<br/>History]

    D11[(D11: Compositions)]
    D4[(D4: Stock Items)]
    D5[(D5: Stock History)]

    ItemData[Item Data] -->|Product ID| P4_3_1
    P4_3_1 -->|Composition Data| D11
    D11 -->|Ingredient List| P4_3_1
    P4_3_1 -->|Composition| P4_3_2

    P4_3_2 -->|Required Stock| P4_3_3
    P4_3_3 -->|Stock Data| D4
    D4 -->|Current Stock| P4_3_3
    P4_3_3 -->|Stock Status| P4_3_4

    P4_3_4 -->|Updated Stock| D4
    P4_3_4 -->|Change Data| P4_3_5
    P4_3_5 -->|History Record| D5
    D5 -->|History| StockManagement
```

### 7.3 Validate Data - Decomposed

```mermaid
flowchart TD
    P7_3_1[7.3.1<br/>Validate<br/>Item Name]
    P7_3_2[7.3.2<br/>Validate<br/>Quantity]
    P7_3_3[7.3.3<br/>Validate<br/>Price]
    P7_3_4[7.3.4<br/>Assign<br/>Category]
    P7_3_5[7.3.5<br/>Clean<br/>Data]

    D3[(D3: Categories)]

    RawItem[Raw Item Data] -->|Item Name| P7_3_1
    P7_3_1 -->|Validated Name| P7_3_2
    P7_3_2 -->|Validated Qty| P7_3_3
    P7_3_3 -->|Validated Price| P7_3_4
    P7_3_4 -->|Category Data| D3
    D3 -->|Category List| P7_3_4
    P7_3_4 -->|Category Assigned| P7_3_5
    P7_3_5 -->|Cleaned Item| FormatProcess
```

---

## AI/ML Input Stok - Proses Detail

Bagian ini menjelaskan secara detail proses AI/ML yang digunakan untuk input stok menggunakan OCR (Optical Character Recognition) dan AI untuk ekstraksi data dari gambar struk belanja.

### Alur Lengkap AI/ML Input Stok

```mermaid
flowchart TD
    Admin[Admin]

    Start([Admin Upload<br/>Gambar Struk])

    P1[1. Upload Image<br/>Frontend]
    P2[2. Send to Laravel<br/>API]
    P3[3. Validate Image<br/>Format & Size]
    P4[4. Forward to OCR<br/>Service]

    OCR_P1[5.1 Image<br/>Preprocessing]
    OCR_P2[5.2 EasyOCR<br/>Text Extraction]
    OCR_P3[5.3 Gemini AI<br/>Classification]
    OCR_P4[5.4 JSON<br/>Parsing]

    P5[6. Validate OCR<br/>Response]
    P6[7. Clean & Format<br/>Data]
    P7[8. Return to<br/>Frontend]
    P8[9. Admin Review<br/>& Edit]
    P9[10. Confirm &<br/>Save to Database]

    D4[(D4: Stock Items)]
    D5[(D5: Stock History)]
    D3[(D3: Categories)]
    D1[(D1: Users)]

    OCRService[Python OCR Service<br/>Port 5000]

    Start --> P1
    P1 -->|Image File| P2
    P2 -->|POST /api/ocr/process-photo| P3
    P3 -->|Valid Image| P4
    P3 -->|Invalid| P1

    P4 -->|HTTP POST<br/>Image| OCRService

    OCRService --> OCR_P1
    OCR_P1 -->|Preprocessed Image| OCR_P2
    OCR_P2 -->|Raw Text Lines| OCR_P3
    OCR_P3 -->|Structured JSON| OCR_P4
    OCR_P4 -->|Items Array| P4

    P4 -->|Extracted Items| P5
    P5 -->|Valid Items| P6
    P5 -->|Invalid| P7

    P6 -->|Category Data| D3
    D3 -->|Category List| P6
    P6 -->|Formatted Items| P7

    P7 -->|Items Array| Admin
    Admin -->|Review Items| P8
    P8 -->|Edit/Confirm| P9

    P9 -->|Stock Data| D4
    P9 -->|User Data| D1
    P9 -->|History Record| D5
    D1 -->|User Info| P9
    D4 -->|Stock Saved| Admin

    style OCR_P1 fill:#e1f5ff
    style OCR_P2 fill:#e1f5ff
    style OCR_P3 fill:#ffe1f5
    style OCR_P4 fill:#e1f5ff
    style OCRService fill:#fff4e1
```

### Teknologi AI/ML yang Digunakan

#### 1. EasyOCR (Optical Character Recognition)

-   **Fungsi**: Ekstraksi teks dari gambar struk
-   **Bahasa**: English (en) dan Indonesian (id)
-   **Proses**:
    -   Image preprocessing (grayscale, blur, threshold)
    -   Text detection dan recognition
    -   Output: Array of text lines

#### 2. Google Gemini AI (Generative AI)

-   **Model**: gemini-flash-latest
-   **Fungsi**: Klasifikasi dan strukturisasi teks hasil OCR
-   **Proses**:
    -   Menerima teks mentah dari EasyOCR
    -   Mengklasifikasi menjadi nama_barang, jumlah, harga
    -   Mengoreksi penulisan nama barang
    -   Output: JSON terstruktur

### Detail Proses AI/ML

#### 5.1 Image Preprocessing

```mermaid
flowchart LR
    A[Original Image] --> B[Convert to<br/>Grayscale]
    B --> C[Gaussian Blur<br/>5x5 Kernel]
    C --> D[OTSU Threshold<br/>Binary Image]
    D --> E[Preprocessed<br/>Image]

    style A fill:#e1f5ff
    style E fill:#c8e6c9
```

**Fungsi:**

-   Meningkatkan kualitas gambar untuk OCR
-   Mengurangi noise
-   Meningkatkan kontras teks

#### 5.2 EasyOCR Text Extraction

```mermaid
flowchart TD
    A[Preprocessed Image] --> B[EasyOCR Reader<br/>en + id]
    B --> C[Text Detection]
    C --> D[Text Recognition]
    D --> E[Raw Text Lines<br/>Array]

    style B fill:#e1f5ff
    style E fill:#c8e6c9
```

**Output Contoh:**

```
[
  "TOKO MAKMUR",
  "Jl. Raya No. 123",
  "Nasi Putih 5 kg 25000",
  "Ayam 2 ekor 50000",
  "Total: 75000"
]
```

#### 5.3 Gemini AI Classification

```mermaid
flowchart TD
    A[Raw Text Lines] --> B[Combine Text<br/>with Newlines]
    B --> C[Create Prompt<br/>for Gemini]
    C --> D[Gemini AI<br/>Processing]
    D --> E[Extract JSON]
    E --> F[Parse JSON]
    F --> G[Structured Items]

    style D fill:#ffe1f5
    style G fill:#c8e6c9
```

**Prompt yang Dikirim:**

```
berikut teks hasil OCR dari struk belanja:
[teks dari EasyOCR]

tolong ektrak jadi JSON dengan format:
[
  {
    "nama_barang": "...",
    "jumlah": "...",
    "harga": "..."
  }
]

jika ada data yang tidak jelas, isi null.
dan jika ada kata yang bukan nama barang, jumlah, atau harga, abaikan saja.
cukup kembalikan JSON tanpa penjelasan apapun.
dan juga untuk nama barang nya di koreksi lagi penulisannya jika ada yang salah.
```

**Output Gemini AI:**

```json
[
    {
        "nama_barang": "Nasi Putih",
        "jumlah": "5",
        "harga": "25000"
    },
    {
        "nama_barang": "Ayam",
        "jumlah": "2",
        "harga": "50000"
    }
]
```

#### 5.4 Data Validation & Cleaning

```mermaid
flowchart TD
    A[Raw OCR Items] --> B{Validate<br/>Item Name}
    B -->|Empty| C[Skip Item]
    B -->|Valid| D[Validate<br/>Quantity]
    D --> E[Validate<br/>Price]
    E --> F[Validate<br/>Unit]
    F --> G[Assign<br/>Category]
    G --> H[Clean Data]
    H --> I[Validated Items]

    style B fill:#fff4e1
    style I fill:#c8e6c9
```

**Validasi yang Dilakukan:**

1. **Nama Barang**: Tidak boleh kosong
2. **Jumlah**: Minimum 1, convert ke integer
3. **Harga**:
    - Handle null/empty → 0
    - Remove non-numeric characters
    - Handle format Indonesia (1.500.000 → 1500000)
    - Convert ke integer
4. **Unit**: Validasi dari list (pcs, kg, gram, liter, ml, porsi, bungkus, botol, kaleng)
5. **Category ID**: Minimum 1, default 1
6. **Min Stock**: Minimum 0, default 10

### DFD Level 3 - OCR Processing Detail

```mermaid
flowchart TD
    Admin[Admin]

    P7_1[7.1 Receive<br/>& Validate Image]
    P7_2[7.2 Check OCR<br/>Service Health]
    P7_3[7.3 Send Image<br/>to OCR Service]

    OCR_1[7.4.1 Image<br/>Preprocessing]
    OCR_2[7.4.2 EasyOCR<br/>Text Extraction]
    OCR_3[7.4.3 Gemini AI<br/>Classification]
    OCR_4[7.4.4 JSON<br/>Parsing]

    P7_4[7.5 Validate<br/>OCR Response]
    P7_5[7.6 Clean &<br/>Format Data]
    P7_6[7.7 Return<br/>to Frontend]

    D3[(D3: Categories)]
    OCRService[Python OCR<br/>Service]

    Admin -->|Receipt Image| P7_1
    P7_1 -->|Valid Image| P7_2
    P7_1 -->|Invalid| Admin

    P7_2 -->|Health Check| OCRService
    OCRService -->|Service Status| P7_2
    P7_2 -->|Service Ready| P7_3
    P7_2 -->|Service Down| Admin

    P7_3 -->|POST /process-photo<br/>Image File| OCRService

    OCRService --> OCR_1
    OCR_1 -->|Preprocessed| OCR_2
    OCR_2 -->|Text Lines| OCR_3
    OCR_3 -->|JSON String| OCR_4
    OCR_4 -->|Items Array| P7_3

    P7_3 -->|Extracted Items| P7_4
    P7_4 -->|Valid Items| P7_5
    P7_4 -->|Invalid| P7_6

    P7_5 -->|Category Data| D3
    D3 -->|Category List| P7_5
    P7_5 -->|Formatted Items| P7_6

    P7_6 -->|Items Array| Admin

    style OCR_1 fill:#e1f5ff
    style OCR_2 fill:#e1f5ff
    style OCR_3 fill:#ffe1f5
    style OCR_4 fill:#e1f5ff
    style OCRService fill:#fff4e1
```

### Proses Review & Save ke Database

```mermaid
flowchart TD
    Admin[Admin]

    R1[1. Display Items<br/>from OCR]
    R2[2. Admin Review<br/>Each Item]
    R3[3. Edit Item<br/>if Needed]
    R4[4. Select Items<br/>to Add]
    R5[5. Confirm<br/>Add to Stock]

    S1[6.1 Prepare<br/>Stock Data]
    S2[6.2 Validate<br/>Stock Data]
    S3[6.3 Save to<br/>Stock Items]
    S4[6.4 Record<br/>Stock History]
    S5[6.5 Return<br/>Success]

    D4[(D4: Stock Items)]
    D5[(D5: Stock History)]
    D1[(D1: Users)]

    Admin -->|View Items| R1
    R1 -->|Items List| R2
    R2 -->|Review| R3
    R3 -->|Edit| R4
    R4 -->|Selected Items| R5

    R5 -->|Items Array| S1
    S1 -->|Stock Data| S2
    S2 -->|Valid Data| S3
    S2 -->|Invalid| Admin

    S3 -->|Stock Data| D4
    S3 -->|User ID| D1
    S3 -->|History Data| S4
    D1 -->|User Info| S4
    S4 -->|History Record| D5
    S4 -->|Success| S5
    S5 -->|Confirmation| Admin

    style R1 fill:#e1f5ff
    style S3 fill:#c8e6c9
    style S4 fill:#c8e6c9
```

### Data Flow - AI/ML Input Stok

#### Input: Receipt Image

-   **Format**: JPEG, PNG, JPG
-   **Max Size**: 10MB
-   **Source**: Admin upload via frontend
-   **Destination**: Process 7.1 (Receive Image)

#### Output: Extracted Items

-   **Format**: JSON Array
-   **Structure**:
    ```json
    [
        {
            "nama_barang": "Nasi Putih",
            "jumlah": "5",
            "harga": 25000,
            "unit": "kg",
            "category_id": 1,
            "minStock": 10
        }
    ]
    ```
-   **Source**: Process 7.6 (Return to Frontend)
-   **Destination**: Admin (Frontend)

#### Stock Data untuk Database

-   **Format**: Object
-   **Structure**:
    ```json
    {
        "name": "Nasi Putih",
        "category_id": 1,
        "buyPrice": 25000,
        "quantity": 5,
        "unit": "kg",
        "minStock": 10,
        "is_divisible": false,
        "max_divisions": "",
        "division_description": ""
    }
    ```
-   **Source**: Process 6.3 (Save to Stock Items)
-   **Destination**: D4 (Stock Items)

### Error Handling

```mermaid
flowchart TD
    Start[OCR Process] --> Check{OCR Service<br/>Available?}
    Check -->|No| Error1[Return Error:<br/>Service Not Available]
    Check -->|Yes| Send[Send Image]

    Send --> Timeout{Timeout<br/>60 seconds?}
    Timeout -->|Yes| Error2[Return Error:<br/>Processing Timeout]
    Timeout -->|No| Process[Process Image]

    Process --> OCR{OCR<br/>Success?}
    OCR -->|No| Error3[Return Error:<br/>OCR Failed]
    OCR -->|Yes| Parse{Parse<br/>JSON?}

    Parse -->|No| Error4[Return Error:<br/>Invalid Response]
    Parse -->|Yes| Validate{Items<br/>Valid?}

    Validate -->|No| Error5[Return Error:<br/>No Valid Items]
    Validate -->|Yes| Success[Return Items]

    style Error1 fill:#ffcdd2
    style Error2 fill:#ffcdd2
    style Error3 fill:#ffcdd2
    style Error4 fill:#ffcdd2
    style Error5 fill:#ffcdd2
    style Success fill:#c8e6c9
```

### Keuntungan AI/ML Input Stok

1. **Efisiensi**: Mengurangi waktu input manual dari menit menjadi detik
2. **Akurasi**: AI membantu mengoreksi penulisan nama barang
3. **Otomatisasi**: Ekstraksi data otomatis dari struk
4. **User Experience**: Admin hanya perlu review dan konfirmasi
5. **Scalability**: Dapat memproses banyak item sekaligus

### Teknologi Stack

-   **Backend API**: Laravel 10 (PHP)
-   **OCR Engine**: EasyOCR (Python)
-   **AI Model**: Google Gemini Flash (Python)
-   **Frontend**: React 19 (JavaScript)
-   **Communication**: HTTP REST API
-   **Image Processing**: OpenCV (Python)

### API Endpoints

#### POST /api/ocr/process-photo

-   **Input**: Multipart form data dengan field `image`
-   **Output**: JSON dengan struktur:
    ```json
    {
      "success": true,
      "data": {
        "items": [...],
        "count": 5
      }
    }
    ```
-   **Timeout**: 60 detik
-   **Error Handling**: Comprehensive dengan pesan error yang jelas

#### GET /api/ocr/health

-   **Purpose**: Check OCR service status
-   **Output**: Service health information

---

## Keterangan Simbol DFD

### 1. External Entity (Entitas Eksternal)

-   **Simbol**: Kotak dengan nama entitas
-   **Contoh**: Admin, Kasir, Supplier, OCR Service
-   **Fungsi**: Entitas di luar sistem yang berinteraksi dengan sistem

### 2. Process (Proses)

-   **Simbol**: Lingkaran atau kotak dengan sudut membulat
-   **Format**: Nomor.0 untuk level 1, Nomor.Sub untuk level 2, dll
-   **Fungsi**: Transformasi data atau aktivitas bisnis

### 3. Data Store (Penyimpanan Data)

-   **Simbol**: Dua garis horizontal dengan nama data store
-   **Format**: D1, D2, D3, dll
-   **Fungsi**: Tempat penyimpanan data persisten

### 4. Data Flow (Alur Data)

-   **Simbol**: Panah dengan label nama data
-   **Fungsi**: Alur data antara proses, entitas, dan data store
-   **Aturan**:
    -   Harus memiliki label yang jelas
    -   Tidak boleh langsung dari data store ke data store
    -   Tidak boleh langsung dari external entity ke external entity

### 5. Data Dictionary

Setiap data flow harus memiliki definisi yang jelas dalam data dictionary.

---

## Data Dictionary

### Data Flows

#### Login Credentials

-   **Type**: Data
-   **Structure**:
    -   email: string
    -   password: string
-   **Source**: Admin, Kasir
-   **Destination**: Process 1.0 (Authentication)

#### User Data

-   **Type**: Data
-   **Structure**:
    -   id: integer
    -   name: string
    -   email: string
    -   role: enum (admin, kasir)
    -   status: enum (active, inactive)
-   **Source**: D1 (Users)
-   **Destination**: Process 1.0 (Authentication)

#### Product Data

-   **Type**: Data
-   **Structure**:
    -   id: integer
    -   name: string
    -   category_id: integer
    -   sell_price: decimal
    -   description: text
-   **Source**: D2 (Products)
-   **Destination**: Process 2.0, 4.0

#### Stock Data

-   **Type**: Data
-   **Structure**:
    -   id: integer
    -   name: string
    -   category_id: integer
    -   buy_price: decimal
    -   quantity: decimal
    -   unit: string
    -   min_stock_limit: decimal
-   **Source**: D4 (Stock Items)
-   **Destination**: Process 3.0, 4.0, 5.0

#### Transaction Data

-   **Type**: Data
-   **Structure**:
    -   id: integer
    -   transaction_date: timestamp
    -   total_amount: decimal
    -   payment_method: enum
    -   customer_name: string
    -   created_by: integer
-   **Source**: D6 (Transactions)
-   **Destination**: Process 4.0, 5.0

#### Transaction Details

-   **Type**: Data
-   **Structure**:
    -   id: integer
    -   transaction_id: integer
    -   product_id: integer
    -   variant_id: integer
    -   quantity: decimal
    -   unit_price: decimal
    -   total_price: decimal
-   **Source**: D7 (Transaction Details)
-   **Destination**: Process 4.0, 5.0

#### Stock History

-   **Type**: Data
-   **Structure**:
    -   id: integer
    -   stock_item_id: integer
    -   change_type: enum (in, out, adjustment)
    -   quantity_before: decimal
    -   quantity_after: decimal
    -   quantity_change: decimal
    -   reason: string
    -   created_by: integer
-   **Source**: D5 (Stock History)
-   **Destination**: Process 3.0, 5.0

#### Extracted Items

-   **Type**: Data
-   **Structure**:
    -   nama_barang: string
    -   jumlah: string
    -   harga: integer
    -   unit: string
    -   category_id: integer
-   **Source**: OCR Service
-   **Destination**: Process 7.0

#### Low Stock Alert

-   **Type**: Data
-   **Structure**:
    -   stock_item_id: integer
    -   item_name: string
    -   current_stock: decimal
    -   min_stock_limit: decimal
    -   message: string
-   **Source**: Process 6.0
-   **Destination**: WhatsApp Agent

### Data Stores

#### D1: Users

-   **Description**: Menyimpan data pengguna sistem (admin dan kasir)
-   **Key Fields**: id, email, password, role
-   **Volume**: ~10-50 records
-   **Access**: Read/Write oleh Process 1.0

#### D2: Products

-   **Description**: Menyimpan data produk jadi yang dijual
-   **Key Fields**: id, name, category_id, sell_price
-   **Volume**: ~50-200 records
-   **Access**: Read/Write oleh Process 2.0, 4.0, 5.0

#### D3: Categories

-   **Description**: Menyimpan data kategori produk dan stok
-   **Key Fields**: id, name, description
-   **Volume**: ~10-30 records
-   **Access**: Read/Write oleh Process 2.0, 3.0, 7.0

#### D4: Stock Items

-   **Description**: Menyimpan data bahan baku dan stok
-   **Key Fields**: id, name, category_id, quantity, buy_price
-   **Volume**: ~50-200 records
-   **Access**: Read/Write oleh Process 3.0, 4.0, 5.0, 6.0, 7.0

#### D5: Stock History

-   **Description**: Menyimpan riwayat perubahan stok
-   **Key Fields**: id, stock_item_id, change_type, quantity_change
-   **Volume**: ~1000-10000 records (growing)
-   **Access**: Write oleh Process 3.0, 4.0; Read oleh Process 5.0

#### D6: Transactions

-   **Description**: Menyimpan data transaksi penjualan
-   **Key Fields**: id, transaction_date, total_amount, payment_method
-   **Volume**: ~1000-50000 records (growing)
-   **Access**: Write oleh Process 4.0; Read oleh Process 5.0

#### D7: Transaction Details

-   **Description**: Menyimpan detail item dalam transaksi
-   **Key Fields**: id, transaction_id, product_id, quantity, unit_price
-   **Volume**: ~5000-250000 records (growing)
-   **Access**: Write oleh Process 4.0; Read oleh Process 5.0

#### D8: Notifications

-   **Description**: Menyimpan konfigurasi notifikasi stok
-   **Key Fields**: id, stock_item_id, min_stock_limit, notification_schedule
-   **Volume**: ~50-200 records
-   **Access**: Read/Write oleh Process 6.0

#### D9: Notification Logs

-   **Description**: Menyimpan log notifikasi yang dikirim
-   **Key Fields**: id, notification_id, sent_at, status, message
-   **Volume**: ~500-5000 records (growing)
-   **Access**: Write oleh Process 6.0; Read oleh Process 6.0

#### D10: Variants

-   **Description**: Menyimpan data varian produk (ukuran, porsi)
-   **Key Fields**: id, product_id, name, price
-   **Volume**: ~100-500 records
-   **Access**: Read/Write oleh Process 2.0, 4.0

#### D11: Compositions

-   **Description**: Menyimpan komposisi bahan baku untuk setiap produk
-   **Key Fields**: id, product_id, stock_item_id, quantity
-   **Volume**: ~200-1000 records
-   **Access**: Read/Write oleh Process 2.0, 4.0

---

## Catatan Penting

1. **Konsistensi Data**: Semua proses harus memastikan konsistensi data antara data stores
2. **Validasi**: Setiap input dari external entity harus divalidasi sebelum diproses
3. **Error Handling**: Setiap proses harus memiliki mekanisme penanganan error
4. **Security**: Proses authentication harus memverifikasi setiap request
5. **Audit Trail**: Semua perubahan data harus tercatat dalam history/log
6. **Performance**: Data store dengan volume besar (D5, D6, D7) perlu optimasi query
7. **Integration**: Proses OCR dan WhatsApp Agent harus memiliki fallback mechanism

---

## Tools untuk Membuat DFD Visual

1. **Mermaid Live Editor**: https://mermaid.live/ (untuk diagram di atas)
2. **Draw.io**: https://app.diagrams.net/ (untuk DFD tradisional)
3. **Lucidchart**: https://www.lucidchart.com/
4. **Visual Paradigm**: https://www.visual-paradigm.com/
5. **Microsoft Visio**: Untuk DFD standar

---

## Revisi History

-   **Version 1.0** (2025-01-XX): Initial DFD documentation
    -   DFD Level 0 (Context Diagram)
    -   DFD Level 1 (Overview Diagram)
    -   DFD Level 2 (Detailed Processes)
    -   DFD Level 3 (Sub-Process Details)
    -   Data Dictionary
