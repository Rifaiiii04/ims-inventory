# DFD PlantUML Syntax - Angkringan IMS

File ini berisi syntax PlantUML untuk membuat DFD Level 0, 1, dan 2 untuk sistem Angkringan IMS.

## Cara Menggunakan

1. Copy syntax PlantUML dari bagian yang diinginkan
2. Paste ke http://www.plantuml.com/plantuml/uml/ atau http://www.planttext.com/
3. Atau gunakan VS Code dengan extension PlantUML
4. Generate diagram PNG/SVG

---

## DFD Level 0 - Context Diagram

```plantuml
@startuml
!theme plain
skinparam componentStyle rectangle
skinparam linetype ortho
skinparam defaultFontSize 12
skinparam defaultTextAlignment center
skinparam arrowThickness 1.2
skinparam rectangle {
  BackgroundColor #EFEFEF
  BorderColor #888
  RoundCorner 20
}

title DFD Level 0 - Context Diagram Angkringan IMS

left to right direction

' ===== ENTITAS EKSTERNAL =====
actor "Admin" as Admin #white
actor "Kasir" as Kasir #white
actor "Layanan OCR Python\n(Port 5000)" as OCRService #white
actor "Agen WhatsApp" as WhatsAppAgent #white

' ===== PROSES UTAMA (SISTEM) =====
rectangle "0.0\nSistem Angkringan IMS" as System #lightgrey

' ===== POSISI (agar hasil simetris & rapi) =====
Admin -[hidden]-> Kasir
Kasir -[hidden]-> System
System -[hidden]-> OCRService
OCRService -[hidden]-> WhatsAppAgent

' ===== ALIRAN DATA: ADMIN =====
Admin --> System : D0.1 Permintaan Login
Admin --> System : D0.2 Data Master\n(Produk, Stok, Kategori, Pengguna)
Admin --> System : D0.3 Permintaan Laporan
Admin --> System : D0.4 Gambar Nota Pembelian

System --> Admin : D0.5 Respon Autentikasi
System --> Admin : D0.6 Data Dasbor
System --> Admin : D0.7 Laporan
System --> Admin : D0.8 Hasil Ekstraksi Data

' ===== ALIRAN DATA: KASIR =====
Kasir --> System : D0.9 Permintaan Login
Kasir --> System : D0.10 Data Transaksi
Kasir --> System : D0.11 Permintaan Laporan

System --> Kasir : D0.12 Respon Autentikasi
System --> Kasir : D0.13 Daftar Produk
System --> Kasir : D0.14 Konfirmasi Transaksi
System --> Kasir : D0.15 Laporan

' ===== ALIRAN DATA: OCR SERVICE =====
System --> OCRService : D0.16 Berkas Gambar Nota
OCRService --> System : D0.17 Hasil Ekstraksi Data

' ===== ALIRAN DATA: WHATSAPP AGENT =====
System --> WhatsAppAgent : D0.18 Notifikasi Stok Menipis
WhatsAppAgent --> System : D0.19 Permintaan Data Stok

@enduml
```

---

## DFD Level 1 - Overview Diagram

