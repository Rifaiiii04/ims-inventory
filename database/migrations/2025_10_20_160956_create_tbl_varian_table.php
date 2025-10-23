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
        Schema::create('tbl_varian', function (Blueprint $table) {
            $table->id('id_varian');
            $table->unsignedBigInteger('id_produk');
            $table->string('nama_varian', 100);
            $table->decimal('harga', 10, 2)->default(0.00);
            $table->decimal('stok_varian', 10, 2)->default(0);
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('id_produk')->references('id_produk')->on('tbl_produk');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_varian');
    }
};
