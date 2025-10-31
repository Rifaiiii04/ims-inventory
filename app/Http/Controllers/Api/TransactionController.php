<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblTransaksi;
use App\Models\TblTransaksiDetail;
use App\Models\TblVarian;
use App\Models\TblBahan;
use App\Models\TblKomposisi;
use App\Models\TblProduk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    /**
     * Get products with variants for POS
     */
    public function getProducts()
    {
        try {
            $products = DB::table('tbl_produk')
                ->leftJoin('tbl_kategori', 'tbl_produk.id_kategori', '=', 'tbl_kategori.id_kategori')
                ->select(
                    'tbl_produk.id_produk',
                    'tbl_produk.nama_produk',
                    'tbl_produk.deskripsi',
                    'tbl_produk.harga as harga_produk',
                    'tbl_kategori.nama_kategori'
                )
                ->orderBy('tbl_produk.nama_produk', 'asc')
                ->get();

            $productsWithVariants = $products->map(function($product) {
                $variants = DB::table('tbl_varian')
                    ->where('id_produk', $product->id_produk)
                    ->where('stok_varian', '>', 0)
                    ->select('id_varian', 'nama_varian', 'stok_varian', 'id_produk', 'unit')
                    ->get()
                    ->map(function($variant) use ($product) {
                        // Gunakan harga dari produk sebagai harga varian jika varian tidak punya harga sendiri
                        return [
                            'id_varian' => $variant->id_varian,
                            'nama_varian' => $variant->nama_varian,
                            'harga' => $product->harga_produk, // Harga dari produk
                            'stok_varian' => $variant->stok_varian,
                            'id_produk' => $variant->id_produk,
                            'unit' => $variant->unit,
                            'compositions' => $this->getVariantCompositions($variant->id_varian)
                        ];
                    });

                // Jika produk tidak punya variant, buat "virtual variant" untuk produk itu sendiri
                if ($variants->isEmpty()) {
                    $variants = collect([[
                        'id_varian' => 'product_' . $product->id_produk, // ID khusus untuk produk tanpa variant
                        'nama_varian' => $product->nama_produk,
                        'harga' => $product->harga_produk,
                        'stok_varian' => 999, // Stok virtual untuk produk tanpa variant
                        'id_produk' => $product->id_produk,
                        'unit' => 'pcs',
                        'compositions' => [],
                        'is_direct_product' => true // Flag untuk produk langsung
                    ]]);
                }

                return [
                    'id' => $product->id_produk,
                    'name' => $product->nama_produk,
                    'description' => $product->deskripsi ?? '',
                    'category' => $product->nama_kategori ?? 'Umum',
                    'harga' => $product->harga_produk,
                    'variants' => $variants,
                    'has_variants' => $variants->count() > 1 || ($variants->count() === 1 && !isset($variants->first()['is_direct_product']))
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $productsWithVariants
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data produk',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get variant compositions for stock calculation
     */
    private function getVariantCompositions($variantId)
    {
        return DB::table('tbl_komposisi')
            ->join('tbl_bahan', 'tbl_komposisi.id_bahan', '=', 'tbl_bahan.id_bahan')
            ->where('tbl_komposisi.id_varian', $variantId)
            ->select(
                'tbl_komposisi.id_bahan',
                'tbl_bahan.nama_bahan',
                'tbl_komposisi.jumlah_per_porsi',
                'tbl_komposisi.satuan',
                'tbl_bahan.stok_bahan',
                'tbl_bahan.min_stok'
            )
            ->get();
    }

    /**
     * Create new transaction
     */
    public function store(Request $request)
    {
        try {
            // Log request data for debugging
            Log::info('Transaction request data:', $request->all());
            
            $validator = Validator::make($request->all(), [
                'items' => 'required|array|min:1',
                'items.*.variant_id' => 'required', // Accept both integer (variant) and string (product_*) for direct products
                'items.*.quantity' => 'required|numeric|min:0.01',
                'payment_method' => 'required|string|in:tunai,qris,transfer,cash,lainnya',
                'cash_amount' => 'nullable|numeric|min:0',
                'transfer_proof' => 'nullable|string'
            ]);

            // Custom validation for variant_id - must be either integer or string starting with 'product_'
            $validator->after(function ($validator) use ($request) {
                foreach ($request->items as $index => $item) {
                    $variantId = $item['variant_id'] ?? null;
                    if ($variantId === null || $variantId === '') {
                        continue; // Already handled by 'required' rule
                    }
                    
                    // Convert to string for checking
                    $variantIdStr = (string) $variantId;
                    
                    // Check if it's a product_* string or a numeric value (integer)
                    if (is_string($variantId) && !str_starts_with($variantIdStr, 'product_')) {
                        // If it's a string but not product_*, check if it's numeric (could be string number)
                        if (!is_numeric($variantId)) {
                            $validator->errors()->add("items.{$index}.variant_id", "Variant ID format tidak valid. Harus integer atau 'product_*'");
                        }
                    } elseif (is_numeric($variantId) || ctype_digit($variantIdStr)) {
                        // Valid integer variant ID
                        continue;
                    } elseif (str_starts_with($variantIdStr, 'product_')) {
                        // Valid product_* format
                        continue;
                    } else {
                        $validator->errors()->add("items.{$index}.variant_id", "Variant ID harus berupa integer atau string 'product_*'");
                    }
                }
            });

            if ($validator->fails()) {
                Log::error('Validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak valid',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            try {
                // Map payment method to match database enum
                $paymentMethodMap = [
                    'tunai' => 'cash',
                    'transfer' => 'lainnya',
                    'qris' => 'qris',
                    'cash' => 'cash',
                    'lainnya' => 'lainnya'
                ];
                
                $paymentMethod = $paymentMethodMap[$request->payment_method] ?? 'cash';
                
                // Generate transaction number
                $transactionNumber = 'TRX' . date('Ymd') . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

                // Calculate total
                $totalAmount = 0;
                $items = [];

                foreach ($request->items as $item) {
                    Log::info('Processing item:', $item);
                    
                    // Cek apakah ini produk langsung atau variant
                    // Convert variant_id to string for checking if it's a direct product
                    $variantIdStr = (string) $item['variant_id'];
                    $isDirectProduct = str_starts_with($variantIdStr, 'product_');
                    
                    if ($isDirectProduct) {
                        // Handle produk langsung (tanpa variant)
                        $productId = str_replace('product_', '', $variantIdStr);
                        $product = TblProduk::find($productId);
                        
                        if (!$product) {
                            Log::error('Product not found:', ['product_id' => $productId]);
                            throw new \Exception("Produk tidak ditemukan");
                        }
                        
                        // Buat objek variant virtual untuk konsistensi
                        $variant = (object) [
                            'id_varian' => $item['variant_id'],
                            'nama_varian' => $product->nama_produk,
                            'id_produk' => $product->id_produk,
                            'stok_varian' => 999, // Stok virtual
                            'is_direct_product' => true
                        ];
                        
                        // Skip stock check untuk produk langsung
                        Log::info('Processing direct product:', [
                            'product' => $product->nama_produk,
                            'quantity' => $item['quantity']
                        ]);
                    } else {
                        // Handle variant normal - load with product relation
                        $variant = TblVarian::with('produk')->find($item['variant_id']);
                        if (!$variant) {
                            Log::error('Variant not found:', ['variant_id' => $item['variant_id']]);
                            throw new \Exception("Varian tidak ditemukan");
                        }

                        if ($variant->stok_varian < $item['quantity']) {
                            Log::error('Insufficient stock:', [
                                'variant' => $variant->nama_varian,
                                'requested' => $item['quantity'],
                                'available' => $variant->stok_varian
                            ]);
                            throw new \Exception("Stok {$variant->nama_varian} tidak mencukupi");
                        }
                    }

                    // Cek stok bahan berdasarkan komposisi (hanya untuk variant, bukan produk langsung)
                    if (!$isDirectProduct) {
                        $compositions = DB::table('tbl_komposisi')
                            ->join('tbl_bahan', 'tbl_komposisi.id_bahan', '=', 'tbl_bahan.id_bahan')
                            ->where('tbl_komposisi.id_varian', $variant->id_varian)
                            ->select(
                                'tbl_komposisi.id_bahan',
                                'tbl_bahan.nama_bahan',
                                'tbl_komposisi.jumlah_per_porsi',
                                'tbl_komposisi.satuan',
                                'tbl_bahan.stok_bahan',
                                'tbl_bahan.min_stok'
                            )
                            ->get();

                        foreach ($compositions as $composition) {
                            $requiredIngredient = $composition->jumlah_per_porsi * $item['quantity'];
                            if ($composition->stok_bahan < $requiredIngredient) {
                                Log::error('Insufficient ingredient stock:', [
                                    'ingredient' => $composition->nama_bahan,
                                    'required' => $requiredIngredient,
                                    'available' => $composition->stok_bahan,
                                    'variant' => $variant->nama_varian,
                                    'composition_per_portion' => $composition->jumlah_per_porsi,
                                    'quantity_ordered' => $item['quantity']
                                ]);
                                throw new \Exception("Stok bahan {$composition->nama_bahan} tidak mencukupi untuk memproduksi {$variant->nama_varian}. Dibutuhkan: {$requiredIngredient} {$composition->satuan}, Tersedia: {$composition->stok_bahan} {$composition->satuan}");
                            }
                        }
                    }

                    // Ambil harga dari produk
                    if ($isDirectProduct) {
                        $harga = $product->harga ?? 0;
                        $productObj = $product;
                    } else {
                        // Ensure product relation is loaded
                        if (!$variant->relationLoaded('produk')) {
                            $variant->load('produk');
                        }
                        $produk = $variant->produk;
                        if (!$produk) {
                            // Fallback: get product directly
                            $produk = TblProduk::find($variant->id_produk);
                        }
                        $harga = $produk->harga ?? 0;
                        $productObj = $produk;
                    }
                    $subtotal = $harga * $item['quantity'];
                    $totalAmount += $subtotal;

                    $items[] = [
                        'variant' => $variant,
                        'product' => $productObj,
                        'isDirectProduct' => $isDirectProduct,
                        'quantity' => $item['quantity'],
                        'price' => $harga,
                        'subtotal' => $subtotal
                    ];
                }

                // Get user ID - ensure it's always set
                $userId = auth()->id();
                if (!$userId) {
                    // If not authenticated, try to get from request or use default
                    $userId = $request->user_id ?? 1;
                    Log::warning('No authenticated user, using default user_id:', ['user_id' => $userId]);
                }
                
                // Create transaction
                Log::info('Creating transaction with data:', [
                    'tanggal_waktu' => now(),
                    'total_transaksi' => $totalAmount,
                    'metode_bayar' => $paymentMethod,
                    'created_by' => $userId,
                ]);
                
                try {
                    $transaction = TblTransaksi::create([
                        'tanggal_waktu' => now(),
                        'total_transaksi' => $totalAmount,
                        'metode_bayar' => $paymentMethod,
                        'nama_pelanggan' => 'Pelanggan Umum',
                        'catatan' => $request->payment_method === 'transfer' ? $request->transfer_proof : null,
                        'created_by' => $userId,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to create transaction:', [
                        'error' => $e->getMessage(),
                        'data' => [
                            'tanggal_waktu' => now(),
                            'total_transaksi' => $totalAmount,
                            'metode_bayar' => $paymentMethod,
                            'created_by' => $userId,
                        ]
                    ]);
                    throw new \Exception("Gagal membuat transaksi: " . $e->getMessage());
                }
                
                Log::info('Transaction created successfully:', ['transaction_id' => $transaction->id_transaksi]);

                // Create transaction details and update stock
                foreach ($items as $item) {
                    $isDirectProduct = $item['isDirectProduct'] ?? false;
                    
                    // Ensure product exists and has id_produk
                    if (!isset($item['product']) || !$item['product']) {
                        Log::error('Product missing in item:', ['item' => $item]);
                        throw new \Exception("Data produk tidak valid untuk item transaksi");
                    }
                    
                    $productId = $item['product']->id_produk ?? null;
                    if (!$productId) {
                        Log::error('Product ID missing:', ['item' => $item, 'product' => $item['product']]);
                        throw new \Exception("ID produk tidak ditemukan");
                    }
                    
                    // Get variant_id - for direct products, use null; for normal variants, use integer id_varian
                    $variantId = null;
                    if (!$isDirectProduct) {
                        // For normal variant, ensure id_varian is integer
                        if (isset($item['variant']) && isset($item['variant']->id_varian)) {
                            $variantId = is_numeric($item['variant']->id_varian) 
                                ? (int) $item['variant']->id_varian 
                                : null;
                        }
                    }
                    
                    Log::info('Creating transaction detail:', [
                        'id_transaksi' => $transaction->id_transaksi,
                        'id_produk' => $productId,
                        'id_varian' => $variantId,
                        'jumlah' => $item['quantity'],
                        'harga_satuan' => $item['price'],
                        'total_harga' => $item['subtotal']
                    ]);
                    
                    try {
                        // Create transaction detail
                        TblTransaksiDetail::create([
                            'id_transaksi' => $transaction->id_transaksi,
                            'id_produk' => $productId,
                            'id_varian' => $variantId, // Null untuk produk langsung
                            'jumlah' => $item['quantity'],
                            'harga_satuan' => $item['price'],
                            'total_harga' => $item['subtotal']
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Failed to create transaction detail:', [
                            'error' => $e->getMessage(),
                            'data' => [
                                'id_transaksi' => $transaction->id_transaksi,
                                'id_produk' => $productId,
                                'id_varian' => $variantId,
                                'jumlah' => $item['quantity'],
                                'harga_satuan' => $item['price'],
                                'total_harga' => $item['subtotal']
                            ]
                        ]);
                        throw new \Exception("Gagal membuat detail transaksi: " . $e->getMessage());
                    }

                    // Update variant stock (hanya untuk variant, bukan produk langsung)
                    if (!$isDirectProduct) {
                        // Ensure variant_id is integer
                        $variantIdForUpdate = is_numeric($item['variant']->id_varian) 
                            ? (int) $item['variant']->id_varian 
                            : $item['variant']->id_varian;
                            
                        Log::info('Updating variant stock:', [
                            'variant_id' => $variantIdForUpdate,
                            'current_stock' => $item['variant']->stok_varian,
                            'decrement_by' => $item['quantity']
                        ]);
                        
                        DB::table('tbl_varian')
                            ->where('id_varian', $variantIdForUpdate)
                            ->decrement('stok_varian', $item['quantity']);

                        // Update ingredient stock based on composition
                        try {
                            $compositions = DB::table('tbl_komposisi')
                                ->where('id_varian', $variantIdForUpdate)
                                ->get();
                                
                            foreach ($compositions as $composition) {
                                $ingredientUsage = $composition->jumlah_per_porsi * $item['quantity'];
                                
                                Log::info('Updating ingredient stock:', [
                                    'ingredient_id' => $composition->id_bahan,
                                    'usage_per_portion' => $composition->jumlah_per_porsi,
                                    'quantity_ordered' => $item['quantity'],
                                    'total_usage' => $ingredientUsage,
                                    'variant' => $item['variant']->nama_varian
                                ]);
                                
                                DB::table('tbl_bahan')
                                    ->where('id_bahan', $composition->id_bahan)
                                    ->decrement('stok_bahan', $ingredientUsage);
                            }
                        } catch (\Exception $e) {
                            Log::error('Failed to update ingredient stock:', [
                                'error' => $e->getMessage(),
                                'variant_id' => $item['variant']->id_varian,
                                'quantity' => $item['quantity']
                            ]);
                            // Continue even if ingredient update fails
                        }
                    } else {
                        Log::info('Skipping stock update for direct product:', [
                            'product' => $item['variant']->nama_varian,
                            'quantity' => $item['quantity']
                        ]);
                    }
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Transaksi berhasil disimpan',
                    'data' => [
                        'transaction_id' => $transaction->id_transaksi,
                        'transaction_number' => 'TRX' . $transaction->id_transaksi,
                        'total_amount' => $totalAmount,
                        'change' => $request->payment_method === 'tunai' ? 
                            ($request->cash_amount - $totalAmount) : 0
                    ]
                ], 201);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Transaction error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan transaksi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get transaction history
     */
    public function getHistory(Request $request)
    {
        try {
            Log::info('Fetching transaction history with filters:', $request->all());
            
            $query = TblTransaksi::with(['user', 'details'])
                ->orderBy('tanggal_waktu', 'desc');

            // Filter by date range
            if ($request->start_date && $request->end_date) {
                $query->whereBetween('tanggal_waktu', [
                    $request->start_date,
                    $request->end_date
                ]);
            }

            // Filter by payment method
            if ($request->payment_method) {
                $query->where('metode_bayar', $request->payment_method);
            }

            // Filter by cashier
            if ($request->cashier_id) {
                $query->where('created_by', $request->cashier_id);
            }

            // Search by transaction number or cashier name
            if ($request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('id_transaksi', 'like', '%' . $request->search . '%')
                      ->orWhereHas('user', function($userQuery) use ($request) {
                          $userQuery->where('nama_user', 'like', '%' . $request->search . '%');
                      });
                });
            }

            $transactions = $query->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $transactions
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil riwayat transaksi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get transaction by ID
     */
    public function show($id)
    {
        try {
            $transaction = TblTransaksi::with(['user', 'details.variant.produk'])
                ->find($id);

            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $transaction
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data transaksi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete transaction
     */
    public function destroy($id)
    {
        try {
            $transaction = TblTransaksi::find($id);

            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi tidak ditemukan'
                ], 404);
            }

            // Check if transaction is too old to delete (optional business rule)
            $transactionDate = $transaction->tanggal_waktu;
            $daysOld = now()->diffInDays($transactionDate);
            
            if ($daysOld > 30) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi yang lebih dari 30 hari tidak dapat dihapus'
                ], 400);
            }

            DB::beginTransaction();

            try {
                // Restore stock for each item in the transaction
                foreach ($transaction->details as $detail) {
                    // Restore variant stock
                    DB::table('tbl_varian')
                        ->where('id_varian', $detail->id_varian)
                        ->increment('stok_varian', $detail->jumlah);

                    // Restore ingredient stock based on composition
                    $compositions = DB::table('tbl_komposisi')
                        ->where('id_varian', $detail->id_varian)
                        ->get();
                        
                    foreach ($compositions as $composition) {
                        $ingredientUsage = $composition->jumlah_per_porsi * $detail->jumlah;
                        DB::table('tbl_bahan')
                            ->where('id_bahan', $composition->id_bahan)
                            ->increment('stok_bahan', $ingredientUsage);
                    }
                }

                // Delete transaction details first
                $transaction->details()->delete();
                
                // Delete transaction
                $transaction->delete();

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Transaksi berhasil dihapus'
                ], 200);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus transaksi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sales report
     */
    public function salesReport(Request $request)
    {
        try {
            $startDate = $request->start_date ?? date('Y-m-01');
            $endDate = $request->end_date ?? date('Y-m-d');

            $report = DB::table('tbl_transaksi')
                ->join('tbl_transaksi_detail', 'tbl_transaksi.id_transaksi', '=', 'tbl_transaksi_detail.id_transaksi')
                ->join('tbl_varian', 'tbl_transaksi_detail.id_varian', '=', 'tbl_varian.id_varian')
                ->join('tbl_produk', 'tbl_varian.id_produk', '=', 'tbl_produk.id_produk')
                ->whereBetween('tbl_transaksi.tanggal_transaksi', [$startDate, $endDate])
                ->select(
                    'tbl_produk.nama_produk',
                    'tbl_varian.nama_varian',
                    DB::raw('SUM(tbl_transaksi_detail.jumlah) as total_quantity'),
                    DB::raw('SUM(tbl_transaksi_detail.subtotal) as total_revenue')
                )
                ->groupBy('tbl_produk.id_produk', 'tbl_varian.id_varian')
                ->orderBy('total_revenue', 'desc')
                ->get();

            $summary = [
                'total_transactions' => TblTransaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])->count(),
                'total_revenue' => TblTransaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])->sum('total_bayar'),
                'cash_transactions' => TblTransaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])->where('metode_bayar', 'tunai')->count(),
                'qris_transactions' => TblTransaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])->where('metode_bayar', 'qris')->count(),
                'transfer_transactions' => TblTransaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])->where('metode_bayar', 'transfer')->count()
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'products' => $report
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil laporan penjualan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export transactions to PDF
     */
    public function exportPDF(Request $request)
    {
        try {
            $query = TblTransaksi::with(['user', 'details'])
                ->orderBy('tanggal_waktu', 'desc');

            // Apply same filters as getHistory
            if ($request->start_date && $request->end_date) {
                $query->whereBetween('tanggal_waktu', [
                    $request->start_date,
                    $request->end_date
                ]);
            }

            if ($request->payment_method) {
                $query->where('metode_bayar', $request->payment_method);
            }

            if ($request->cashier_id) {
                $query->where('created_by', $request->cashier_id);
            }

            if ($request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('id_transaksi', 'like', '%' . $request->search . '%')
                      ->orWhereHas('user', function($userQuery) use ($request) {
                          $userQuery->where('nama_user', 'like', '%' . $request->search . '%');
                      });
                });
            }

            $transactions = $query->get();

            // For now, return JSON data (PDF generation can be implemented later)
            return response()->json([
                'success' => true,
                'message' => 'PDF export feature is under development. Data ready for export.',
                'data' => $transactions,
                'count' => $transactions->count()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat export PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export transactions to Excel
     */
    public function exportExcel(Request $request)
    {
        try {
            $query = TblTransaksi::with(['user', 'details'])
                ->orderBy('tanggal_waktu', 'desc');

            // Apply same filters as getHistory
            if ($request->start_date && $request->end_date) {
                $query->whereBetween('tanggal_waktu', [
                    $request->start_date,
                    $request->end_date
                ]);
            }

            if ($request->payment_method) {
                $query->where('metode_bayar', $request->payment_method);
            }

            if ($request->cashier_id) {
                $query->where('created_by', $request->cashier_id);
            }

            if ($request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('id_transaksi', 'like', '%' . $request->search . '%')
                      ->orWhereHas('user', function($userQuery) use ($request) {
                          $userQuery->where('nama_user', 'like', '%' . $request->search . '%');
                      });
                });
            }

            $transactions = $query->get();

            // For now, return JSON data (Excel generation can be implemented later)
            return response()->json([
                'success' => true,
                'message' => 'Excel export feature is under development. Data ready for export.',
                'data' => $transactions,
                'count' => $transactions->count()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat export Excel',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}