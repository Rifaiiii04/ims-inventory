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
use Illuminate\Support\Facades\Log;
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

            // Get top products from last 30 days
            $topProducts = $this->getTopProducts(30);

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => [
                        'total_products' => $totalProducts,
                        'low_stock' => $lowStockProducts,
                        'today_sales' => (float)$todaySales,
                        'top_products' => $topProducts
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
     * Get top selling products
     */
    private function getTopProducts($days = 30)
    {
        try {
            $startDate = Carbon::now()->subDays($days);

            // Get transactions from last N days with details
            $transactions = TblTransaksi::where('tanggal_waktu', '>=', $startDate)
                ->with(['details' => function($query) {
                    $query->with(['produk']);
                }])
                ->get();

            $productSales = [];

            foreach ($transactions as $transaction) {
                foreach ($transaction->details as $detail) {
                    $productId = $detail->id_produk ?? null;
                    $productName = $detail->produk->nama_produk ?? 'Unknown';
                    
                    if (!$productId) continue;

                    if (!isset($productSales[$productId])) {
                        $productSales[$productId] = [
                            'id' => $productId,
                            'name' => $productName,
                            'sold' => 0,
                            'revenue' => 0
                        ];
                    }

                    // Add quantity sold
                    $productSales[$productId]['sold'] += (float)($detail->jumlah ?? 0);
                    
                    // Add revenue
                    $detailRevenue = (float)($detail->total_harga ?? 0);
                    if ($detailRevenue == 0) {
                        $detailRevenue = (float)($detail->harga_satuan ?? 0) * (float)($detail->jumlah ?? 0);
                    }
                    $productSales[$productId]['revenue'] += $detailRevenue;
                }
            }

            // Sort by quantity sold (or revenue) descending
            usort($productSales, function($a, $b) {
                // Sort by quantity sold first, then by revenue
                if ($b['sold'] != $a['sold']) {
                    return $b['sold'] <=> $a['sold'];
                }
                return $b['revenue'] <=> $a['revenue'];
            });

            // Return top 5 products
            return array_slice($productSales, 0, 5);

        } catch (\Exception $e) {
            Log::error('Error getting top products: ' . $e->getMessage());
            return [];
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
