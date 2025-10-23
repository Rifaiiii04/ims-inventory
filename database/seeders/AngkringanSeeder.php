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
            ['Ayam Utuh', 4, 25000, 2, 'ekor', 5, 1], // Stok rendah
            ['Lele', 4, 8000, 6, 'ekor', 8, 1], // Stok rendah
            ['Nila', 4, 12000, 4, 'ekor', 6, 1], // Stok rendah
            ['Cumi', 4, 45000, 0.5, 'kg', 2, 1], // Stok rendah
            
            // Bahan Pokok
            ['Beras', 3, 12000, 3, 'liter', 5, 1], // Stok rendah
            ['Tahu Bumbu Kuning', 3, 3000, 15, 'bijik', 20, 1], // Stok rendah
            ['Tempe Bumbu Kuning', 3, 3000, 25, 'bijik', 20, 1],
            ['Tempe Bacem', 3, 3000, 25, 'bijik', 20, 1],
            ['Tahu Bacem', 3, 3000, 25, 'bijik', 20, 1],
            
            // Bumbu & Rempah
            ['Bumbu Halus', 5, 15000, 0.3, 'kg', 0.5, 1], // Stok rendah
            ['Rempah Kering', 5, 25000, 150, 'gr', 200, 1], // Stok rendah
            
            // Sayuran
            ['Kangkung', 6, 5000, 2, 'ikat', 3, 1], // Stok rendah
            ['Terong', 6, 8000, 10, 'buah', 5, 1],
            ['Timun', 6, 5000, 5, 'buah', 3, 1],
            
            // Ikan Asin
            ['Ikan Asin Japuh', 7, 35000, 0.3, 'kg', 1, 1], // Stok rendah
            ['Ikan Asin Peda', 7, 40000, 0.3, 'kg', 1, 1], // Stok rendah
            ['Ikan Asin Pindang', 7, 38000, 0.5, 'kg', 1, 1],
            
            // Minuman
            ['Teh', 2, 25000, 30, 'gr', 50, 1], // Stok rendah
            ['Jeruk', 2, 15000, 10, 'buah', 5, 1],
            ['Es Batu', 2, 5000, 2, 'bal', 1, 1],
        ];

        foreach ($bahanData as $bahan) {
            DB::table('tbl_bahan')->insert([
                'nama_bahan' => $bahan[0],
                'id_kategori' => $bahan[1],
                'harga_beli' => $bahan[2],
                'stok_bahan' => $bahan[3],
                'satuan' => $bahan[4],
                'min_stok' => $bahan[5],
                'updated_by' => $bahan[6],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Insert produk contoh (berdasarkan data frontend)
        $produkData = [
            // Makanan
            ['Nasi', 1, 'Nasi putih hangat', 1],
            ['Ayam Bakar', 1, 'Ayam bakar bumbu khas', 1],
            ['Ayam Goreng', 1, 'Ayam goreng crispy', 1],
            ['Tusukan (Sate-satean)', 1, 'Sate cumi bumbu khas', 1],
            ['Lele Goreng', 1, 'Lele goreng crispy', 1],
            ['Nila Goreng', 1, 'Nila goreng bumbu kuning', 1],
            ['Cobek Nila', 1, 'Nila cobek bumbu pedas', 1],
            ['Kepala Ayam', 1, 'Kepala ayam goreng', 1],
            ['Tempe Goreng', 1, 'Tempe goreng crispy', 1],
            ['Tahu Goreng', 1, 'Tahu goreng crispy', 1],
            ['Cumi Goreng', 1, 'Cumi goreng bumbu khas', 1],
            ['Pencok', 1, 'Pencok bumbu khas', 1],
            ['Receuh Timun', 1, 'Timun receuh segar', 1],
            ['Asin Japuh', 1, 'Ikan asin japuh goreng', 1],
            ['Asin Peda', 1, 'Ikan asin peda goreng', 1],
            ['Asin Pindang', 1, 'Ikan asin pindang goreng', 1],
            ['Tumis Kangkung', 1, 'Kangkung tumis bumbu khas', 1],
            ['Tumis Terong', 1, 'Terong tumis bumbu khas', 1],
            
            // Minuman
            ['Es Teh Manis', 2, 'Es teh manis segar', 1],
            ['Es Teh Tawar', 2, 'Es teh tawar segar', 1],
            ['Es Teh Jus', 2, 'Es teh dengan jus', 1],
            ['Es Jeruk', 2, 'Es jeruk segar', 1],
        ];

        foreach ($produkData as $produk) {
            DB::table('tbl_produk')->insert([
                'nama_produk' => $produk[0],
                'id_kategori' => $produk[1],
                'deskripsi' => $produk[2],
                'created_by' => $produk[3],
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Insert varian produk (harga berdasarkan data frontend)
        $varianData = [
            // Makanan
            [1, 'Porsi', 5000, 120],
            [2, 'Porsi', 17000, 12],
            [3, 'Porsi', 16000, 12],
            [4, 'Tusuk', 3000, 30],
            [5, 'Porsi', 10000, 10],
            [6, 'Porsi', 18000, 8],
            [7, 'Porsi', 23000, 8],
            [8, 'Porsi', 2000, 10],
            [9, 'Porsi', 1000, 25],
            [10, 'Porsi', 1000, 25],
            [11, 'Porsi', 8000, 30],
            [12, 'Porsi', 8000, 20],
            [13, 'Porsi', 8000, 10],
            [14, 'Porsi', 5000, 10],
            [15, 'Porsi', 8000, 10],
            [16, 'Porsi', 8000, 10],
            [17, 'Porsi', 10000, 10],
            [18, 'Porsi', 10000, 10],
            
            // Minuman
            [19, 'Gelas', 5000, 50],
            [20, 'Gelas', 2000, 50],
            [21, 'Gelas', 4000, 50],
            [22, 'Gelas', 7000, 10],
        ];

        foreach ($varianData as $varian) {
            DB::table('tbl_varian')->insert([
                'id_produk' => $varian[0],
                'nama_varian' => $varian[1],
                'harga' => $varian[2],
                'stok' => $varian[3],
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
