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
                'stok_varian' => $varian[3],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        echo "Varian data inserted successfully\n";
    }
}
