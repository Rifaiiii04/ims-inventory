# Dokumentasi Backend - Angkringan IMS

## Overview

Dokumentasi ini menjelaskan struktur backend yang diperlukan untuk mendukung frontend Angkringan IMS yang sudah dibuat. Backend harus menyediakan API endpoints untuk semua fitur yang ada di frontend.

## Database Schema

### 1. Users Table

**Tujuan**: Menyimpan data pengguna (Admin, Kasir)

```sql
- id (Primary Key)
- name (Varchar)
- email (Varchar, Unique)
- password (Varchar, Hashed)
- role (Enum: 'admin', 'cashier')
- phone (Varchar, Nullable)
- avatar (Varchar, Nullable)
- status (Enum: 'active', 'inactive')
- created_at (Timestamp)
- updated_at (Timestamp)
- last_login (Timestamp, Nullable)
```

### 2. Categories Table

**Tujuan**: Kategori produk (Makanan, Minuman, Bahan Utama, dll)

```sql
- id (Primary Key)
- name (Varchar)
- description (Text, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### 3. Products Table

**Tujuan**: Data produk makanan dan minuman

```sql
- id (Primary Key)
- name (Varchar)
- category_id (Foreign Key → Categories)
- description (Text, Nullable)
- sell_price (Decimal)
- created_at (Timestamp)
- updated_at (Timestamp)
- created_by (Foreign Key → Users)
```

### 4. Product_Variants Table

**Tujuan**: Varian produk (Porsi, Ukuran, dll)

```sql
- id (Primary Key)
- product_id (Foreign Key → Products)
- name (Varchar)
- price (Decimal)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### 5. Stock_Items Table

**Tujuan**: Data stok bahan baku dan produk

