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
            $compositions = DB::table('tbl_komposisi')
                ->orderBy('id_komposisi', 'desc')
                ->get();

            $formattedCompositions = $compositions->map(function($composition) {
                return [
                    'id' => $composition->id_komposisi,
                    'variant_id' => $composition->id_varian,
                    'variant_name' => 'Varian ' . $composition->id_varian,
                    'product_id' => null,
                    'product_name' => 'Produk Tidak Diketahui',
                    'ingredient_id' => $composition->id_bahan,
                    'ingredient_name' => 'Bahan ' . $composition->id_bahan,
                    'ingredient_unit' => $composition->satuan ?? 'kg',
                    'quantity' => (float)$composition->jumlah_per_porsi,
                    'created_at' => $composition->created_at,
                    'updated_at' => $composition->updated_at,
                ];
            });

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
            // Simple validation
            if (!$request->variant_id || !$request->ingredient_id || !$request->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Semua field harus diisi'
                ], 422);
            }

            $composition = DB::table('tbl_komposisi')->insertGetId([
                'id_varian' => $request->variant_id,
                'id_bahan' => $request->ingredient_id,
                'jumlah_per_porsi' => $request->quantity,
                'satuan' => 'kg',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Komposisi berhasil ditambahkan',
                'data' => [
                    'id' => $composition,
                    'variant_id' => $request->variant_id,
                    'variant_name' => 'Varian ' . $request->variant_id,
                    'product_id' => null,
                    'product_name' => 'Produk Tidak Diketahui',
                    'ingredient_id' => $request->ingredient_id,
                    'ingredient_name' => 'Bahan ' . $request->ingredient_id,
                    'ingredient_unit' => 'kg',
                    'quantity' => (float)$request->quantity,
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

            // Simple validation
            if (!$request->variant_id || !$request->ingredient_id || !$request->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Semua field harus diisi'
                ], 422);
            }

            DB::table('tbl_komposisi')
                ->where('id_komposisi', $id)
                ->update([
                    'id_varian' => $request->variant_id,
                    'id_bahan' => $request->ingredient_id,
                    'jumlah_per_porsi' => $request->quantity,
                    'satuan' => 'kg',
                    'updated_at' => now(),
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Komposisi berhasil diperbarui',
                'data' => [
                    'id' => $id,
                    'variant_id' => $request->variant_id,
                    'variant_name' => 'Varian ' . $request->variant_id,
                    'product_id' => null,
                    'product_name' => 'Produk Tidak Diketahui',
                    'ingredient_id' => $request->ingredient_id,
                    'ingredient_name' => 'Bahan ' . $request->ingredient_id,
                    'ingredient_unit' => 'kg',
                    'quantity' => (float)$request->quantity,
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