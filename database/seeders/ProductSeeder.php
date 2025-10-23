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

        echo "Product data inserted successfully\n";
    }
}
