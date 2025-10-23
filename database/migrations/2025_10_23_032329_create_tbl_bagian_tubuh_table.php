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
        Schema::create('tbl_bagian_tubuh', function (Blueprint $table) {
            $table->id('id_bagian');
            $table->unsignedBigInteger('id_produk');
            $table->string('nama_bagian', 100);
            $table->decimal('jumlah_per_ekor', 8, 2);
            $table->string('unit', 20)->default('potong');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();
            
            // Foreign key
            $table->foreign('id_produk')->references('id_produk')->on('tbl_produk');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_bagian_tubuh');
    }
};
