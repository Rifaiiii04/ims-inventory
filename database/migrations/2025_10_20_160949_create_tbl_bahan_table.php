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
        Schema::create('tbl_bahan', function (Blueprint $table) {
            $table->id('id_bahan');
            $table->string('nama_bahan', 100);
            $table->unsignedBigInteger('id_kategori');
            $table->decimal('harga_beli', 10, 2)->default(0.00);
            $table->decimal('stok_bahan', 10, 2)->default(0);
            $table->string('satuan', 20);
            $table->decimal('min_stok', 10, 2)->default(0);
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('id_kategori')->references('id_kategori')->on('tbl_kategori');
            $table->foreign('updated_by')->references('id_user')->on('tbl_user');
            
            // Index untuk optimasi
            $table->index('stok_bahan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_bahan');
    }
};
