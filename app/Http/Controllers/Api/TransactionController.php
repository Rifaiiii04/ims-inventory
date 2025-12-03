<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblTransaksi;
use App\Models\TblTransaksiDetail;
use App\Models\TblVarian;
use App\Models\TblBahan;
use App\Models\TblKomposisi;
use App\Models\TblProduk;
use App\Models\TblNotifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;

class TransactionController extends Controller
{
    /**
     * Get products with variants for POS
     * BUAT ULANG: Logika sederhana dan jelas
     * ATURAN: Produk dengan bahan baku utama habis TIDAK BOLEH muncul di POS
     */
    public function getProducts()
    {
        try {
            // Ambil semua produk
            $products = DB::table('tbl_produk')
                ->leftJoin('tbl_kategori', 'tbl_produk.id_kategori', '=', 'tbl_kategori.id_kategori')
                ->select(
                    'tbl_produk.id_produk',
                    'tbl_produk.nama_produk',
                    'tbl_produk.deskripsi',
                    'tbl_produk.harga as harga_produk',
                    'tbl_kategori.nama_kategori'
                )
                ->orderBy('tbl_produk.nama_produk', 'asc')
                ->get();

            $productsWithVariants = $products->map(function($product) {
                // Ambil semua variant untuk produk ini
                $variants = DB::table('tbl_varian')
                    ->where('id_produk', $product->id_produk)
                    ->select('id_varian', 'nama_varian', 'stok_varian', 'id_produk', 'unit')
                    ->get();
                
                Log::info("Product {$product->nama_produk}: Found {$variants->count()} variants");
                
                $variants = $variants->map(function($variant) use ($product) {
                        try {
                            // Ambil komposisi variant
                            $compositions = $this->getVariantCompositions($variant->id_varian);
                            $hasComposition = !$compositions->isEmpty();
                            
                            Log::info("Variant {$variant->nama_varian}: Has composition = {$hasComposition}, Count = {$compositions->count()}");
                            
                            // LOGIKA: SEMUA PRODUK HARUS PUNYA KOMPOSISI
                            // 1. Jika tidak punya komposisi, SKIP variant ini (return null)
                            // 2. Jika punya komposisi, cek bahan baku utama
                            // 3. Jika bahan baku utama stok <= 0, SKIP variant ini (return null)
                            
                            // PENTING: Jika tidak punya komposisi, SKIP variant ini
                            if (!$hasComposition) {
                                Log::info("Variant {$variant->nama_varian} SKIPPED: No composition found. All products must have compositions.");
                                return null; // SKIP variant ini
                            }
                            
                            // Cari bahan baku utama yang di-set (is_bahan_baku_utama = 1)
                            $mainIngredient = null;
                            foreach ($compositions as $comp) {
                                $isMain = $comp->is_bahan_baku_utama ?? false;
                                if ($isMain === true || $isMain === 1 || $isMain === '1' || $isMain === 'true' || (is_numeric($isMain) && (int)$isMain === 1)) {
                                    $mainIngredient = $comp;
                                    break;
                                }
                            }
                            
                            // Jika tidak ada bahan baku utama yang di-set, cari bahan dengan stok > 0
                            if (!$mainIngredient && $compositions->count() > 0) {
                                // Cari bahan pertama yang stoknya > 0
                                foreach ($compositions as $comp) {
                                    $stok = (float)($comp->stok_bahan ?? 0);
                                    if ($stok > 0) {
                                        $mainIngredient = $comp;
                                        Log::info("Variant {$variant->nama_varian}: No main ingredient set, using first available ingredient with stock > 0: {$mainIngredient->nama_bahan} (stok: {$stok})");
                                        break;
                                    }
                                }
                                
                                // Jika semua bahan stoknya <= 0, gunakan bahan pertama (untuk logging)
                                if (!$mainIngredient) {
                                    $mainIngredient = $compositions->first();
                                    Log::info("Variant {$variant->nama_varian}: No ingredient with stock > 0, using first ingredient: {$mainIngredient->nama_bahan} (stok: {$mainIngredient->stok_bahan})");
                                }
                            }
                            
                            // PENTING: Jika tidak ada mainIngredient sama sekali (tidak ada komposisi), SKIP
                            if (!$mainIngredient) {
                                Log::info("Variant {$variant->nama_varian} SKIPPED: No main ingredient found (compositions empty)");
                                return null;
                            }
                            
                            // Cek stok bahan baku utama
                            $stokBahan = (float)($mainIngredient->stok_bahan ?? 0);
                            $jumlahPerPorsi = (float)($mainIngredient->jumlah_per_porsi ?? 0);
                            
                            Log::info("Variant {$variant->nama_varian} stock check:", [
                                'main_ingredient' => $mainIngredient->nama_bahan ?? 'Unknown',
                                'stok_bahan' => $stokBahan,
                                'jumlah_per_porsi' => $jumlahPerPorsi,
                                'is_bahan_baku_utama_set' => $mainIngredient->is_bahan_baku_utama ?? false
                            ]);
                            
                            // Cek apakah bahan baku utama habis atau tidak cukup
                            $isOutOfStock = false;
                            if ($stokBahan <= 0) {
                                $isOutOfStock = true;
                                Log::info("Variant {$variant->nama_varian}: Main ingredient '{$mainIngredient->nama_bahan}' stock is 0 - will show as unavailable");
                            } else if ($jumlahPerPorsi > 0 && $stokBahan < $jumlahPerPorsi) {
                                $isOutOfStock = true;
                                Log::info("Variant {$variant->nama_varian}: Main ingredient '{$mainIngredient->nama_bahan}' stock ({$stokBahan}) insufficient for 1 portion ({$jumlahPerPorsi}) - will show as unavailable");
                            }
                            
                            // Hitung stok prediksi berdasarkan bahan baku utama
                            if ($jumlahPerPorsi > 0) {
                                $predictedStock = floor($stokBahan / $jumlahPerPorsi);
                            } else {
                                $predictedStock = 0;
                            }
                            
                            Log::info("Variant {$variant->nama_varian} APPROVED:", [
                                'predicted_stock' => $predictedStock,
                                'variant_stock' => $variant->stok_varian
                            ]);
                            
                            // Konversi compositions ke array (selalu ada karena sudah di-check di atas)
                            $compositionsArray = $compositions->map(function($comp) {
                                return [
                                    'id_bahan' => $comp->id_bahan ?? null,
                                    'nama_bahan' => $comp->nama_bahan ?? '',
                                    'jumlah_per_porsi' => (float)($comp->jumlah_per_porsi ?? 0),
                                    'satuan' => $comp->satuan ?? '',
                                    'stok_bahan' => (float)($comp->stok_bahan ?? 0),
                                    'min_stok' => (float)($comp->min_stok ?? 0),
                                    'is_bahan_baku_utama' => (bool)($comp->is_bahan_baku_utama ?? false)
                                ];
                            })->values()->toArray();
                            
                            return [
                                'id_varian' => $variant->id_varian,
                                'nama_varian' => $variant->nama_varian ?? '',
                                'harga' => $product->harga_produk ?? 0,
                                'stok_varian' => $variant->stok_varian ?? 0,
                                'stok_prediksi' => $predictedStock,
                                'id_produk' => $variant->id_produk ?? $product->id_produk,
                                'unit' => $variant->unit ?? 'pcs',
                                'compositions' => $compositionsArray,
                                'is_direct_product' => false, // Semua produk punya komposisi
                                'can_sell' => !$isOutOfStock, // Tidak bisa dijual jika bahan baku utama habis
                                'has_out_of_stock_ingredient' => $isOutOfStock // Flag untuk frontend
                            ];
                        } catch (\Exception $e) {
                            Log::error("Error processing variant {$variant->nama_varian}: " . $e->getMessage());
                            return null;
                        }
                    })
                    // Filter variant yang null (dilewati karena bahan baku utama habis)
                    ->filter(function($variant) {
                        return $variant !== null;
                    });

                // Jika produk tidak punya variant, cek apakah punya komposisi langsung ke produk
                if ($variants->isEmpty()) {
                    // Cek komposisi langsung ke produk (tanpa variant)
                    $directCompositions = DB::table('tbl_komposisi')
                        ->join('tbl_bahan', 'tbl_komposisi.id_bahan', '=', 'tbl_bahan.id_bahan')
                        ->where('tbl_komposisi.id_produk', $product->id_produk)
                        ->whereNull('tbl_komposisi.id_varian')
                        ->select(
                            'tbl_komposisi.id_bahan',
                            'tbl_bahan.nama_bahan',
                            'tbl_komposisi.jumlah_per_porsi',
                            'tbl_komposisi.satuan',
                            'tbl_bahan.stok_bahan',
                            'tbl_bahan.min_stok',
                            'tbl_komposisi.is_bahan_baku_utama'
                        )
                        ->get();
                    
                    $hasDirectComposition = !$directCompositions->isEmpty();
                    
                    // Jika punya komposisi, proses seperti variant
                    if ($hasDirectComposition) {
                        // Cari bahan baku utama yang di-set (is_bahan_baku_utama = 1)
                        $mainIngredient = null;
                        foreach ($directCompositions as $comp) {
                            $isMain = $comp->is_bahan_baku_utama ?? false;
                            if ($isMain === true || $isMain === 1 || $isMain === '1' || $isMain === 'true' || (is_numeric($isMain) && (int)$isMain === 1)) {
                                $mainIngredient = $comp;
                                break;
                            }
                        }
                        
                        // Jika tidak ada bahan baku utama yang di-set, cari bahan dengan stok > 0
                        if (!$mainIngredient && $directCompositions->count() > 0) {
                            // Cari bahan pertama yang stoknya > 0
                            foreach ($directCompositions as $comp) {
                                $stok = (float)($comp->stok_bahan ?? 0);
                                if ($stok > 0) {
                                    $mainIngredient = $comp;
                                    Log::info("Product {$product->nama_produk} (direct): No main ingredient set, using first available ingredient with stock > 0: {$mainIngredient->nama_bahan} (stok: {$stok})");
                                    break;
                                }
                            }
                            
                            // Jika semua bahan stoknya <= 0, gunakan bahan pertama (untuk logging)
                            if (!$mainIngredient) {
                                $mainIngredient = $directCompositions->first();
                                Log::info("Product {$product->nama_produk} (direct): No ingredient with stock > 0, using first ingredient: {$mainIngredient->nama_bahan} (stok: {$mainIngredient->stok_bahan})");
                            }
                        }
                        
                        // PENTING: Jika bahan baku utama stok <= 0, SKIP produk ini
                        if ($mainIngredient) {
                            $stokBahan = (float)($mainIngredient->stok_bahan ?? 0);
                            $jumlahPerPorsi = (float)($mainIngredient->jumlah_per_porsi ?? 0);
                            
                            Log::info("Product {$product->nama_produk} (direct) stock check:", [
                                'main_ingredient' => $mainIngredient->nama_bahan ?? 'Unknown',
                                'stok_bahan' => $stokBahan,
                                'jumlah_per_porsi' => $jumlahPerPorsi
                            ]);
                            
                            // Cek apakah bahan baku utama habis atau tidak cukup
                            $isOutOfStock = false;
                            if ($stokBahan <= 0) {
                                $isOutOfStock = true;
                                Log::info("Product {$product->nama_produk} (direct): Main ingredient '{$mainIngredient->nama_bahan}' stock is 0 - will show as unavailable");
                            } else if ($jumlahPerPorsi > 0 && $stokBahan < $jumlahPerPorsi) {
                                $isOutOfStock = true;
                                Log::info("Product {$product->nama_produk} (direct): Main ingredient '{$mainIngredient->nama_bahan}' stock ({$stokBahan}) insufficient for 1 portion ({$jumlahPerPorsi}) - will show as unavailable");
                            }
                            
                            // Hitung stok prediksi
                            if ($jumlahPerPorsi > 0 && $stokBahan > 0) {
                                $predictedStock = floor($stokBahan / $jumlahPerPorsi);
                            } else {
                                $predictedStock = 0;
                            }
                            
                            $compositionsArray = $directCompositions->map(function($comp) {
                                return [
                                    'id_bahan' => $comp->id_bahan,
                                    'nama_bahan' => $comp->nama_bahan,
                                    'jumlah_per_porsi' => (float)$comp->jumlah_per_porsi,
                                    'satuan' => $comp->satuan,
                                    'stok_bahan' => (float)$comp->stok_bahan,
                                    'min_stok' => (float)$comp->min_stok,
                                    'is_bahan_baku_utama' => (bool)($comp->is_bahan_baku_utama ?? false)
                                ];
                            })->values()->toArray();
                            
                            // Buat variant (baik tersedia maupun tidak tersedia)
                            $variants = collect([[
                                'id_varian' => 'product_' . $product->id_produk,
                                'nama_varian' => $product->nama_produk,
                                'harga' => $product->harga_produk,
                                'stok_varian' => 0,
                                'stok_prediksi' => $predictedStock,
                                'id_produk' => $product->id_produk,
                                'unit' => 'pcs',
                                'compositions' => $compositionsArray,
                                'is_direct_product' => false,
                                'can_sell' => !$isOutOfStock, // Tidak bisa dijual jika bahan baku utama habis
                                'has_out_of_stock_ingredient' => $isOutOfStock // Flag untuk frontend
                            ]]);
                        } else {
                            // Produk tanpa komposisi: SKIP (semua produk harus punya komposisi)
                            Log::info("Product {$product->nama_produk} SKIPPED: No composition found. All products must have compositions.");
                            $variants = collect([]);
                        }
                    } else {
                        // Produk tanpa komposisi: SKIP (semua produk harus punya komposisi)
                        Log::info("Product {$product->nama_produk} SKIPPED: No composition found. All products must have compositions.");
                        $variants = collect([]);
                    }
                }

                // Convert variants collection to array untuk memastikan konsistensi di frontend
                $variantsArray = $variants->values()->toArray();
                
                return [
                    'id' => $product->id_produk,
                    'name' => $product->nama_produk,
                    'description' => $product->deskripsi ?? '',
                    'category' => $product->nama_kategori ?? 'Umum',
                    'harga' => $product->harga_produk,
                    'variants' => $variantsArray, // Pastikan selalu array, bukan collection
                    'has_variants' => count($variantsArray) > 1 || (count($variantsArray) === 1 && !isset($variantsArray[0]['is_direct_product']))
                ];
            })
            ->filter(function($product) {
                // Filter produk yang masih punya variant tersedia
                // Pastikan variants adalah array dan tidak kosong
                $variants = $product['variants'] ?? [];
                if (is_array($variants)) {
                    return count($variants) > 0;
                }
                // Jika masih collection, gunakan count()
                return is_object($variants) && method_exists($variants, 'count') ? $variants->count() > 0 : false;
            });

            // Convert collection ke array dan reset keys untuk memastikan array indexed, bukan object
            $productsArray = $productsWithVariants->values()->toArray();
            
            Log::info("Total products returned: " . count($productsArray));
            
            return response()->json([
                'success' => true,
                'data' => $productsArray
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error in getProducts:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data produk',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get variant compositions for stock calculation
     */
    private function getVariantCompositions($variantId)
    {
        return DB::table('tbl_komposisi')
            ->join('tbl_bahan', 'tbl_komposisi.id_bahan', '=', 'tbl_bahan.id_bahan')
            ->where('tbl_komposisi.id_varian', $variantId)
            ->select(
                'tbl_komposisi.id_bahan',
                'tbl_bahan.nama_bahan',
                'tbl_komposisi.jumlah_per_porsi',
                'tbl_komposisi.satuan',
                'tbl_bahan.stok_bahan',
                'tbl_bahan.min_stok',
                'tbl_komposisi.is_bahan_baku_utama'
            )
            ->get();
    }
    
    /**
     * Get product compositions (direct to product, without variant)
     */
    private function getProductCompositions($productId)
    {
        return DB::table('tbl_komposisi')
            ->join('tbl_bahan', 'tbl_komposisi.id_bahan', '=', 'tbl_bahan.id_bahan')
            ->where('tbl_komposisi.id_produk', $productId)
            ->whereNull('tbl_komposisi.id_varian')
            ->select(
                'tbl_komposisi.id_bahan',
                'tbl_bahan.nama_bahan',
                'tbl_komposisi.jumlah_per_porsi',
                'tbl_komposisi.satuan',
                'tbl_bahan.stok_bahan',
                'tbl_bahan.min_stok',
                'tbl_komposisi.is_bahan_baku_utama'
            )
            ->get();
    }

    /**
     * Check if variant can be produced with available ingredient stock
     * @param int $variantId
     * @param float $quantity
     * @return bool
     */
    private function canProduceVariant($variantId, $quantity = 1)
    {
        $compositions = DB::table('tbl_komposisi')
            ->join('tbl_bahan', 'tbl_komposisi.id_bahan', '=', 'tbl_bahan.id_bahan')
            ->where('tbl_komposisi.id_varian', $variantId)
            ->select(
                'tbl_komposisi.jumlah_per_porsi',
                'tbl_bahan.stok_bahan'
            )
            ->get();

        return $this->canProduceVariantWithCompositions($compositions, $quantity);
    }

    /**
     * Check if variant can be produced with given compositions
     * @param \Illuminate\Support\Collection $compositions
     * @param float $quantity
     * @return bool
     */
    private function canProduceVariantWithCompositions($compositions, $quantity = 1)
    {
        // Jika tidak ada komposisi, berarti produk langsung (selalu bisa diproduksi)
        if ($compositions->isEmpty()) {
            return true;
        }

        // Cek setiap bahan apakah stoknya cukup
        foreach ($compositions as $composition) {
            $requiredIngredient = $composition->jumlah_per_porsi * $quantity;
            if ($composition->stok_bahan < $requiredIngredient) {
                return false; // Stok bahan tidak cukup
            }
        }

        return true; // Semua bahan cukup
    }

    /**
     * Calculate predicted stock based on ingredient stock
     * Menghitung berapa banyak produk yang bisa dibuat berdasarkan stok bahan
     * @param \Illuminate\Support\Collection $compositions
     * @return float|int
     */
    private function calculatePredictedStock($compositions)
    {
        // Jika tidak ada komposisi, berarti produk langsung (tidak terbatas)
        if ($compositions->isEmpty()) {
            return 999; // Stok virtual untuk produk langsung
        }

        $maxQuantity = null;

        // Hitung untuk setiap bahan, berapa banyak produk yang bisa dibuat
        foreach ($compositions as $composition) {
            if ($composition->jumlah_per_porsi <= 0) {
                continue; // Skip jika jumlah per porsi 0 atau negatif
            }

            // Hitung berapa banyak produk yang bisa dibuat dari bahan ini
            $possibleQuantity = floor($composition->stok_bahan / $composition->jumlah_per_porsi);

            // Ambil nilai minimum (karena terbatas oleh bahan yang paling sedikit)
            if ($maxQuantity === null || $possibleQuantity < $maxQuantity) {
                $maxQuantity = $possibleQuantity;
            }
        }

        // Jika tidak ada komposisi valid, return 0
        return $maxQuantity !== null ? max(0, $maxQuantity) : 0;
    }

    /**
     * Create new transaction
     */
    public function store(Request $request)
    {
        try {
            // Log request data for debugging
            Log::info('Transaction request data:', $request->all());
            
            $validator = Validator::make($request->all(), [
                'items' => 'required|array|min:1',
                'items.*.variant_id' => 'required', // Accept both integer (variant) and string (product_*) for direct products
                'items.*.quantity' => 'required|numeric|min:0.01',
                'payment_method' => 'required|string|in:tunai,qris,transfer,cash,lainnya',
                'cash_amount' => 'nullable|numeric|min:0',
                'transfer_proof' => 'nullable|string'
            ]);

            // Custom validation for variant_id - must be either integer or string starting with 'product_'
            $validator->after(function ($validator) use ($request) {
                foreach ($request->items as $index => $item) {
                    $variantId = $item['variant_id'] ?? null;
                    if ($variantId === null || $variantId === '') {
                        continue; // Already handled by 'required' rule
                    }
                    
                    // Convert to string for checking
                    $variantIdStr = (string) $variantId;
                    
                    // Check if it's a product_* string or a numeric value (integer)
                    if (is_string($variantId) && !str_starts_with($variantIdStr, 'product_')) {
                        // If it's a string but not product_*, check if it's numeric (could be string number)
                        if (!is_numeric($variantId)) {
                            $validator->errors()->add("items.{$index}.variant_id", "Variant ID format tidak valid. Harus integer atau 'product_*'");
                        }
                    } elseif (is_numeric($variantId) || ctype_digit($variantIdStr)) {
                        // Valid integer variant ID
                        continue;
                    } elseif (str_starts_with($variantIdStr, 'product_')) {
                        // Valid product_* format
                        continue;
                    } else {
                        $validator->errors()->add("items.{$index}.variant_id", "Variant ID harus berupa integer atau string 'product_*'");
                    }
                }
            });

            if ($validator->fails()) {
                Log::error('Validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak valid',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            try {
                // Map payment method to match database enum
                $paymentMethodMap = [
                    'tunai' => 'cash',
                    'transfer' => 'lainnya',
                    'qris' => 'qris',
                    'cash' => 'cash',
                    'lainnya' => 'lainnya'
                ];
                
                $paymentMethod = $paymentMethodMap[$request->payment_method] ?? 'cash';
                
                // Generate transaction number
                $transactionNumber = 'TRX' . date('Ymd') . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

                // Calculate total
                $totalAmount = 0;
                $items = [];

                foreach ($request->items as $item) {
                    Log::info('Processing item:', $item);
                    
                    // Cek apakah ini produk langsung atau variant
                    // Convert variant_id to string for checking if it's a direct product
                    $variantIdStr = (string) $item['variant_id'];
                    $isDirectProduct = str_starts_with($variantIdStr, 'product_');
                    
                    if ($isDirectProduct) {
                        // Handle produk langsung (tanpa variant)
                        $productId = str_replace('product_', '', $variantIdStr);
                        $product = TblProduk::find($productId);
                        
                        if (!$product) {
                            Log::error('Product not found:', ['product_id' => $productId]);
                            throw new \Exception("Produk tidak ditemukan");
                        }
                        
                        // Buat objek variant virtual untuk konsistensi
                        $variant = (object) [
                            'id_varian' => $item['variant_id'],
                            'nama_varian' => $product->nama_produk,
                            'id_produk' => $product->id_produk,
                            'stok_varian' => 999, // Stok virtual
                            'is_direct_product' => true
                        ];
                        
                        // Skip stock check untuk produk langsung
                        Log::info('Processing direct product:', [
                            'product' => $product->nama_produk,
                            'quantity' => $item['quantity']
                        ]);
                    } else {
                        // Handle variant normal - load with product relation
                        $variant = TblVarian::with('produk')->find($item['variant_id']);
                        if (!$variant) {
                            Log::error('Variant not found:', ['variant_id' => $item['variant_id']]);
                            throw new \Exception("Varian tidak ditemukan");
                        }

                        // Cek stok bahan berdasarkan komposisi untuk validasi
                        $compositions = DB::table('tbl_komposisi')
                            ->join('tbl_bahan', 'tbl_komposisi.id_bahan', '=', 'tbl_bahan.id_bahan')
                            ->where('tbl_komposisi.id_varian', $variant->id_varian)
                            ->select(
                                'tbl_komposisi.id_bahan',
                                'tbl_bahan.nama_bahan',
                                'tbl_komposisi.jumlah_per_porsi',
                                'tbl_komposisi.satuan',
                                'tbl_bahan.stok_bahan',
                                'tbl_bahan.min_stok'
                            )
                            ->lockForUpdate() // Lock untuk mencegah race condition
                            ->get();

                        $hasComposition = !$compositions->isEmpty();
                        
                        // Validasi stok berdasarkan jenis variant:
                        // 1. Variant dengan komposisi: gunakan stok_varian dulu (produk jadi), baru stok bahan jika diperlukan
                        // 2. Variant tanpa komposisi: cek stok_varian
                        if ($hasComposition) {
                            // Variant dengan komposisi: gunakan stok_varian dulu, baru buat dari bahan jika diperlukan
                            $predictedStock = $this->calculatePredictedStock($compositions);
                            $availableFromStock = $variant->stok_varian; // Produk jadi yang sudah ada
                            $availableFromIngredients = $predictedStock; // Bisa dibuat dari bahan
                            $totalAvailable = $availableFromStock + $availableFromIngredients;
                            
                            Log::info('Stock validation for variant with composition:', [
                                'variant' => $variant->nama_varian,
                                'stok_varian' => $availableFromStock,
                                'stok_prediksi' => $availableFromIngredients,
                                'total_available' => $totalAvailable,
                                'requested' => $item['quantity']
                            ]);
                            
                            if ($totalAvailable < $item['quantity']) {
                                Log::error('Insufficient stock (variant + ingredients):', [
                                    'variant' => $variant->nama_varian,
                                    'requested' => $item['quantity'],
                                    'stok_varian' => $availableFromStock,
                                    'stok_prediksi' => $availableFromIngredients,
                                    'total_available' => $totalAvailable
                                ]);
                                
                                if ($availableFromStock > 0) {
                                    throw new \Exception("Stok {$variant->nama_varian} tidak mencukupi. Tersedia: {$availableFromStock} produk jadi + {$availableFromIngredients} bisa dibuat dari bahan = {$totalAvailable} total, Diminta: {$item['quantity']}");
                                } else {
                                    throw new \Exception("Stok bahan tidak mencukupi untuk memproduksi {$variant->nama_varian}. Maksimal yang bisa dibuat: {$availableFromIngredients} porsi");
                                }
                            }
                        } else {
                            // Variant tanpa komposisi: cek stok_varian
                            Log::info('Stock validation for variant without composition:', [
                                'variant' => $variant->nama_varian,
                                'stok_varian' => $variant->stok_varian,
                                'requested' => $item['quantity']
                            ]);
                            
                            if ($variant->stok_varian < $item['quantity']) {
                                Log::error('Insufficient variant stock:', [
                                    'variant' => $variant->nama_varian,
                                    'requested' => $item['quantity'],
                                    'stok_varian' => $variant->stok_varian
                                ]);
                                throw new \Exception("Stok {$variant->nama_varian} tidak mencukupi. Tersedia: {$variant->stok_varian}, Diminta: {$item['quantity']}");
                            }
                        }

                        // Validasi sudah dilakukan di atas berdasarkan jenis variant
                        // Tidak perlu double check lagi karena sudah di-lock dan divalidasi
                    }

                    // Ambil harga dari produk
                    if ($isDirectProduct) {
                        $harga = $product->harga ?? 0;
                        $productObj = $product;
                    } else {
                        // Ensure product relation is loaded
                        if (!$variant->relationLoaded('produk')) {
                            $variant->load('produk');
                        }
                        $produk = $variant->produk;
                        if (!$produk) {
                            // Fallback: get product directly
                            $produk = TblProduk::find($variant->id_produk);
                        }
                        $harga = $produk->harga ?? 0;
                        $productObj = $produk;
                    }
                    $subtotal = $harga * $item['quantity'];
                    $totalAmount += $subtotal;

                    $items[] = [
                        'variant' => $variant,
                        'product' => $productObj,
                        'isDirectProduct' => $isDirectProduct,
                        'quantity' => $item['quantity'],
                        'price' => $harga,
                        'subtotal' => $subtotal
                    ];
                }

                // Get user ID - ensure it's always set
                $userId = auth()->id();
                if (!$userId) {
                    // If not authenticated, try to get from request or use default
                    $userId = $request->user_id ?? 1;
                    Log::warning('No authenticated user, using default user_id:', ['user_id' => $userId]);
                }
                
                // Create transaction
                Log::info('Creating transaction with data:', [
                    'tanggal_waktu' => now(),
                    'total_transaksi' => $totalAmount,
                    'metode_bayar' => $paymentMethod,
                    'created_by' => $userId,
                ]);
                
                try {
                    $transaction = TblTransaksi::create([
                        'tanggal_waktu' => now(),
                        'total_transaksi' => $totalAmount,
                        'metode_bayar' => $paymentMethod,
                        'nama_pelanggan' => 'Pelanggan Umum',
                        'catatan' => $request->payment_method === 'transfer' ? $request->transfer_proof : null,
                        'created_by' => $userId,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to create transaction:', [
                        'error' => $e->getMessage(),
                        'data' => [
                            'tanggal_waktu' => now(),
                            'total_transaksi' => $totalAmount,
                            'metode_bayar' => $paymentMethod,
                            'created_by' => $userId,
                        ]
                    ]);
                    throw new \Exception("Gagal membuat transaksi: " . $e->getMessage());
                }
                
                Log::info('Transaction created successfully:', ['transaction_id' => $transaction->id_transaksi]);

                // Create transaction details and update stock
                foreach ($items as $item) {
                    $isDirectProduct = $item['isDirectProduct'] ?? false;
                    
                    // Ensure product exists and has id_produk
                    if (!isset($item['product']) || !$item['product']) {
                        Log::error('Product missing in item:', ['item' => $item]);
                        throw new \Exception("Data produk tidak valid untuk item transaksi");
                    }
                    
                    $productId = $item['product']->id_produk ?? null;
                    if (!$productId) {
                        Log::error('Product ID missing:', ['item' => $item, 'product' => $item['product']]);
                        throw new \Exception("ID produk tidak ditemukan");
                    }
                    
                    // Get variant_id - for direct products, use null; for normal variants, use integer id_varian
                    $variantId = null;
                    if (!$isDirectProduct) {
                        // For normal variant, ensure id_varian is integer
                        if (isset($item['variant']) && isset($item['variant']->id_varian)) {
                            $variantId = is_numeric($item['variant']->id_varian) 
                                ? (int) $item['variant']->id_varian 
                                : null;
                        }
                    }
                    
                    Log::info('Creating transaction detail:', [
                        'id_transaksi' => $transaction->id_transaksi,
                        'id_produk' => $productId,
                        'id_varian' => $variantId,
                        'jumlah' => $item['quantity'],
                        'harga_satuan' => $item['price'],
                        'total_harga' => $item['subtotal']
                    ]);
                    
                    try {
                        // Create transaction detail
                        TblTransaksiDetail::create([
                            'id_transaksi' => $transaction->id_transaksi,
                            'id_produk' => $productId,
                            'id_varian' => $variantId, // Null untuk produk langsung
                            'jumlah' => $item['quantity'],
                            'harga_satuan' => $item['price'],
                            'total_harga' => $item['subtotal']
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Failed to create transaction detail:', [
                            'error' => $e->getMessage(),
                            'data' => [
                                'id_transaksi' => $transaction->id_transaksi,
                                'id_produk' => $productId,
                                'id_varian' => $variantId,
                                'jumlah' => $item['quantity'],
                                'harga_satuan' => $item['price'],
                                'total_harga' => $item['subtotal']
                            ]
                        ]);
                        throw new \Exception("Gagal membuat detail transaksi: " . $e->getMessage());
                    }

                    // Update stock berdasarkan jenis produk
                    if (!$isDirectProduct) {
                        // Ensure variant_id is integer
                        $variantIdForUpdate = is_numeric($item['variant']->id_varian) 
                            ? (int) $item['variant']->id_varian 
                            : $item['variant']->id_varian;
                        
                        // Cek apakah variant punya komposisi (bahan)
                        $compositions = DB::table('tbl_komposisi')
                            ->where('id_varian', $variantIdForUpdate)
                            ->get();
                        
                        $hasComposition = !$compositions->isEmpty();
                        
                        if ($hasComposition) {
                            // Variant dengan komposisi: untuk model angkringan (make-to-order), 
                            // selalu kurangi bahan karena produk dibuat dari bahan
                            // Stok_varian hanya sebagai buffer/pre-made, tapi bahan tetap harus dikurangi
                            $currentVariantStock = $item['variant']->stok_varian ?? 0;
                            $quantityToFulfill = $item['quantity'];
                            
                            // Hitung berapa yang bisa dipenuhi dari stok_varian (produk jadi)
                            $fulfilledFromStock = min($currentVariantStock, $quantityToFulfill);
                            $remainingToProduce = $quantityToFulfill - $fulfilledFromStock;
                            
                            Log::info('Updating stock for variant with composition:', [
                                'variant_id' => $variantIdForUpdate,
                                'variant_name' => $item['variant']->nama_varian,
                                'current_stok_varian' => $currentVariantStock,
                                'total_quantity' => $quantityToFulfill,
                                'fulfilled_from_stock' => $fulfilledFromStock,
                                'remaining_to_produce' => $remainingToProduce
                            ]);
                            
                            // Decrement stok_varian untuk produk jadi yang digunakan
                            if ($fulfilledFromStock > 0) {
                                DB::table('tbl_varian')
                                    ->where('id_varian', $variantIdForUpdate)
                                    ->decrement('stok_varian', $fulfilledFromStock);
                                
                                Log::info('Decremented variant stock:', [
                                    'variant_id' => $variantIdForUpdate,
                                    'decremented_by' => $fulfilledFromStock
                                ]);
                            }
                            
                            // SELALU kurangi bahan untuk semua quantity (make-to-order model)
                            // Karena produk dibuat dari bahan, bukan dari stok_varian
                            $totalQuantityToProduce = $quantityToFulfill; // Selalu kurangi bahan untuk semua quantity
                            
                            Log::info('Producing variant from ingredients (make-to-order):', [
                                'variant_id' => $variantIdForUpdate,
                                'quantity_to_produce' => $totalQuantityToProduce,
                                'note' => 'Always reduce ingredients for all quantity in make-to-order model'
                            ]);
                            
                            try {
                                foreach ($compositions as $composition) {
                                    // Gunakan bahan untuk SEMUA quantity (make-to-order model)
                                    $ingredientUsage = $composition->jumlah_per_porsi * $totalQuantityToProduce;
                                    
                                    // Gunakan lockForUpdate untuk memastikan konsistensi
                                    $bahan = TblBahan::lockForUpdate()->find($composition->id_bahan);
                                    if (!$bahan) {
                                        Log::error('Bahan not found for stock update:', [
                                            'ingredient_id' => $composition->id_bahan
                                        ]);
                                        continue;
                                    }
                                    
                                    // Double check stok sebelum update
                                    if ($bahan->stok_bahan < $ingredientUsage) {
                                        Log::error('Insufficient ingredient stock during update:', [
                                            'ingredient' => $bahan->nama_bahan,
                                            'required' => $ingredientUsage,
                                            'available' => $bahan->stok_bahan,
                                            'variant' => $item['variant']->nama_varian,
                                            'total_quantity' => $totalQuantityToProduce
                                        ]);
                                        throw new \Exception("Stok bahan {$bahan->nama_bahan} tidak mencukupi saat update. Dibutuhkan: {$ingredientUsage}, Tersedia: {$bahan->stok_bahan}");
                                    }
                                    
                                    Log::info('Updating ingredient stock:', [
                                        'ingredient_id' => $composition->id_bahan,
                                        'ingredient_name' => $bahan->nama_bahan,
                                        'usage_per_portion' => $composition->jumlah_per_porsi,
                                        'total_quantity' => $totalQuantityToProduce,
                                        'total_usage' => $ingredientUsage,
                                        'variant' => $item['variant']->nama_varian
                                    ]);
                                    
                                    // Update dengan decrement yang aman
                                    $bahan->decrement('stok_bahan', $ingredientUsage);
                                    
                                    // Reload untuk mendapatkan stok terbaru
                                    $bahan->refresh();
                                    
                                    // Trigger notifikasi jika stok menipis (berdasarkan min_stok dari bahan)
                                    if ($bahan->stok_bahan < $bahan->min_stok) {
                                        // Kirim notifikasi via StockController
                                        try {
                                            $stockController = new \App\Http\Controllers\Api\StockController();
                                            $reflection = new \ReflectionClass($stockController);
                                            $method = $reflection->getMethod('sendStockNotification');
                                            $method->setAccessible(true);
                                            $method->invoke($stockController, $bahan);
                                        } catch (\Exception $e) {
                                            Log::error('Failed to send notification after stock update:', [
                                                'error' => $e->getMessage(),
                                                'bahan_id' => $bahan->id_bahan
                                            ]);
                                        }
                                    }
                                }
                            } catch (\Exception $e) {
                                Log::error('Failed to update ingredient stock:', [
                                    'error' => $e->getMessage(),
                                    'variant_id' => $item['variant']->id_varian,
                                    'quantity' => $item['quantity']
                                ]);
                                // Rollback transaction jika gagal update stok bahan
                                throw $e;
                            }
                        } else {
                            // Variant tanpa komposisi (produk jadi):
                            // Hanya decrement stok variant, tidak ada bahan yang digunakan
                            
                            Log::info('Updating variant stock for pre-made variant:', [
                                'variant_id' => $variantIdForUpdate,
                                'current_stock' => $item['variant']->stok_varian,
                                'decrement_by' => $item['quantity']
                            ]);
                            
                            DB::table('tbl_varian')
                                ->where('id_varian', $variantIdForUpdate)
                                ->decrement('stok_varian', $item['quantity']);
                        }
                    } else {
                        Log::info('Skipping stock update for direct product:', [
                            'product' => $item['variant']->nama_varian,
                            'quantity' => $item['quantity']
                        ]);
                    }
                }

                DB::commit();

                // Prepare response
                $response = response()->json([
                    'success' => true,
                    'message' => 'Transaksi berhasil disimpan',
                    'data' => [
                        'transaction_id' => $transaction->id_transaksi,
                        'transaction_number' => 'TRX' . $transaction->id_transaksi,
                        'total_amount' => $totalAmount,
                        'change' => $request->payment_method === 'tunai' ? 
                            ($request->cash_amount - $totalAmount) : 0
                    ]
                ], 201);

                // Kirim notifikasi stok menipis setelah response dikirim (non-blocking)
                // Menggunakan register_shutdown_function untuk menjalankan setelah response dikirim
                register_shutdown_function(function() {
                    try {
                        $this->sendStockNotificationAfterTransaction();
                    } catch (\Exception $e) {
                        // Silently fail - notification is not critical
                        Log::error('Error in shutdown function for stock notification: ' . $e->getMessage());
                    }
                });

                return $response;

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Transaction error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Determine if this is a validation/business logic error (400) or server error (500)
            $errorMessage = $e->getMessage();
            $isValidationError = (
                str_contains($errorMessage, 'tidak mencukupi') ||
                str_contains($errorMessage, 'tidak ditemukan') ||
                str_contains($errorMessage, 'tidak valid') ||
                str_contains($errorMessage, 'Data tidak valid')
            );
            
            $statusCode = $isValidationError ? 400 : 500;
            
            return response()->json([
                'success' => false,
                'message' => $isValidationError ? $errorMessage : 'Terjadi kesalahan saat menyimpan transaksi',
                'error' => $errorMessage
            ], $statusCode);
        }
    }

    /**
     * Get transaction history
     */
    public function getHistory(Request $request)
    {
        try {
            Log::info('Fetching transaction history with filters:', $request->all());
            
            $query = TblTransaksi::with(['user', 'details'])
                ->orderBy('tanggal_waktu', 'desc');

            // Filter by date range
            if ($request->start_date && $request->end_date) {
                $query->whereBetween('tanggal_waktu', [
                    $request->start_date,
                    $request->end_date
                ]);
            }

            // Filter by payment method
            if ($request->payment_method) {
                $query->where('metode_bayar', $request->payment_method);
            }

            // Filter by cashier
            if ($request->cashier_id) {
                $query->where('created_by', $request->cashier_id);
            }

            // Search by transaction number or cashier name
            if ($request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('id_transaksi', 'like', '%' . $request->search . '%')
                      ->orWhereHas('user', function($userQuery) use ($request) {
                          $userQuery->where('nama_user', 'like', '%' . $request->search . '%');
                      });
                });
            }

            $transactions = $query->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $transactions
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil riwayat transaksi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get transaction by ID
     */
    public function show($id)
    {
        try {
            $transaction = TblTransaksi::with([
                'user',
                'details' => function($query) {
                    $query->with([
                        'produk.kategori',
                        'varian' => function($q) {
                            $q->with('produk.kategori');
                        }
                    ]);
                }
            ])
                ->find($id);

            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $transaction
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching transaction detail:', [
                'transaction_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data transaksi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Print receipt for a single transaction
     */
    public function printReceipt($id)
    {
        try {
            $transaction = TblTransaksi::with([
                'user',
                'details' => function($query) {
                    $query->with([
                        'produk.kategori',
                        'varian' => function($q) {
                            $q->with('produk.kategori');
                        }
                    ]);
                }
            ])
                ->find($id);

            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi tidak ditemukan'
                ], 404);
            }

            // Generate HTML content for receipt
            $html = $this->generateReceiptHtml($transaction);

            // Return HTML that can be printed
            return response($html)
                ->header('Content-Type', 'text/html; charset=utf-8')
                ->header('Content-Disposition', 'inline; filename="struk-TRX' . $transaction->id_transaksi . '.html"');

        } catch (\Exception $e) {
            Log::error('Error generating receipt:', [
                'transaction_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat generate struk',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate HTML content for receipt
     */
    private function generateReceiptHtml($transaction)
    {
        $paymentMethodText = '';
        switch($transaction->metode_bayar) {
            case 'cash':
                $paymentMethodText = 'Tunai';
                break;
            case 'qris':
                $paymentMethodText = 'QRIS';
                break;
            case 'lainnya':
                $paymentMethodText = 'Transfer Bank';
                break;
            default:
                $paymentMethodText = $transaction->metode_bayar;
        }

        $dateTime = date('d F Y H:i', strtotime($transaction->tanggal_waktu));
        $cashierName = $transaction->user->nama_user ?? 'Unknown';

        $html = '<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Struk Transaksi - TRX' . $transaction->id_transaksi . '</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none !important; }
        }
        body { 
            font-family: "Courier New", monospace; 
            padding: 20px; 
            background: #f5f5f5; 
            max-width: 400px; 
            margin: 0 auto;
        }
        .receipt { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .header { 
            text-align: center; 
            border-bottom: 2px dashed #10b981; 
            padding-bottom: 15px; 
            margin-bottom: 15px; 
        }
        .header h1 { 
            color: #10b981; 
            font-size: 20px; 
            margin-bottom: 5px; 
        }
        .header p { 
            color: #666; 
            font-size: 12px; 
        }
        .info { 
            margin-bottom: 15px; 
            font-size: 12px; 
        }
        .info-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 5px; 
        }
        .info-label { 
            color: #666; 
        }
        .info-value { 
            font-weight: bold; 
            color: #111; 
        }
        .divider { 
            border-top: 1px dashed #ddd; 
            margin: 15px 0; 
        }
        .items { 
            margin-bottom: 15px; 
        }
        .item { 
            margin-bottom: 10px; 
            font-size: 12px; 
        }
        .item-name { 
            font-weight: bold; 
            margin-bottom: 3px; 
        }
        .item-detail { 
            display: flex; 
            justify-content: space-between; 
            color: #666; 
            font-size: 11px; 
        }
        .total { 
            background: #f0fdf4; 
            border: 2px solid #10b981; 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 15px; 
        }
        .total-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 5px; 
            font-size: 14px; 
        }
        .total-label { 
            font-weight: bold; 
            color: #111; 
        }
        .total-value { 
            font-weight: bold; 
            color: #10b981; 
            font-size: 18px; 
        }
        .footer { 
            text-align: center; 
            padding-top: 15px; 
            border-top: 2px dashed #10b981; 
            color: #666; 
            font-size: 11px; 
        }
        .print-btn { 
            margin-top: 20px; 
            text-align: center; 
        }
        .print-btn button { 
            background: #10b981; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 8px; 
            font-size: 14px; 
            font-weight: bold; 
            cursor: pointer; 
        }
        .print-btn button:hover { 
            background: #059669; 
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>ANGKRINGAN IMS</h1>
            <p>Sistem Point of Sale</p>
        </div>

        <div class="info">
            <div class="info-row">
                <span class="info-label">No. Transaksi:</span>
                <span class="info-value">TRX' . $transaction->id_transaksi . '</span>
            </div>
            <div class="info-row">
                <span class="info-label">Tanggal:</span>
                <span class="info-value">' . $dateTime . '</span>
            </div>
            <div class="info-row">
                <span class="info-label">Kasir:</span>
                <span class="info-value">' . htmlspecialchars($cashierName) . '</span>
            </div>
            <div class="info-row">
                <span class="info-label">Metode Bayar:</span>
                <span class="info-value">' . $paymentMethodText . '</span>
            </div>
        </div>

        <div class="divider"></div>

        <div class="items">
            <div style="font-weight: bold; margin-bottom: 10px; font-size: 12px;">Daftar Item:</div>';

        foreach ($transaction->details as $detail) {
            $itemName = $detail->varian ? $detail->varian->nama_varian : ($detail->produk ? $detail->produk->nama_produk : 'Unknown Item');
            $price = $detail->harga_satuan;
            $quantity = $detail->jumlah;
            $subtotal = $detail->total_harga;

            $html .= '
            <div class="item">
                <div class="item-name">' . htmlspecialchars($itemName) . '</div>
                <div class="item-detail">
                    <span>' . number_format($price, 0, ',', '.') . ' x ' . $quantity . '</span>
                    <span>Rp ' . number_format($subtotal, 0, ',', '.') . '</span>
                </div>
            </div>';
        }

        $html .= '
        </div>

        <div class="divider"></div>

        <div class="total">
            <div class="total-row">
                <span class="total-label">TOTAL:</span>
                <span class="total-value">Rp ' . number_format($transaction->total_transaksi, 0, ',', '.') . '</span>
            </div>
        </div>

        <div class="footer">
            <p>Terima kasih telah berbelanja!</p>
            <p>Silakan datang kembali</p>
            <p style="margin-top: 10px; font-size: 10px;">Dicetak pada: ' . date('d F Y H:i:s') . '</p>
        </div>
    </div>

    <div class="print-btn no-print">
        <button onclick="window.print()">Cetak Struk</button>
    </div>

    <script>
        // Auto trigger print dialog after page loads
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 250);
        };
    </script>
</body>
</html>';

        return $html;
    }

    /**
     * Delete transaction
     */
    public function destroy($id)
    {
        try {
            $transaction = TblTransaksi::find($id);

            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi tidak ditemukan'
                ], 404);
            }

            // Check if transaction is too old to delete (optional business rule)
            $transactionDate = $transaction->tanggal_waktu;
            $daysOld = now()->diffInDays($transactionDate);
            
            if ($daysOld > 30) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi yang lebih dari 30 hari tidak dapat dihapus'
                ], 400);
            }

            DB::beginTransaction();

            try {
                // Restore stock for each item in the transaction
                foreach ($transaction->details as $detail) {
                    if ($detail->id_varian) {
                        // Cek apakah variant punya komposisi
                        $compositions = DB::table('tbl_komposisi')
                            ->where('id_varian', $detail->id_varian)
                            ->get();
                        
                        $hasComposition = !$compositions->isEmpty();
                        
                        if ($hasComposition) {
                            // Variant dengan komposisi: restore stok bahan DAN stok_varian
                            // Karena saat transaksi dibuat, kedua stok bisa dikurangi
                            
                            // 1. Restore stok bahan
                            foreach ($compositions as $composition) {
                                $ingredientUsage = $composition->jumlah_per_porsi * $detail->jumlah;
                                DB::table('tbl_bahan')
                                    ->where('id_bahan', $composition->id_bahan)
                                    ->increment('stok_bahan', $ingredientUsage);
                                
                                Log::info('Restored ingredient stock:', [
                                    'ingredient_id' => $composition->id_bahan,
                                    'restored_quantity' => $ingredientUsage
                                ]);
                            }
                            
                            // 2. Restore stok_varian (jika ada yang dikurangi saat transaksi dibuat)
                            // PENTING: Saat transaksi dibuat, stok_varian dikurangi sebesar:
                            // min(current_stock, quantity) = fulfilledFromStock
                            // Namun, kita tidak menyimpan nilai fulfilledFromStock di database.
                            // Untuk keamanan, kita restore sebesar jumlah yang dibeli (detail->jumlah)
                            // karena ini adalah jumlah maksimal yang mungkin dikurangi dari stok_varian.
                            // Restoring full quantity is safer than under-restoring.
                            try {
                                $variant = DB::table('tbl_varian')
                                    ->where('id_varian', $detail->id_varian)
                                    ->first();
                                
                                if ($variant) {
                                    // Restore stok_varian sebesar jumlah yang dibeli
                                    // Ini mengembalikan stok_varian yang mungkin dikurangi saat transaksi dibuat
                                    DB::table('tbl_varian')
                                        ->where('id_varian', $detail->id_varian)
                                        ->increment('stok_varian', $detail->jumlah);
                                    
                                    Log::info('Restored variant stock for composed variant:', [
                                        'variant_id' => $detail->id_varian,
                                        'variant_name' => $variant->nama_varian ?? 'Unknown',
                                        'restored_quantity' => $detail->jumlah,
                                        'transaction_detail_id' => $detail->id_transaksi_detail ?? null
                                    ]);
                                } else {
                                    // Variant tidak ditemukan, tapi tetap coba restore untuk keamanan
                                    // (mungkin variant dihapus setelah transaksi dibuat)
                                    $restored = DB::table('tbl_varian')
                                        ->where('id_varian', $detail->id_varian)
                                        ->increment('stok_varian', $detail->jumlah);
                                    
                                    if ($restored > 0) {
                                        Log::info('Restored variant stock (variant was missing but restored anyway):', [
                                            'variant_id' => $detail->id_varian,
                                            'restored_quantity' => $detail->jumlah
                                        ]);
                                    } else {
                                        Log::warning('Variant not found when restoring stock (no rows affected):', [
                                            'variant_id' => $detail->id_varian,
                                            'transaction_detail_id' => $detail->id_transaksi_detail ?? null
                                        ]);
                                    }
                                }
                            } catch (\Exception $e) {
                                // Log error but don't fail the entire deletion
                                // Stock restoration is important but shouldn't block transaction deletion
                                Log::error('Error restoring variant stock for composed variant:', [
                                    'variant_id' => $detail->id_varian,
                                    'error' => $e->getMessage(),
                                    'transaction_detail_id' => $detail->id_transaksi_detail ?? null
                                ]);
                                // Continue with other items
                            }
                        } else {
                            // Variant tanpa komposisi: restore stok variant saja
                            DB::table('tbl_varian')
                                ->where('id_varian', $detail->id_varian)
                                ->increment('stok_varian', $detail->jumlah);
                        }
                    }
                    // Jika id_varian null (produk langsung), tidak perlu restore stok
                }

                // Delete transaction details first
                $transaction->details()->delete();
                
                // Delete transaction
                $transaction->delete();

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Transaksi berhasil dihapus'
                ], 200);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus transaksi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sales report
     */
    public function salesReport(Request $request)
    {
        try {
            $startDate = $request->start_date ?? date('Y-m-01');
            $endDate = $request->end_date ?? date('Y-m-d');

            $report = DB::table('tbl_transaksi')
                ->join('tbl_transaksi_detail', 'tbl_transaksi.id_transaksi', '=', 'tbl_transaksi_detail.id_transaksi')
                ->join('tbl_varian', 'tbl_transaksi_detail.id_varian', '=', 'tbl_varian.id_varian')
                ->join('tbl_produk', 'tbl_varian.id_produk', '=', 'tbl_produk.id_produk')
                ->whereBetween('tbl_transaksi.tanggal_transaksi', [$startDate, $endDate])
                ->select(
                    'tbl_produk.nama_produk',
                    'tbl_varian.nama_varian',
                    DB::raw('SUM(tbl_transaksi_detail.jumlah) as total_quantity'),
                    DB::raw('SUM(tbl_transaksi_detail.subtotal) as total_revenue')
                )
                ->groupBy('tbl_produk.id_produk', 'tbl_varian.id_varian')
                ->orderBy('total_revenue', 'desc')
                ->get();

            $summary = [
                'total_transactions' => TblTransaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])->count(),
                'total_revenue' => TblTransaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])->sum('total_bayar'),
                'cash_transactions' => TblTransaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])->where('metode_bayar', 'tunai')->count(),
                'qris_transactions' => TblTransaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])->where('metode_bayar', 'qris')->count(),
                'transfer_transactions' => TblTransaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])->where('metode_bayar', 'transfer')->count()
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'products' => $report
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil laporan penjualan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export transactions to PDF
     */
    public function exportPDF(Request $request)
    {
        try {
            $query = TblTransaksi::with(['user', 'details.produk', 'details.varian'])
                ->orderBy('tanggal_waktu', 'desc');

            // Apply same filters as getHistory
            if ($request->start_date && $request->end_date) {
                $query->whereBetween('tanggal_waktu', [
                    $request->start_date,
                    $request->end_date
                ]);
            }

            if ($request->payment_method) {
                $query->where('metode_bayar', $request->payment_method);
            }

            if ($request->cashier_id) {
                $query->where('created_by', $request->cashier_id);
            }

            if ($request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('id_transaksi', 'like', '%' . $request->search . '%')
                      ->orWhereHas('user', function($userQuery) use ($request) {
                          $userQuery->where('nama_user', 'like', '%' . $request->search . '%');
                      });
                });
            }

            $transactions = $query->get();

            // Generate HTML content for PDF (browser print-friendly)
            $html = $this->generateTransactionPDFHtml($transactions, $request);

            // Return HTML that can be printed as PDF by browser
            return response($html)
                ->header('Content-Type', 'text/html; charset=utf-8')
                ->header('Content-Disposition', 'inline; filename="riwayat-transaksi-' . date('Y-m-d') . '.html"');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat export PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate HTML content for transaction PDF export
     */
    private function generateTransactionPDFHtml($transactions, $request)
    {
        $dateRange = '';
        if ($request->start_date && $request->end_date) {
            $dateRange = date('d F Y', strtotime($request->start_date)) . ' - ' . date('d F Y', strtotime($request->end_date));
        } else {
            $dateRange = 'Semua Periode';
        }

        $totalRevenue = $transactions->sum('total_transaksi');
        $totalTransactions = $transactions->count();

        $html = '<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Riwayat Transaksi</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #10b981; font-size: 28px; margin-bottom: 10px; }
        .header p { color: #666; font-size: 14px; }
        .info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px; }
        .info-item { background: #f9fafb; padding: 12px; border-radius: 6px; }
        .info-label { font-size: 12px; color: #666; margin-bottom: 5px; }
        .info-value { font-size: 16px; font-weight: bold; color: #111; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
        .summary-card { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-label { font-size: 12px; opacity: 0.9; margin-bottom: 8px; }
        .summary-value { font-size: 24px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #10b981; color: white; padding: 12px; text-align: left; font-size: 12px; font-weight: bold; }
        td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
        tr:nth-child(even) { background: #f9fafb; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
        .badge-cash { background: #dcfce7; color: #166534; }
        .badge-qris { background: #dbeafe; color: #1e40af; }
        .badge-transfer { background: #f3e8ff; color: #6b21a8; }
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 RIWAYAT TRANSAKSI</h1>
            <p>Laporan Transaksi POS System</p>
        </div>

        <div class="info">
            <div class="info-item">
                <div class="info-label">Periode</div>
                <div class="info-value">' . htmlspecialchars($dateRange) . '</div>
            </div>
            <div class="info-item">
                <div class="info-label">Tanggal Export</div>
                <div class="info-value">' . date('d F Y H:i:s') . '</div>
            </div>
        </div>

        <div class="summary">
            <div class="summary-card">
                <div class="summary-label">Total Transaksi</div>
                <div class="summary-value">' . number_format($totalTransactions, 0, ',', '.') . '</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Total Pendapatan</div>
                <div class="summary-value">Rp ' . number_format($totalRevenue, 0, ',', '.') . '</div>
            </div>
            <div class="summary-card">
                <div class="summary-label">Rata-rata per Transaksi</div>
                <div class="summary-value">Rp ' . number_format($totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0, 0, ',', '.') . '</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>No. Transaksi</th>
                    <th>Tanggal & Waktu</th>
                    <th>Kasir</th>
                    <th>Metode</th>
                    <th class="text-right">Total</th>
                    <th class="text-center">Items</th>
                </tr>
            </thead>
            <tbody>';

        $no = 1;
        foreach ($transactions as $transaction) {
            $paymentMethodClass = '';
            $paymentMethodText = '';
            switch($transaction->metode_bayar) {
                case 'cash':
                    $paymentMethodClass = 'badge-cash';
                    $paymentMethodText = 'Tunai';
                    break;
                case 'qris':
                    $paymentMethodClass = 'badge-qris';
                    $paymentMethodText = 'QRIS';
                    break;
                case 'lainnya':
                    $paymentMethodClass = 'badge-transfer';
                    $paymentMethodText = 'Transfer';
                    break;
                default:
                    $paymentMethodClass = 'badge-cash';
                    $paymentMethodText = $transaction->metode_bayar;
            }

            $itemCount = $transaction->details->sum('jumlah');
            $dateTime = date('d M Y H:i', strtotime($transaction->tanggal_waktu));

            $html .= '<tr>
                <td>' . $no++ . '</td>
                <td><strong>TRX' . $transaction->id_transaksi . '</strong></td>
                <td>' . $dateTime . '</td>
                <td>' . htmlspecialchars($transaction->user->nama_user ?? 'Unknown') . '</td>
                <td><span class="badge ' . $paymentMethodClass . '">' . $paymentMethodText . '</span></td>
                <td class="text-right"><strong>Rp ' . number_format($transaction->total_transaksi, 0, ',', '.') . '</strong></td>
                <td class="text-center">' . $itemCount . ' item</td>
            </tr>';
        }

        $html .= '</tbody>
        </table>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #666; font-size: 12px;">
            <p>Dicetak pada: ' . date('d F Y H:i:s') . '</p>
            <p>Dokumen ini dihasilkan oleh POS System</p>
        </div>
    </div>
</body>
</html>';

        return $html;
    }

    /**
     * Export transactions to Excel (CSV format for simplicity)
     */
    public function exportExcel(Request $request)
    {
        try {
            $query = TblTransaksi::with(['user', 'details.produk', 'details.varian'])
                ->orderBy('tanggal_waktu', 'desc');

            // Apply same filters as getHistory
            if ($request->start_date && $request->end_date) {
                $query->whereBetween('tanggal_waktu', [
                    $request->start_date,
                    $request->end_date
                ]);
            }

            if ($request->payment_method) {
                $query->where('metode_bayar', $request->payment_method);
            }

            if ($request->cashier_id) {
                $query->where('created_by', $request->cashier_id);
            }

            if ($request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('id_transaksi', 'like', '%' . $request->search . '%')
                      ->orWhereHas('user', function($userQuery) use ($request) {
                          $userQuery->where('nama_user', 'like', '%' . $request->search . '%');
                      });
                });
            }

            $transactions = $query->get();

            // Generate CSV content (using tab-delimited for better Excel compatibility)
            $csv = $this->generateTransactionCSV($transactions);

            // Return CSV file with proper encoding
            // Using .txt extension so Excel will ask for delimiter on import (more reliable)
            $filename = 'riwayat-transaksi-' . date('Y-m-d') . '.csv';
            return response($csv, 200, [
                'Content-Type' => 'text/csv; charset=utf-8',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Pragma' => 'public',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat export Excel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate CSV content for transaction export
     * Using TAB delimiter - most compatible with Excel across all locales
     */
    private function generateTransactionCSV($transactions)
    {
        // Add BOM for UTF-8 to ensure Excel displays Indonesian characters correctly
        $csv = "\xEF\xBB\xBF";
        
        // Use TAB as delimiter - Excel always recognizes TAB regardless of locale settings
        $delimiter = "\t";
        
        // CSV Headers
        $headers = ["No", "No. Transaksi", "Tanggal", "Waktu", "Kasir", "Metode Pembayaran", "Total", "Jumlah Item"];
        $csv .= implode($delimiter, $headers) . "\n";

        $no = 1;
        foreach ($transactions as $transaction) {
            $paymentMethod = '';
            switch($transaction->metode_bayar) {
                case 'cash':
                    $paymentMethod = 'Tunai';
                    break;
                case 'qris':
                    $paymentMethod = 'QRIS';
                    break;
                case 'lainnya':
                    $paymentMethod = 'Transfer';
                    break;
                default:
                    $paymentMethod = $transaction->metode_bayar;
            }

            $dateTime = \Carbon\Carbon::parse($transaction->tanggal_waktu);
            $date = $dateTime->format('d/m/Y');
            $time = $dateTime->format('H:i:s');
            $itemCount = $transaction->details->sum('jumlah');
            $cashierName = $transaction->user->nama_user ?? 'Unknown';
            $transactionNo = 'TRX' . $transaction->id_transaksi;
            $total = number_format($transaction->total_transaksi, 0, ',', '.');

            // Build row - TAB delimiter rarely needs escaping
            $row = [
                $no++,
                $transactionNo,
                $date,
                $time,
                $cashierName,
                $paymentMethod,
                $total,
                $itemCount
            ];

            $csv .= implode($delimiter, $row) . "\n";
        }

        return $csv;
    }

    /**
     * Send stock notification after transaction
     * Hanya mengirim untuk bahan yang dikonfigurasi di "Kelola Notifikasi" dan aktif
     * Method ini tidak akan memblokir response karena dipanggil setelah response dikirim
     */
    private function sendStockNotificationAfterTransaction()
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

        try {
            // Ambil semua bahan dengan stok di bawah min_stok
            $lowStockItems = TblBahan::with('kategori')
                ->whereColumn('stok_bahan', '<', 'min_stok')
                ->get();

            if ($lowStockItems->isEmpty()) {
                return; // Tidak ada stok menipis
            }

            $itemsToSend = [];
            $fiveMinutesAgo = now()->subMinutes(5);

            foreach ($lowStockItems as $bahan) {
                // Cek cooldown 5 menit menggunakan cache
                $cacheKey = 'stock_notification_' . $bahan->id_bahan;
                $lastSent = cache()->get($cacheKey);
                
                if ($lastSent && $lastSent->gt($fiveMinutesAgo)) {
                    continue;
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
                return; // Tidak ada stok menipis yang perlu dikirim
            }

            $items = $itemsToSend;

            $webhookUrl = config('services.n8n.webhook_url');
            // Reduce timeout to 2 seconds to prevent blocking the response
            $timeout = min(config('services.n8n.timeout', 5), 2);

            if (empty($webhookUrl)) {
                Log::warning('N8N webhook URL tidak dikonfigurasi');
                return;
            }

            // Kirim batch data ke n8n webhook dengan timeout pendek
            // Gunakan try-catch untuk menangkap semua jenis error termasuk timeout
            try {
                $response = Http::timeout($timeout)
                    ->connectTimeout(1) // Connection timeout 1 second
                    ->post($webhookUrl, [
                        'items' => $items,
                        'batch' => true,
                        'total_items' => count($items)
                    ]);

                if ($response->successful()) {
                    Log::info('Stock notification sent to n8n after transaction', [
                        'total_items' => count($items)
                    ]);
                } else {
                    Log::warning('Stock notification sent but received non-success response', [
                        'status' => $response->status(),
                        'total_items' => count($items)
                    ]);
                }
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                // Connection timeout atau connection refused - tidak critical
                Log::warning('Stock notification connection failed (non-critical)', [
                    'error' => $e->getMessage(),
                    'webhook_url' => $webhookUrl
                ]);
            } catch (\Illuminate\Http\Client\RequestException $e) {
                // Request timeout atau HTTP error - tidak critical
                Log::warning('Stock notification request failed (non-critical)', [
                    'error' => $e->getMessage(),
                    'webhook_url' => $webhookUrl
                ]);
            }

        } catch (\Exception $e) {
            // Log error tapi jangan gagalkan transaksi
            // Catch all other exceptions that might occur
            Log::error('Failed to send stock notification after transaction: ' . $e->getMessage(), [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}