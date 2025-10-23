<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblKomposisi;
use App\Models\TblVarian;
use App\Models\TblBahan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CompositionController extends Controller
{
    /**
     * Get all compositions
     */
    public function index(Request $request)
    {
        try {
            // Ambil semua komposisi dengan detail
            $compositions = DB::table('tbl_komposisi')
                ->join('tbl_varian', 'tbl_komposisi.id_varian', '=', 'tbl_varian.id_varian')
                ->join('tbl_produk', 'tbl_varian.id_produk', '=', 'tbl_produk.id_produk')
                ->join('tbl_bahan', 'tbl_komposisi.id_bahan', '=', 'tbl_bahan.id_bahan')
                ->select(
                    'tbl_komposisi.*',
                    'tbl_varian.nama_varian',
                    'tbl_produk.nama_produk',
                    'tbl_produk.id_produk',
                    'tbl_bahan.nama_bahan',
                    'tbl_bahan.satuan as bahan_satuan',
                    'tbl_bahan.stok_bahan'
                )
                ->orderBy('tbl_varian.id_varian', 'desc')
                ->get();

            // Kelompokkan berdasarkan varian
            $groupedCompositions = $compositions->groupBy('id_varian');
            
            $formattedCompositions = $groupedCompositions->map(function($variantCompositions, $variantId) {
                $firstComposition = $variantCompositions->first();
                $ingredients = $variantCompositions->map(function($composition) {
                    // Hitung estimasi hasil produksi berdasarkan stok bahan
                    $estimatedProduction = 0;
                    if ($composition->jumlah_per_porsi > 0) {
                        $estimatedProduction = floor($composition->stok_bahan / $composition->jumlah_per_porsi);
                    }

                    return [
                        'id' => $composition->id_komposisi,
                        'ingredient_id' => $composition->id_bahan,
                        'ingredient_name' => $composition->nama_bahan,
                        'ingredient_unit' => $composition->bahan_satuan,
                        'quantity' => (float)$composition->jumlah_per_porsi,
                        'estimated_production' => $estimatedProduction,
                        'ingredient_stock' => (float)$composition->stok_bahan,
                    ];
                });

                // Hitung estimasi produksi minimum (bahan yang paling terbatas)
                $minEstimatedProduction = $ingredients->min('estimated_production');

                return [
                    'variant_id' => $firstComposition->id_varian,
                    'variant_name' => $firstComposition->nama_varian,
                    'product_id' => $firstComposition->id_produk,
                    'product_name' => $firstComposition->nama_produk,
                    'ingredients' => $ingredients,
                    'ingredients_count' => $ingredients->count(),
                    'estimated_production' => $minEstimatedProduction,
                    'created_at' => $firstComposition->created_at,
                    'updated_at' => $firstComposition->updated_at,
                ];
            })->values();

            return response()->json([
                'success' => true,
                'data' => $formattedCompositions
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
                'variant_id' => 'required|exists:tbl_varian,id_varian',
                'ingredient_id' => 'required|exists:tbl_bahan,id_bahan',
                'quantity' => 'required|numeric|min:0.01'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Cek apakah komposisi sudah ada (varian + bahan yang sama)
            $existingComposition = DB::table('tbl_komposisi')
                ->where('id_varian', $request->variant_id)
                ->where('id_bahan', $request->ingredient_id)
                ->first();

            if ($existingComposition) {
                // Update jumlah jika sudah ada
                DB::table('tbl_komposisi')
                    ->where('id_komposisi', $existingComposition->id_komposisi)
                    ->update([
                        'jumlah_per_porsi' => $request->quantity,
                        'updated_at' => now()
                    ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Komposisi sudah ada, jumlah berhasil diperbarui',
                    'data' => [
                        'id' => $existingComposition->id_komposisi,
                        'variant_id' => $request->variant_id,
                        'ingredient_id' => $request->ingredient_id,
                        'quantity' => (float)$request->quantity,
                        'updated_at' => now()->format('Y-m-d H:i:s'),
                    ]
                ], 200);
            }

            // Ambil satuan dari bahan
            $bahan = DB::table('tbl_bahan')->where('id_bahan', $request->ingredient_id)->first();
            $satuan = $bahan ? $bahan->satuan : 'kg';

            $composition = DB::table('tbl_komposisi')->insertGetId([
                'id_varian' => $request->variant_id,
                'id_bahan' => $request->ingredient_id,
                'jumlah_per_porsi' => $request->quantity,
                'satuan' => $satuan,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Komposisi berhasil ditambahkan',
                'data' => [
                    'id' => $composition,
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

            // Validation
            $validator = Validator::make($request->all(), [
                'variant_id' => 'required|exists:tbl_varian,id_varian',
                'ingredient_id' => 'required|exists:tbl_bahan,id_bahan',
                'quantity' => 'required|numeric|min:0.01'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Cek duplikat (kecuali untuk komposisi yang sedang diedit)
            $existingComposition = DB::table('tbl_komposisi')
                ->where('id_varian', $request->variant_id)
                ->where('id_bahan', $request->ingredient_id)
                ->where('id_komposisi', '!=', $id)
                ->first();

            if ($existingComposition) {
                return response()->json([
                    'success' => false,
                    'message' => 'Komposisi dengan varian dan bahan yang sama sudah ada'
                ], 422);
            }

            // Ambil satuan dari bahan
            $bahan = DB::table('tbl_bahan')->where('id_bahan', $request->ingredient_id)->first();
            $satuan = $bahan ? $bahan->satuan : 'kg';

            DB::table('tbl_komposisi')
                ->where('id_komposisi', $id)
                ->update([
                    'id_varian' => $request->variant_id,
                    'id_bahan' => $request->ingredient_id,
                    'jumlah_per_porsi' => $request->quantity,
                    'satuan' => $satuan,
                    'updated_at' => now(),
                ]);

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
            $ingredients = TblBahan::select('id_bahan', 'nama_bahan', 'satuan')
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