```sql
- id (Primary Key)
- name (Varchar)
- category_id (Foreign Key → Categories)
- buy_price (Decimal)
- quantity (Decimal)
- unit (Varchar) // ekor, kg, liter, dll
- daily_need (Decimal)
- conversion_info (Text) // informasi konversi
- min_stock_limit (Decimal) // batas minimum stok
- last_updated (Timestamp)
- updated_by (Foreign Key → Users)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### 6. Stock_History Table

**Tujuan**: Riwayat perubahan stok

```sql
- id (Primary Key)
- stock_item_id (Foreign Key → Stock_Items)
- change_type (Enum: 'in', 'out', 'adjustment')
- quantity_before (Decimal)
- quantity_after (Decimal)
- quantity_change (Decimal)
- reason (Varchar) // 'restock', 'usage', 'adjustment'
- notes (Text, Nullable)
- created_at (Timestamp)
- created_by (Foreign Key → Users)
```

### 7. Transactions Table

**Tujuan**: Data transaksi penjualan

```sql
- id (Primary Key)
- transaction_date (Timestamp)
- total_amount (Decimal)
- payment_method (Enum: 'cash', 'qris', 'transfer')
- customer_name (Varchar, Nullable)
- notes (Text, Nullable)
- created_at (Timestamp)
- created_by (Foreign Key → Users)
```

### 8. Transaction_Items Table

**Tujuan**: Detail item dalam transaksi

```sql
- id (Primary Key)
- transaction_id (Foreign Key → Transactions)
- product_id (Foreign Key → Products)
- product_variant_id (Foreign Key → Product_Variants, Nullable)
- quantity (Decimal)
- unit_price (Decimal)
- total_price (Decimal)
- created_at (Timestamp)
```

### 9. Notifications Table

**Tujuan**: Konfigurasi notifikasi stok menipis

```sql
- id (Primary Key)
- stock_item_id (Foreign Key → Stock_Items)
- min_stock_limit (Decimal)
- notification_schedule (Enum: 'daily', 'twice_daily', 'weekly')
- is_active (Boolean)
- last_notified (Timestamp, Nullable)
- created_at (Timestamp)
- created_by (Foreign Key → Users)
```

### 10. Notification_Logs Table

**Tujuan**: Log notifikasi yang dikirim

```sql
- id (Primary Key)
- notification_id (Foreign Key → Notifications)
- sent_at (Timestamp)
- status (Enum: 'sent', 'failed')
- message (Text)
- created_at (Timestamp)
```

## API Endpoints

### Authentication

-   `POST /api/auth/login` - Login user
-   `POST /api/auth/logout` - Logout user
-   `GET /api/auth/me` - Get current user data
-   `POST /api/auth/refresh` - Refresh token

### Dashboard

-   `GET /api/dashboard/summary` - Get dashboard summary data
-   `GET /api/dashboard/top-products` - Get top selling products
-   `GET /api/dashboard/low-stock` - Get low stock items

### Stock Management

-   `GET /api/stock` - Get all stock items with pagination
-   `POST /api/stock` - Create new stock item
-   `GET /api/stock/{id}` - Get specific stock item
-   `PUT /api/stock/{id}` - Update stock item
-   `DELETE /api/stock/{id}` - Delete stock item
-   `POST /api/stock/{id}/adjust` - Adjust stock quantity
-   `GET /api/stock/{id}/history` - Get stock history

### Product Management

-   `GET /api/products` - Get all products with pagination
-   `POST /api/products` - Create new product
-   `GET /api/products/{id}` - Get specific product
-   `PUT /api/products/{id}` - Update product
-   `DELETE /api/products/{id}` - Delete product

### Categories

-   `GET /api/categories` - Get all categories
-   `POST /api/categories` - Create new category
-   `PUT /api/categories/{id}` - Update category
-   `DELETE /api/categories/{id}` - Delete category

### Product Variants

-   `GET /api/products/{id}/variants` - Get product variants
-   `POST /api/products/{id}/variants` - Create product variant
-   `PUT /api/variants/{id}` - Update variant
-   `DELETE /api/variants/{id}` - Delete variant

### Sales Reports

-   `GET /api/reports/sales/daily` - Get daily sales data
-   `GET /api/reports/sales/weekly` - Get weekly sales data
-   `GET /api/reports/sales/monthly` - Get monthly sales data
-   `GET /api/reports/sales/by-product` - Get sales by product
-   `GET /api/reports/sales/by-payment` - Get sales by payment method
-   `POST /api/reports/sales/export` - Export sales report

### Inventory Reports

-   `GET /api/reports/inventory` - Get inventory report data
-   `GET /api/reports/inventory/charts` - Get inventory charts data
-   `POST /api/reports/inventory/export` - Export inventory report

### Transactions

-   `GET /api/transactions` - Get all transactions with pagination
-   `POST /api/transactions` - Create new transaction
-   `GET /api/transactions/{id}` - Get specific transaction
-   `PUT /api/transactions/{id}` - Update transaction
-   `DELETE /api/transactions/{id}` - Delete transaction

### Notifications

-   `GET /api/notifications` - Get all notifications
-   `POST /api/notifications` - Create new notification
-   `PUT /api/notifications/{id}` - Update notification
-   `DELETE /api/notifications/{id}` - Delete notification
-   `POST /api/notifications/{id}/toggle` - Toggle notification status
-   `GET /api/notifications/summary` - Get notification summary

### Account Management

-   `GET /api/users` - Get all users
-   `POST /api/users` - Create new user
-   `GET /api/users/{id}` - Get specific user
-   `PUT /api/users/{id}` - Update user
-   `DELETE /api/users/{id}` - Delete user
-   `POST /api/users/{id}/reset-password` - Reset user password

## Business Logic Requirements

### 1. Stock Management Logic

-   **Low Stock Alert**: Otomatis cek stok yang di bawah batas minimum
-   **Stock History**: Setiap perubahan stok harus dicatat dengan detail
-   **Daily Need Calculation**: Hitung kebutuhan harian berdasarkan data historis
-   **Conversion Info**: Simpan informasi konversi (contoh: 1 ekor ayam = 4 bagian)

### 2. Sales Logic

-   **Transaction Processing**: Proses transaksi dengan multiple items
-   **Payment Methods**: Support tunai, QRIS, transfer
-   **Variant Pricing**: Harga berbeda untuk setiap varian produk
-   **Receipt Generation**: Generate struk transaksi

### 3. Reporting Logic

-   **Real-time Data**: Data laporan harus real-time
-   **Date Filtering**: Filter berdasarkan tanggal, minggu, bulan
-   **Category Filtering**: Filter berdasarkan kategori produk
-   **Export Functionality**: Export ke PDF dan Excel

### 4. Notification Logic

-   **Scheduled Notifications**: Kirim notifikasi sesuai jadwal yang ditentukan
-   **Low Stock Alerts**: Alert otomatis saat stok menipis
-   **Multiple Recipients**: Kirim ke multiple user (admin, kasir)

### 5. User Management Logic

-   **Role-based Access**: Admin dan Kasir memiliki akses berbeda
-   **Password Security**: Hash password dengan bcrypt
-   **Session Management**: JWT token untuk authentication
-   **Profile Management**: Update profil dan preferensi

## Data Validation Rules

### Stock Items

-   Nama harus unique dalam kategori yang sama
-   Harga beli harus > 0
-   Quantity tidak boleh negatif
-   Unit harus valid (ekor, kg, liter, dll)

### Products

-   Nama produk harus unique
-   Harga jual harus > harga beli
-   Minimal 1 varian untuk setiap produk

### Transactions

-   Total amount harus > 0
-   Payment method harus valid
-   Minimal 1 item dalam transaksi

### Users

-   Email harus unique dan valid format
-   Password minimal 8 karakter
-   Role harus valid (admin/cashier)

## Security Requirements

### Authentication

-   JWT token dengan expiration
-   Refresh token mechanism
-   Password hashing dengan bcrypt

### Authorization

-   Role-based access control
-   API endpoint protection
-   Data ownership validation

### Data Protection

-   Input validation dan sanitization
-   SQL injection prevention
-   XSS protection
-   CSRF protection

## Performance Considerations

### Database

-   Index pada foreign keys
-   Index pada frequently queried fields
-   Pagination untuk large datasets
-   Query optimization

### Caching

-   Cache dashboard summary data
-   Cache product categories
-   Cache user sessions
-   Redis untuk session storage

### API Response

-   Consistent response format
-   Error handling yang proper
-   Response time optimization
-   Rate limiting

## Integration Points

### Frontend Integration

-   RESTful API design
-   JSON response format
-   CORS configuration
-   Error response standardization

### External Services

-   Email service untuk notifikasi
-   SMS service untuk alert (optional)
-   File storage untuk export
-   Payment gateway integration (optional)

## Development Guidelines

### Code Structure

-   MVC pattern
-   Service layer untuk business logic
-   Repository pattern untuk data access
-   Middleware untuk authentication/authorization

### Error Handling

-   Centralized error handling
-   Logging system
-   User-friendly error messages
-   Debug mode untuk development

### Testing

-   Unit tests untuk business logic
-   Integration tests untuk API endpoints
-   Database migration tests
-   Performance tests

## Deployment Considerations

### Environment Configuration

-   Development, staging, production environments
-   Environment-specific configurations
-   Database connection pooling
-   Log level configuration

### Monitoring

-   Application performance monitoring
-   Database performance monitoring
-   Error tracking
-   User activity logging

### Backup Strategy

-   Database backup schedule
-   File backup strategy
-   Disaster recovery plan
-   Data retention policy

## Migration Strategy

### Database Migrations

-   Laravel migration files
-   Seed data untuk development
-   Production data migration plan
-   Rollback strategy

### API Versioning

-   Version control untuk API
-   Backward compatibility
-   Deprecation strategy
-   Client update coordination

---

**Catatan**: Dokumentasi ini dibuat berdasarkan analisis frontend yang sudah ada. Pastikan untuk menyesuaikan dengan kebutuhan spesifik dan teknologi stack yang akan digunakan untuk backend development.
