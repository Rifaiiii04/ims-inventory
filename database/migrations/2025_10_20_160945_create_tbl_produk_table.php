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
        Schema::create('tbl_produk', function (Blueprint $table) {
            $table->id('id_produk');
            $table->string('nama_produk', 100);
            $table->unsignedBigInteger('id_kategori');
            $table->text('deskripsi')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('id_kategori')->references('id_kategori')->on('tbl_kategori');
            $table->foreign('created_by')->references('id_user')->on('tbl_user');
            
            // Index untuk optimasi
            $table->index('id_kategori');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_produk');
    }
};
