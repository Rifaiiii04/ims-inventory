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
     * Create new stock item
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100',
                'category_id' => 'required|exists:tbl_kategori,id_kategori',
                'buyPrice' => 'required|numeric|min:0',
                'quantity' => 'required|numeric|min:0',
                'unit' => 'required|string|max:20',
                'minStock' => 'required|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $stock = TblBahan::create([
                'nama_bahan' => $request->name,
                'id_kategori' => $request->category_id,
                'harga_beli' => $request->buyPrice,
                'stok_bahan' => $request->quantity,
                'satuan' => $request->unit,
                'min_stok' => $request->minStock,
                'updated_by' => $request->user()->id_user
            ]);

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
                // Log error but don't fail the create
                \Log::error('Failed to log stock history: ' . $e->getMessage());
            }

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
                    'isLowStock' => $stock->stok_bahan < $stock->min_stok
                ]
            ], 201);

        } catch (\Exception $e) {
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
                'minStock' => 'required|numeric|min:0'
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
                \Log::error('Failed to log stock history: ' . $e->getMessage());
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
                \Log::error('Failed to log stock history: ' . $e->getMessage());
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
            $query = TblStockHistory::with(['bahan', 'user'])
                ->orderBy('created_at', 'desc');

            // Filter by stock ID if provided
            if ($id) {
                $query->where('id_bahan', $id);
            }

            // Filter by action if provided
            if ($request->has('action')) {
                $query->where('action', $request->action);
            }

            // Filter by date range if provided
            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $history = $query->paginate($request->get('per_page', 15));

            $formattedHistory = $history->map(function($item) {
                return [
                    'id' => $item->id_history,
                    'action' => $item->action,
                    'action_display' => $this->getActionDisplayName($item->action),
                    'description' => $item->description,
                    'old_data' => $item->old_data,
                    'new_data' => $item->new_data,
                    'changes' => $this->formatChanges($item->old_data, $item->new_data, $item->action),
                    'bahan_name' => $item->bahan->nama_bahan ?? 'Bahan Terhapus',
                    'user_name' => $item->user->nama_user ?? 'User Tidak Diketahui',
                    'created_at' => $item->created_at->format('Y-m-d H:i:s'),
                    'created_at_human' => $item->created_at->diffForHumans(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedHistory,
                'pagination' => [
                    'current_page' => $history->currentPage(),
                    'last_page' => $history->lastPage(),
                    'per_page' => $history->perPage(),
                    'total' => $history->total(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil history stok',
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
