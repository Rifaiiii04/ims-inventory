<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VariantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing variants
        DB::table('tbl_varian')->delete();

        // Insert varian produk (jenis masakan/porsi, harga ada di produk)
        $varianData = [
            // Ayam - Multiple varian
            [1, 'Goreng', 12],
            [1, 'Bakar', 8],
            [1, 'Porsi', 15],
            
            // Nasi
            [2, 'Porsi', 120],
            
            // Lele - Multiple varian
            [3, 'Goreng', 10],
            [3, 'Bakar', 5],
            
            // Nila - Multiple varian
            [4, 'Goreng', 8],
            [4, 'Cobek', 6],
            
            // Tusukan (Sate-satean)
            [5, 'Tusuk', 30],
            
            // Kepala Ayam
            [6, 'Porsi', 10],
            
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
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        echo "Varian data inserted successfully\n";
    }
}
