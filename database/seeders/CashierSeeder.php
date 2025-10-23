<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CashierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing cashiers (level = 'kasir')
        DB::table('tbl_user')->where('level', 'kasir')->delete();

        // Insert sample cashiers
        $cashiers = [
            [
                'username' => 'kasir1',
                'nama_user' => 'Siti Nurhaliza',
                'email' => 'siti@angkringan.com',
                'password' => Hash::make('kasir123'),
                'level' => 'kasir',
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'kasir2',
                'nama_user' => 'Ahmad Wijaya',
                'email' => 'ahmad@angkringan.com',
                'password' => Hash::make('kasir123'),
                'level' => 'kasir',
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'kasir3',
                'nama_user' => 'Dewi Sartika',
                'email' => 'dewi@angkringan.com',
                'password' => Hash::make('kasir123'),
                'level' => 'kasir',
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'kasir4',
                'nama_user' => 'Budi Santoso',
                'email' => 'budi@angkringan.com',
                'password' => Hash::make('kasir123'),
                'level' => 'kasir',
                'status' => 'nonaktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'kasir5',
                'nama_user' => 'Maya Sari',
                'email' => 'maya@angkringan.com',
                'password' => Hash::make('kasir123'),
                'level' => 'kasir',
                'status' => 'aktif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($cashiers as $cashier) {
            DB::table('tbl_user')->insert($cashier);
        }

        echo "Cashier data inserted successfully\n";
    }
}