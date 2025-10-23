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
        Schema::table('tbl_bagian_tubuh', function (Blueprint $table) {
            $table->decimal('persentase_penggunaan', 5, 2)->default(0.00)->after('jumlah_per_ekor');
            $table->decimal('harga_per_potong', 10, 2)->default(0.00)->after('persentase_penggunaan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_bagian_tubuh', function (Blueprint $table) {
            $table->dropColumn(['persentase_penggunaan', 'harga_per_potong']);
        });
    }
};