```plantuml
@startuml
!theme plain
skinparam componentStyle rectangle
skinparam linetype ortho

title DFD Level 1 - Overview Diagram Angkringan IMS

[Admin] as Admin
[Kasir] as Kasir
[Python OCR Service] as OCRService
[WhatsApp Agent] as WhatsAppAgent

[1.0\nAuthentication\nProcess] as P1
[2.0\nProduct\nManagement] as P2
[3.0\nStock\nManagement] as P3
[4.0\nTransaction\nProcessing] as P4
[5.0\nReporting] as P5
[6.0\nNotification\nManagement] as P6
[7.0\nOCR\nProcessing] as P7

(D1: Users) as D1
(D2: Products) as D2
(D3: Categories) as D3
(D4: Stock Items) as D4
(D5: Stock History) as D5
(D6: Transactions) as D6
(D7: Transaction Details) as D7
(D8: Notifications) as D8
(D9: Notification Logs) as D9
(D10: Variants) as D10
(D11: Compositions) as D11

Admin --> P1 : Login Credentials
Kasir --> P1 : Login Credentials
P1 --> D1 : User Data
D1 --> P1 : User Info
P1 --> Admin : Auth Response
P1 --> Kasir : Auth Response

Admin --> P2 : Product CRUD
P2 --> D2 : Product Data
P2 --> D3 : Category Data
P2 --> D10 : Variant Data
P2 --> D11 : Composition Data
D2 --> P2 : Product List
D3 --> P2 : Category List
D10 --> P2 : Variant List
D11 --> P2 : Composition List
P2 --> Admin : Product Response

Admin --> P3 : Stock CRUD
P3 --> D4 : Stock Data
P3 --> D5 : Stock History
P3 --> D3 : Category Data
D4 --> P3 : Stock List
D5 --> P3 : History Data
D3 --> P3 : Category List
P3 --> Admin : Stock Response
P3 --> P6 : Low Stock Alert

Kasir --> P4 : Transaction Data
P4 --> D6 : Transaction Data
P4 --> D7 : Transaction Details
P4 --> D4 : Stock Update
P4 --> D5 : Stock History
P4 --> D2 : Product Data
P4 --> D10 : Variant Data
D2 --> P4 : Product Info
D10 --> P4 : Variant Info
D6 --> P4 : Transaction Confirmation
P4 --> Kasir : Transaction Response

Admin --> P5 : Report Request
Kasir --> P5 : Report Request
P5 --> D6 : Transaction Data
P5 --> D7 : Transaction Details
P5 --> D4 : Stock Data
P5 --> D2 : Product Data
D6 --> P5 : Sales Data
D7 --> P5 : Sales Detail
D4 --> P5 : Inventory Data
D2 --> P5 : Product Info
P5 --> Admin : Reports
P5 --> Kasir : Reports

P6 --> D8 : Notification Data
P6 --> D9 : Notification Log
P6 --> D4 : Stock Data
D8 --> P6 : Notification Config
D9 --> P6 : Log Data
P6 --> WhatsAppAgent : Alert Message
WhatsAppAgent --> P6 : Query Request

Admin --> P7 : Receipt Image
P7 --> OCRService : Image
OCRService --> P7 : Extracted Items
P7 --> Admin : Validated Items
P7 --> D4 : Stock Data

@enduml
```

---

## DFD Level 2 - Detailed Processes

### 2.0 Product Management - Decomposed

```plantuml
@startuml
!theme plain
skinparam componentStyle rectangle
skinparam linetype ortho

title DFD Level 2 - Product Management Decomposed

[Admin] as Admin

[2.1\nManage\nProducts] as P2_1
[2.2\nManage\nCategories] as P2_2
[2.3\nManage\nVariants] as P2_3
[2.4\nManage\nCompositions] as P2_4

(D2: Products) as D2
(D3: Categories) as D3
(D10: Variants) as D10
(D11: Compositions) as D11
(D4: Stock Items) as D4

Admin --> P2_1 : Product CRUD
P2_1 --> D2 : Product Data
P2_1 --> D3 : Category Data
D2 --> P2_1 : Product List
D3 --> P2_1 : Category List
P2_1 --> Admin : Product Response

Admin --> P2_2 : Category CRUD
P2_2 --> D3 : Category Data
D3 --> P2_2 : Category List
P2_2 --> Admin : Category Response

Admin --> P2_3 : Variant CRUD
P2_3 --> D10 : Variant Data
P2_3 --> D2 : Product Data
D10 --> P2_3 : Variant List
D2 --> P2_3 : Product List
P2_3 --> Admin : Variant Response

Admin --> P2_4 : Composition CRUD
P2_4 --> D11 : Composition Data
P2_4 --> D2 : Product Data
P2_4 --> D4 : Stock Data
D11 --> P2_4 : Composition List
D2 --> P2_4 : Product List
D4 --> P2_4 : Stock List
P2_4 --> Admin : Composition Response

@enduml
```

### 3.0 Stock Management - Decomposed

