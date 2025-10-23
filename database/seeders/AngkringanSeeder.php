<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AngkringanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Insert user admin
        DB::table('tbl_user')->insert([
            'nama_user' => 'Administrator',
            'username' => 'admin',
            'password' => Hash::make('admin123'),
            'level' => 'admin',
            'tema' => 'terang',
            'bahasa' => 'id',
            'notif_aktif' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Insert user kasir
        DB::table('tbl_user')->insert([
            'nama_user' => 'Kasir Angkringan',
            'username' => 'kasir',
            'password' => Hash::make('kasir123'),
            'level' => 'kasir',
            'tema' => 'terang',
            'bahasa' => 'id',
            'notif_aktif' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Insert kategori contoh
        DB::table('tbl_kategori')->insert([
            [
                'nama_kategori' => 'Makanan',
                'deskripsi' => 'Produk makanan siap saji',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Minuman',
                'deskripsi' => 'Berbagai jenis minuman',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Bahan Dasar',
                'deskripsi' => 'Bahan baku dasar untuk memasak',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Bahan Utama',
                'deskripsi' => 'Bahan utama seperti daging dan ikan',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Bumbu & Rempah',
                'deskripsi' => 'Bumbu dan rempah-rempah',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Sayuran',
                'deskripsi' => 'Berbagai jenis sayuran',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kategori' => 'Ikan Asin',
                'deskripsi' => 'Berbagai jenis ikan asin',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Insert bahan baku contoh (berdasarkan data frontend) - beberapa dengan stok rendah untuk testing
        $bahanData = [
            // Bahan Utama - beberapa dengan stok rendah
            ['Ayam Utuh', 4, 25000, 2, true, 6, 'Dapat dibagi menjadi: Dada, Paha, Sayap, Kepala, Leher, Ceker', 'ekor', 5, 1], // Stok rendah
            ['Lele', 4, 8000, 6, true, 2, 'Dapat dibagi menjadi: Badan, Kepala', 'ekor', 8, 1], // Stok rendah
            ['Nila', 4, 12000, 4, true, 2, 'Dapat dibagi menjadi: Badan, Kepala', 'ekor', 6, 1], // Stok rendah
            ['Cumi', 4, 45000, 0.5, false, null, null, 'kg', 2, 1], // Stok rendah
            
            // Bahan Pokok
            ['Beras', 3, 12000, 3, false, null, null, 'liter', 5, 1], // Stok rendah
            ['Tahu Bumbu Kuning', 3, 3000, 15, false, null, null, 'bijik', 20, 1], // Stok rendah
            ['Tempe Bumbu Kuning', 3, 3000, 25, false, null, null, 'bijik', 20, 1],
            ['Tempe Bacem', 3, 3000, 25, false, null, null, 'bijik', 20, 1],
            ['Tahu Bacem', 3, 3000, 25, false, null, null, 'bijik', 20, 1],
            
            // Bumbu & Rempah
            ['Bumbu Halus', 5, 15000, 0.3, false, null, null, 'kg', 0.5, 1], // Stok rendah
            ['Rempah Kering', 5, 25000, 150, false, null, null, 'gr', 200, 1], // Stok rendah
            
            // Sayuran
            ['Kangkung', 6, 5000, 2, false, null, null, 'ikat', 3, 1], // Stok rendah
            ['Terong', 6, 8000, 10, false, null, null, 'buah', 5, 1],
            ['Timun', 6, 5000, 5, false, null, null, 'buah', 3, 1],
            
            // Ikan Asin
            ['Ikan Asin Japuh', 7, 35000, 0.3, false, null, null, 'kg', 1, 1], // Stok rendah
            ['Ikan Asin Peda', 7, 40000, 0.3, false, null, null, 'kg', 1, 1], // Stok rendah
            ['Ikan Asin Pindang', 7, 38000, 0.5, false, null, null, 'kg', 1, 1],
            
            // Minuman
            ['Teh', 2, 25000, 30, false, null, null, 'gr', 50, 1], // Stok rendah
            ['Jeruk', 2, 15000, 10, false, null, null, 'buah', 5, 1],
            ['Es Batu', 2, 5000, 2, false, null, null, 'bal', 1, 1],
        ];

        foreach ($bahanData as $bahan) {
            DB::table('tbl_bahan')->insert([
                'nama_bahan' => $bahan[0],
                'id_kategori' => $bahan[1],
                'harga_beli' => $bahan[2],
                'stok_bahan' => $bahan[3],
                'is_divisible' => $bahan[4],
                'max_divisions' => $bahan[5],
                'division_description' => $bahan[6],
                'satuan' => $bahan[7],
                'min_stok' => $bahan[8],
                'updated_by' => $bahan[9],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Insert produk contoh (berdasarkan data frontend)
        $produkData = [
            // Makanan - Produk dengan multiple varian
            ['Ayam', 1, 'Ayam dengan berbagai varian masakan', 15000, 1],
            ['Nasi', 1, 'Nasi putih hangat', 5000, 1],
            ['Lele', 1, 'Lele dengan berbagai varian masakan', 10000, 1],
            ['Nila', 1, 'Nila dengan berbagai varian masakan', 18000, 1],
            ['Tusukan (Sate-satean)', 1, 'Sate cumi bumbu khas', 3000, 1],
            ['Kepala Ayam', 1, 'Kepala ayam goreng', 2000, 1],
            ['Tempe', 1, 'Tempe dengan berbagai varian masakan', 1000, 1],
            ['Tahu', 1, 'Tahu dengan berbagai varian masakan', 1000, 1],
            ['Cumi', 1, 'Cumi dengan berbagai varian masakan', 8000, 1],
            ['Pencok', 1, 'Pencok bumbu khas', 8000, 1],
            ['Receuh Timun', 1, 'Timun receuh segar', 8000, 1],
            ['Asin Japuh', 1, 'Ikan asin japuh goreng', 5000, 1],
            ['Asin Peda', 1, 'Ikan asin peda goreng', 8000, 1],
            ['Asin Pindang', 1, 'Ikan asin pindang goreng', 8000, 1],
            ['Tumis Kangkung', 1, 'Kangkung tumis bumbu khas', 10000, 1],
            ['Tumis Terong', 1, 'Terong tumis bumbu khas', 10000, 1],
            
            // Minuman - Produk dengan multiple varian
            ['Es Teh', 2, 'Es teh dengan berbagai varian', 4000, 1],
            ['Es Jeruk', 2, 'Es jeruk segar', 7000, 1],
        ];

        foreach ($produkData as $produk) {
            DB::table('tbl_produk')->insert([
                'nama_produk' => $produk[0],
                'id_kategori' => $produk[1],
                'deskripsi' => $produk[2],
                'harga' => $produk[3],
                'created_by' => $produk[4],
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Insert varian produk (jenis masakan/porsi, harga ada di produk)
        $varianData = [
            // Ayam - Multiple varian dengan konversi realistis
            [1, 'Goreng', 12, 'porsi', 4.0, 'ekor', '1 ekor ayam = 4 porsi goreng'],
            [1, 'Bakar', 8, 'porsi', 3.0, 'ekor', '1 ekor ayam = 3 porsi bakar'],
            [1, 'Porsi', 15, 'porsi', 5.0, 'ekor', '1 ekor ayam = 5 porsi campur'],
            
            // Nasi
            [2, 'Porsi', 120, 'porsi', 0.5, 'liter', '1 liter beras = 2 porsi nasi'],
            
            // Lele - Multiple varian
            [3, 'Goreng', 10, 'porsi', 1.0, 'ekor', '1 ekor lele = 1 porsi goreng'],
            [3, 'Bakar', 5, 'porsi', 1.0, 'ekor', '1 ekor lele = 1 porsi bakar'],
            
            // Nila - Multiple varian
            [4, 'Goreng', 8, 'porsi', 1.0, 'ekor', '1 ekor nila = 1 porsi goreng'],
            [4, 'Cobek', 6, 'porsi', 1.0, 'ekor', '1 ekor nila = 1 porsi cobek'],
            
            // Tusukan (Sate-satean)
            [5, 'Tusuk', 30, 'tusuk', 0.1, 'kg', '1 kg cumi = 10 tusuk'],
            
            // Kepala Ayam
            [6, 'Porsi', 10, 'porsi', 0.5, 'kg', '1 kg kepala ayam = 2 porsi'],
            
            // Tempe - Multiple varian
            [7, 'Goreng', 25],
            [7, 'Bacem', 20],
            
            // Tahu - Multiple varian
            [8, 'Goreng', 25],
            [8, 'Bacem', 20],
            
            // Cumi - Multiple varian
            [9, 'Goreng', 30],
            [9, 'Bakar', 15],
            
            // Pencok
            [10, 'Porsi', 20],
            
            // Receuh Timun
            [11, 'Porsi', 10],
            
            // Asin Japuh
            [12, 'Porsi', 10],
            
            // Asin Peda
            [13, 'Porsi', 10],
            
            // Asin Pindang
            [14, 'Porsi', 10],
            
            // Tumis Kangkung
            [15, 'Porsi', 10],
            
            // Tumis Terong
            [16, 'Porsi', 10],
            
            // Es Teh - Multiple varian
            [17, 'Manis', 50],
            [17, 'Tawar', 40],
            [17, 'Jus', 35],
            
            // Es Jeruk
            [18, 'Gelas', 10],
        ];

        foreach ($varianData as $varian) {
            DB::table('tbl_varian')->insert([
                'id_produk' => $varian[0],
                'nama_varian' => $varian[1],
                'stok_varian' => $varian[2],
                'unit' => $varian[3] ?? 'porsi',
                'conversion_rate' => $varian[4] ?? 1.0,
                'conversion_unit' => $varian[5] ?? 'pcs',
                'description' => $varian[6] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Insert bagian tubuh untuk produk yang bisa dipotong
        $bagianTubuhData = [
            // Ayam (ID: 1) - 1 ekor ayam bisa dibagi menjadi:
            [1, 'Dada', 2, 30.00, 7500, 'potong', 'Dada ayam utuh', true],
            [1, 'Paha', 2, 25.00, 6000, 'potong', 'Paha ayam atas dan bawah', true],
            [1, 'Sayap', 2, 20.00, 5000, 'potong', 'Sayap ayam kiri dan kanan', true],
            [1, 'Kepala', 1, 15.00, 3750, 'potong', 'Kepala ayam', true],
            [1, 'Leher', 1, 5.00, 1250, 'potong', 'Leher ayam', true],
            [1, 'Ceker', 2, 5.00, 1250, 'potong', 'Ceker ayam kiri dan kanan', true],
            
            // Lele (ID: 3) - 1 ekor lele bisa dibagi menjadi:
            [3, 'Badan', 1, 80.00, 6400, 'potong', 'Badan lele utuh', true],
            [3, 'Kepala', 1, 20.00, 1600, 'potong', 'Kepala lele', true],
            
            // Nila (ID: 4) - 1 ekor nila bisa dibagi menjadi:
            [4, 'Badan', 1, 85.00, 15300, 'potong', 'Badan nila utuh', true],
            [4, 'Kepala', 1, 15.00, 2700, 'potong', 'Kepala nila', true],
        ];

        foreach ($bagianTubuhData as $bagian) {
            DB::table('tbl_bagian_tubuh')->insert([
                'id_produk' => $bagian[0],
                'nama_bagian' => $bagian[1],
                'jumlah_per_ekor' => $bagian[2],
                'persentase_penggunaan' => $bagian[3],
                'harga_per_potong' => $bagian[4],
                'unit' => $bagian[5],
                'deskripsi' => $bagian[6],
                'is_aktif' => $bagian[7],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
