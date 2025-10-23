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
        Schema::create('tbl_stock_history', function (Blueprint $table) {
            $table->id('id_history');
            $table->unsignedBigInteger('id_bahan');
            $table->enum('action', ['create', 'update', 'delete', 'stock_in', 'stock_out']);
            $table->json('old_data')->nullable(); // Data sebelum perubahan
            $table->json('new_data')->nullable(); // Data setelah perubahan
            $table->text('description')->nullable(); // Deskripsi perubahan
            $table->unsignedBigInteger('changed_by'); // User yang melakukan perubahan
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            $table->foreign('id_bahan')->references('id_bahan')->on('tbl_bahan')->onDelete('cascade');
            $table->foreign('changed_by')->references('id_user')->on('tbl_user')->onDelete('cascade');
            
            $table->index(['id_bahan', 'created_at']);
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_stock_history');
    }
};
