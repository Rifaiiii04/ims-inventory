<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Insert komposisi contoh (menggunakan ID varian dan bahan yang ada)
        $compositionData = [
            // Komposisi untuk varian makanan (hanya menggunakan bahan ID 1 dan 2)
            [2, 1, 0.5], // Nasi - Beras
            [3, 1, 0.3], // Ayam Bakar - Beras
            [3, 2, 0.8], // Ayam Bakar - Ayam Utuh
            [4, 1, 0.3], // Ayam Goreng - Beras
            [4, 2, 0.8], // Ayam Goreng - Ayam Utuh
            [5, 1, 0.3], // Tusukan - Beras
            [5, 2, 0.2], // Tusukan - Ayam Utuh
            [6, 1, 0.3], // Lele Goreng - Beras
            [6, 2, 0.6], // Lele Goreng - Ayam Utuh
            [7, 1, 0.3], // Nila Goreng - Beras
            [7, 2, 0.6], // Nila Goreng - Ayam Utuh
            [8, 1, 0.3], // Cobek Nila - Beras
            [8, 2, 0.6], // Cobek Nila - Ayam Utuh
            [9, 1, 0.3], // Kepala Ayam - Beras
            [9, 2, 0.4], // Kepala Ayam - Ayam Utuh
            [10, 1, 0.3], // Tempe Goreng - Beras
            [10, 2, 0.3], // Tempe Goreng - Ayam Utuh
            [11, 1, 0.3], // Tahu Goreng - Beras
            [11, 2, 0.3], // Tahu Goreng - Ayam Utuh
            [12, 1, 0.3], // Cumi Goreng - Beras
            [12, 2, 0.4], // Cumi Goreng - Ayam Utuh
            [13, 1, 0.3], // Pencok - Beras
            [13, 2, 0.1], // Pencok - Ayam Utuh
            [14, 1, 0.3], // Receuh Timun - Beras
            [14, 2, 0.2], // Receuh Timun - Ayam Utuh
            [15, 1, 0.3], // Asin Japuh - Beras
            [15, 2, 0.2], // Asin Japuh - Ayam Utuh
            [16, 1, 0.3], // Asin Peda - Beras
            [16, 2, 0.2], // Asin Peda - Ayam Utuh
            [17, 1, 0.3], // Asin Pindang - Beras
            [17, 2, 0.2], // Asin Pindang - Ayam Utuh
            [18, 1, 0.3], // Tumis Kangkung - Beras
            [18, 2, 0.3], // Tumis Kangkung - Ayam Utuh
            [19, 1, 0.3], // Tumis Terong - Beras
            [19, 2, 0.3], // Tumis Terong - Ayam Utuh
            
            // Komposisi untuk varian minuman
            [20, 1, 0.01], // Es Teh Manis - Beras
            [20, 2, 0.1], // Es Teh Manis - Ayam Utuh
            [23, 1, 0.01], // Es Teh Tawar - Beras
            [23, 2, 0.1], // Es Teh Tawar - Ayam Utuh
            [24, 1, 0.01], // Es Teh Jus - Beras
            [24, 2, 0.2], // Es Teh Jus - Ayam Utuh
        ];

        foreach ($compositionData as $composition) {
            DB::table('tbl_komposisi')->insert([
                'id_varian' => $composition[0],
                'id_bahan' => $composition[1],
                'jumlah_per_porsi' => $composition[2],
                'satuan' => 'kg',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        echo "Composition data inserted successfully\n";
    }
}
