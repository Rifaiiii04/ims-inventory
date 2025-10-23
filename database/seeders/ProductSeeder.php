<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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

        echo "Product data inserted successfully\n";
    }
}
