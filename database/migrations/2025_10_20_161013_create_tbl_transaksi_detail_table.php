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
        Schema::create('tbl_transaksi_detail', function (Blueprint $table) {
            $table->id('id_detail');
            $table->unsignedBigInteger('id_transaksi');
            $table->unsignedBigInteger('id_produk');
            $table->unsignedBigInteger('id_varian');
            $table->decimal('jumlah', 10, 2)->default(0);
            $table->decimal('harga_satuan', 10, 2)->default(0.00);
            $table->decimal('total_harga', 10, 2)->default(0.00);
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('id_transaksi')->references('id_transaksi')->on('tbl_transaksi');
            $table->foreign('id_produk')->references('id_produk')->on('tbl_produk');
            $table->foreign('id_varian')->references('id_varian')->on('tbl_varian');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_transaksi_detail');
    }
};
