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
     * Map payment method from database value to display name
     */
    private function mapPaymentMethod($method)
    {
        $methodMap = [
            'cash' => 'Tunai',
            'qris' => 'QRIS',
            'lainnya' => 'Transfer',
            'tunai' => 'Tunai',
            'transfer' => 'Transfer'
        ];
        
        return $methodMap[strtolower($method ?? 'cash')] ?? 'Tunai';
    }

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

            // Base query for transactions - fresh from database without cache
            $transactionsQuery = TblTransaksi::withoutGlobalScopes()
                ->with([
                    'details' => function($query) {
                        $query->with(['produk.kategori', 'varian']);
                    }
                ]);

            // Apply date filter
            if ($dateFilter) {
                $transactionsQuery->whereDate('tanggal_waktu', $dateFilter);
            } else {
                // Default to last 30 days for daily, 12 weeks for weekly, 12 months for monthly
                switch ($period) {
                    case 'weekly':
                        $transactionsQuery->where('tanggal_waktu', '>=', now()->subWeeks(12));
                        break;
                    case 'monthly':
                        $transactionsQuery->where('tanggal_waktu', '>=', now()->subMonths(12));
                        break;
                    default: // daily
                        $transactionsQuery->where('tanggal_waktu', '>=', now()->subDays(30));
                        break;
                }
            }

            // Apply product filter
            if ($productFilter) {
                $transactionsQuery->whereHas('details.produk', function($query) use ($productFilter) {
                    $query->where('id_produk', $productFilter);
                });
            }

            // Apply category filter
            if ($categoryFilter) {
                $transactionsQuery->whereHas('details.produk', function($query) use ($categoryFilter) {
                    $query->where('id_kategori', $categoryFilter);
                });
            }

            // Apply payment method filter
            if ($paymentFilter) {
                // Map filter value to database value
                $paymentFilterMap = [
                    'Tunai' => 'cash',
                    'QRIS' => 'qris',
                    'Transfer' => 'lainnya',
                    'tunai' => 'cash',
                    'qris' => 'qris',
                    'transfer' => 'lainnya'
                ];
                $dbPaymentMethod = $paymentFilterMap[$paymentFilter] ?? $paymentFilter;
                $transactionsQuery->where('metode_bayar', $dbPaymentMethod);
            }

            $transactions = $transactionsQuery->orderBy('tanggal_waktu', 'desc')->get();

            // Calculate summary data from fresh database queries
            $totalTransactions = $transactions->count();
            
            // Calculate total revenue from transaction total_transaksi
            $totalRevenue = $transactions->sum(function($transaction) {
                return (float)($transaction->total_transaksi ?? 0);
            });
            
            // Alternative: calculate from details if total_transaksi is 0
            if ($totalRevenue == 0) {
                $totalRevenue = $transactions->sum(function($transaction) {
                    return $transaction->details->sum(function($detail) {
                        return (float)($detail->total_harga ?? ($detail->harga_satuan * $detail->jumlah));
                    });
                });
            }
            
            // Calculate total products sold
            $totalProductsSold = $transactions->sum(function($transaction) {
                return $transaction->details->sum(function($detail) {
                    return (int)($detail->jumlah ?? 0);
                });
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

            // Get recent transactions with correct total calculation
            $recentTransactions = $transactions->take(10)->map(function($transaction) {
                // Calculate total from transaction or sum from details
                $transactionTotal = (float)($transaction->total_transaksi ?? 0);
                if ($transactionTotal == 0) {
                    $transactionTotal = $transaction->details->sum(function($detail) {
                        return (float)($detail->total_harga ?? ($detail->harga_satuan * $detail->jumlah));
                    });
                }
                
                return [
                    'id' => $transaction->id_transaksi,
                    'date' => $transaction->tanggal_waktu->format('Y-m-d'),
                    'time' => $transaction->tanggal_waktu->format('H:i'),
                    'total' => $transactionTotal,
                    'payment_method' => $this->mapPaymentMethod($transaction->metode_bayar ?? 'cash'),
                    'cashier' => 'Admin', // You can add cashier field later
                    'items' => $transaction->details->map(function($detail) {
                        $detailTotal = (float)($detail->total_harga ?? ($detail->harga_satuan * $detail->jumlah));
                        return [
                            'product' => $detail->produk->nama_produk ?? 'Unknown',
                            'variant' => $detail->varian->nama_varian ?? 'Default',
                            'category' => $detail->produk->kategori->nama_kategori ?? '-',
                            'category_id' => $detail->produk->kategori->id_kategori ?? null,
                            'quantity' => (int)($detail->jumlah ?? 0),
                            'unit_price' => (float)($detail->harga_satuan ?? 0),
                            'total_price' => $detailTotal
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
        // Untuk produk, kita perlu melihat history dari bahan-bahan yang digunakan dalam komposisi
        // Ambil semua bahan yang digunakan dalam komposisi produk ini
        $compositionBahanIds = DB::table('tbl_komposisi')
            ->where(function($query) use ($productId) {
                $query->where('id_produk', $productId)
                      ->orWhereIn('id_varian', function($subQuery) use ($productId) {
                          $subQuery->select('id_varian')
                                   ->from('tbl_varian')
                                   ->where('id_produk', $productId);
                      });
            })
            ->pluck('id_bahan')
            ->unique()
            ->toArray();

        if (empty($compositionBahanIds)) {
            return [
                'initial_stock' => 0,
                'stock_in' => 0
            ];
        }

        // Get stock history from tbl_stock_history for all related bahan
        $historyQuery = TblStockHistory::whereIn('id_bahan', $compositionBahanIds);

        if ($dateFilter) {
            try {
                // Try different date formats
                $date = Carbon::parse($dateFilter);
                $historyQuery->whereDate('created_at', $date->format('Y-m-d'));
            } catch (\Exception $e) {
                // If date parsing fails, ignore date filter
            }
        }

        $history = $historyQuery->orderBy('created_at', 'asc')->get();

        $initialStock = 0;
        $stockIn = 0;

        // Track first stock for each bahan to determine initial stock
        $firstStockRecorded = [];

        foreach ($history as $record) {
            $bahanId = $record->id_bahan;
            
            // Parse old_data and new_data to get stock values
            $oldStock = 0;
            $newStock = 0;
            
            if ($record->old_data && is_array($record->old_data)) {
                $oldStock = $record->old_data['stok_bahan'] ?? 0;
            }
            
            if ($record->new_data && is_array($record->new_data)) {
                $newStock = $record->new_data['stok_bahan'] ?? 0;
            }

            // Calculate quantity change
            $quantityChange = $newStock - $oldStock;

            if ($record->action === 'stock_in') {
                $stockIn += $quantityChange;
            } elseif ($record->action === 'create') {
                // First time this bahan is created
                if (!isset($firstStockRecorded[$bahanId])) {
                    $initialStock += $newStock;
                    $firstStockRecorded[$bahanId] = true;
                } else {
                    // If already recorded, treat as stock_in
                    $stockIn += $quantityChange;
                }
            } elseif ($record->action === 'update' && $quantityChange > 0) {
                // Stock increase from update
                $stockIn += $quantityChange;
            }
        }

        return [
            'initial_stock' => max(0, $initialStock),
            'stock_in' => max(0, $stockIn)
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
        try {
            // Get filter parameters
            $productFilter = $request->get('product', '');
            $categoryFilter = $request->get('category', '');
            $dateFilter = $request->get('date', '');

            // Get inventory report data
            $reportRequest = new Request([
                'product' => $productFilter,
                'category' => $categoryFilter,
                'date' => $dateFilter
            ]);

            $inventoryData = $this->getInventoryReport($reportRequest);
            $data = json_decode($inventoryData->getContent(), true);

            if (!$data['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengambil data untuk export'
                ], 500);
            }

            // Generate HTML content for PDF
            $html = $this->generatePDFHtml($data['data']);

            // Return HTML that can be printed as PDF by browser
            return response($html)
                ->header('Content-Type', 'text/html; charset=utf-8')
                ->header('Content-Disposition', 'inline; filename="laporan-inventory-' . date('Y-m-d') . '.html"');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat export PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate HTML content for PDF export
     */
    private function generatePDFHtml($data)
    {
        $summary = $data['summary'];
        $items = $data['items'];
        $date = date('d F Y H:i:s');

        $html = '<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Inventory</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #2d3748;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 12px;
            color: #718096;
            text-transform: uppercase;
        }
        .summary-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #2d3748;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background: #2d3748;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        tr:nth-child(even) {
            background: #f7fafc;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #718096;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Inventory</h1>
        <p>Tanggal: ' . $date . '</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>Total Produk</h3>
            <div class="value">' . $summary['total_products'] . '</div>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #718096;">Item</p>
        </div>
        <div class="summary-card">
            <h3>Total Stok</h3>
            <div class="value">' . number_format($summary['total_stock'], 0, ',', '.') . '</div>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #718096;">Unit</p>
        </div>
        <div class="summary-card">
            <h3>Nilai Beli</h3>
            <div class="value">Rp ' . number_format($summary['total_buy_value'], 0, ',', '.') . '</div>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #718096;">Total Beli</p>
        </div>
        <div class="summary-card">
            <h3>Nilai Jual</h3>
            <div class="value">Rp ' . number_format($summary['total_sell_value'], 0, ',', '.') . '</div>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #718096;">Total Jual</p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th>Harga Beli</th>
                <th>Harga Jual</th>
                <th>Stok Awal</th>
                <th>Stok Masuk</th>
                <th>Stok Akhir</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>';

        $no = 1;
        foreach ($items as $item) {
            $html .= '
            <tr>
                <td class="text-center">' . $no++ . '</td>
                <td>' . htmlspecialchars($item['name']) . '</td>
                <td>' . htmlspecialchars($item['category']) . '</td>
                <td class="text-right">Rp ' . number_format($item['buy_price'], 0, ',', '.') . '</td>
                <td class="text-right">Rp ' . number_format($item['sell_price'], 0, ',', '.') . '</td>
                <td class="text-right">' . number_format($item['initial_stock'], 0, ',', '.') . ' ' . htmlspecialchars($item['unit']) . '</td>
                <td class="text-right">' . number_format($item['stock_in'], 0, ',', '.') . ' ' . htmlspecialchars($item['unit']) . '</td>
                <td class="text-right">' . number_format($item['final_stock'], 0, ',', '.') . ' ' . htmlspecialchars($item['unit']) . '</td>
                <td class="text-center">' . htmlspecialchars($item['status']) . '</td>
            </tr>';
        }

        $html .= '
        </tbody>
    </table>

    <div class="footer">
        <p>Laporan ini dibuat secara otomatis oleh sistem IMS Angkringan</p>
        <p>Dicetak pada: ' . $date . '</p>
    </div>

    <script>
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>';

        return $html;
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
                    $displayKey = $date->format('d M');
                    break;
                case 'weekly':
                    $key = $date->format('Y-W');
                    $weekStart = $date->startOfWeek();
                    $weekEnd = $date->copy()->endOfWeek();
                    $displayKey = $weekStart->format('d M') . ' - ' . $weekEnd->format('d M');
                    break;
                case 'monthly':
                    $key = $date->format('Y-m');
                    $displayKey = $date->format('M Y');
                    break;
                default:
                    $key = $date->format('Y-m-d');
                    $displayKey = $date->format('d M');
            }
            
            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'period' => $displayKey,
                    'revenue' => 0,
                    'transactions' => 0,
                    'products_sold' => 0
                ];
            }
            
            // Calculate revenue from total_harga or sum from details
            $transactionRevenue = (float)($transaction->total_harga ?? 0);
            if ($transactionRevenue == 0) {
                $transactionRevenue = $transaction->details->sum(function($detail) {
                    return (float)($detail->total_harga ?? ($detail->harga_satuan * $detail->jumlah));
                });
            }
            
            $grouped[$key]['revenue'] += $transactionRevenue;
            $grouped[$key]['transactions'] += 1;
            $grouped[$key]['products_sold'] += $transaction->details->sum(function($detail) {
                return (int)($detail->jumlah ?? 0);
            });
        }
        
        // Sort by period key
        ksort($grouped);
        
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
                
                // Calculate revenue from total_harga or calculate from unit price
                $detailRevenue = (float)($detail->total_harga ?? 0);
                if ($detailRevenue == 0) {
                    $detailRevenue = (float)($detail->harga_satuan ?? 0) * (int)($detail->jumlah ?? 0);
                }
                
                $productSales[$productName]['quantity_sold'] += (int)($detail->jumlah ?? 0);
                $productSales[$productName]['revenue'] += $detailRevenue;
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
                
                // Calculate revenue from total_harga or calculate from unit price
                $detailRevenue = (float)($detail->total_harga ?? 0);
                if ($detailRevenue == 0) {
                    $detailRevenue = (float)($detail->harga_satuan ?? 0) * (int)($detail->jumlah ?? 0);
                }
                
                $categorySales[$categoryName]['quantity_sold'] += (int)($detail->jumlah ?? 0);
                $categorySales[$categoryName]['revenue'] += $detailRevenue;
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
            // Get payment method from database field metode_bayar
            $dbMethod = $transaction->metode_bayar ?? 'cash';
            // Map to display name
            $method = $this->mapPaymentMethod($dbMethod);
            
            if (!isset($paymentMethods[$method])) {
                $paymentMethods[$method] = [
                    'name' => $method,
                    'count' => 0,
                    'revenue' => 0
                ];
            }
            
            // Calculate revenue from total_transaksi or sum from details
            $transactionRevenue = (float)($transaction->total_transaksi ?? 0);
            if ($transactionRevenue == 0) {
                $transactionRevenue = $transaction->details->sum(function($detail) {
                    return (float)($detail->total_harga ?? ($detail->harga_satuan * $detail->jumlah));
                });
            }
            
            $paymentMethods[$method]['count'] += 1;
            $paymentMethods[$method]['revenue'] += $transactionRevenue;
        }
        
        return array_values($paymentMethods);
    }

    /**
     * Export sales report to PDF
     */
    public function exportSalesPDF(Request $request)
    {
        try {
            // Get filter parameters
            $productFilter = $request->get('product', '');
            $categoryFilter = $request->get('category', '');
            $dateFilter = $request->get('date', '');
            $paymentFilter = $request->get('payment', '');
            $period = $request->get('period', 'daily');

            // Get sales report data
            $reportRequest = new Request([
                'product' => $productFilter,
                'category' => $categoryFilter,
                'date' => $dateFilter,
                'payment' => $paymentFilter,
                'period' => $period
            ]);

            $salesData = $this->getSalesReport($reportRequest);
            $data = json_decode($salesData->getContent(), true);

            if (!$data['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengambil data untuk export'
                ], 500);
            }

            // Generate HTML content for PDF
            $html = $this->generateSalesPDFHtml($data['data'], $period);

            // Return HTML that can be printed as PDF by browser
            return response($html)
                ->header('Content-Type', 'text/html; charset=utf-8')
                ->header('Content-Disposition', 'inline; filename="laporan-penjualan-' . date('Y-m-d') . '.html"');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat export PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate HTML content for sales PDF export
     */
    private function generateSalesPDFHtml($data, $period = 'daily')
    {
        $periodLabel = [
            'daily' => 'Harian',
            'weekly' => 'Mingguan',
            'monthly' => 'Bulanan'
        ][$period] ?? 'Harian';

        $date = date('d/m/Y H:i:s');
        $summary = $data['summary'] ?? [];
        $recentTransactions = $data['recent_transactions'] ?? [];
        $chartData = $data['chart_data'] ?? [];
        $productPerformance = $data['product_performance'] ?? [];

        $html = '<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Penjualan</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #2d3748;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 12px;
            color: #718096;
            text-transform: uppercase;
        }
        .summary-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #2d3748;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background: #2d3748;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        tr:nth-child(even) {
            background: #f7fafc;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #718096;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Penjualan</h1>
        <p>Periode: ' . htmlspecialchars($periodLabel) . '</p>
        <p>Tanggal: ' . htmlspecialchars($date) . '</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>Total Transaksi</h3>
            <div class="value">' . ($summary['total_transactions'] ?? 0) . '</div>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #718096;">Transaksi</p>
        </div>
        <div class="summary-card">
            <h3>Total Pendapatan</h3>
            <div class="value">Rp ' . number_format($summary['total_revenue'] ?? 0, 0, ',', '.') . '</div>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #718096;">Pendapatan</p>
        </div>
        <div class="summary-card">
            <h3>Produk Terjual</h3>
            <div class="value">' . ($summary['total_products_sold'] ?? 0) . '</div>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #718096;">Unit</p>
        </div>
        <div class="summary-card">
            <h3>Produk Terlaris</h3>
            <div class="value">' . htmlspecialchars($summary['top_product'] ?? 'Tidak ada data') . '</div>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #718096;">Produk</p>
        </div>
    </div>

    <h2 style="margin-top: 30px; color: #2d3748;">Transaksi Terbaru</h2>
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>ID Transaksi</th>
                <th>Tanggal</th>
                <th>Waktu</th>
                <th class="text-right">Total</th>
                <th>Metode Pembayaran</th>
                <th>Kasir</th>
            </tr>
        </thead>
        <tbody>';

        $no = 1;
        foreach ($recentTransactions as $transaction) {
            $html .= '
            <tr>
                <td class="text-center">' . $no++ . '</td>
                <td>#' . htmlspecialchars($transaction['id'] ?? '') . '</td>
                <td>' . htmlspecialchars($transaction['date'] ?? '') . '</td>
                <td>' . htmlspecialchars($transaction['time'] ?? '') . '</td>
                <td class="text-right">Rp ' . number_format($transaction['total'] ?? 0, 0, ',', '.') . '</td>
                <td>' . htmlspecialchars($transaction['payment_method'] ?? 'Tunai') . '</td>
                <td>' . htmlspecialchars($transaction['cashier'] ?? 'Admin') . '</td>
            </tr>';
        }

        if (count($recentTransactions) === 0) {
            $html .= '
            <tr>
                <td colspan="7" class="text-center" style="padding: 20px; color: #718096;">
                    Tidak ada data transaksi
                </td>
            </tr>';
        }

        $html .= '
        </tbody>
    </table>

    <h2 style="margin-top: 30px; color: #2d3748;">Performa Produk</h2>
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Produk</th>
                <th class="text-right">Qty Terjual</th>
                <th class="text-right">Pendapatan</th>
            </tr>
        </thead>
        <tbody>';

        $no = 1;
        foreach ($productPerformance as $product) {
            $html .= '
            <tr>
                <td class="text-center">' . $no++ . '</td>
                <td>' . htmlspecialchars($product['name'] ?? '') . '</td>
                <td class="text-right">' . number_format($product['quantity_sold'] ?? 0, 0, ',', '.') . '</td>
                <td class="text-right">Rp ' . number_format($product['revenue'] ?? 0, 0, ',', '.') . '</td>
            </tr>';
        }

        if (count($productPerformance) === 0) {
            $html .= '
            <tr>
                <td colspan="4" class="text-center" style="padding: 20px; color: #718096;">
                    Tidak ada data produk
                </td>
            </tr>';
        }

        $html .= '
        </tbody>
    </table>

    <div class="footer">
        <p>Laporan ini dibuat secara otomatis oleh sistem IMS Angkringan</p>
        <p>Dicetak pada: ' . $date . '</p>
    </div>

    <script>
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>';

        return $html;
    }
}