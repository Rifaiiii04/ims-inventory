<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblVarian;
use App\Models\TblProduk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VariantController extends Controller
{
    /**
     * Get all variants
     */
    public function index(Request $request)
    {
        try {
            $variants = TblVarian::with(['produk:id_produk,nama_produk'])
                ->orderBy('nama_varian', 'asc')
                ->get();

            $formattedVariants = $variants->map(function($variant) {
                return [
                    'id' => $variant->id_varian,
                    'name' => $variant->nama_varian,
                    'product_id' => $variant->id_produk,
                    'product_name' => $variant->produk->nama_produk ?? 'Produk Tidak Diketahui',
                    'harga' => (float)$variant->harga,
                    'stok' => (float)$variant->stok_varian,
                    'created_at' => $variant->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $variant->updated_at->format('Y-m-d H:i:s'),
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
     * Get variant by ID
     */
    public function show($id)
    {
        try {
            $variant = TblVarian::with(['produk:id_produk,nama_produk'])
                ->find($id);

            if (!$variant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data varian tidak ditemukan'
                ], 404);
            }

            $formattedVariant = [
                'id' => $variant->id_varian,
                'name' => $variant->nama_varian,
                'product_id' => $variant->id_produk,
                'product_name' => $variant->produk->nama_produk ?? 'Produk Tidak Diketahui',
                'harga' => (float)$variant->harga,
                'stok' => (float)$variant->stok_varian,
                'created_at' => $variant->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $variant->updated_at->format('Y-m-d H:i:s'),
            ];

            return response()->json([
                'success' => true,
                'data' => $formattedVariant
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
     * Create new variant
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100',
                'product_id' => 'required|exists:tbl_produk,id_produk',
                'harga' => 'required|numeric|min:0',
                'stok' => 'required|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $variant = TblVarian::create([
                'nama_varian' => $request->name,
                'id_produk' => $request->product_id,
                'harga' => $request->harga,
                'stok_varian' => $request->stok,
            ]);

            // Reload variant with product for response
            $variant->load(['produk:id_produk,nama_produk']);

            return response()->json([
                'success' => true,
                'message' => 'Varian berhasil ditambahkan',
                'data' => [
                    'id' => $variant->id_varian,
                    'name' => $variant->nama_varian,
                    'product_id' => $variant->id_produk,
                    'product_name' => $variant->produk->nama_produk ?? 'Produk Tidak Diketahui',
                    'harga' => (float)$variant->harga,
                    'stok' => (float)$variant->stok_varian,
                    'created_at' => $variant->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $variant->updated_at->format('Y-m-d H:i:s'),
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menambahkan varian',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update variant
     */
    public function update(Request $request, $id)
    {
        try {
            $variant = TblVarian::find($id);

            if (!$variant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data varian tidak ditemukan'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100',
                'product_id' => 'required|exists:tbl_produk,id_produk',
                'harga' => 'required|numeric|min:0',
                'stok' => 'required|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $variant->update([
                'nama_varian' => $request->name,
                'id_produk' => $request->product_id,
                'harga' => $request->harga,
                'stok_varian' => $request->stok,
            ]);

            // Reload variant with product for response
            $variant->load(['produk:id_produk,nama_produk']);

            return response()->json([
                'success' => true,
                'message' => 'Varian berhasil diperbarui',
                'data' => [
                    'id' => $variant->id_varian,
                    'name' => $variant->nama_varian,
                    'product_id' => $variant->id_produk,
                    'product_name' => $variant->produk->nama_produk ?? 'Produk Tidak Diketahui',
                    'harga' => (float)$variant->harga,
                    'stok' => (float)$variant->stok_varian,
                    'created_at' => $variant->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $variant->updated_at->format('Y-m-d H:i:s'),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui varian',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete variant
     */
    public function destroy($id)
    {
        try {
            $variant = TblVarian::find($id);

            if (!$variant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data varian tidak ditemukan'
                ], 404);
            }

            $variant->delete();

            return response()->json([
                'success' => true,
                'message' => 'Varian berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus varian',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get products for dropdown
     */
    public function products()
    {
        try {
            $products = TblProduk::select('id_produk', 'nama_produk')
                ->orderBy('nama_produk', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $products
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data produk',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}