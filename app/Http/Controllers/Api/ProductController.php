<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblProduk;
use App\Models\TblKategori;
use App\Models\TblBahan;
use App\Models\TblVarian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Get all products
     */
    public function index(Request $request)
    {
        try {
            $products = TblProduk::with([
                'kategori:id_kategori,nama_kategori',
                'varian:id_varian,id_produk,nama_varian,harga,stok_varian'
            ])
            ->orderBy('nama_produk', 'asc')
            ->get();

            $formattedProducts = $products->map(function($product) {
                // Hitung total stok dari varian
                $totalStock = $product->varian->sum('stok_varian');
                
                // Ambil harga terendah dari varian
                $minPrice = $product->varian->min('harga');
                
                // Ambil bahan utama (kosong untuk sementara)
                $mainIngredients = [];
                
                return [
                    'id' => $product->id_produk,
                    'name' => $product->nama_produk,
                    'description' => $product->deskripsi,
                    'category_id' => $product->id_kategori,
                    'category_name' => $product->kategori->nama_kategori ?? 'Tidak ada kategori',
                    'status' => $product->status,
                    'total_stock' => $totalStock,
                    'min_price' => $minPrice ? (float)$minPrice : 0,
                    'variant_count' => $product->varian->count(),
                    'main_ingredients' => $mainIngredients,
                    'created_at' => $product->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $product->updated_at->format('Y-m-d H:i:s'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedProducts
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
     * Get product by ID
     */
    public function show($id)
    {
        try {
            $product = TblProduk::with([
                'kategori:id_kategori,nama_kategori',
                'varian:id_varian,id_produk,nama_varian,harga,stok_varian'
            ])->find($id);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data produk tidak ditemukan'
                ], 404);
            }

            // Hitung total stok dari varian
            $totalStock = $product->varian->sum('stok_varian');
            
            // Ambil harga terendah dari varian
            $minPrice = $product->varian->min('harga');
            
            // Ambil semua bahan (kosong untuk sementara)
            $ingredients = [];

            $formattedProduct = [
                'id' => $product->id_produk,
                'name' => $product->nama_produk,
                'description' => $product->deskripsi,
                'category_id' => $product->id_kategori,
                'category_name' => $product->kategori->nama_kategori ?? 'Tidak ada kategori',
                'status' => $product->status,
                'total_stock' => $totalStock,
                'min_price' => $minPrice ? (float)$minPrice : 0,
                'variant_count' => $product->varian->count(),
                'ingredients' => $ingredients,
                'created_at' => $product->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $product->updated_at->format('Y-m-d H:i:s'),
            ];

            return response()->json([
                'success' => true,
                'data' => $formattedProduct
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
     * Create new product
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100',
                'description' => 'nullable|string|max:255',
                'category_id' => 'required|exists:tbl_kategori,id_kategori',
                'status' => 'required|in:aktif,nonaktif'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $product = TblProduk::create([
                'nama_produk' => $request->name,
                'deskripsi' => $request->description,
                'id_kategori' => $request->category_id,
                'status' => $request->status,
                'created_by' => auth()->id()
            ]);

            // Reload product with relationships for response
            $product->load(['kategori:id_kategori,nama_kategori', 'varian']);

            return response()->json([
                'success' => true,
                'message' => 'Produk berhasil ditambahkan',
                'data' => [
                    'id' => $product->id_produk,
                    'name' => $product->nama_produk,
                    'description' => $product->deskripsi,
                    'category_id' => $product->id_kategori,
                    'category_name' => $product->kategori->nama_kategori ?? 'Tidak ada kategori',
                    'status' => $product->status,
                    'total_stock' => 0,
                    'min_price' => 0,
                    'variant_count' => 0,
                    'main_ingredients' => [],
                    'created_at' => $product->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $product->updated_at->format('Y-m-d H:i:s'),
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menambahkan produk',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update product
     */
    public function update(Request $request, $id)
    {
        try {
            $product = TblProduk::find($id);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data produk tidak ditemukan'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100',
                'description' => 'nullable|string|max:255',
                'category_id' => 'required|exists:tbl_kategori,id_kategori',
                'status' => 'required|in:aktif,nonaktif'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $product->update([
                'nama_produk' => $request->name,
                'deskripsi' => $request->description,
                'id_kategori' => $request->category_id,
                'status' => $request->status,
            ]);

            // Reload product with relationships for response
            $product->load(['kategori:id_kategori,nama_kategori', 'varian']);

            // Hitung total stok dari varian
            $totalStock = $product->varian->sum('stok_varian');
            
            // Ambil harga terendah dari varian
            $minPrice = $product->varian->min('harga');
            
            // Ambil bahan utama (kosong untuk sementara)
            $mainIngredients = [];

            return response()->json([
                'success' => true,
                'message' => 'Produk berhasil diperbarui',
                'data' => [
                    'id' => $product->id_produk,
                    'name' => $product->nama_produk,
                    'description' => $product->deskripsi,
                    'category_id' => $product->id_kategori,
                    'category_name' => $product->kategori->nama_kategori ?? 'Tidak ada kategori',
                    'status' => $product->status,
                    'total_stock' => $totalStock,
                    'min_price' => $minPrice ? (float)$minPrice : 0,
                    'variant_count' => $product->varian->count(),
                    'main_ingredients' => $mainIngredients,
                    'created_at' => $product->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $product->updated_at->format('Y-m-d H:i:s'),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui produk',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete product
     */
    public function destroy($id)
    {
        try {
            $product = TblProduk::find($id);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data produk tidak ditemukan'
                ], 404);
            }

            // Hapus varian terkait terlebih dahulu
            $product->varian()->delete();
            
            // Hapus produk
            $product->delete();

            return response()->json([
                'success' => true,
                'message' => 'Produk berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus produk',
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