```plantuml
@startuml
!theme plain
skinparam componentStyle rectangle
skinparam linetype ortho

title DFD Level 2 - Stock Management Decomposed

[Admin] as Admin

[3.1\nManage\nStock Items] as P3_1
[3.2\nUpdate\nStock] as P3_2
[3.3\nTrack Stock\nHistory] as P3_3
[3.4\nCheck Low\nStock] as P3_4

(D4: Stock Items) as D4
(D5: Stock History) as D5
(D3: Categories) as D3
(D1: Users) as D1
(D8: Notifications) as D8

Admin --> P3_1 : Stock CRUD
P3_1 --> D4 : Stock Data
P3_1 --> D3 : Category Data
D4 --> P3_1 : Stock List
D3 --> P3_1 : Category List
P3_1 --> Admin : Stock Response

Admin --> P3_2 : Stock Update Request
P3_2 --> D4 : Updated Stock
P3_2 --> D1 : User Data
P3_2 --> P3_3 : History Record
D4 --> P3_2 : Current Stock
D1 --> P3_2 : User Info
P3_2 --> Admin : Update Response

P3_2 --> P3_3 : History Data
P3_3 --> D5 : History Record
D5 --> P3_3 : History List

P3_2 --> P3_4 : Stock Data
P3_4 --> D4 : Stock Data
D4 --> P3_4 : Stock Status
P3_4 --> D8 : Low Stock Alert

@enduml
```

### 4.0 Transaction Processing - Decomposed

```plantuml
@startuml
!theme plain
skinparam componentStyle rectangle
skinparam linetype ortho

title DFD Level 2 - Transaction Processing Decomposed

[Kasir] as Kasir

[4.1\nCreate\nTransaction] as P4_1
[4.2\nProcess\nItems] as P4_2
[4.3\nUpdate\nStock] as P4_3
[4.4\nCalculate\nTotal] as P4_4
[4.5\nGenerate\nReceipt] as P4_5

(D6: Transactions) as D6
(D7: Transaction Details) as D7
(D2: Products) as D2
(D10: Variants) as D10
(D4: Stock Items) as D4
(D5: Stock History) as D5
(D11: Compositions) as D11
(D1: Users) as D1

Kasir --> P4_1 : Transaction Request
P4_1 --> D1 : User Data
D1 --> P4_1 : User Info
P4_1 --> D6 : Transaction Header
P4_1 --> P4_2 : Transaction ID

P4_2 --> D2 : Product Data
P4_2 --> D10 : Variant Data
D2 --> P4_2 : Product Info
D10 --> P4_2 : Variant Info
P4_2 --> D7 : Transaction Details
P4_2 --> P4_3 : Item Data
P4_2 --> P4_4 : Item Data

P4_3 --> D11 : Composition Data
P4_3 --> D4 : Stock Data
D11 --> P4_3 : Ingredient List
D4 --> P4_3 : Current Stock
P4_3 --> D4 : Updated Stock
P4_3 --> D5 : History Record

P4_4 --> D7 : Transaction Details
D7 --> P4_4 : Item Prices
P4_4 --> P4_1 : Total Amount
P4_1 --> D6 : Updated Total

P4_1 --> P4_5 : Transaction Data
P4_5 --> D6 : Transaction Data
P4_5 --> D7 : Transaction Details
D6 --> P4_5 : Transaction Info
D7 --> P4_5 : Item Details
P4_5 --> Kasir : Receipt

@enduml
```

### 5.0 Reporting - Decomposed

```plantuml
@startuml
!theme plain
skinparam componentStyle rectangle
skinparam linetype ortho

title DFD Level 2 - Reporting Decomposed

[Admin] as Admin
[Kasir] as Kasir

[5.1\nGenerate Sales\nReport] as P5_1
[5.2\nGenerate Inventory\nReport] as P5_2
[5.3\nExport\nReport] as P5_3

(D6: Transactions) as D6
(D7: Transaction Details) as D7
(D4: Stock Items) as D4
(D5: Stock History) as D5
(D2: Products) as D2
(D3: Categories) as D3

Admin --> P5_1 : Sales Report Request
Kasir --> P5_1 : Sales Report Request
P5_1 --> D6 : Transaction Data
P5_1 --> D7 : Transaction Details
P5_1 --> D2 : Product Data
D6 --> P5_1 : Sales Data
D7 --> P5_1 : Sales Detail
D2 --> P5_1 : Product Info
P5_1 --> Admin : Sales Report
P5_1 --> Kasir : Sales Report
P5_1 --> P5_3 : Report Data

Admin --> P5_2 : Inventory Report Request
Kasir --> P5_2 : Inventory Report Request
P5_2 --> D4 : Stock Data
P5_2 --> D5 : Stock History
P5_2 --> D3 : Category Data
D4 --> P5_2 : Inventory Data
D5 --> P5_2 : History Data
D3 --> P5_2 : Category Info
P5_2 --> Admin : Inventory Report
P5_2 --> Kasir : Inventory Report
P5_2 --> P5_3 : Report Data

Admin --> P5_3 : Export Request
P5_3 --> P5_1 : Report Data
P5_3 --> P5_2 : Report Data
P5_3 --> Admin : PDF/Excel File

@enduml
```

