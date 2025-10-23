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
        Schema::create('tbl_transaksi', function (Blueprint $table) {
            $table->id('id_transaksi');
            $table->dateTime('tanggal_waktu')->useCurrent();
            $table->decimal('total_transaksi', 10, 2)->default(0.00);
            $table->enum('metode_bayar', ['cash', 'qris', 'lainnya'])->default('cash');
            $table->string('nama_pelanggan', 100)->nullable();
            $table->text('catatan')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('created_by')->references('id_user')->on('tbl_user');
            
            // Index untuk optimasi
            $table->index('tanggal_waktu');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_transaksi');
    }
};
