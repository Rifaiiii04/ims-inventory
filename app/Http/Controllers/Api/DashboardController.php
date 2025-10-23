<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblProduk;
use App\Models\TblBahan;
use App\Models\TblTransaksi;
use App\Models\TblTransaksiDetail;
use App\Models\TblVarian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard summary data
     */
    public function getSummary(Request $request)
    {
        try {
            // Total products
            $totalProducts = TblProduk::count();
            
            // Low stock products
            $lowStockProducts = TblBahan::whereColumn('stok_bahan', '<', 'min_stok')->count();
            
            // Today's sales
            $todaySales = TblTransaksi::whereDate('tanggal_waktu', Carbon::today())
                ->sum('total_transaksi') ?? 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => [
                        'total_products' => $totalProducts,
                        'low_stock' => $lowStockProducts,
                        'today_sales' => (float)$todaySales,
                        'top_products' => []
                    ],
                    'recent_transactions' => [],
                    'chart_data' => []
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get low stock alerts
     */
    public function getLowStockAlerts(Request $request)
    {
        try {
            $lowStockItems = TblBahan::select(
                'tbl_bahan.*',
                'tbl_kategori.nama_kategori'
            )
            ->join('tbl_kategori', 'tbl_bahan.id_kategori', '=', 'tbl_kategori.id_kategori')
            ->whereColumn('tbl_bahan.stok_bahan', '<', 'tbl_bahan.min_stok')
            ->orderBy('tbl_bahan.stok_bahan', 'asc')
            ->get();

            return response()->json([
                'success' => true,
                'data' => $lowStockItems->map(function($item) {
                    return [
                        'id' => $item->id_bahan,
                        'name' => $item->nama_bahan,
                        'category' => $item->nama_kategori,
                        'current_stock' => (float)$item->stok_bahan,
                        'min_stock' => (float)$item->min_stok,
                        'unit' => $item->satuan,
                        'buy_price' => (float)$item->harga_beli
                    ];
                })
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data low stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