### 6.0 Notification Management - Decomposed

```plantuml
@startuml
!theme plain
skinparam componentStyle rectangle
skinparam linetype ortho

title DFD Level 2 - Notification Management Decomposed

[Admin] as Admin
[WhatsApp Agent] as WhatsAppAgent

[6.1\nConfigure\nNotifications] as P6_1
[6.2\nMonitor Stock\nLevels] as P6_2
[6.3\nSend\nNotifications] as P6_3
[6.4\nLog\nNotifications] as P6_4

(D8: Notifications) as D8
(D9: Notification Logs) as D9
(D4: Stock Items) as D4

Admin --> P6_1 : Notification Config
P6_1 --> D8 : Notification Data
D8 --> P6_1 : Notification List
P6_1 --> Admin : Config Response

P6_2 --> D4 : Stock Data
P6_2 --> D8 : Notification Config
D4 --> P6_2 : Stock Status
D8 --> P6_2 : Alert Rules
P6_2 --> P6_3 : Low Stock Alert

P6_3 --> D8 : Notification Data
P6_3 --> WhatsAppAgent : Alert Message
P6_3 --> P6_4 : Notification Data
WhatsAppAgent --> P6_3 : Query Request
P6_3 --> WhatsAppAgent : Query Response

P6_4 --> D9 : Log Data
D9 --> P6_4 : Log List

@enduml
```

### 7.0 OCR Processing - Decomposed

```plantuml
@startuml
!theme plain
skinparam componentStyle rectangle
skinparam linetype ortho

title DFD Level 2 - OCR Processing Decomposed

[Admin] as Admin
[Python OCR Service] as OCRService

[7.1\nReceive\nImage] as P7_1
[7.2\nSend to OCR\nService] as P7_2
[7.3\nValidate\nData] as P7_3
[7.4\nFormat\nItems] as P7_4

(D4: Stock Items) as D4
(D3: Categories) as D3

Admin --> P7_1 : Receipt Image
P7_1 --> P7_2 : Image File

P7_2 --> OCRService : Image
OCRService --> P7_2 : Extracted Text JSON
P7_2 --> P7_3 : Raw Items

P7_3 --> D3 : Category Data
D3 --> P7_3 : Category List
P7_3 --> P7_4 : Validated Items

P7_4 --> Admin : Formatted Items
P7_4 --> D4 : Stock Data

@enduml
```

---

## Catatan Penting

1. **Simbol DFD**:

    - External Entity: `[Name]` (kotak)
    - Process: `[Number\nName]` (kotak dengan nomor)
    - Data Store: `(D#: Name)` (database symbol)
    - Data Flow: `-->` dengan label

2. **Penomoran Proses**:

    - Level 1: 1.0, 2.0, 3.0, dst
    - Level 2: 2.1, 2.2, 2.3, dst (decomposed dari 2.0)

3. **Data Stores**:

    - D1: Users
    - D2: Products
    - D3: Categories
    - D4: Stock Items
    - D5: Stock History
    - D6: Transactions
    - D7: Transaction Details
    - D8: Notifications
    - D9: Notification Logs
    - D10: Variants
    - D11: Compositions

4. **External Entities**:
    - Admin
    - Kasir
    - Python OCR Service
    - WhatsApp Agent

---

## Tools untuk Render PlantUML

1. **Online**: http://www.plantuml.com/plantuml/uml/ atau http://www.planttext.com/
2. **VS Code**: Extension "PlantUML"
3. **IntelliJ IDEA**: Plugin "PlantUML integration"
4. **Command Line**: `java -jar plantuml.jar diagram.puml`

---

## Revisi History

-   **Version 2.0** (2025-01-XX): Fixed syntax to use proper PlantUML format
    -   DFD Level 0 (Context Diagram)
    -   DFD Level 1 (Overview Diagram)
    -   DFD Level 2 (Detailed Processes)
        -   Product Management
        -   Stock Management
        -   Transaction Processing
        -   Reporting
        -   Notification Management
        -   OCR Processing
