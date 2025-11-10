# DFD AI/Machine Learning Input Stok - Angkringan IMS

Dokumentasi ini fokus pada proses AI/ML yang digunakan untuk input stok menggunakan OCR (Optical Character Recognition) dan AI untuk ekstraksi data dari gambar struk belanja.

## Daftar Isi
1. [DFD Level 0 - Context Diagram (AI/ML Input Stok)](#dfd-level-0---context-diagram-aiml-input-stok)
2. [DFD Level 1 - Overview Process](#dfd-level-1---overview-process)
3. [DFD Level 2 - Detailed Processes](#dfd-level-2---detailed-processes)
4. [DFD Level 3 - Sub-Process Details](#dfd-level-3---sub-process-details)
5. [Sequence Diagram - AI/ML Input Stok](#sequence-diagram---aiml-input-stok)
6. [Activity Diagram - OCR Processing](#activity-diagram---ocr-processing)
7. [Component Diagram - AI/ML Architecture](#component-diagram---aiml-architecture)
8. [Data Dictionary - AI/ML Input Stok](#data-dictionary---aiml-input-stok)

---

## DFD Level 0 - Context Diagram (AI/ML Input Stok)

Diagram konteks menunjukkan interaksi antara entitas eksternal dengan sistem untuk proses AI/ML input stok.

### PlantUML Syntax

```plantuml
@startuml DFD_Level0_AI_ML_Input_Stok
!theme plain
skinparam componentStyle rectangle
skinparam linetype ortho

title DFD Level 0 - Context Diagram AI/ML Input Stok

package "External Entities" {
  [Admin] as Admin
  [Python OCR Service\nPort 5000] as OCRService
}

package "Angkringan IMS System" {
  [AI/ML Input Stok\nSystem] as System
}

' Data Flows
Admin --> System : Receipt Image\n(JPEG/PNG, max 10MB)
System --> OCRService : Image File\nHTTP POST
OCRService --> System : Extracted Items\nJSON Array
System --> Admin : Validated Items\nJSON Array
Admin --> System : Confirmed Items\nStock Data
System --> Admin : Stock Saved\nConfirmation

note right of OCRService
  Technologies:
  - EasyOCR (Text Extraction)
  - Google Gemini AI (Classification)
  - OpenCV (Image Processing)
end note

note right of System
  Processes:
  - Image Validation
  - OCR Service Communication
  - Data Validation & Cleaning
  - Stock Data Preparation
  - Database Storage
end note

@enduml
```

### Penjelasan

**External Entities:**
- **Admin**: Pengguna yang mengupload gambar struk dan melakukan review hasil OCR
- **Python OCR Service**: Layanan eksternal yang melakukan ekstraksi teks dan klasifikasi menggunakan AI

**Data Flows:**
- **Receipt Image**: Gambar struk belanja dalam format JPEG/PNG (max 10MB)
- **Image File**: File gambar yang dikirim ke OCR service via HTTP POST
- **Extracted Items**: Data item yang diekstrak dalam format JSON array
- **Validated Items**: Data item yang sudah divalidasi dan diformat
- **Confirmed Items**: Data item yang dikonfirmasi admin untuk disimpan
- **Stock Saved**: Konfirmasi bahwa data stok berhasil disimpan

---

## DFD Level 1 - Overview Process

Diagram ini memecah sistem AI/ML input stok menjadi proses-proses utama.

### PlantUML Syntax

```plantuml
@startuml DFD_Level1_AI_ML_Input_Stok
!theme plain
skinparam componentStyle rectangle
skinparam linetype ortho

title DFD Level 1 - Overview Process AI/ML Input Stok

package "External" {
  [Admin] as Admin
  [Python OCR Service] as OCRService
}

package "Processes" {
  [1.0\nReceive & Validate\nImage] as P1
  [2.0\nOCR Processing] as P2
  [3.0\nData Validation\n& Cleaning] as P3
  [4.0\nReview & Confirmation] as P4
  [5.0\nSave to Database] as P5
}

database "Data Stores" {
  [D3: Categories] as D3
  [D4: Stock Items] as D4
  [D5: Stock History] as D5
  [D1: Users] as D1
}

' Flows from Admin
Admin --> P1 : Receipt Image
Admin --> P4 : Review Items
Admin --> P4 : Confirm Items

' OCR Processing
P1 --> P2 : Valid Image
P2 --> OCRService : Image File
OCRService --> P2 : Extracted Text\nJSON
P2 --> P3 : Raw Items

' Data Validation
P3 --> D3 : Get Categories
D3 --> P3 : Category List
P3 --> P4 : Validated Items

' Review & Confirmation
P4 --> Admin : Items for Review
P4 --> P5 : Confirmed Items

' Save to Database
P5 --> D4 : Stock Data
P5 --> D1 : User ID
P5 --> D5 : History Record
D1 --> P5 : User Info
P5 --> Admin : Success Confirmation

note right of P2
  AI/ML Components:
  - Image Preprocessing
  - EasyOCR Text Extraction
  - Gemini AI Classification
  - JSON Parsing
end note

@enduml
```

### Penjelasan Proses

1. **Receive & Validate Image (1.0)**: Menerima dan memvalidasi gambar struk
2. **OCR Processing (2.0)**: Memproses gambar menggunakan AI/ML untuk ekstraksi data
3. **Data Validation & Cleaning (3.0)**: Memvalidasi dan membersihkan data hasil OCR
4. **Review & Confirmation (4.0)**: Admin mereview dan mengkonfirmasi item yang akan disimpan
5. **Save to Database (5.0)**: Menyimpan data stok ke database

---

## DFD Level 2 - Detailed Processes

Diagram ini memecah setiap proses utama menjadi sub-proses yang lebih detail.

### PlantUML Syntax

```plantuml
@startuml DFD_Level2_AI_ML_Input_Stok
!theme plain
skinparam componentStyle rectangle
skinparam linetype ortho

title DFD Level 2 - Detailed Processes AI/ML Input Stok

package "External" {
  [Admin] as Admin
  [Python OCR Service] as OCRService
}

package "1.0 Receive & Validate Image" {
  [1.1\nValidate\nImage Format] as P1_1
  [1.2\nValidate\nImage Size] as P1_2
  [1.3\nCheck OCR\nService Health] as P1_3
}

package "2.0 OCR Processing" {
  [2.1\nImage\nPreprocessing] as P2_1
  [2.2\nEasyOCR\nText Extraction] as P2_2
  [2.3\nGemini AI\nClassification] as P2_3
  [2.4\nJSON\nParsing] as P2_4
}

package "3.0 Data Validation & Cleaning" {
  [3.1\nValidate\nItem Name] as P3_1
  [3.2\nValidate\nQuantity] as P3_2
  [3.3\nValidate\nPrice] as P3_3
  [3.4\nValidate\nUnit] as P3_4
  [3.5\nAssign\nCategory] as P3_5
}

package "4.0 Review & Confirmation" {
  [4.1\nDisplay\nItems] as P4_1
  [4.2\nEdit\nItems] as P4_2
  [4.3\nSelect\nItems] as P4_3
  [4.4\nConfirm\nAdd] as P4_4
}

package "5.0 Save to Database" {
  [5.1\nPrepare\nStock Data] as P5_1
  [5.2\nValidate\nStock Data] as P5_2
  [5.3\nSave to\nStock Items] as P5_3
  [5.4\nRecord\nStock History] as P5_4
}

database "Data Stores" {
  [D3: Categories] as D3
  [D4: Stock Items] as D4
  [D5: Stock History] as D5
  [D1: Users] as D1
}

' Process 1.0
Admin --> P1_1 : Receipt Image
P1_1 --> P1_2 : Valid Format
P1_2 --> P1_3 : Valid Size
P1_3 --> OCRService : Health Check
OCRService --> P1_3 : Service Status
P1_3 --> P2_1 : Service Ready

' Process 2.0
P2_1 --> P2_2 : Preprocessed Image
P2_2 --> OCRService : Process Image
OCRService --> P2_2 : Raw Text Lines
P2_2 --> P2_3 : Text Lines
P2_3 --> OCRService : Text + Prompt
OCRService --> P2_3 : JSON String
P2_3 --> P2_4 : JSON String
P2_4 --> P3_1 : Items Array

' Process 3.0
P3_1 --> P3_2 : Valid Name
P3_2 --> P3_3 : Valid Quantity
P3_3 --> P3_4 : Valid Price
P3_4 --> P3_5 : Valid Unit
P3_5 --> D3 : Get Categories
D3 --> P3_5 : Category List
P3_5 --> P4_1 : Validated Items

' Process 4.0
P4_1 --> Admin : Items List
Admin --> P4_2 : Edit Request
P4_2 --> P4_3 : Edited Items
P4_3 --> P4_4 : Selected Items
P4_4 --> P5_1 : Confirmed Items

' Process 5.0
P5_1 --> P5_2 : Stock Data
P5_2 --> P5_3 : Valid Data
P5_3 --> D4 : Stock Data
P5_3 --> D1 : User ID
P5_3 --> P5_4 : History Data
D1 --> P5_4 : User Info
P5_4 --> D5 : History Record
P5_4 --> Admin : Success

note right of P2_1
  Image Preprocessing:
  - Grayscale Conversion
  - Gaussian Blur (5x5)
  - OTSU Threshold
end note

note right of P2_2
  EasyOCR:
  - Languages: en, id
  - Text Detection
  - Text Recognition
end note

note right of P2_3
  Gemini AI:
  - Model: gemini-flash-latest
  - Classification
  - Text Correction
  - JSON Generation
end note

@enduml
```

---

## DFD Level 3 - Sub-Process Details

Diagram detail untuk sub-proses yang kompleks.

### PlantUML Syntax - OCR Processing Detail

```plantuml
@startuml DFD_Level3_OCR_Processing
!theme plain
skinparam componentStyle rectangle
skinparam linetype ortho

title DFD Level 3 - OCR Processing Detail

package "2.1 Image Preprocessing" {
  [2.1.1\nLoad Image] as P2_1_1
  [2.1.2\nConvert to\nGrayscale] as P2_1_2
  [2.1.3\nApply Gaussian\nBlur] as P2_1_3
  [2.1.4\nOTSU\nThreshold] as P2_1_4
}

package "2.2 EasyOCR Text Extraction" {
  [2.2.1\nInitialize\nEasyOCR Reader] as P2_2_1
  [2.2.2\nText Detection] as P2_2_2
  [2.2.3\nText Recognition] as P2_2_3
  [2.2.4\nFormat Text\nLines] as P2_2_4
}

package "2.3 Gemini AI Classification" {
  [2.3.1\nCombine Text\nLines] as P2_3_1
  [2.3.2\nCreate Prompt] as P2_3_2
  [2.3.3\nCall Gemini\nAPI] as P2_3_3
  [2.3.4\nExtract JSON] as P2_3_4
}

package "2.4 JSON Parsing" {
  [2.4.1\nClean JSON\nString] as P2_4_1
  [2.4.2\nParse JSON] as P2_4_2
  [2.4.3\nExtract Items] as P2_4_3
  [2.4.4\nFormat Items] as P2_4_4
}

' Image Preprocessing Flow
P2_1_1 --> P2_1_2 : Image Bytes
P2_1_2 --> P2_1_3 : Grayscale Image
P2_1_3 --> P2_1_4 : Blurred Image
P2_1_4 --> P2_2_1 : Binary Image

' EasyOCR Flow
P2_2_1 --> P2_2_2 : Preprocessed Image
P2_2_2 --> P2_2_3 : Text Regions
P2_2_3 --> P2_2_4 : Recognized Text
P2_2_4 --> P2_3_1 : Text Lines Array

' Gemini AI Flow
P2_3_1 --> P2_3_2 : Combined Text
P2_3_2 --> P2_3_3 : Prompt
P2_3_3 --> P2_3_4 : AI Response
P2_3_4 --> P2_4_1 : JSON String

' JSON Parsing Flow
P2_4_1 --> P2_4_2 : Cleaned JSON
P2_4_2 --> P2_4_3 : Parsed Object
P2_4_3 --> P2_4_4 : Items Array
P2_4_4 --> P3_1 : Validated Items

note right of P2_1_2
  OpenCV:
  cv2.cvtColor(img, COLOR_BGR2GRAY)
end note

note right of P2_1_3
  OpenCV:
  cv2.GaussianBlur(gray, (5,5), 0)
end note

note right of P2_1_4
  OpenCV:
  cv2.threshold(blur, 0, 255, 
  THRESH_BINARY + THRESH_OTSU)
end note

note right of P2_2_1
  EasyOCR:
  reader = easyocr.Reader(['en', 'id'])
end note

note right of P2_3_3
  Gemini AI:
  model.generate_content(prompt)
  Model: gemini-flash-latest
end note

@enduml
```

### PlantUML Syntax - Data Validation Detail

```plantuml
@startuml DFD_Level3_Data_Validation
!theme plain
skinparam componentStyle rectangle
skinparam linetype ortho

title DFD Level 3 - Data Validation & Cleaning Detail

package "3.1 Validate Item Name" {
  [3.1.1\nCheck Empty] as P3_1_1
  [3.1.2\nTrim Whitespace] as P3_1_2
  [3.1.3\nValidate Length] as P3_1_3
}

package "3.2 Validate Quantity" {
  [3.2.1\nConvert to\nInteger] as P3_2_1
  [3.2.2\nCheck Minimum] as P3_2_2
  [3.2.3\nSet Default] as P3_2_3
}

package "3.3 Validate Price" {
  [3.3.1\nHandle Null] as P3_3_1
  [3.3.2\nRemove Non-Numeric] as P3_3_2
  [3.3.3\nHandle Indonesian\nFormat] as P3_3_3
  [3.3.4\nConvert to\nInteger] as P3_3_4
}

package "3.4 Validate Unit" {
  [3.4.1\nCheck Valid Units] as P3_4_1
  [3.4.2\nSet Default] as P3_4_2
}

package "3.5 Assign Category" {
  [3.5.1\nGet Category\nList] as P3_5_1
  [3.5.2\nMatch Category] as P3_5_2
  [3.5.3\nSet Default] as P3_5_3
}

database "Data Stores" {
  [D3: Categories] as D3
}

' Validation Flow
P3_1_1 --> P3_1_2 : Not Empty
P3_1_2 --> P3_1_3 : Trimmed Name
P3_1_3 --> P3_2_1 : Valid Name

P3_2_1 --> P3_2_2 : Integer Value
P3_2_2 --> P3_2_3 : Valid Quantity
P3_2_3 --> P3_3_1 : Quantity

P3_3_1 --> P3_3_2 : Not Null
P3_3_2 --> P3_3_3 : Cleaned Price
P3_3_3 --> P3_3_4 : Formatted Price
P3_3_4 --> P3_4_1 : Valid Price

P3_4_1 --> P3_4_2 : Valid Unit
P3_4_2 --> P3_5_1 : Unit

P3_5_1 --> D3 : Query Categories
D3 --> P3_5_1 : Category List
P3_5_1 --> P3_5_2 : Categories
P3_5_2 --> P3_5_3 : Matched Category
P3_5_3 --> P4_1 : Validated Item

note right of P3_3_3
  Handle formats:
  - 1.500.000 → 1500000
  - 1,500,000 → 1500000
  - 1500.50 → 1500
end note

note right of P3_4_1
  Valid units:
  pcs, kg, gram, liter,
  ml, porsi, bungkus,
  botol, kaleng
end note

@enduml
```

---

## Sequence Diagram - AI/ML Input Stok

Diagram sequence menunjukkan interaksi temporal antara komponen dalam proses AI/ML input stok.

### PlantUML Syntax

```plantuml
@startuml Sequence_AI_ML_Input_Stok
!theme plain
skinparam sequenceMessageAlign center
skinparam roundcorner 10

title Sequence Diagram - AI/ML Input Stok Process

actor Admin
participant "Frontend\n(React)" as Frontend
participant "Laravel API\n(OcrController)" as Laravel
participant "Python OCR\nService" as OCR
participant "EasyOCR\nEngine" as EasyOCR
participant "Gemini AI\nAPI" as Gemini
participant "Database\n(MySQL)" as DB

== Upload & Validation ==
Admin -> Frontend: Upload Receipt Image
Frontend -> Laravel: POST /api/ocr/process-photo\n(image file)
Laravel -> Laravel: Validate Image Format\n& Size

== OCR Service Communication ==
Laravel -> OCR: GET /health
OCR --> Laravel: Service Status
alt Service Available
  Laravel -> OCR: POST /process-photo\n(image file)
  
  == Image Preprocessing ==
  OCR -> OCR: Load Image
  OCR -> OCR: Convert to Grayscale
  OCR -> OCR: Apply Gaussian Blur
  OCR -> OCR: OTSU Threshold
  
  == Text Extraction ==
  OCR -> EasyOCR: Process Image
  EasyOCR --> OCR: Raw Text Lines\nArray
  
  == AI Classification ==
  OCR -> OCR: Combine Text Lines
  OCR -> OCR: Create Prompt
  OCR -> Gemini: Generate Content\n(prompt)
  Gemini --> OCR: JSON Response
  OCR -> OCR: Parse JSON
  OCR -> OCR: Format Items
  
  OCR --> Laravel: Extracted Items\nJSON Array
else Service Unavailable
  OCR --> Laravel: Error Response
end

== Data Validation ==
Laravel -> Laravel: Validate OCR Response
Laravel -> DB: Query Categories
DB --> Laravel: Category List
Laravel -> Laravel: Validate & Clean Items
Laravel --> Frontend: Validated Items\nJSON Array

== Review & Confirmation ==
Frontend -> Admin: Display Items\nfor Review
Admin -> Frontend: Edit Items\n(if needed)
Admin -> Frontend: Select Items\nConfirm Add

== Save to Database ==
Frontend -> Laravel: POST /api/stocks\n(confirmed items)
Laravel -> Laravel: Prepare Stock Data
Laravel -> DB: Save Stock Items
DB --> Laravel: Success
Laravel -> Laravel: Record Stock History
Laravel -> DB: Insert History
DB --> Laravel: Success
Laravel --> Frontend: Success Response
Frontend --> Admin: Confirmation Message

@enduml
```

---

## Activity Diagram - OCR Processing

Diagram aktivitas menunjukkan alur kerja proses OCR dengan AI/ML.

### PlantUML Syntax

```plantuml
@startuml Activity_OCR_Processing
!theme plain
skinparam activity {
  BackgroundColor #E1F5FF
  BorderColor #01579B
  FontColor #000000
}
skinparam arrow {
  Color #01579B
}

title Activity Diagram - OCR Processing with AI/ML

start

:Admin uploads receipt image;

:Validate image format\n(JPEG, PNG, JPG);

if (Image valid?) then (yes)
  :Check image size\n(max 10MB);
  
  if (Size valid?) then (yes)
    :Check OCR service health;
    
    if (Service available?) then (yes)
      :Send image to OCR service;
      
      partition "Image Preprocessing" {
        :Load image bytes;
        :Convert to grayscale;
        :Apply Gaussian blur (5x5);
        :Apply OTSU threshold;
      }
      
      partition "EasyOCR Text Extraction" {
        :Initialize EasyOCR reader\n(languages: en, id);
        :Detect text regions;
        :Recognize text;
        :Extract text lines;
      }
      
      if (Text found?) then (yes)
        partition "Gemini AI Classification" {
          :Combine text lines;
          :Create classification prompt;
          :Call Gemini API;
          :Receive JSON response;
        }
        
        :Parse JSON response;
        
        if (JSON valid?) then (yes)
          :Extract items array;
          
          partition "Data Validation" {
            :Validate item name;
            :Validate quantity;
            :Validate price;
            :Validate unit;
            :Assign category;
          }
          
          if (Items valid?) then (yes)
            :Format items;
            :Return to frontend;
            stop
          else (no)
            :Return empty array;
            stop
          endif
        else (no)
          :Try manual JSON extraction;
          if (Extraction success?) then (yes)
            :Extract items;
            :Validate items;
            :Return items;
            stop
          else (no)
            :Return empty array;
            stop
          endif
        endif
      else (no)
        :Return empty array;
        stop
      endif
    else (no)
      :Return error:\nService not available;
      stop
    endif
  else (no)
    :Return error:\nImage too large;
    stop
  endif
else (no)
  :Return error:\nInvalid format;
  stop
endif

@enduml
```

---

## Component Diagram - AI/ML Architecture

Diagram komponen menunjukkan arsitektur sistem AI/ML untuk input stok.

### PlantUML Syntax

```plantuml
@startuml Component_AI_ML_Architecture
!theme plain
skinparam componentStyle rectangle
skinparam linetype ortho

title Component Diagram - AI/ML Input Stok Architecture

package "Frontend Layer" {
  [React Frontend] as Frontend
  [Stock Form Modal] as FormModal
  [OCR Review Modal] as ReviewModal
}

package "Backend API Layer" {
  [Laravel API] as Laravel
  [OcrController] as OcrController
  [StockController] as StockController
}

package "OCR Service Layer" {
  [Python OCR Service\nFlask] as OCRService
  [Image Preprocessor] as Preprocessor
  [OCR Engine] as OCREngine
  [AI Classifier] as AIClassifier
}

package "AI/ML Components" {
  [EasyOCR\nLibrary] as EasyOCR
  [Google Gemini AI\nAPI] as Gemini
  [OpenCV\nLibrary] as OpenCV
}

package "Data Layer" {
  database "MySQL Database" {
    [Stock Items] as StockDB
    [Categories] as CategoryDB
    [Stock History] as HistoryDB
  }
}

' Frontend connections
Frontend --> FormModal : Uses
FormModal --> ReviewModal : Uses
FormModal --> Laravel : HTTP Request

' Backend connections
Laravel --> OcrController : Routes
Laravel --> StockController : Routes
OcrController --> OCRService : HTTP Request
StockController --> StockDB : SQL Query
StockController --> CategoryDB : SQL Query
StockController --> HistoryDB : SQL Query

' OCR Service connections
OCRService --> Preprocessor : Calls
OCRService --> OCREngine : Calls
OCRService --> AIClassifier : Calls
Preprocessor --> OpenCV : Uses
OCREngine --> EasyOCR : Uses
AIClassifier --> Gemini : API Call

' Data flow
ReviewModal --> StockController : Save Request
OcrController --> OCRService : Image Processing
OCRService --> OcrController : Extracted Items

note right of EasyOCR
  Features:
  - Multi-language (en, id)
  - Text detection
  - Text recognition
  - GPU support
end note

note right of Gemini
  Model: gemini-flash-latest
  Features:
  - Text classification
  - JSON generation
  - Text correction
  - Context understanding
end note

note right of OpenCV
  Functions:
  - Image loading
  - Grayscale conversion
  - Gaussian blur
  - OTSU threshold
end note

@enduml
```

---

## Data Dictionary - AI/ML Input Stok

### Input Data Flows

#### Receipt Image
- **Type**: Binary File
- **Format**: JPEG, PNG, JPG
- **Max Size**: 10MB
- **Source**: Admin (Frontend Upload)
- **Destination**: Process 1.0 (Receive & Validate Image)
- **Structure**: 
  ```
  Multipart Form Data:
  - image: File
  ```

#### Image File (to OCR Service)
- **Type**: Binary File
- **Format**: JPEG, PNG, JPG
- **Source**: Process 1.0
- **Destination**: Python OCR Service
- **Transport**: HTTP POST
- **Endpoint**: `http://127.0.0.1:5000/process-photo`

### Processing Data Flows

#### Preprocessed Image
- **Type**: Binary Image
- **Format**: Grayscale Binary (OTSU Threshold)
- **Source**: Process 2.1 (Image Preprocessing)
- **Destination**: Process 2.2 (EasyOCR Text Extraction)
- **Properties**:
  - Grayscale: Yes
  - Blur: Gaussian 5x5
  - Threshold: OTSU Binary

#### Raw Text Lines
- **Type**: Array of Strings
- **Source**: Process 2.2 (EasyOCR Text Extraction)
- **Destination**: Process 2.3 (Gemini AI Classification)
- **Example**:
  ```json
  [
    "TOKO MAKMUR",
    "Jl. Raya No. 123",
    "Nasi Putih 5 kg 25000",
    "Ayam 2 ekor 50000",
    "Total: 75000"
  ]
  ```

#### Classification Prompt
- **Type**: String
- **Source**: Process 2.3 (Gemini AI Classification)
- **Destination**: Google Gemini API
- **Structure**:
  ```
  berikut teks hasil OCR dari struk belanja:
  [combined text lines]
  
  tolong ektrak jadi JSON dengan format:
  [
    {
      "nama_barang": "...", 
      "jumlah": "...", 
      "harga": "..."
    }
  ]
  
  [additional instructions]
  ```

#### JSON Response (from Gemini)
- **Type**: String (JSON)
- **Source**: Google Gemini API
- **Destination**: Process 2.4 (JSON Parsing)
- **Example**:
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

### Output Data Flows

#### Extracted Items (Raw)
- **Type**: Array of Objects
- **Source**: Process 2.4 (JSON Parsing)
- **Destination**: Process 3.0 (Data Validation)
- **Structure**:
  ```json
  [
    {
      "nama_barang": "Nasi Putih",
      "jumlah": "5",
      "harga": "25000",
      "unit": "pcs",
      "category_id": 1,
      "minStock": 10
    }
  ]
  ```

#### Validated Items
- **Type**: Array of Objects
- **Source**: Process 3.0 (Data Validation & Cleaning)
- **Destination**: Process 4.0 (Review & Confirmation)
- **Structure**:
  ```json
  [
    {
      "nama_barang": "Nasi Putih",
      "jumlah": 5,
      "harga": 25000,
      "unit": "kg",
      "category_id": 1,
      "minStock": 10
    }
  ]
  ```

#### Confirmed Items
- **Type**: Array of Objects
- **Source**: Process 4.0 (Review & Confirmation)
- **Destination**: Process 5.0 (Save to Database)
- **Structure**:
  ```json
  [
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
  ]
  ```

#### Stock Data (for Database)
- **Type**: Object
- **Source**: Process 5.1 (Prepare Stock Data)
- **Destination**: D4 (Stock Items)
- **Structure**:
  ```sql
  {
    nama_bahan: "Nasi Putih",
    id_kategori: 1,
    harga_beli: 25000,
    stok_bahan: 5,
    satuan: "kg",
    min_stok: 10,
    is_divisible: 0,
    max_divisions: null,
    division_description: null,
    updated_by: [user_id]
  }
  ```

### Error Data Flows

#### Error Response
- **Type**: JSON Object
- **Source**: Any Process
- **Destination**: Admin (Frontend)
- **Structure**:
  ```json
  {
    "success": false,
    "error": "Error type",
    "message": "Error message description"
  }
  ```

**Error Types:**
1. **Service Not Available**: OCR service tidak berjalan
2. **Processing Timeout**: Proses OCR > 60 detik
3. **Invalid Image Format**: Format gambar tidak didukung
4. **Image Too Large**: Ukuran > 10MB
5. **OCR Failed**: Gagal ekstraksi teks
6. **Invalid Response**: Response dari OCR service tidak valid
7. **No Valid Items**: Tidak ada item valid yang ditemukan

---

## Teknologi Stack

### Frontend
- **Framework**: React 19
- **HTTP Client**: Axios
- **UI Components**: Custom React Components

### Backend API
- **Framework**: Laravel 10
- **Language**: PHP 8.2+
- **HTTP Client**: Guzzle HTTP

### OCR Service
- **Framework**: Flask (Python)
- **Language**: Python 3.8+
- **OCR Engine**: EasyOCR
- **AI Model**: Google Gemini Flash
- **Image Processing**: OpenCV
- **Port**: 5000

### Database
- **DBMS**: MySQL
- **ORM**: Eloquent (Laravel)

---

## API Endpoints

### POST /api/ocr/process-photo
- **Purpose**: Memproses gambar struk menggunakan OCR dan AI
- **Input**: Multipart form data dengan field `image`
- **Output**: JSON dengan extracted items
- **Timeout**: 60 detik
- **Error Codes**:
  - 400: Invalid image format
  - 503: OCR service not available
  - 504: Processing timeout
  - 500: Internal server error

### GET /api/ocr/health
- **Purpose**: Check status OCR service
- **Output**: Service health information
- **Timeout**: 5 detik

### POST /api/stocks
- **Purpose**: Menyimpan data stok ke database
- **Input**: JSON array of stock items
- **Output**: Success confirmation
- **Authentication**: Required (Sanctum)

---

## Cara Menggunakan PlantUML

1. **Online Editor**: 
   - Kunjungi http://www.plantuml.com/plantuml/uml/
   - Copy-paste syntax PlantUML
   - Generate diagram

2. **VS Code Extension**:
   - Install extension "PlantUML"
   - Create file dengan ekstensi `.puml`
   - Preview dengan `Alt+D`

3. **Command Line**:
   ```bash
   java -jar plantuml.jar diagram.puml
   ```

4. **IntelliJ IDEA**:
   - Install plugin "PlantUML integration"
   - Create file `.puml`
   - Preview diagram

---

## Revisi History

- **Version 1.0** (2025-01-XX): Initial documentation
  - DFD Level 0-3 untuk AI/ML Input Stok
  - Sequence Diagram
  - Activity Diagram
  - Component Diagram
  - Data Dictionary
  - PlantUML syntax untuk semua diagram

