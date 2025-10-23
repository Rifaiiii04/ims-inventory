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
        Schema::create('tbl_komposisi', function (Blueprint $table) {
            $table->id('id_komposisi');
            $table->unsignedBigInteger('id_varian');
            $table->unsignedBigInteger('id_bahan');
            $table->decimal('jumlah_per_porsi', 10, 2)->default(0);
            $table->string('satuan', 20);
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('id_varian')->references('id_varian')->on('tbl_varian');
            $table->foreign('id_bahan')->references('id_bahan')->on('tbl_bahan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_komposisi');
    }
};
