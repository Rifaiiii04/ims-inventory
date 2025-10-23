<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblProduk;
use App\Models\TblBahan;
use App\Models\TblVarian;
use App\Models\TblTransaksi;
use App\Models\TblTransaksiDetail;
use App\Models\TblStockHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Get inventory report data
     */
    public function getInventoryReport(Request $request)
    {
        try {
            // Get filter parameters
            $productFilter = $request->get('product', '');
            $categoryFilter = $request->get('category', '');
            $dateFilter = $request->get('date', '');

            // Base query for products with variants
            $productsQuery = TblProduk::with([
                'kategori:id_kategori,nama_kategori',
                'varian:id_varian,id_produk,nama_varian,stok_varian'
            ]);

            // Apply filters
            if ($productFilter) {
                $productsQuery->where('nama_produk', 'like', "%{$productFilter}%");
            }

            if ($categoryFilter) {
                $productsQuery->where('id_kategori', $categoryFilter);
            }

            $products = $productsQuery->orderBy('nama_produk', 'asc')->get();

            // Calculate summary data
            $totalProducts = $products->count();
            $totalStock = 0;
            $totalBuyValue = 0;
            $totalSellValue = 0;

            $inventoryItems = [];

            foreach ($products as $product) {
                // Calculate total stock from variants
                $productStock = $product->varian->sum('stok_varian');
                $totalStock += $productStock;

                // Get product price
                $productPrice = $product->harga ?? 0;
                $totalSellValue += $productStock * $productPrice;

                // Calculate buy value (simplified - using 60% of sell price as buy price)
                $buyPrice = $productPrice * 0.6;
                $totalBuyValue += $productStock * $buyPrice;

                // Get stock history for this product
                $stockHistory = $this->getStockHistoryForProduct($product->id_produk, $dateFilter);

                // Determine stock status
                $status = $this->getStockStatus($productStock, $product->varian->count());

                $inventoryItems[] = [
                    'id' => $product->id_produk,
                    'name' => $product->nama_produk,
                    'category' => $product->kategori->nama_kategori ?? 'Tidak ada kategori',
                    'buy_price' => $buyPrice,
                    'sell_price' => $productPrice,
                    'unit' => 'porsi', // Default unit
                    'initial_stock' => $stockHistory['initial_stock'],
                    'stock_in' => $stockHistory['stock_in'],
                    'final_stock' => $productStock,
                    'status' => $status,
                    'variant_count' => $product->varian->count()
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => [
                        'total_products' => $totalProducts,
                        'total_stock' => $totalStock,
                        'total_buy_value' => (float)$totalBuyValue,
                        'total_sell_value' => (float)$totalSellValue,
                        'low_stock_items' => collect($inventoryItems)->where('status', 'Kritis')->count()
                    ],
                    'items' => $inventoryItems
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data laporan inventory',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get stock history for a product
     */
    private function getStockHistoryForProduct($productId, $dateFilter = '')
    {
        // Get stock history from tbl_stock_history for this product
        $historyQuery = TblStockHistory::where('id_bahan', $productId);

        if ($dateFilter) {
            $date = Carbon::createFromFormat('d/m/Y', $dateFilter);
            $historyQuery->whereDate('created_at', $date);
        }

        $history = $historyQuery->orderBy('created_at', 'asc')->get();

        $initialStock = 0;
        $stockIn = 0;

        foreach ($history as $record) {
            if ($record->action === 'create') {
                $initialStock += $record->quantity_change;
            } elseif ($record->action === 'update' && $record->quantity_change > 0) {
                $stockIn += $record->quantity_change;
            }
        }

        return [
            'initial_stock' => $initialStock,
            'stock_in' => $stockIn
        ];
    }

    /**
     * Determine stock status based on current stock
     */
    private function getStockStatus($currentStock, $variantCount)
    {
        if ($currentStock === 0) {
            return 'Kritis';
        } elseif ($currentStock < ($variantCount * 5)) { // Less than 5 per variant
            return 'Perhatian';
        } else {
            return 'Aman';
        }
    }

    /**
     * Get categories for filter
     */
    public function getCategories()
    {
        try {
            $categories = DB::table('tbl_kategori')
                ->select('id_kategori', 'nama_kategori')
                ->orderBy('nama_kategori', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $categories
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data kategori',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export inventory report to Excel
     */
    public function exportExcel(Request $request)
    {
        // TODO: Implement Excel export
        return response()->json([
            'success' => false,
            'message' => 'Fitur export Excel belum tersedia'
        ], 501);
    }

    /**
     * Export inventory report to PDF
     */
    public function exportPDF(Request $request)
    {
        // TODO: Implement PDF export
        return response()->json([
            'success' => false,
            'message' => 'Fitur export PDF belum tersedia'
        ], 501);
    }
}