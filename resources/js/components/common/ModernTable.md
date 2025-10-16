# ModernTable Component

Komponen tabel modern yang dapat digunakan kembali di seluruh aplikasi dengan styling yang konsisten.

## Props

| Prop                    | Type      | Default                                    | Description                                             |
| ----------------------- | --------- | ------------------------------------------ | ------------------------------------------------------- |
| `title`                 | string    | -                                          | Judul tabel yang ditampilkan di header                  |
| `subtitle`              | string    | -                                          | Subtitle tabel (default: "{data.length} item tersedia") |
| `icon`                  | ReactNode | -                                          | Icon yang ditampilkan di header                         |
| `iconColor`             | string    | "from-blue-500 to-green-500"               | Warna gradient untuk icon background                    |
| `data`                  | array     | []                                         | Array data yang akan ditampilkan                        |
| `columns`               | array     | []                                         | Konfigurasi kolom tabel                                 |
| `onEdit`                | function  | -                                          | Callback untuk tombol edit                              |
| `onDelete`              | function  | -                                          | Callback untuk tombol delete                            |
| `onViewHistory`         | function  | -                                          | Callback untuk tombol view history                      |
| `emptyStateTitle`       | string    | "Belum ada data"                           | Judul untuk empty state                                 |
| `emptyStateDescription` | string    | "Mulai tambahkan data untuk melihat tabel" | Deskripsi untuk empty state                             |
| `emptyStateAction`      | string    | "Klik tombol tambah untuk memulai"         | Action text untuk empty state                           |
| `showActions`           | boolean   | true                                       | Menampilkan kolom aksi                                  |
| `showHeader`            | boolean   | true                                       | Menampilkan header tabel                                |
| `className`             | string    | ""                                         | Class tambahan untuk wrapper                            |
| `mobileCardComponent`   | function  | -                                          | Custom component untuk mobile view                      |
| `loading`               | boolean   | false                                      | Menampilkan loading state                               |

## Column Configuration

Setiap kolom dalam array `columns` harus memiliki struktur:

```javascript
{
    header: "Nama Kolom",           // Header yang ditampilkan
    accessor: "fieldName",          // Field name atau function untuk mengakses data
    render: (value, item, index) => // Optional: custom render function
        <div>{value}</div>
}
```

### Accessor Types

1. **String**: Mengakses property object

    ```javascript
    { header: "Nama", accessor: "name" }
    ```

2. **Function**: Custom logic untuk mengakses data
    ```javascript
    {
        header: "Full Name",
        accessor: (item) => `${item.firstName} ${item.lastName}`
    }
    ```

### Render Function

Gunakan `render` function untuk customisasi tampilan cell:

```javascript
{
    header: "Status",
    accessor: "status",
    render: (value, item, index) => (
        <span className={`px-2 py-1 rounded-full ${
            value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
            {value}
        </span>
    )
}
```

## Contoh Penggunaan

### Basic Usage

```javascript
import ModernTable from "./components/common/ModernTable";

const columns = [
    { header: "Nama", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Status", accessor: "status" },
];

const data = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "active" },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        status: "inactive",
    },
];

<ModernTable
    title="Daftar Pengguna"
    data={data}
    columns={columns}
    onEdit={(item) => console.log("Edit:", item)}
    onDelete={(id) => console.log("Delete:", id)}
/>;
```

### Advanced Usage dengan Custom Render

```javascript
const columns = [
    {
        header: "Produk",
        accessor: "name",
        render: (value, item) => (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    {value.charAt(0)}
                </div>
                <div>
                    <div className="font-bold">{value}</div>
                    <div className="text-xs text-gray-500">ID: {item.id}</div>
                </div>
            </div>
        ),
    },
    {
        header: "Harga",
        accessor: "price",
        render: (value) => (
            <div className="text-green-600 font-bold">
                Rp {value.toLocaleString("id-ID")}
            </div>
        ),
    },
];
```

### Mobile Card Component

```javascript
const mobileCardComponent = (item, index) => (
    <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="font-bold">{item.name}</h3>
        <p className="text-gray-600">{item.description}</p>
        <div className="flex gap-2 mt-2">
            <button className="px-3 py-1 bg-blue-500 text-white rounded">
                Edit
            </button>
            <button className="px-3 py-1 bg-red-500 text-white rounded">
                Delete
            </button>
        </div>
    </div>
);

<ModernTable
    title="Custom Mobile View"
    data={data}
    columns={columns}
    mobileCardComponent={mobileCardComponent}
/>;
```

## Styling

Komponen menggunakan Tailwind CSS dengan desain modern:

-   **Header**: Gradient background dengan icon dan live indicator
-   **Table**: Alternating row colors dengan hover effects
-   **Actions**: Icon buttons dengan hover animations
-   **Mobile**: Card-based layout untuk responsivitas
-   **Empty State**: Centered message dengan icon dan call-to-action

## Responsive Design

-   **Desktop**: Tabel dengan kolom lengkap
-   **Mobile**: Card layout dengan informasi terpilih
-   **Tablet**: Tabel dengan scroll horizontal jika diperlukan

## Loading State

```javascript
<ModernTable title="Loading Data" data={[]} columns={columns} loading={true} />
```

## Empty State

```javascript
<ModernTable
    title="No Data"
    data={[]}
    columns={columns}
    emptyStateTitle="Belum ada data"
    emptyStateDescription="Mulai tambahkan data untuk melihat tabel"
    emptyStateAction="Klik tombol tambah untuk memulai"
/>
```
