<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tbl_konversi_produk', function (Blueprint $table) {
            $table->id('id_konversi');
            $table->unsignedBigInteger('id_produk_hasil'); // Produk yang dihasilkan (Paha Ayam)
            $table->unsignedBigInteger('id_bahan_baku'); // Bahan baku yang digunakan (Ayam Utuh)
            $table->decimal('jumlah_bahan_digunakan', 10, 2); // Berapa bahan yang digunakan
            $table->decimal('jumlah_produk_dihasilkan', 10, 2); // Berapa produk yang dihasilkan
            $table->string('unit_bahan', 20); // Unit bahan (ekor, kg, dll)
            $table->string('unit_produk', 20); // Unit produk (potong, porsi, dll)
            $table->text('deskripsi')->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('id_produk_hasil')->references('id_produk')->on('tbl_produk');
            $table->foreign('id_bahan_baku')->references('id_bahan')->on('tbl_bahan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_konversi_produk');
    }
};
