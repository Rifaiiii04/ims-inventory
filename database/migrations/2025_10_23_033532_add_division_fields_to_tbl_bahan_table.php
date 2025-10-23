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
        Schema::table('tbl_bahan', function (Blueprint $table) {
            $table->boolean('is_divisible')->default(false)->after('stok_bahan');
            $table->integer('max_divisions')->nullable()->after('is_divisible');
            $table->text('division_description')->nullable()->after('max_divisions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_bahan', function (Blueprint $table) {
            $table->dropColumn(['is_divisible', 'max_divisions', 'division_description']);
        });
    }
};
