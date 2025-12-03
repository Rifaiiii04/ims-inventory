<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblKomposisi;
use App\Models\TblVarian;
use App\Models\TblBahan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CompositionController extends Controller
{
    /**
     * Get all compositions
     */
    public function index(Request $request)
    {
        try {
            // Ambil komposisi dengan varian
            $compositionsWithVariants = DB::table('tbl_komposisi')
                ->join('tbl_varian', 'tbl_komposisi.id_varian', '=', 'tbl_varian.id_varian')
                ->join('tbl_produk', 'tbl_varian.id_produk', '=', 'tbl_produk.id_produk')
                ->join('tbl_bahan', 'tbl_komposisi.id_bahan', '=', 'tbl_bahan.id_bahan')
                ->whereNotNull('tbl_komposisi.id_varian')
                ->select(
                    'tbl_komposisi.*',
                    'tbl_varian.nama_varian',
                    'tbl_varian.stok_varian',
                    'tbl_produk.nama_produk',
                    'tbl_produk.id_produk',
                    'tbl_bahan.nama_bahan',
                    'tbl_bahan.satuan as bahan_satuan',
                    'tbl_bahan.stok_bahan'
                );

            // Ambil komposisi langsung ke produk (tanpa varian)
            $compositionsDirectToProduct = DB::table('tbl_komposisi')
                ->join('tbl_produk', 'tbl_komposisi.id_produk', '=', 'tbl_produk.id_produk')
                ->join('tbl_bahan', 'tbl_komposisi.id_bahan', '=', 'tbl_bahan.id_bahan')
                ->whereNull('tbl_komposisi.id_varian')
                ->select(
                    'tbl_komposisi.*',
                    DB::raw('NULL as nama_varian'),
                    DB::raw('0 as stok_varian'),
                    'tbl_produk.nama_produk',
                    'tbl_produk.id_produk',
                    'tbl_bahan.nama_bahan',
                    'tbl_bahan.satuan as bahan_satuan',
                    'tbl_bahan.stok_bahan'
                );

            // Gabungkan kedua query
            $compositions = $compositionsWithVariants
                ->union($compositionsDirectToProduct)
                ->get()
                ->sortByDesc('id_produk')
                ->values(); // Reset keys to make it a proper indexed array

            // Group komposisi berdasarkan produk/varian
            $groupedCompositions = [];
            
            foreach ($compositions as $composition) {
                // Key untuk grouping: variant_id jika ada, atau product_id jika tidak ada variant
                $groupKey = $composition->id_varian ? "variant_{$composition->id_varian}" : "product_{$composition->id_produk}";
                
                if (!isset($groupedCompositions[$groupKey])) {
                    // Ambil stok_varian jika ada varian
                    $stokVarian = 0;
                    if ($composition->id_varian) {
                        $variantInfo = DB::table('tbl_varian')
                            ->where('id_varian', $composition->id_varian)
                            ->select('stok_varian')
                            ->first();
                        $stokVarian = $variantInfo ? (float)$variantInfo->stok_varian : 0;
                    }
                    
                    $groupedCompositions[$groupKey] = [
                        'id' => $composition->id_varian ? "variant_{$composition->id_varian}" : "product_{$composition->id_produk}",
                    'variant_id' => $composition->id_varian,
                    'variant_name' => $composition->nama_varian,
                    'product_id' => $composition->id_produk,
                    'product_name' => $composition->nama_produk,
                        'stok_varian' => $stokVarian,
                        'estimated_production' => 0, // Akan dihitung setelah semua ingredients ditambahkan
                        'ingredients' => [],
                        'created_at' => $composition->created_at,
                        'updated_at' => $composition->updated_at,
                    ];
                }
                
                // Hitung estimasi produksi untuk bahan ini
                $ingredientEstimation = 0;
                // Pastikan stok bahan > 0 dan jumlah_per_porsi > 0
                if ($composition->jumlah_per_porsi > 0 && $composition->stok_bahan > 0) {
                    $ingredientEstimation = floor($composition->stok_bahan / $composition->jumlah_per_porsi);
                } else {
                    // Jika stok bahan = 0 atau jumlah_per_porsi = 0, estimasi = 0
                    $ingredientEstimation = 0;
                }
                
                // Ambil informasi lengkap bahan (hanya field yang pasti ada)
                $bahanInfo = DB::table('tbl_bahan')
                    ->leftJoin('tbl_kategori', 'tbl_bahan.id_kategori', '=', 'tbl_kategori.id_kategori')
                    ->where('tbl_bahan.id_bahan', $composition->id_bahan)
                    ->select(
                        'tbl_bahan.min_stok',
                        'tbl_bahan.harga_beli',
                        'tbl_bahan.created_at as bahan_created_at',
                        'tbl_bahan.updated_at as bahan_updated_at',
                        'tbl_kategori.nama_kategori'
                    )
                    ->first();
                
                // Set default jika bahanInfo null
                if (!$bahanInfo) {
                    $bahanInfo = (object)[
                        'min_stok' => 0,
                        'harga_beli' => 0,
                        'nama_kategori' => 'Tidak ada kategori',
                        'bahan_created_at' => null,
                        'bahan_updated_at' => null,
                    ];
                }
                
                // Set default untuk field optional (division fields)
                // Field ini mungkin tidak ada jika migration belum dijalankan
                $bahanInfo->is_divisible = false;
                $bahanInfo->max_divisions = null;
                $bahanInfo->division_description = null;
                
                // Tambahkan bahan ke array ingredients
                $groupedCompositions[$groupKey]['ingredients'][] = [
                    'composition_id' => $composition->id_komposisi,
                    'ingredient_id' => $composition->id_bahan,
                    'ingredient_name' => $composition->nama_bahan,
                    'ingredient_unit' => $composition->bahan_satuan,
                    'quantity' => (float)$composition->jumlah_per_porsi,
                    'ingredient_stock' => (float)$composition->stok_bahan,
                    'estimated_production' => $ingredientEstimation,
                    'min_stok' => $bahanInfo->min_stok ?? 0,
                    'harga_beli' => $bahanInfo->harga_beli ?? 0,
                    'is_divisible' => $bahanInfo->is_divisible ?? false,
                    'max_divisions' => $bahanInfo->max_divisions ?? null,
                    'division_description' => $bahanInfo->division_description ?? null,
                    'kategori' => $bahanInfo->nama_kategori ?? 'Tidak ada kategori',
                    'bahan_created_at' => $bahanInfo->bahan_created_at ?? null,
                    'bahan_updated_at' => $bahanInfo->bahan_updated_at ?? null,
                    'is_bahan_baku_utama' => (bool)($composition->is_bahan_baku_utama ?? false), // PENTING: Include flag bahan baku utama
                ];
            }
            
            // Hitung estimasi produksi minimum untuk setiap grup
            foreach ($groupedCompositions as &$group) {
                $minEstimation = null;
                $hasIngredients = false;
                $hasZeroStock = false;
                
                foreach ($group['ingredients'] as $ingredient) {
                    $hasIngredients = true;
                    
                    // Jika stok bahan <= 0, maka tidak bisa diproduksi dari bahan ini
                    if ($ingredient['ingredient_stock'] <= 0) {
                        $hasZeroStock = true;
                        // Jika ada bahan dengan stok 0, estimasi dari bahan = 0
                        $minEstimation = 0;
                        break; // Langsung break karena tidak bisa diproduksi
                    }
                    
                    // Hitung ulang estimasi untuk bahan ini (pastikan menggunakan stok terbaru)
                    $quantity = $ingredient['quantity'] ?? 0;
                    $stock = $ingredient['ingredient_stock'] ?? 0;
                    if ($quantity > 0 && $stock > 0) {
                        $estimation = floor($stock / $quantity);
                        // Ambil minimum dari semua bahan
                        if ($minEstimation === null || $estimation < $minEstimation) {
                            $minEstimation = $estimation;
                        }
                    } else {
                        // Jika quantity = 0 atau stock = 0, estimasi = 0
                        $hasZeroStock = true;
                        $minEstimation = 0;
                        break;
                    }
                }
                
                // Hitung total estimasi: stok_varian + estimasi dari bahan
                $estimatedFromIngredients = 0;
                if ($hasIngredients && !$hasZeroStock && $minEstimation !== null && $minEstimation > 0) {
                    $estimatedFromIngredients = $minEstimation;
                }
                
                $stokVarian = (float)($group['stok_varian'] ?? 0);
                
                // Total estimasi = stok_varian (sudah jadi) + estimasi dari bahan
                // Jika stok_varian = 0 dan estimasi dari bahan = 0, maka total = 0
                $group['estimated_production'] = $stokVarian + $estimatedFromIngredients;
            }
            
            // Convert to indexed array
            $formattedCompositions = array_values($groupedCompositions);

            return response()->json([
                'success' => true,
                'data' => $formattedCompositions
            ], 200);

        } catch (\Exception $e) {
            \Log::error('CompositionController@index Error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data komposisi',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
                'file' => config('app.debug') ? $e->getFile() . ':' . $e->getLine() : null
            ], 500);
        }
    }

    /**
     * Get composition by ID
     */
    public function show($id)
    {
        try {
            $composition = TblKomposisi::with([
                'varian:id_varian,id_produk,nama_varian',
                'bahan:id_bahan,nama_bahan,satuan'
            ])->find($id);

            if (!$composition) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data komposisi tidak ditemukan'
                ], 404);
            }

            $formattedComposition = [
                'id' => $composition->id_komposisi,
                'variant_id' => $composition->id_varian,
                'variant_name' => $composition->varian->nama_varian ?? 'Varian Tidak Diketahui',
                'product_id' => $composition->varian->produk->id_produk ?? null,
                'product_name' => $composition->varian->produk->nama_produk ?? 'Produk Tidak Diketahui',
                'ingredient_id' => $composition->id_bahan,
                'ingredient_name' => $composition->bahan->nama_bahan ?? 'Bahan Tidak Diketahui',
                'ingredient_unit' => $composition->bahan->satuan ?? '',
                'quantity' => (float)$composition->jumlah_bahan,
                'created_at' => $composition->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $composition->updated_at->format('Y-m-d H:i:s'),
            ];

            return response()->json([
                'success' => true,
                'data' => $formattedComposition
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data komposisi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new composition
     */
    public function store(Request $request)
    {
        try {
            // Validation
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|exists:tbl_produk,id_produk',
                'variant_id' => 'nullable|exists:tbl_varian,id_varian',
                'ingredient_id' => 'required|exists:tbl_bahan,id_bahan',
                'quantity' => 'required|numeric|min:0.01',
                'is_bahan_baku_utama' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Jika tidak ada variant_id, buat komposisi langsung ke produk
            if (!$request->variant_id) {
                // Cek apakah komposisi sudah ada (produk + bahan yang sama)
                $existingComposition = DB::table('tbl_komposisi')
                    ->where('id_produk', $request->product_id)
                    ->where('id_bahan', $request->ingredient_id)
                    ->whereNull('id_varian')
                    ->first();

                if ($existingComposition) {
                    // Jika ini dipilih sebagai bahan baku utama, set yang lain jadi false
                    $isMainIngredient = $request->has('is_bahan_baku_utama') && $request->is_bahan_baku_utama == true;
                    if ($isMainIngredient) {
                        // Set semua komposisi lain untuk produk ini menjadi false
                        DB::table('tbl_komposisi')
                            ->where('id_produk', $request->product_id)
                            ->whereNull('id_varian')
                            ->where('id_komposisi', '!=', $existingComposition->id_komposisi)
                            ->update(['is_bahan_baku_utama' => false]);
                    }
                    
                    // Update jumlah jika sudah ada
                    DB::table('tbl_komposisi')
                        ->where('id_komposisi', $existingComposition->id_komposisi)
                        ->update([
                            'jumlah_per_porsi' => $request->quantity,
                            'is_bahan_baku_utama' => $isMainIngredient,
                            'updated_at' => now()
                        ]);

                    return response()->json([
                        'success' => true,
                        'message' => 'Komposisi sudah ada, jumlah berhasil diperbarui',
                        'data' => [
                            'id' => $existingComposition->id_komposisi,
                            'product_id' => $request->product_id,
                            'variant_id' => null,
                            'ingredient_id' => $request->ingredient_id,
                            'quantity' => (float)$request->quantity,
                            'is_bahan_baku_utama' => $isMainIngredient,
                            'updated_at' => now()->format('Y-m-d H:i:s'),
                        ]
                    ], 200);
                }

                // Jika ini dipilih sebagai bahan baku utama, set yang lain jadi false
                $isMainIngredient = $request->has('is_bahan_baku_utama') && $request->is_bahan_baku_utama == true;
                if ($isMainIngredient) {
                    // Set semua komposisi lain untuk produk ini menjadi false
                    DB::table('tbl_komposisi')
                        ->where('id_produk', $request->product_id)
                        ->whereNull('id_varian')
                        ->update(['is_bahan_baku_utama' => false]);
                }
                
                // Ambil satuan dari bahan
                $bahan = DB::table('tbl_bahan')->where('id_bahan', $request->ingredient_id)->first();
                $satuan = $bahan ? $bahan->satuan : 'kg';

                $composition = DB::table('tbl_komposisi')->insertGetId([
                    'id_produk' => $request->product_id,
                    'id_varian' => null,
                    'id_bahan' => $request->ingredient_id,
                    'jumlah_per_porsi' => $request->quantity,
                    'satuan' => $satuan,
                    'is_bahan_baku_utama' => $isMainIngredient,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Komposisi berhasil ditambahkan',
                    'data' => [
                        'id' => $composition,
                        'product_id' => $request->product_id,
                        'variant_id' => null,
                        'ingredient_id' => $request->ingredient_id,
                        'quantity' => (float)$request->quantity,
                        'satuan' => $satuan,
                        'created_at' => now()->format('Y-m-d H:i:s'),
                        'updated_at' => now()->format('Y-m-d H:i:s'),
                    ]
                ], 201);
            }

            // Cek apakah komposisi sudah ada (varian + bahan yang sama)
            $existingComposition = DB::table('tbl_komposisi')
                ->where('id_varian', $request->variant_id)
                ->where('id_bahan', $request->ingredient_id)
                ->first();

            if ($existingComposition) {
                // Jika ini dipilih sebagai bahan baku utama, set yang lain jadi false
                $isMainIngredient = $request->has('is_bahan_baku_utama') && $request->is_bahan_baku_utama == true;
                if ($isMainIngredient) {
                    // Set semua komposisi lain untuk variant ini menjadi false
                    DB::table('tbl_komposisi')
                        ->where('id_varian', $request->variant_id)
                        ->where('id_komposisi', '!=', $existingComposition->id_komposisi)
                        ->update(['is_bahan_baku_utama' => false]);
                }
                
                // Update jumlah jika sudah ada
                DB::table('tbl_komposisi')
                    ->where('id_komposisi', $existingComposition->id_komposisi)
                    ->update([
                        'jumlah_per_porsi' => $request->quantity,
                        'is_bahan_baku_utama' => $isMainIngredient,
                        'updated_at' => now()
                    ]);

                // Ambil product_id dari varian
                $variant = DB::table('tbl_varian')->where('id_varian', $request->variant_id)->first();
                $product_id = $variant ? $variant->id_produk : null;

                return response()->json([
                    'success' => true,
                    'message' => 'Komposisi sudah ada, jumlah berhasil diperbarui',
                    'data' => [
                        'id' => $existingComposition->id_komposisi,
                        'product_id' => $product_id,
                        'variant_id' => $request->variant_id,
                        'ingredient_id' => $request->ingredient_id,
                        'quantity' => (float)$request->quantity,
                        'is_bahan_baku_utama' => $isMainIngredient,
                        'updated_at' => now()->format('Y-m-d H:i:s'),
                    ]
                ], 200);
            }

            // Jika ini dipilih sebagai bahan baku utama, set yang lain jadi false
            $isMainIngredient = $request->has('is_bahan_baku_utama') && $request->is_bahan_baku_utama == true;
            if ($isMainIngredient) {
                // Set semua komposisi lain untuk variant ini menjadi false
                DB::table('tbl_komposisi')
                    ->where('id_varian', $request->variant_id)
                    ->update(['is_bahan_baku_utama' => false]);
            }
            
            // Ambil satuan dari bahan
            $bahan = DB::table('tbl_bahan')->where('id_bahan', $request->ingredient_id)->first();
            $satuan = $bahan ? $bahan->satuan : 'kg';

            // Ambil product_id dari varian
            $variant = DB::table('tbl_varian')->where('id_varian', $request->variant_id)->first();
            $product_id = $variant ? $variant->id_produk : null;

            $composition = DB::table('tbl_komposisi')->insertGetId([
                'id_produk' => $product_id,
                'id_varian' => $request->variant_id,
                'id_bahan' => $request->ingredient_id,
                'jumlah_per_porsi' => $request->quantity,
                'satuan' => $satuan,
                'is_bahan_baku_utama' => $isMainIngredient,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Komposisi berhasil ditambahkan',
                'data' => [
                    'id' => $composition,
                    'product_id' => $product_id,
                    'variant_id' => $request->variant_id,
                    'ingredient_id' => $request->ingredient_id,
                    'quantity' => (float)$request->quantity,
                    'satuan' => $satuan,
                    'created_at' => now()->format('Y-m-d H:i:s'),
                    'updated_at' => now()->format('Y-m-d H:i:s'),
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menambahkan komposisi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update composition
     */
    public function update(Request $request, $id)
    {
        try {
            $composition = DB::table('tbl_komposisi')->where('id_komposisi', $id)->first();

            if (!$composition) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data komposisi tidak ditemukan'
                ], 404);
            }

            // Validation - variant_id bisa null untuk komposisi langsung ke produk
            $validator = Validator::make($request->all(), [
                'variant_id' => 'nullable|exists:tbl_varian,id_varian',
                'product_id' => 'nullable|exists:tbl_produk,id_produk',
                'ingredient_id' => 'required|exists:tbl_bahan,id_bahan',
                'quantity' => 'required|numeric|min:0.01',
                'is_bahan_baku_utama' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Tentukan apakah ini komposisi dengan variant atau tanpa variant
            $hasVariant = $request->has('variant_id') && $request->variant_id !== null;
            
            // Cek duplikat (kecuali untuk komposisi yang sedang diedit)
            $existingComposition = null;
            if ($hasVariant) {
                $existingComposition = DB::table('tbl_komposisi')
                    ->where('id_varian', $request->variant_id)
                    ->where('id_bahan', $request->ingredient_id)
                    ->where('id_komposisi', '!=', $id)
                    ->first();
            } else {
                // Untuk komposisi tanpa variant, cek berdasarkan product_id
                $productId = $request->product_id ?? $composition->id_produk;
                if ($productId) {
                    $existingComposition = DB::table('tbl_komposisi')
                        ->where('id_produk', $productId)
                        ->whereNull('id_varian')
                        ->where('id_bahan', $request->ingredient_id)
                        ->where('id_komposisi', '!=', $id)
                        ->first();
                }
            }

            if ($existingComposition) {
                return response()->json([
                    'success' => false,
                    'message' => 'Komposisi dengan varian/produk dan bahan yang sama sudah ada'
                ], 422);
            }

            // Jika ini dipilih sebagai bahan baku utama, set yang lain jadi false
            $isMainIngredient = $request->has('is_bahan_baku_utama') && $request->is_bahan_baku_utama == true;
            if ($isMainIngredient) {
                if ($hasVariant) {
                    // Set semua komposisi lain untuk variant ini menjadi false
                    DB::table('tbl_komposisi')
                        ->where('id_varian', $request->variant_id)
                        ->where('id_komposisi', '!=', $id)
                        ->update(['is_bahan_baku_utama' => false]);
                } else {
                    // Set semua komposisi lain untuk produk ini (tanpa variant) menjadi false
                    $productId = $request->product_id ?? $composition->id_produk;
                    if ($productId) {
                        DB::table('tbl_komposisi')
                            ->where('id_produk', $productId)
                            ->whereNull('id_varian')
                            ->where('id_komposisi', '!=', $id)
                            ->update(['is_bahan_baku_utama' => false]);
                    }
                }
            }

            // Ambil satuan dari bahan
            $bahan = DB::table('tbl_bahan')->where('id_bahan', $request->ingredient_id)->first();
            $satuan = $bahan ? $bahan->satuan : 'kg';

            // Update komposisi
            $updateData = [
                'id_bahan' => $request->ingredient_id,
                'jumlah_per_porsi' => $request->quantity,
                'satuan' => $satuan,
                'is_bahan_baku_utama' => $isMainIngredient,
                'updated_at' => now(),
            ];
            
            // Hanya update variant_id jika ada
            if ($hasVariant) {
                $updateData['id_varian'] = $request->variant_id;
            } else {
                // Untuk komposisi tanpa variant, pastikan variant_id tetap null
                $updateData['id_varian'] = null;
            }
            
            DB::table('tbl_komposisi')
                ->where('id_komposisi', $id)
                ->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Komposisi berhasil diperbarui',
                'data' => [
                    'id' => $id,
                    'variant_id' => $request->variant_id,
                    'ingredient_id' => $request->ingredient_id,
                    'quantity' => (float)$request->quantity,
                    'satuan' => $satuan,
                    'created_at' => $composition->created_at,
                    'updated_at' => now()->format('Y-m-d H:i:s'),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui komposisi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete composition
     */
    public function destroy($id)
    {
        try {
            $composition = DB::table('tbl_komposisi')->where('id_komposisi', $id)->first();

            if (!$composition) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data komposisi tidak ditemukan'
                ], 404);
            }

            DB::table('tbl_komposisi')->where('id_komposisi', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Komposisi berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus komposisi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get variants for dropdown
     */
    public function variants()
    {
        try {
            $variants = TblVarian::with(['produk:id_produk,nama_produk'])
                ->select('id_varian', 'id_produk', 'nama_varian')
                ->orderBy('nama_varian', 'asc')
                ->get();

            $formattedVariants = $variants->map(function($variant) {
                return [
                    'id' => $variant->id_varian,
                    'name' => $variant->nama_varian,
                    'product_id' => $variant->id_produk,
                    'product_name' => $variant->produk->nama_produk ?? 'Produk Tidak Diketahui'
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedVariants
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data varian',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get ingredients for dropdown
     */
    public function ingredients()
    {
        try {
            $ingredients = TblBahan::select('id_bahan', 'nama_bahan', 'satuan', 'min_stok')
                ->orderBy('nama_bahan', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $ingredients
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data bahan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}