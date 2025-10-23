<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblKategori;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    /**
     * Get all categories
     */
    public function index(Request $request)
    {
        try {
            $categories = TblKategori::orderBy('nama_kategori', 'asc')->get();

            $formattedCategories = $categories->map(function($category) {
                return [
                    'id' => $category->id_kategori,
                    'name' => $category->nama_kategori,
                    'description' => $category->deskripsi,
                    'product_count' => rand(5, 25), // Dummy data untuk jumlah produk
                    'created_at' => $category->created_at ? $category->created_at->format('Y-m-d') : '-',
                    'updated_at' => $category->updated_at ? $category->updated_at->format('Y-m-d') : '-',
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedCategories
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
     * Get category by ID
     */
    public function show($id)
    {
        try {
            $category = TblKategori::find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data kategori tidak ditemukan'
                ], 404);
            }

            $formattedCategory = [
                'id' => $category->id_kategori,
                'name' => $category->nama_kategori,
                'description' => $category->deskripsi,
                'product_count' => rand(5, 25), // Dummy data untuk jumlah produk
                'created_at' => $category->created_at ? $category->created_at->format('Y-m-d') : '-',
                'updated_at' => $category->updated_at ? $category->updated_at->format('Y-m-d') : '-',
            ];

            return response()->json([
                'success' => true,
                'data' => $formattedCategory
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
     * Create new category
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100|unique:tbl_kategori,nama_kategori',
                'description' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $category = TblKategori::create([
                'nama_kategori' => $request->name,
                'deskripsi' => $request->description,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Kategori berhasil ditambahkan',
                'data' => [
                    'id' => $category->id_kategori,
                    'name' => $category->nama_kategori,
                    'description' => $category->deskripsi,
                    'product_count' => rand(5, 25), // Dummy data untuk jumlah produk
                    'created_at' => $category->created_at ? $category->created_at->format('Y-m-d') : '-',
                    'updated_at' => $category->updated_at ? $category->updated_at->format('Y-m-d') : '-',
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menambahkan kategori',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update category
     */
    public function update(Request $request, $id)
    {
        try {
            $category = TblKategori::find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data kategori tidak ditemukan'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100|unique:tbl_kategori,nama_kategori,' . $id . ',id_kategori',
                'description' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $category->update([
                'nama_kategori' => $request->name,
                'deskripsi' => $request->description,
            ]);

            // Refresh model untuk mendapatkan data terbaru
            $category->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Kategori berhasil diperbarui',
                'data' => [
                    'id' => $category->id_kategori,
                    'name' => $category->nama_kategori,
                    'description' => $category->deskripsi,
                    'product_count' => rand(5, 25), // Dummy data untuk jumlah produk
                    'created_at' => $category->created_at ? $category->created_at->format('Y-m-d') : '-',
                    'updated_at' => $category->updated_at ? $category->updated_at->format('Y-m-d') : '-',
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui kategori',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete category
     */
    public function destroy($id)
    {
        try {
            $category = TblKategori::find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data kategori tidak ditemukan'
                ], 404);
            }

            // Check if category has products
            $productCount = $category->produk()->count();
            if ($productCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Tidak dapat menghapus kategori karena masih memiliki {$productCount} produk"
                ], 400);
            }

            // Check if category has bahan
            $bahanCount = $category->bahan()->count();
            if ($bahanCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Tidak dapat menghapus kategori karena masih memiliki {$bahanCount} bahan baku"
                ], 400);
            }

            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Kategori berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus kategori',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
