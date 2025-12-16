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
        Schema::create('tbl_expired_predictions', function (Blueprint $table) {
            $table->id('id_prediksi');
            $table->unsignedBigInteger('id_bahan');
            $table->date('tanggal_prediksi_expired')->nullable();
            $table->text('alasan_prediksi')->nullable();
            $table->decimal('confidence_score', 5, 2)->nullable()->comment('Skor kepercayaan prediksi (0-100)');
            $table->text('data_bahan')->nullable()->comment('JSON data bahan yang digunakan untuk prediksi');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('id_bahan')->references('id_bahan')->on('tbl_bahan')->onDelete('cascade');
            $table->foreign('created_by')->references('id_user')->on('tbl_user')->onDelete('set null');
            
            // Index untuk optimasi
            $table->index('id_bahan');
            $table->index('tanggal_prediksi_expired');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_expired_predictions');
    }
};
