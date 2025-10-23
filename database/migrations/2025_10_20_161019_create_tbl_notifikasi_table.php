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
        Schema::create('tbl_notifikasi', function (Blueprint $table) {
            $table->id('id_notifikasi');
            $table->unsignedBigInteger('id_bahan');
            $table->decimal('batas_minimum', 10, 2)->default(0);
            $table->enum('jadwal', ['harian', 'mingguan', 'real-time'])->default('real-time');
            $table->boolean('aktif')->default(true);
            $table->timestamp('terakhir_kirim')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('id_bahan')->references('id_bahan')->on('tbl_bahan');
            $table->foreign('created_by')->references('id_user')->on('tbl_user');
            
            // Index untuk optimasi
            $table->index('aktif');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_notifikasi');
    }
};
