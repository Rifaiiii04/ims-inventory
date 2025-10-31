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
        Schema::table('tbl_transaksi_detail', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['id_varian']);
            
            // Make id_varian nullable to support direct products (products without variants)
            $table->unsignedBigInteger('id_varian')->nullable()->change();
            
            // Re-create foreign key with nullable support
            $table->foreign('id_varian')
                  ->references('id_varian')
                  ->on('tbl_varian')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_transaksi_detail', function (Blueprint $table) {
            // Drop foreign key
            $table->dropForeign(['id_varian']);
            
            // Make id_varian NOT NULL again
            $table->unsignedBigInteger('id_varian')->nullable(false)->change();
            
            // Re-create foreign key without nullable
            $table->foreign('id_varian')
                  ->references('id_varian')
                  ->on('tbl_varian');
        });
    }
};
