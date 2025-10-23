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
        Schema::create('tbl_user', function (Blueprint $table) {
            $table->id('id_user');
            $table->string('nama_user', 100);
            $table->string('username', 50)->unique();
            $table->string('password', 255);
            $table->enum('level', ['admin', 'kasir'])->default('kasir');
            $table->string('foto_profil', 255)->nullable();
            $table->enum('tema', ['terang', 'gelap'])->default('terang');
            $table->string('bahasa', 20)->default('id');
            $table->boolean('notif_aktif')->default(true);
            $table->timestamps();
            
            // Index untuk optimasi
            $table->index('username');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_user');
    }
};
