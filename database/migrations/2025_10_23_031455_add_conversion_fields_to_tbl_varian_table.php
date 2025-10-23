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
        Schema::table('tbl_varian', function (Blueprint $table) {
            $table->string('unit', 20)->default('porsi')->after('stok_varian');
            $table->decimal('conversion_rate', 8, 2)->default(1.00)->after('unit');
            $table->string('conversion_unit', 20)->default('ekor')->after('conversion_rate');
            $table->text('description')->nullable()->after('conversion_unit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_varian', function (Blueprint $table) {
            $table->dropColumn(['unit', 'conversion_rate', 'conversion_unit', 'description']);
        });
    }
};
