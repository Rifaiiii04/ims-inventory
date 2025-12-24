<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblBahan;
use App\Models\TblKategori;
use App\Models\TblStockHistory;
use App\Models\TblNotifikasi;
use App\Traits\StockHistoryTrait;
use App\Http\Controllers\Api\NotificationController;
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
                    'category_id' => $stock->id_kategori,
                    'buyPrice' => (float)$stock->harga_beli,
                    'quantity' => (float)$stock->stok_bahan,
                    'unit' => $stock->satuan,
                    'minStock' => (float)$stock->min_stok,
                    'is_divisible' => (bool)$stock->is_divisible,
                    'max_divisions' => $stock->max_divisions,
                    'division_description' => $stock->division_description,
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
                'category_id' => $stock->id_kategori,
                'buyPrice' => (float)$stock->harga_beli,
                'quantity' => (float)$stock->stok_bahan,
                'unit' => $stock->satuan,
                'minStock' => (float)$stock->min_stok,
                'is_divisible' => (bool)$stock->is_divisible,
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
        // Increase execution time limit untuk batch operations
        $originalTimeLimit = ini_get('max_execution_time');
        set_time_limit(120); // 2 minutes for batch operations
        
        DB::beginTransaction();
        
        try {
            // Default category_id jika kosong (gunakan category pertama yang ada)
            $categoryId = $request->category_id;
            
            // Convert to integer and validate
            if (!empty($categoryId)) {
                $categoryId = (int) $categoryId;
            }
            
            // Check if category exists in database
            if (empty($categoryId) || !is_numeric($categoryId) || $categoryId <= 0) {
                $defaultCategory = TblKategori::first();
                if (!$defaultCategory) {
                    Log::warning('No categories available in database', [
                        'request_category_id' => $request->category_id,
                        'request_data' => $request->all()
                    ]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Kategori belum tersedia. Silakan buat kategori terlebih dahulu.'
                    ], 422);
                }
                $categoryId = $defaultCategory->id_kategori;
            } else {
                // Verify category exists
                $categoryExists = TblKategori::where('id_kategori', $categoryId)->exists();
                if (!$categoryExists) {
                    Log::warning('Category ID does not exist in database', [
                        'request_category_id' => $categoryId,
                        'request_data' => $request->all()
                    ]);
                    // Try to get default category
                    $defaultCategory = TblKategori::first();
                    if (!$defaultCategory) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Kategori yang dipilih tidak valid. Silakan pilih kategori yang tersedia.'
                        ], 422);
                    }
                    $categoryId = $defaultCategory->id_kategori;
                }
            }

            // Ensure category_id is integer
            $categoryId = (int) $categoryId;
            
            // Final check: verify category exists
            $categoryExists = TblKategori::where('id_kategori', $categoryId)->exists();
            if (!$categoryExists) {
                Log::error('Category ID does not exist after validation', [
                    'category_id' => $categoryId,
                    'request_data' => $request->all()
                ]);
                $defaultCategory = TblKategori::first();
                if (!$defaultCategory) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Kategori tidak tersedia. Silakan buat kategori terlebih dahulu.'
                    ], 422);
                }
                $categoryId = $defaultCategory->id_kategori;
            }

            $validator = Validator::make(array_merge($request->all(), ['category_id' => $categoryId]), [
                'name' => 'required|string|max:100',
                'category_id' => 'required|integer|exists:tbl_kategori,id_kategori',
                'buyPrice' => 'required|numeric|min:0',
                'quantity' => 'required|numeric|min:0',
                'unit' => 'required|string|max:20',
                'minStock' => 'required|numeric|min:0',
                'is_divisible' => 'boolean',
                'max_divisions' => 'nullable|integer|min:1',
                'division_description' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                Log::warning('Stock validation failed', [
                    'request_data' => $request->all(),
                    'category_id' => $categoryId,
                    'validation_errors' => $validator->errors()->toArray()
                ]);
                
                // Build detailed error message
                $errorMessages = [];
                foreach ($validator->errors()->toArray() as $field => $messages) {
                    $errorMessages[] = implode(', ', $messages);
                }
                $errorMessage = 'Validation error: ' . implode('; ', $errorMessages);
                
                return response()->json([
                    'success' => false,
                    'message' => $errorMessage,
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

                // Smart update expired prediction setelah restock (non-blocking, async)
                // Run in background to prevent blocking the response
                try {
                    // Set execution time limit untuk proses ini
                    set_time_limit(30); // 30 seconds max for this operation
                    
                    $notificationController = app(NotificationController::class);
                    $predictionResult = $notificationController->smartUpdateExpiredPrediction($existingStock->id_bahan);
                    if ($predictionResult['success']) {
                        Log::info('Expired prediction smart updated after restock', [
                            'bahan_id' => $existingStock->id_bahan,
                            'action' => $predictionResult['action'] ?? 'unknown'
                        ]);
                    }
                } catch (\Exception $e) {
                    // Non-blocking: log error tapi tidak gagalkan restock
                    Log::warning('Failed to smart update expired prediction after restock', [
                        'bahan_id' => $existingStock->id_bahan,
                        'error' => $e->getMessage()
                    ]);
                } finally {
                    // Reset time limit
                    set_time_limit(ini_get('max_execution_time'));
                }

                // Reset time limit before returning
                set_time_limit($originalTimeLimit);

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

                    // Smart update expired prediction setelah restock (non-blocking, async)
                    // Skip untuk batch operations
                    $skipExpiredPrediction = $request->has('skip_expired_prediction') && $request->skip_expired_prediction === true;
                    
                    if (!$skipExpiredPrediction) {
                        // Run in background to prevent blocking the response
                        try {
                            // Set execution time limit untuk proses ini
                            set_time_limit(20); // 20 seconds max for this operation
                            
                        $notificationController = app(NotificationController::class);
                        $predictionResult = $notificationController->smartUpdateExpiredPrediction($doubleCheck->id_bahan);
                        if ($predictionResult['success']) {
                            Log::info('Expired prediction smart updated after restock (double check)', [
                                'bahan_id' => $doubleCheck->id_bahan,
                                'action' => $predictionResult['action'] ?? 'unknown'
                            ]);
                        }
                    } catch (\Exception $e) {
                        // Non-blocking: log error tapi tidak gagalkan restock
                        Log::warning('Failed to smart update expired prediction after restock (double check)', [
                            'bahan_id' => $doubleCheck->id_bahan,
                            'error' => $e->getMessage()
                        ]);
                        } finally {
                            // Reset time limit
                            set_time_limit($originalTimeLimit);
                        }
                    }
                    
                    // Reset time limit before returning
                    set_time_limit($originalTimeLimit);
                    
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
                'updated_by' => $request->user() ? $request->user()->id_user : null
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

            // Smart update expired prediction untuk bahan baru (non-blocking, async)
            // Hanya jika stok > 0
            // Skip untuk batch operations atau run in background to prevent timeout
            // Check if this is a batch operation (skip expired prediction to prevent timeout)
            $skipExpiredPrediction = $request->has('skip_expired_prediction') && $request->skip_expired_prediction === true;
            
            if ($stock->stok_bahan > 0 && !$skipExpiredPrediction) {
                // Run in background to prevent blocking the response
                // Use shorter timeout to prevent PHP execution timeout
                try {
                    // Set execution time limit untuk proses ini
                    set_time_limit(20); // 20 seconds max for this operation
                    
                    $notificationController = app(NotificationController::class);
                    $predictionResult = $notificationController->smartUpdateExpiredPrediction($stock->id_bahan);
                    if ($predictionResult['success']) {
                        Log::info('Expired prediction created for new bahan', [
                            'bahan_id' => $stock->id_bahan,
                            'action' => $predictionResult['action'] ?? 'created'
                        ]);
                    }
                } catch (\Exception $e) {
                    // Non-blocking: log error tapi tidak gagalkan create
                    Log::warning('Failed to create expired prediction for new bahan', [
                        'bahan_id' => $stock->id_bahan,
                        'error' => $e->getMessage()
                    ]);
                } finally {
                    // Reset time limit
                    set_time_limit($originalTimeLimit);
                }
            } else if ($skipExpiredPrediction) {
                Log::info('Skipping expired prediction for batch operation', [
                    'bahan_id' => $stock->id_bahan
                ]);
            }

            // Reset time limit before returning
            set_time_limit($originalTimeLimit);

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
            // Reset time limit on error
            if (isset($originalTimeLimit)) {
                set_time_limit($originalTimeLimit);
            }
            
            Log::error('Stock creation/update error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
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
            $oldQuantity = (float)$stock->stok_bahan;
            $newQuantity = (float)$request->quantity;
            $isStockIncrease = $newQuantity > $oldQuantity;
            
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

            // Reload stock untuk mendapatkan relasi kategori
            $stock->refresh();
            $stock->load('kategori');

            // Log history untuk update
            try {
                $newData = $stock->toArray();
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

            // Kirim notifikasi jika stok menipis (non-blocking)
            try {
                $this->sendStockNotification($stock);
            } catch (\Exception $e) {
                // Log error but don't fail the update
                Log::warning('Failed to send stock notification: ' . $e->getMessage());
            }

            // Smart update expired prediction jika stok bertambah (restock) atau stok > 0
            // Hanya update jika stok bertambah atau sudah ada stok
            // Skip untuk batch operations
            $skipExpiredPrediction = $request->has('skip_expired_prediction') && $request->skip_expired_prediction === true;
            
            if (($isStockIncrease || $newQuantity > 0) && $newQuantity > 0 && !$skipExpiredPrediction) {
                try {
                    // Set execution time limit untuk proses ini
                    $originalTimeLimit = ini_get('max_execution_time');
                    set_time_limit(20); // 20 seconds max for this operation
                    
                    $notificationController = app(NotificationController::class);
                    $predictionResult = $notificationController->smartUpdateExpiredPrediction($stock->id_bahan);
                    if ($predictionResult['success']) {
                        Log::info('Expired prediction smart updated after stock update', [
                            'bahan_id' => $stock->id_bahan,
                            'action' => $predictionResult['action'] ?? 'unknown',
                            'old_quantity' => $oldQuantity,
                            'new_quantity' => $newQuantity
                        ]);
                    }
                } catch (\Exception $e) {
                    // Non-blocking: log error tapi tidak gagalkan update
                    Log::warning('Failed to smart update expired prediction after stock update', [
                        'bahan_id' => $stock->id_bahan,
                        'error' => $e->getMessage()
                    ]);
                } finally {
                    // Reset time limit jika sudah diset sebelumnya
                    if (isset($originalTimeLimit)) {
                        set_time_limit($originalTimeLimit);
                    }
                }
            }

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
            Log::error('Error updating stock: ' . $e->getMessage(), [
                'stock_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui stok',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
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

            DB::beginTransaction();

            try {
                // Simpan data untuk history sebelum delete
                $oldData = $stock->toArray();
                
                // Log history untuk delete (sebelum delete, karena setelah delete tidak bisa log)
                try {
                    $userId = auth()->check() ? auth()->id() : (auth()->user() ? auth()->user()->id_user : null);
                    if ($userId) {
                        $this->logStockHistory(
                            $stock->id_bahan,
                            'delete',
                            $oldData,
                            null,
                            "Menghapus stok: {$stock->nama_bahan}",
                            $userId
                        );
                    }
                } catch (\Exception $e) {
                    // Log error but don't fail the delete
                    Log::error('Failed to log stock history: ' . $e->getMessage());
                }
                
                // Hapus semua relasi yang memiliki foreign key ke tbl_bahan
                // Urutan penting: hapus dari yang paling dependen dulu
                
                // 1. Hapus stock history terkait (meskipun ada onDelete cascade, lebih aman hapus manual)
                DB::table('tbl_stock_history')->where('id_bahan', $id)->delete();
                
                // 2. Hapus notifikasi terkait
                DB::table('tbl_notifikasi')->where('id_bahan', $id)->delete();
                
                // 3. Hapus komposisi yang menggunakan bahan ini
                // (Sudah dicek sebelumnya, tapi hapus lagi untuk memastikan)
                DB::table('tbl_komposisi')->where('id_bahan', $id)->delete();
                
                // 4. Hapus konversi produk yang menggunakan bahan ini
                // (Sudah dicek sebelumnya, tapi hapus lagi untuk memastikan)
                DB::table('tbl_konversi_produk')->where('id_bahan_baku', $id)->delete();
                
                // Hapus stok
                $stock->delete();

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Stok berhasil dihapus'
                ], 200);

            } catch (\Exception $e) {
                DB::rollback();
                Log::error('Error deleting stock in transaction: ' . $e->getMessage());
                Log::error('Stack trace: ' . $e->getTraceAsString());
                Log::error('Stock ID: ' . $id);
                
                // Cek apakah error karena foreign key constraint
                $errorMessage = $e->getMessage();
                if (strpos($errorMessage, 'foreign key') !== false || strpos($errorMessage, '1451') !== false) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Stok tidak dapat dihapus karena masih digunakan dalam relasi lain. Pastikan semua komposisi dan konversi produk sudah dihapus.',
                        'error' => config('app.debug') ? $e->getMessage() : 'Foreign key constraint violation'
                    ], 400);
                }
                
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Error in StockController@destroy: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus stok',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
                'file' => config('app.debug') ? $e->getFile() . ':' . $e->getLine() : null
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
                        
                        // Hapus semua relasi yang memiliki foreign key ke tbl_bahan
                        // Urutan penting: hapus dari yang paling dependen dulu
                        
                        // 1. Hapus stock history terkait (meskipun ada onDelete cascade, lebih aman hapus manual)
                        DB::table('tbl_stock_history')->where('id_bahan', $id)->delete();
                        
                        // 2. Hapus notifikasi terkait
                        DB::table('tbl_notifikasi')->where('id_bahan', $id)->delete();
                        
                        // 3. Hapus komposisi yang menggunakan bahan ini
                        DB::table('tbl_komposisi')->where('id_bahan', $id)->delete();
                        
                        // 4. Hapus konversi produk yang menggunakan bahan ini
                        DB::table('tbl_konversi_produk')->where('id_bahan_baku', $id)->delete();
                        
                        // Log history untuk delete
                        try {
                            $userId = auth()->check() ? auth()->id() : (auth()->user() ? auth()->user()->id_user : null);
                            if ($userId) {
                                $this->logStockHistory(
                                    $stock->id_bahan,
                                    'delete',
                                    $oldData,
                                    null,
                                    "Menghapus stok: {$stock->nama_bahan}",
                                    $userId
                                );
                            }
                        } catch (\Exception $e) {
                            // Log error but don't fail the delete
                            Log::error('Failed to log stock history: ' . $e->getMessage());
                        }
                        
                        // Hapus stok
                        $stock->delete();
                        $deletedCount++;
                    } catch (\Exception $e) {
                        $failedCount++;
                        $errorMessage = $e->getMessage();
                        $stockName = isset($stock) ? $stock->nama_bahan : 'Unknown';
                        
                        // Cek apakah error karena foreign key constraint
                        if (strpos($errorMessage, 'foreign key') !== false || strpos($errorMessage, '1451') !== false) {
                            $errors[] = "Stok '{$stockName}' tidak dapat dihapus karena masih digunakan dalam relasi lain";
                        } else {
                            $errors[] = "Gagal menghapus stok '{$stockName}' (ID: {$id}): " . $errorMessage;
                        }
                        Log::error("Failed to delete stock {$id}: " . $errorMessage);
                        Log::error('Stack trace: ' . $e->getTraceAsString());
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
     * Mengirim notifikasi jika stok di bawah min_stok dari bahan itu sendiri
     */
    private function sendStockNotification($stock)
    {
        // Cek apakah notifikasi diaktifkan (dari config dan settings)
        if (!config('services.n8n.enabled', true)) {
            return;
        }
        
        // Cek apakah notifikasi diaktifkan dari settings
        $notificationEnabled = \App\Models\TblSettings::getValue('notification_enabled', true);
        if (!$notificationEnabled) {
            return;
        }

        // Cek apakah stok di bawah min_stok dari bahan itu sendiri
        if ($stock->stok_bahan >= $stock->min_stok) {
            return;
        }

        // Cek cooldown 5 menit menggunakan cache
        $cacheKey = 'stock_notification_' . $stock->id_bahan;
        $lastSent = cache()->get($cacheKey);
        
        if ($lastSent) {
            $fiveMinutesAgo = now()->subMinutes(5);
            if ($lastSent->gt($fiveMinutesAgo)) {
                Log::debug('Stock notification skipped: sent recently', [
                    'bahan_id' => $stock->id_bahan,
                    'terakhir_kirim' => $lastSent
                ]);
                return;
            }
        }

        // Gunakan batch notification jika diaktifkan
        // Langsung kirim semua stok menipis dalam satu request
        if (config('services.n8n.batch_notification', true)) {
            $this->sendBatchStockNotificationInternal();
            return;
        }

        try {
            $webhookUrl = config('services.n8n.webhook_url');
            $timeout = config('services.n8n.timeout', 5);

            if (empty($webhookUrl)) {
                Log::warning('N8N webhook URL tidak dikonfigurasi');
                return;
            }

            // Reload stock dengan kategori untuk mendapatkan data lengkap
            $stock->load('kategori');

            // Kirim data ke n8n webhook
            Http::timeout($timeout)->post($webhookUrl, [
                'nama_bahan' => $stock->nama_bahan,
                'stok_bahan' => (float)$stock->stok_bahan,
                'id_bahan' => $stock->id_bahan,
                'satuan' => $stock->satuan,
                'min_stok' => (float)$stock->min_stok,
                'kategori' => $stock->kategori->nama_kategori ?? 'Tidak ada kategori',
            ]);

            // Update cache untuk cooldown
            cache()->put($cacheKey, now(), now()->addMinutes(5));

            Log::info('Stock notification sent to n8n', [
                'bahan_id' => $stock->id_bahan,
                'nama_bahan' => $stock->nama_bahan,
                'stok' => $stock->stok_bahan,
                'min_stok' => $stock->min_stok
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
     * Send batch stock notification internally (called from sendStockNotification)
     * Mengirim semua stok menipis (stok < min_stok) dalam satu request
     */
    private function sendBatchStockNotificationInternal()
    {
        // Cek apakah notifikasi diaktifkan
        if (!config('services.n8n.enabled', true)) {
            return;
        }
        
        // Cek apakah notifikasi diaktifkan dari settings
        $notificationEnabled = \App\Models\TblSettings::getValue('notification_enabled', true);
        if (!$notificationEnabled) {
            return;
        }

        try {
            // Ambil semua bahan dengan stok di bawah min_stok
            $lowStockItems = TblBahan::with('kategori')
                ->whereColumn('stok_bahan', '<', 'min_stok')
                ->get();

            if ($lowStockItems->isEmpty()) {
                return;
            }

            $itemsToSend = [];
            $fiveMinutesAgo = now()->subMinutes(5);

            foreach ($lowStockItems as $bahan) {
                // Cek cooldown 5 menit menggunakan cache
                $cacheKey = 'stock_notification_' . $bahan->id_bahan;
                $lastSent = cache()->get($cacheKey);
                
                if ($lastSent) {
                    $lastSentTime = is_string($lastSent) ? \Carbon\Carbon::parse($lastSent) : $lastSent;
                    if ($lastSentTime instanceof \Carbon\Carbon && $lastSentTime->gt($fiveMinutesAgo)) {
                        continue;
                    }
                }

                $itemsToSend[] = [
                    'nama_bahan' => $bahan->nama_bahan,
                    'stok_bahan' => (float)$bahan->stok_bahan,
                    'id_bahan' => $bahan->id_bahan,
                    'satuan' => $bahan->satuan,
                    'min_stok' => (float)$bahan->min_stok,
                    'kategori' => $bahan->kategori->nama_kategori ?? 'Tidak ada kategori',
                ];

                // Update cache untuk cooldown
                cache()->put($cacheKey, now(), now()->addMinutes(5));
            }

            if (empty($itemsToSend)) {
                return;
            }

            $webhookUrl = config('services.n8n.webhook_url');
            $timeout = config('services.n8n.timeout', 5);

            if (empty($webhookUrl)) {
                Log::warning('N8N webhook URL tidak dikonfigurasi');
                return;
            }

            // Kirim batch data ke n8n webhook
            Http::timeout($timeout)->post($webhookUrl, [
                'items' => $itemsToSend,
                'batch' => true,
                'timestamp' => now()->toIso8601String()
            ]);

            Log::info('Batch stock notification sent to n8n', [
                'items_count' => count($itemsToSend)
            ]);

        } catch (\Exception $e) {
            // Log error tapi jangan gagalkan proses
            Log::error('Failed to send batch stock notification to n8n: ' . $e->getMessage());
        }
    }

    /**
     * Send batch stock notification to n8n webhook (public method for API endpoint)
     * Mengirim semua stok menipis (stok < min_stok) dalam satu request
     * 
     * @param Request $request - Optional: 'force' parameter untuk skip pengecekan settings (untuk manual send)
     */
    public function sendBatchStockNotification(Request $request)
    {
        // Cek apakah notifikasi diaktifkan (dari config)
        if (!config('services.n8n.enabled', true)) {
            return response()->json([
                'success' => false,
                'message' => 'Notifikasi n8n tidak diaktifkan di konfigurasi'
            ], 400);
        }
        
        // Untuk manual send (force=true), skip pengecekan settings
        // Untuk otomatis, cek settings
        $force = $request->input('force', false);
        if (!$force) {
            $notificationEnabled = \App\Models\TblSettings::getValue('notification_enabled', true);
            if (!$notificationEnabled) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notifikasi dinonaktifkan di pengaturan. Aktifkan di halaman Pengaturan atau gunakan opsi "Kirim Sekarang" untuk mengirim manual.'
                ], 400);
            }
        }

        try {
            // Ambil semua bahan dengan stok di bawah min_stok
            $lowStockItems = TblBahan::with('kategori')
                ->whereColumn('stok_bahan', '<', 'min_stok')
                ->get();

            if ($lowStockItems->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Tidak ada stok yang menipis',
                    'data' => []
                ], 200);
            }

            $itemsToSend = [];
            $fiveMinutesAgo = now()->subMinutes(5);

            foreach ($lowStockItems as $bahan) {
                // Untuk manual send (force=true), skip cooldown
                // Untuk otomatis, cek cooldown 5 menit menggunakan cache
                if (!$force) {
                    $cacheKey = 'stock_notification_' . $bahan->id_bahan;
                    $lastSent = cache()->get($cacheKey);
                    
                    if ($lastSent) {
                        $lastSentTime = is_string($lastSent) ? \Carbon\Carbon::parse($lastSent) : $lastSent;
                        if ($lastSentTime instanceof \Carbon\Carbon && $lastSentTime->gt($fiveMinutesAgo)) {
                            continue;
                        }
                    }
                }

                $itemsToSend[] = [
                    'nama_bahan' => $bahan->nama_bahan,
                    'stok_bahan' => (float)$bahan->stok_bahan,
                    'id_bahan' => $bahan->id_bahan,
                    'satuan' => $bahan->satuan,
                    'min_stok' => (float)$bahan->min_stok,
                    'kategori' => $bahan->kategori->nama_kategori ?? 'Tidak ada kategori',
                ];

                // Update cache untuk cooldown (hanya untuk otomatis, bukan manual)
                if (!$force) {
                    $cacheKey = 'stock_notification_' . $bahan->id_bahan;
                    cache()->put($cacheKey, now(), now()->addMinutes(5));
                }
            }

            if (empty($itemsToSend)) {
                return response()->json([
                    'success' => true,
                    'message' => 'Tidak ada stok yang menipis atau tidak ada notifikasi aktif',
                    'data' => []
                ], 200);
            }

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
                'items' => $itemsToSend,
                'batch' => true,
                'total_items' => count($itemsToSend)
            ]);

            Log::info('Batch stock notification sent to n8n', [
                'total_items' => count($itemsToSend),
                'items' => $itemsToSend
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Batch notification berhasil dikirim',
                'total_items' => count($itemsToSend),
                'data' => $itemsToSend
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
