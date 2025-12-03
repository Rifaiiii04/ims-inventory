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
use Illuminate\Support\Facades\Log;

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
                'varian:id_varian,id_produk,nama_varian,stok_varian',
                'varian.komposisi:id_komposisi,id_varian,id_bahan,jumlah_per_porsi',
                'varian.komposisi.bahan:id_bahan,nama_bahan'
            ])
            ->orderBy('nama_produk', 'asc')
            ->get();

            // Ambil komposisi langsung ke produk (tanpa varian) dengan stok bahan
            $directCompositions = DB::table('tbl_komposisi')
                ->join('tbl_bahan', 'tbl_komposisi.id_bahan', '=', 'tbl_bahan.id_bahan')
                ->whereNull('tbl_komposisi.id_varian')
                ->select(
                    'tbl_komposisi.id_produk', 
                    'tbl_bahan.nama_bahan', 
                    'tbl_komposisi.jumlah_per_porsi',
                    'tbl_bahan.stok_bahan'
                )
                ->get()
                ->groupBy('id_produk');

            $formattedProducts = $products->map(function($product) use ($directCompositions) {
                // Hitung total stok dari varian
                $totalStock = $product->varian->sum('stok_varian');
                
                // Hitung stok dari komposisi langsung ke produk (tanpa varian)
                if (isset($directCompositions[$product->id_produk])) {
                    $minStock = PHP_INT_MAX;
                    foreach ($directCompositions[$product->id_produk] as $comp) {
                        if ($comp->jumlah_per_porsi > 0) {
                            $canProduce = floor($comp->stok_bahan / $comp->jumlah_per_porsi);
                            $minStock = min($minStock, $canProduce);
                        }
                    }
                    // Jika ada komposisi langsung, gunakan stok yang dihitung dari komposisi
                    if ($minStock !== PHP_INT_MAX) {
                        $totalStock = $minStock;
                    }
                }
                
                // Ambil harga dari produk
                $productPrice = $product->harga ?? 0;
                
                // Hitung komposisi dari semua varian
                $allIngredients = collect();
                $compositionCount = 0;
                
                foreach ($product->varian as $variant) {
                    foreach ($variant->komposisi as $composition) {
                        $allIngredients->push($composition->bahan->nama_bahan);
                        $compositionCount++;
                    }
                }
                
                // Tambahkan komposisi langsung ke produk (tanpa varian)
                if (isset($directCompositions[$product->id_produk])) {
                    foreach ($directCompositions[$product->id_produk] as $directComp) {
                        $allIngredients->push($directComp->nama_bahan);
                        $compositionCount++;
                    }
                }
                
                // Ambil bahan unik
                $uniqueIngredients = $allIngredients->unique()->values()->toArray();
                
                return [
                    'id' => $product->id_produk,
                    'name' => $product->nama_produk,
                    'description' => $product->deskripsi,
                    'category_id' => $product->id_kategori,
                    'category_name' => $product->kategori->nama_kategori ?? 'Tidak ada kategori',
                    'status' => $product->status,
                    'total_stock' => $totalStock,
                    'harga' => (float)$productPrice,
                    'variant_count' => $product->varian->count(),
                    'composition_count' => $compositionCount,
                    'unique_ingredients' => $uniqueIngredients,
                    'ingredients_count' => count($uniqueIngredients),
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
                'varian:id_varian,id_produk,nama_varian,stok_varian'
            ])->find($id);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data produk tidak ditemukan'
                ], 404);
            }

            // Hitung total stok dari varian
            $totalStock = $product->varian->sum('stok_varian');
            
            // Ambil harga dari produk
            $productPrice = $product->harga ?? 0;
            
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
                'harga' => (float)$productPrice,
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
                'harga' => 'required|numeric|min:0',
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
                'harga' => $request->harga,
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
                'harga' => 'required|numeric|min:0',
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
            
            // Ambil harga dari produk
            $productPrice = $product->harga ?? 0;
            
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
                    'harga' => (float)$productPrice,
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

            // Tidak perlu cek transaksi karena transaksi adalah riwayat yang tidak menghalangi penghapusan
            
            // Check if product has direct compositions (komposisi langsung ke produk tanpa varian)
            $directCompositionsCount = \App\Models\TblKomposisi::where('id_produk', $id)
                ->whereNull('id_varian')
                ->count();
            
            if ($directCompositionsCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Produk tidak dapat dihapus karena masih memiliki komposisi langsung. Hapus komposisi terlebih dahulu.'
                ], 400);
            }
            
            // Check if product has variants that are used in compositions
            $variants = $product->varian;
            
            foreach ($variants as $variant) {
                $compositionsCount = \App\Models\TblKomposisi::where('id_varian', $variant->id_varian)->count();
                
                if ($compositionsCount > 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Produk tidak dapat dihapus karena masih memiliki varian yang digunakan dalam komposisi. Hapus komposisi terlebih dahulu.'
                    ], 400);
                }
            }
            
            // Check if product is used in konversi_produk
            $konversiCount = DB::table('tbl_konversi_produk')->where('id_produk_hasil', $id)->count();
            if ($konversiCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Produk tidak dapat dihapus karena masih digunakan dalam konversi produk. Hapus konversi produk terlebih dahulu.'
                ], 400);
            }

            DB::beginTransaction();

            try {
                // Hapus detail transaksi yang terkait (jika ada)
                // Karena id_produk di tbl_transaksi_detail adalah NOT NULL dan foreign key constraint,
                // kita perlu hapus detail transaksi yang terkait sebelum menghapus product
                // HATI-HATI: Ini akan menghapus riwayat transaksi yang terkait dengan product ini
                $transactionDetailsCount = DB::table('tbl_transaksi_detail')->where('id_produk', $id)->count();
                if ($transactionDetailsCount > 0) {
                    \Log::warning("Deleting product with transaction history. Product ID: {$id}, Transaction details count: {$transactionDetailsCount}");
                    // Hapus detail transaksi yang terkait
                    DB::table('tbl_transaksi_detail')->where('id_produk', $id)->delete();
                }
                
                // Hapus komposisi langsung ke produk (jika ada)
                \App\Models\TblKomposisi::where('id_produk', $id)->whereNull('id_varian')->delete();
                
                // Hapus konversi produk terkait (jika ada)
                DB::table('tbl_konversi_produk')->where('id_produk_hasil', $id)->delete();
                
                // Hapus bagian tubuh terkait (jika ada)
                $product->bagianTubuh()->delete();
                
                // Hapus varian terkait terlebih dahulu (jika ada)
                if ($variants->count() > 0) {
                    $product->varian()->delete();
                }
                
                // Hapus produk
                $product->delete();

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Produk berhasil dihapus'
                ], 200);

            } catch (\Exception $e) {
                DB::rollback();
                \Log::error('Error deleting product: ' . $e->getMessage());
                \Log::error('Stack trace: ' . $e->getTraceAsString());
                throw $e;
            }

        } catch (\Exception $e) {
            \Log::error('Error in ProductController@destroy: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus produk',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
                'file' => config('app.debug') ? $e->getFile() . ':' . $e->getLine() : null
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