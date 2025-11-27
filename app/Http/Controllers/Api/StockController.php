<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblBahan;
use App\Models\TblKategori;
use App\Models\TblStockHistory;
use App\Traits\StockHistoryTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class StockController extends Controller
{
    use StockHistoryTrait;
    /**
     * Get all stock items
     */
    public function index(Request $request)
    {
        try {
            $stocks = TblBahan::with(['kategori:id_kategori,nama_kategori'])
                ->orderBy('nama_bahan', 'asc')
                ->get();

            $formattedStocks = $stocks->map(function($stock) {
                return [
                    'id' => $stock->id_bahan,
                    'name' => $stock->nama_bahan,
                    'category' => $stock->kategori->nama_kategori ?? 'Tidak ada kategori',
                    'buyPrice' => (float)$stock->harga_beli,
                    'quantity' => (float)$stock->stok_bahan,
                    'unit' => $stock->satuan,
                    'minStock' => (float)$stock->min_stok,
                    'lastUpdated' => $stock->updated_at->format('Y-m-d'),
                    'updatedBy' => $stock->updated_by ? 'User' : 'System',
                    'isLowStock' => $stock->stok_bahan < $stock->min_stok
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedStocks
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data stok',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get stock by ID
     */
    public function show($id)
    {
        try {
            $stock = TblBahan::with(['kategori:id_kategori,nama_kategori'])
                ->find($id);

            if (!$stock) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data stok tidak ditemukan'
                ], 404);
            }

            $formattedStock = [
                'id' => $stock->id_bahan,
                'name' => $stock->nama_bahan,
                'category' => $stock->kategori->nama_kategori ?? 'Tidak ada kategori',
                'buyPrice' => (float)$stock->harga_beli,
                'quantity' => (float)$stock->stok_bahan,
                'unit' => $stock->satuan,
                'minStock' => (float)$stock->min_stok,
                'is_divisible' => $stock->is_divisible,
                'max_divisions' => $stock->max_divisions,
                'division_description' => $stock->division_description,
                'lastUpdated' => $stock->updated_at->format('Y-m-d'),
                'updatedBy' => $stock->updated_by ? 'User' : 'System',
                'isLowStock' => $stock->stok_bahan < $stock->min_stok
            ];

            return response()->json([
                'success' => true,
                'data' => $formattedStock
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data stok',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new stock item or update existing one if duplicate name found
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        
        try {
            // Default category_id jika kosong (gunakan category pertama yang ada)
            $categoryId = $request->category_id;
            if (empty($categoryId) || !is_numeric($categoryId)) {
                $defaultCategory = TblKategori::first();
                if (!$defaultCategory) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Kategori belum tersedia. Silakan buat kategori terlebih dahulu.'
                    ], 422);
                }
                $categoryId = $defaultCategory->id_kategori;
            }

            $validator = Validator::make(array_merge($request->all(), ['category_id' => $categoryId]), [
                'name' => 'required|string|max:100',
                'category_id' => 'required|exists:tbl_kategori,id_kategori',
                'buyPrice' => 'required|numeric|min:0',
                'quantity' => 'required|numeric|min:0',
                'unit' => 'required|string|max:20',
                'minStock' => 'required|numeric|min:0',
                'is_divisible' => 'boolean',
                'max_divisions' => 'nullable|integer|min:1',
                'division_description' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Cek apakah stok dengan nama yang sama sudah ada (case-insensitive)
            // Gunakan lock untuk mencegah race condition
            $existingStock = TblBahan::whereRaw('LOWER(TRIM(nama_bahan)) = ?', [strtolower(trim($request->name))])
                ->lockForUpdate()
                ->first();

            if ($existingStock) {
                // Update stok yang sudah ada - tambahkan quantity baru
                $oldData = $existingStock->toArray();
                $oldQuantity = (float)$existingStock->stok_bahan;
                $newQuantity = $oldQuantity + (float)$request->quantity;
                
                // Lock row untuk update (dalam transaction)
                $existingStock = TblBahan::lockForUpdate()->find($existingStock->id_bahan);
                
                $existingStock->update([
                    'nama_bahan' => trim($request->name), // Update nama jika ada perubahan (misal case berbeda)
                    'id_kategori' => $categoryId,
                    'harga_beli' => $request->buyPrice, // Update harga beli terbaru
                    'stok_bahan' => $newQuantity, // Tambahkan quantity baru
                    'satuan' => $request->unit,
                    'min_stok' => $request->minStock, // Update min stock
                    'is_divisible' => $request->is_divisible ?? $existingStock->is_divisible,
                    'max_divisions' => $request->max_divisions ?? $existingStock->max_divisions,
                    'division_description' => $request->division_description ?? $existingStock->division_description,
                    'updated_by' => $request->user()->id_user
                ]);

                // Reload untuk mendapatkan relasi kategori
                $existingStock->refresh();
                $existingStock->load('kategori');

                // Log history untuk stock addition
                try {
                    $this->logStockHistory(
                        $existingStock->id_bahan,
                        'stock_in',
                        $oldData,
                        $existingStock->toArray(),
                        "Menambahkan stok: +{$request->quantity} {$request->unit}. Total stok: {$oldQuantity} → {$newQuantity}",
                        $request->user()->id_user
                    );
                } catch (\Exception $e) {
                    Log::error('Failed to log stock history: ' . $e->getMessage());
                }

                DB::commit();

                // Kirim notifikasi jika stok menipis
                $this->sendStockNotification($existingStock);

                return response()->json([
                    'success' => true,
                    'message' => "Stok '{$existingStock->nama_bahan}' sudah ada. Quantity ditambahkan: +{$request->quantity} {$request->unit}. Total stok sekarang: {$newQuantity} {$request->unit}",
                    'data' => [
                        'id' => $existingStock->id_bahan,
                        'name' => $existingStock->nama_bahan,
                        'category' => $existingStock->kategori->nama_kategori ?? 'Tidak ada kategori',
                        'buyPrice' => (float)$existingStock->harga_beli,
                        'quantity' => (float)$existingStock->stok_bahan,
                        'unit' => $existingStock->satuan,
                        'minStock' => (float)$existingStock->min_stok,
                        'lastUpdated' => $existingStock->updated_at->format('Y-m-d'),
                        'updatedBy' => 'User',
                        'isLowStock' => $existingStock->stok_bahan < $existingStock->min_stok,
                        'isUpdated' => true // Flag untuk frontend bahwa ini update, bukan create
                    ]
                ], 200);
            } else {
                // Cek sekali lagi sebelum create untuk mencegah race condition
                $doubleCheck = TblBahan::whereRaw('LOWER(TRIM(nama_bahan)) = ?', [strtolower(trim($request->name))])
                    ->lockForUpdate()
                    ->first();
                
                if ($doubleCheck) {
                    // Jika ternyata sudah ada (race condition), gunakan yang sudah ada
                    $oldData = $doubleCheck->toArray();
                    $oldQuantity = (float)$doubleCheck->stok_bahan;
                    $newQuantity = $oldQuantity + (float)$request->quantity;
                    
                    $doubleCheck->update([
                        'nama_bahan' => trim($request->name),
                        'id_kategori' => $categoryId,
                        'harga_beli' => $request->buyPrice,
                        'stok_bahan' => $newQuantity,
                        'satuan' => $request->unit,
                        'min_stok' => $request->minStock,
                        'updated_by' => $request->user()->id_user
                    ]);
                    
                    $doubleCheck->refresh();
                    $doubleCheck->load('kategori');
                    
                    try {
                        $this->logStockHistory(
                            $doubleCheck->id_bahan,
                            'stock_in',
                            $oldData,
                            $doubleCheck->toArray(),
                            "Menambahkan stok: +{$request->quantity} {$request->unit}. Total stok: {$oldQuantity} → {$newQuantity}",
                            $request->user()->id_user
                        );
                    } catch (\Exception $e) {
                        Log::error('Failed to log stock history: ' . $e->getMessage());
                    }
                    
                    DB::commit();

                    // Kirim notifikasi jika stok menipis
                    $this->sendStockNotification($doubleCheck);
                    
                    return response()->json([
                        'success' => true,
                        'message' => "Stok '{$doubleCheck->nama_bahan}' sudah ada. Quantity ditambahkan: +{$request->quantity} {$request->unit}. Total stok sekarang: {$newQuantity} {$request->unit}",
                        'data' => [
                            'id' => $doubleCheck->id_bahan,
                            'name' => $doubleCheck->nama_bahan,
                            'category' => $doubleCheck->kategori->nama_kategori ?? 'Tidak ada kategori',
                            'buyPrice' => (float)$doubleCheck->harga_beli,
                            'quantity' => (float)$doubleCheck->stok_bahan,
                            'unit' => $doubleCheck->satuan,
                            'minStock' => (float)$doubleCheck->min_stok,
                            'lastUpdated' => $doubleCheck->updated_at->format('Y-m-d'),
                            'updatedBy' => 'User',
                            'isLowStock' => $doubleCheck->stok_bahan < $doubleCheck->min_stok,
                            'isUpdated' => true
                        ]
                    ], 200);
                }
                
                // Buat stok baru
            $stock = TblBahan::create([
                    'nama_bahan' => trim($request->name),
                    'id_kategori' => $categoryId,
                'harga_beli' => $request->buyPrice,
                'stok_bahan' => $request->quantity,
                'is_divisible' => $request->is_divisible ?? false,
                'max_divisions' => $request->max_divisions,
                'division_description' => $request->division_description,
                'satuan' => $request->unit,
                'min_stok' => $request->minStock,
                'updated_by' => $request->user()->id_user
            ]);

                // Reload untuk mendapatkan relasi kategori
                $stock->load('kategori');

            // Log history untuk create
            try {
                $this->logStockHistory(
                    $stock->id_bahan,
                    'create',
                    null,
                    $stock->toArray(),
                    "Menambahkan stok baru: {$stock->nama_bahan}",
                    $request->user()->id_user
                );
            } catch (\Exception $e) {
                Log::error('Failed to log stock history: ' . $e->getMessage());
            }

                DB::commit();

            // Kirim notifikasi jika stok menipis
            $this->sendStockNotification($stock);

            return response()->json([
                'success' => true,
                'message' => 'Stok berhasil ditambahkan',
                'data' => [
                    'id' => $stock->id_bahan,
                    'name' => $stock->nama_bahan,
                    'category' => $stock->kategori->nama_kategori ?? 'Tidak ada kategori',
                    'buyPrice' => (float)$stock->harga_beli,
                    'quantity' => (float)$stock->stok_bahan,
                    'unit' => $stock->satuan,
                    'minStock' => (float)$stock->min_stok,
                    'lastUpdated' => $stock->updated_at->format('Y-m-d'),
                    'updatedBy' => 'User',
                        'isLowStock' => $stock->stok_bahan < $stock->min_stok,
                        'isUpdated' => false
                ]
            ], 201);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Stock creation/update error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menambahkan stok',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update stock item
     */
    public function update(Request $request, $id)
    {
        try {
            $stock = TblBahan::find($id);

            if (!$stock) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data stok tidak ditemukan'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100',
                'category_id' => 'required|exists:tbl_kategori,id_kategori',
                'buyPrice' => 'required|numeric|min:0',
                'quantity' => 'required|numeric|min:0',
                'unit' => 'required|string|max:20',
                'minStock' => 'required|numeric|min:0',
                'is_divisible' => 'boolean',
                'max_divisions' => 'nullable|integer|min:1',
                'division_description' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Simpan data lama untuk history
            $oldData = $stock->toArray();
            
            $stock->update([
                'nama_bahan' => $request->name,
                'id_kategori' => $request->category_id,
                'harga_beli' => $request->buyPrice,
                'stok_bahan' => $request->quantity,
                'is_divisible' => $request->is_divisible ?? false,
                'max_divisions' => $request->max_divisions,
                'division_description' => $request->division_description,
                'satuan' => $request->unit,
                'min_stok' => $request->minStock,
                'updated_by' => $request->user()->id_user
            ]);

            // Log history untuk update
            try {
                $newData = $stock->fresh()->toArray();
                $changes = $this->getChanges($oldData, $newData);
                $description = $this->generateChangeDescription($changes, 'update');
                
                $this->logStockHistory(
                    $stock->id_bahan,
                    'update',
                    $oldData,
                    $newData,
                    $description ?: "Memperbarui data stok: {$stock->nama_bahan}",
                    $request->user()->id_user
                );
            } catch (\Exception $e) {
                // Log error but don't fail the update
                Log::error('Failed to log stock history: ' . $e->getMessage());
            }

            // Kirim notifikasi jika stok menipis
            $this->sendStockNotification($stock);

            return response()->json([
                'success' => true,
                'message' => 'Stok berhasil diperbarui',
                'data' => [
                    'id' => $stock->id_bahan,
                    'name' => $stock->nama_bahan,
                    'category' => $stock->kategori->nama_kategori ?? 'Tidak ada kategori',
                    'buyPrice' => (float)$stock->harga_beli,
                    'quantity' => (float)$stock->stok_bahan,
                    'unit' => $stock->satuan,
                    'minStock' => (float)$stock->min_stok,
                    'lastUpdated' => $stock->updated_at->format('Y-m-d'),
                    'updatedBy' => 'User',
                    'isLowStock' => $stock->stok_bahan < $stock->min_stok
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui stok',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete stock item
     */
    public function destroy($id)
    {
        try {
            $stock = TblBahan::find($id);

            if (!$stock) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data stok tidak ditemukan'
                ], 404);
            }

            // Simpan data untuk history sebelum delete
            $oldData = $stock->toArray();
            
            // Log history untuk delete
            try {
                $this->logStockHistory(
                    $stock->id_bahan,
                    'delete',
                    $oldData,
                    null,
                    "Menghapus stok: {$stock->nama_bahan}",
                    auth()->id()
                );
            } catch (\Exception $e) {
                // Log error but don't fail the delete
                Log::error('Failed to log stock history: ' . $e->getMessage());
            }
            
            $stock->delete();

            return response()->json([
                'success' => true,
                'message' => 'Stok berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus stok',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete stock items
     */
    public function bulkDelete(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'ids' => 'required|array|min:1',
                'ids.*' => 'required|integer|exists:tbl_bahan,id_bahan'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak valid',
                    'errors' => $validator->errors()
                ], 422);
            }

            $ids = $request->ids;
            $deletedCount = 0;
            $failedCount = 0;
            $errors = [];

            DB::beginTransaction();

            try {
                foreach ($ids as $id) {
                    try {
                        $stock = TblBahan::find($id);
                        
                        if (!$stock) {
                            $failedCount++;
                            $errors[] = "Stok dengan ID {$id} tidak ditemukan";
                            continue;
                        }

                        // Simpan data untuk history sebelum delete
                        $oldData = $stock->toArray();
                        
                        // Log history untuk delete
                        try {
                            $this->logStockHistory(
                                $stock->id_bahan,
                                'delete',
                                $oldData,
                                null,
                                "Menghapus stok: {$stock->nama_bahan}",
                                auth()->id()
                            );
                        } catch (\Exception $e) {
                            Log::error('Failed to log stock history: ' . $e->getMessage());
                        }
                        
                        $stock->delete();
                        $deletedCount++;
                    } catch (\Exception $e) {
                        $failedCount++;
                        $errors[] = "Gagal menghapus stok dengan ID {$id}: " . $e->getMessage();
                        Log::error("Failed to delete stock {$id}: " . $e->getMessage());
                    }
                }

                DB::commit();

                $message = "Berhasil menghapus {$deletedCount} stok";
                if ($failedCount > 0) {
                    $message .= ", {$failedCount} gagal dihapus";
                }

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => [
                        'deleted_count' => $deletedCount,
                        'failed_count' => $failedCount,
                        'errors' => $errors
                    ]
                ], 200);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus stok',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get low stock alerts
     */
    public function lowStock(Request $request)
    {
        try {
            $lowStockItems = TblBahan::with(['kategori:id_kategori,nama_kategori'])
                ->whereColumn('stok_bahan', '<', 'min_stok')
                ->orderBy('stok_bahan', 'asc')
                ->get();

            $formattedItems = $lowStockItems->map(function($item) {
                return [
                    'id' => $item->id_bahan,
                    'name' => $item->nama_bahan,
                    'category' => $item->kategori->nama_kategori ?? 'Tidak ada kategori',
                    'currentStock' => (float)$item->stok_bahan,
                    'minStock' => (float)$item->min_stok,
                    'unit' => $item->unit,
                    'buyPrice' => (float)$item->harga_beli,
                    'shortage' => (float)$item->min_stok - (float)$item->stok_bahan
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedItems,
                'count' => $formattedItems->count()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data stok menipis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get categories for dropdown
     */
    public function categories()
    {
        try {
            $categories = TblKategori::select('id_kategori', 'nama_kategori')
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
     * Get stock history
     */
    public function history(Request $request, $id = null)
    {
        try {
            $query = TblStockHistory::with(['bahan:id_bahan,nama_bahan', 'user:id_user,nama_user'])
                ->orderBy('created_at', 'desc');

            if ($id) {
                $query->where('id_bahan', $id);
            }

            $histories = $query->get();

            $formattedHistories = $histories->map(function($history) {
                return [
                    'id' => $history->id_history,
                    'bahan_id' => $history->id_bahan,
                    'bahan_nama' => $history->bahan->nama_bahan ?? 'Bahan tidak ditemukan',
                    'action' => $history->action,
                    'old_data' => $history->old_data ?? null,
                    'new_data' => $history->new_data ?? null,
                    'description' => $history->description,
                    'user_id' => $history->user_id,
                    'user_nama' => $history->user->nama_user ?? 'System',
                    'created_at' => $history->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $history->updated_at->format('Y-m-d H:i:s'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedHistories
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil riwayat stok',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send stock notification to n8n webhook (single item)
     */
    private function sendStockNotification($stock)
    {
        // Cek apakah notifikasi diaktifkan
        if (!config('services.n8n.enabled', true)) {
            return;
        }

        // Hanya kirim notifikasi jika stok di bawah 5
        if ($stock->stok_bahan >= 5) {
            return;
        }

        // Gunakan batch notification jika diaktifkan
        // Langsung kirim semua stok menipis dalam satu request
        if (config('services.n8n.batch_notification', true)) {
            $this->sendBatchStockNotification();
            return;
        }

        try {
            $webhookUrl = config('services.n8n.webhook_url');
            $timeout = config('services.n8n.timeout', 5);

            if (empty($webhookUrl)) {
                Log::warning('N8N webhook URL tidak dikonfigurasi');
                return;
            }

            // Kirim data ke n8n webhook
            Http::timeout($timeout)->post($webhookUrl, [
                'nama_bahan' => $stock->nama_bahan,
                'stok_bahan' => $stock->stok_bahan,
                'id_bahan' => $stock->id_bahan,
                'satuan' => $stock->satuan,
                'min_stok' => $stock->min_stok,
            ]);

            Log::info('Stock notification sent to n8n', [
                'bahan_id' => $stock->id_bahan,
                'nama_bahan' => $stock->nama_bahan,
                'stok' => $stock->stok_bahan
            ]);

        } catch (\Exception $e) {
            // Log error tapi jangan gagalkan proses update stok
            Log::error('Failed to send stock notification to n8n: ' . $e->getMessage(), [
                'bahan_id' => $stock->id_bahan,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send batch stock notification to n8n webhook
     * Mengirim semua stok menipis dalam satu request
     */
    public function sendBatchStockNotification()
    {
        // Cek apakah notifikasi diaktifkan
        if (!config('services.n8n.enabled', true)) {
            return response()->json([
                'success' => false,
                'message' => 'Notifikasi n8n tidak diaktifkan'
            ], 400);
        }

        try {
            // Ambil semua stok yang menipis (stok < 5)
            $lowStockItems = TblBahan::with(['kategori:id_kategori,nama_kategori'])
                ->where('stok_bahan', '<', 5)
                ->orderBy('stok_bahan', 'asc')
                ->get();

            if ($lowStockItems->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Tidak ada stok yang menipis',
                    'data' => []
                ], 200);
            }

            // Format data untuk n8n
            $items = $lowStockItems->map(function($item) {
                return [
                    'nama_bahan' => $item->nama_bahan,
                    'stok_bahan' => (float)$item->stok_bahan,
                    'id_bahan' => $item->id_bahan,
                    'satuan' => $item->satuan,
                    'min_stok' => (float)$item->min_stok,
                    'kategori' => $item->kategori->nama_kategori ?? 'Tidak ada kategori',
                ];
            })->toArray();

            $webhookUrl = config('services.n8n.webhook_url');
            $timeout = config('services.n8n.timeout', 5);

            if (empty($webhookUrl)) {
                Log::warning('N8N webhook URL tidak dikonfigurasi');
                return response()->json([
                    'success' => false,
                    'message' => 'N8N webhook URL tidak dikonfigurasi'
                ], 400);
            }

            // Kirim batch data ke n8n webhook
            Http::timeout($timeout)->post($webhookUrl, [
                'items' => $items,
                'batch' => true,
                'total_items' => count($items)
            ]);

            Log::info('Batch stock notification sent to n8n', [
                'total_items' => count($items),
                'items' => $items
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Batch notification berhasil dikirim',
                'total_items' => count($items),
                'data' => $items
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to send batch stock notification to n8n: ' . $e->getMessage(), [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim batch notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get action display name
     */
    private function getActionDisplayName($action)
    {
        $actions = [
            'create' => 'Tambah Stok',
            'update' => 'Update Stok',
            'delete' => 'Hapus Stok',
            'stock_in' => 'Stok Masuk',
            'stock_out' => 'Stok Keluar',
        ];

        return $actions[$action] ?? $action;
    }

    /**
     * Format changes for display
     */
    private function formatChanges($oldData, $newData, $action)
    {
        if (!$oldData || !$newData) {
            return [];
        }

        $changes = [];
        $fieldNames = [
            'nama_bahan' => 'Nama Bahan',
            'id_kategori' => 'Kategori',
            'harga_beli' => 'Harga Beli',
            'stok_bahan' => 'Stok',
            'satuan' => 'Satuan',
            'min_stok' => 'Minimum Stok',
        ];

        foreach ($newData as $key => $newValue) {
            $oldValue = $oldData[$key] ?? null;
            
            if ($oldValue !== $newValue && isset($fieldNames[$key])) {
                $changes[] = [
                    'field' => $fieldNames[$key],
                    'old_value' => $oldValue,
                    'new_value' => $newValue,
                    'formatted_change' => "{$fieldNames[$key]}: '{$oldValue}' → '{$newValue}'"
                ];
            }
        }

        return $changes;
    }
}
