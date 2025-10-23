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
     * Get sales report data
     */
    public function getSalesReport(Request $request)
    {
        try {
            // Get filter parameters
            $productFilter = $request->get('product', '');
            $categoryFilter = $request->get('category', '');
            $dateFilter = $request->get('date', '');
            $paymentFilter = $request->get('payment', '');
            $period = $request->get('period', 'daily'); // daily, weekly, monthly

            // Base query for transactions
            $transactionsQuery = TblTransaksi::with([
                'details' => function($query) {
                    $query->with(['produk', 'varian']);
                }
            ]);

            // Apply date filter
            if ($dateFilter) {
                $transactionsQuery->whereDate('tanggal_waktu', $dateFilter);
            } else {
                // Default to last 30 days
                $transactionsQuery->where('tanggal_waktu', '>=', now()->subDays(30));
            }

            $transactions = $transactionsQuery->orderBy('tanggal_waktu', 'desc')->get();

            // Calculate summary data
            $totalTransactions = $transactions->count();
            $totalRevenue = $transactions->sum('total_harga');
            $totalProductsSold = $transactions->sum(function($transaction) {
                return $transaction->details->sum('jumlah');
            });

            // Get top product
            $productSales = [];
            foreach ($transactions as $transaction) {
                foreach ($transaction->details as $detail) {
                    $productName = $detail->produk->nama_produk ?? 'Unknown';
                    if (!isset($productSales[$productName])) {
                        $productSales[$productName] = 0;
                    }
                    $productSales[$productName] += $detail->jumlah;
                }
            }
            arsort($productSales);
            $topProduct = array_key_first($productSales) ?? 'Tidak ada data';

            // Group data by period for charts
            $chartData = $this->groupDataByPeriod($transactions, $period);

            // Get product performance data
            $productPerformance = $this->getProductPerformance($transactions);

            // Get category performance data
            $categoryPerformance = $this->getCategoryPerformance($transactions);

            // Get payment method data
            $paymentMethods = $this->getPaymentMethodData($transactions);

            // Get recent transactions
            $recentTransactions = $transactions->take(10)->map(function($transaction) {
                return [
                    'id' => $transaction->id_transaksi,
                    'date' => $transaction->tanggal_waktu->format('Y-m-d'),
                    'time' => $transaction->tanggal_waktu->format('H:i'),
                    'total' => $transaction->total_harga,
                    'payment_method' => $transaction->metode_pembayaran ?? 'Tunai',
                    'cashier' => 'Admin', // You can add cashier field later
                    'items' => $transaction->details->map(function($detail) {
                        return [
                            'product' => $detail->produk->nama_produk ?? 'Unknown',
                            'variant' => $detail->varian->nama_varian ?? 'Default',
                            'quantity' => $detail->jumlah,
                            'unit_price' => $detail->harga_satuan,
                            'total_price' => $detail->total_harga
                        ];
                    })
                ];
            });

            $reportData = [
                'summary' => [
                    'total_transactions' => $totalTransactions,
                    'total_revenue' => $totalRevenue,
                    'total_products_sold' => $totalProductsSold,
                    'top_product' => $topProduct,
                    'average_transaction_value' => $totalTransactions > 0 ? round($totalRevenue / $totalTransactions) : 0
                ],
                'chart_data' => $chartData,
                'product_performance' => $productPerformance,
                'category_performance' => $categoryPerformance,
                'payment_methods' => $paymentMethods,
                'recent_transactions' => $recentTransactions
            ];

            return response()->json([
                'success' => true,
                'data' => $reportData
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data laporan penjualan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

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

            // Ambil komposisi langsung ke produk (tanpa varian) dengan stok bahan
            $directCompositions = DB::table('tbl_komposisi')
                ->join('tbl_bahan', 'tbl_komposisi.id_bahan', '=', 'tbl_bahan.id_bahan')
                ->whereNull('tbl_komposisi.id_varian')
                ->select(
                    'tbl_komposisi.id_produk', 
                    'tbl_bahan.nama_bahan', 
                    'tbl_komposisi.jumlah_per_porsi',
                    'tbl_bahan.stok_bahan',
                    'tbl_bahan.harga_beli'
                )
                ->get()
                ->groupBy('id_produk');

            // Calculate summary data
            $totalProducts = $products->count();
            $totalStock = 0;
            $totalBuyValue = 0;
            $totalSellValue = 0;

            $inventoryItems = [];

            foreach ($products as $product) {
                // Calculate total stock from variants
                $productStock = $product->varian->sum('stok_varian');
                
                // Hitung stok dari komposisi langsung ke produk (tanpa varian)
                if (isset($directCompositions[$product->id_produk])) {
                    $minStock = PHP_INT_MAX;
                    foreach ($directCompositions[$product->id_produk] as $comp) {
                        if ($comp->jumlah_per_porsi > 0) {
                            $canProduce = floor($comp->stok_bahan / $comp->jumlah_per_porsi);
                            $minStock = min($minStock, $canProduce);
                        }
                    }
                    // Jika ada komposisi langsung, gunakan stok yang dihitung dari komposisi
                    if ($minStock !== PHP_INT_MAX) {
                        $productStock = $minStock;
                    }
                }
                
                $totalStock += $productStock;

                // Get product price
                $productPrice = $product->harga ?? 0;
                $totalSellValue += $productStock * $productPrice;

                // Calculate buy value from composition or simplified calculation
                $buyPrice = $productPrice * 0.6; // Default 60% of sell price
                
                // If product has direct composition, calculate buy price from ingredients
                if (isset($directCompositions[$product->id_produk])) {
                    $totalIngredientCost = 0;
                    foreach ($directCompositions[$product->id_produk] as $comp) {
                        $ingredientCost = $comp->harga_beli * $comp->jumlah_per_porsi;
                        $totalIngredientCost += $ingredientCost;
                    }
                    $buyPrice = $totalIngredientCost;
                }
                
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

    /**
     * Group transaction data by period for charts
     */
    private function groupDataByPeriod($transactions, $period)
    {
        $grouped = [];
        
        foreach ($transactions as $transaction) {
            $date = Carbon::parse($transaction->tanggal_waktu);
            
            switch ($period) {
                case 'daily':
                    $key = $date->format('Y-m-d');
                    break;
                case 'weekly':
                    $key = $date->format('Y-W');
                    break;
                case 'monthly':
                    $key = $date->format('Y-m');
                    break;
                default:
                    $key = $date->format('Y-m-d');
            }
            
            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'period' => $key,
                    'revenue' => 0,
                    'transactions' => 0,
                    'products_sold' => 0
                ];
            }
            
            $grouped[$key]['revenue'] += $transaction->total_harga;
            $grouped[$key]['transactions'] += 1;
            $grouped[$key]['products_sold'] += $transaction->details->sum('jumlah');
        }
        
        return array_values($grouped);
    }

    /**
     * Get product performance data
     */
    private function getProductPerformance($transactions)
    {
        $productSales = [];
        
        foreach ($transactions as $transaction) {
            foreach ($transaction->details as $detail) {
                $productName = $detail->produk->nama_produk ?? 'Unknown';
                if (!isset($productSales[$productName])) {
                    $productSales[$productName] = [
                        'name' => $productName,
                        'quantity_sold' => 0,
                        'revenue' => 0
                    ];
                }
                $productSales[$productName]['quantity_sold'] += $detail->jumlah;
                $productSales[$productName]['revenue'] += $detail->total_harga;
            }
        }
        
        // Sort by revenue descending
        uasort($productSales, function($a, $b) {
            return $b['revenue'] <=> $a['revenue'];
        });
        
        return array_values($productSales);
    }

    /**
     * Get category performance data
     */
    private function getCategoryPerformance($transactions)
    {
        $categorySales = [];
        
        foreach ($transactions as $transaction) {
            foreach ($transaction->details as $detail) {
                $categoryName = $detail->produk->kategori->nama_kategori ?? 'Unknown';
                if (!isset($categorySales[$categoryName])) {
                    $categorySales[$categoryName] = [
                        'name' => $categoryName,
                        'quantity_sold' => 0,
                        'revenue' => 0
                    ];
                }
                $categorySales[$categoryName]['quantity_sold'] += $detail->jumlah;
                $categorySales[$categoryName]['revenue'] += $detail->total_harga;
            }
        }
        
        // Sort by revenue descending
        uasort($categorySales, function($a, $b) {
            return $b['revenue'] <=> $a['revenue'];
        });
        
        return array_values($categorySales);
    }

    /**
     * Get payment method data
     */
    private function getPaymentMethodData($transactions)
    {
        $paymentMethods = [];
        
        foreach ($transactions as $transaction) {
            $method = $transaction->metode_pembayaran ?? 'Tunai';
            if (!isset($paymentMethods[$method])) {
                $paymentMethods[$method] = [
                    'name' => $method,
                    'count' => 0,
                    'revenue' => 0
                ];
            }
            $paymentMethods[$method]['count'] += 1;
            $paymentMethods[$method]['revenue'] += $transaction->total_harga;
        }
        
        return array_values($paymentMethods);
    }
}