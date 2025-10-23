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
        Schema::create('tbl_notifikasi_log', function (Blueprint $table) {
            $table->id('id_log');
            $table->unsignedBigInteger('id_notifikasi');
            $table->timestamp('waktu_kirim')->useCurrent();
            $table->enum('status', ['terkirim', 'gagal'])->default('terkirim');
            $table->text('pesan')->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('id_notifikasi')->references('id_notifikasi')->on('tbl_notifikasi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_notifikasi_log');
    }
};
