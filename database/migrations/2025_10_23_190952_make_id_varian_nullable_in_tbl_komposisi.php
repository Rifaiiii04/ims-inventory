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
        Schema::table('tbl_komposisi', function (Blueprint $table) {
            $table->unsignedBigInteger('id_varian')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_komposisi', function (Blueprint $table) {
            $table->unsignedBigInteger('id_varian')->nullable(false)->change();
        });
    }
};
