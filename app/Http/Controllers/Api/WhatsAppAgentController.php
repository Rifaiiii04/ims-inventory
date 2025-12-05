<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblBahan;
use App\Models\TblKategori;
use App\Models\TblProduk;
use App\Models\TblTransaksi;
use App\Models\TblStockHistory;
use App\Traits\StockHistoryTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WhatsAppAgentController extends Controller
{
    use StockHistoryTrait;

    /**
     * Process WhatsApp message for stock input
     * Format: NAMA | KATEGORI | HARGA | STOK | SATUAN
     */
    public function processStockMessage(Request $request)
    {
        try {
            $message = $request->input('message', '');
            
            if (empty($message)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pesan tidak boleh kosong'
                ], 400);
            }

            // Parse message format: NAMA | KATEGORI | HARGA | STOK | SATUAN
            $parts = array_map('trim', explode('|', $message));
            
            if (count($parts) !== 5) {
                return response()->json([
                    'success' => false,
                    'message' => 'Format pesan salah. Gunakan: NAMA | KATEGORI | HARGA | STOK | SATUAN'
                ], 400);
            }

            $nama = $parts[0];
            $kategori = $parts[1];
            $harga = floatval($parts[2]);
            $stok = floatval($parts[3]);
            $satuan = $parts[4];

            // Validasi data
            if (empty($nama) || $harga < 0 || $stok < 0 || empty($satuan)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak valid. Pastikan nama, harga, stok, dan satuan diisi dengan benar'
                ], 400);
            }

            // Cari atau buat kategori
            $kategoriModel = TblKategori::where('nama_kategori', $kategori)->first();
            if (!$kategoriModel) {
                $kategoriModel = TblKategori::create([
                    'nama_kategori' => $kategori,
                    'deskripsi' => 'Kategori dibuat via WhatsApp Agent'
                ]);
            }

            // Cek apakah bahan sudah ada
            $existingBahan = TblBahan::where('nama_bahan', $nama)->first();
            
            DB::beginTransaction();
            
            try {
                if ($existingBahan) {
                    // Update stok yang sudah ada
                    $oldData = $existingBahan->toArray();
                    $existingBahan->update([
                        'harga_beli' => $harga,
                        'stok_bahan' => $existingBahan->stok_bahan + $stok,
                        'satuan' => $satuan,
                        'updated_by' => 1 // System user
                    ]);

                    // Log history
                    $this->logStockHistory(
                        $existingBahan->id_bahan,
                        'update',
                        $oldData,
                        $existingBahan->toArray(),
                        "Update stok via WhatsApp Agent: +{$stok} {$satuan}",
                        1
                    );

                    $message = "Stok {$nama} berhasil ditambahkan {$stok} {$satuan}. Total stok sekarang: {$existingBahan->stok_bahan} {$satuan}";
                } else {
                    // Buat bahan baru
                    $bahan = TblBahan::create([
                        'nama_bahan' => $nama,
                        'id_kategori' => $kategoriModel->id_kategori,
                        'harga_beli' => $harga,
                        'stok_bahan' => $stok,
                        'satuan' => $satuan,
                        'min_stok' => 0,
                        'updated_by' => 1 // System user
                    ]);

                    // Log history
                    $this->logStockHistory(
                        $bahan->id_bahan,
                        'create',
                        null,
                        $bahan->toArray(),
                        "Bahan baru ditambahkan via WhatsApp Agent",
                        1
                    );

                    $message = "Bahan baru {$nama} berhasil ditambahkan dengan stok {$stok} {$satuan}";
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => [
                        'nama' => $nama,
                        'kategori' => $kategori,
                        'harga' => $harga,
                        'stok' => $stok,
                        'satuan' => $satuan
                    ]
                ], 200);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('WhatsApp Agent Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memproses pesan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get low stock alerts for WhatsApp notification
     */
    public function getLowStockAlerts()
    {
        try {
            $lowStockItems = TblBahan::with(['kategori:id_kategori,nama_kategori'])
                ->whereColumn('stok_bahan', '<', 'min_stok')
                ->get();

            if ($lowStockItems->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Tidak ada stok yang menipis',
                    'data' => []
                ], 200);
            }

            $alerts = $lowStockItems->map(function($item) {
                return [
                    'nama' => $item->nama_bahan,
                    'kategori' => $item->kategori->nama_kategori ?? 'Tidak ada kategori',
                    'stok_sekarang' => $item->stok_bahan,
                    'stok_minimum' => $item->min_stok,
                    'satuan' => $item->satuan,
                    'kekurangan' => $item->min_stok - $item->stok_bahan
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Ditemukan ' . $lowStockItems->count() . ' item dengan stok menipis',
                'data' => $alerts
            ], 200);

        } catch (\Exception $e) {
            Log::error('WhatsApp Low Stock Alert Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data stok menipis'
            ], 500);
        }
    }

    /**
     * Send low stock notification via WhatsApp
     */
    public function sendLowStockNotification()
    {
        try {
            $alerts = $this->getLowStockAlerts();
            
            if (!$alerts->getData()->success) {
                return $alerts;
            }

            $lowStockItems = $alerts->getData()->data;
            
            if (empty($lowStockItems)) {
                return response()->json([
                    'success' => true,
                    'message' => 'Tidak ada notifikasi yang perlu dikirim'
                ], 200);
            }

            // Format pesan untuk WhatsApp
            $message = "🚨 *ALERT STOK MENIPIS* 🚨\n\n";
            foreach ($lowStockItems as $item) {
                $message .= "• *{$item['nama']}* ({$item['kategori']})\n";
                $message .= "  Stok: {$item['stok_sekarang']} {$item['satuan']}\n";
                $message .= "  Minimum: {$item['stok_minimum']} {$item['satuan']}\n";
                $message .= "  Kekurangan: {$item['kekurangan']} {$item['satuan']}\n\n";
            }
            $message .= "Segera lakukan restocking! 📦";

            // Simpan notifikasi ke database
            DB::table('tbl_notifikasi')->insert([
                'judul' => 'Alert Stok Menipis',
                'pesan' => $message,
                'tipe' => 'low_stock',
                'status' => 'unread',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi stok menipis berhasil dikirim',
                'whatsapp_message' => $message,
                'items_count' => count($lowStockItems)
            ], 200);

        } catch (\Exception $e) {
            Log::error('WhatsApp Notification Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengirim notifikasi'
            ], 500);
        }
    }

    /**
     * Execute SQL query (READ ONLY - SELECT only for security)
     * Used by WhatsApp AI agent to query database
     */
    public function executeQuery(Request $request)
    {
        try {
            $query = $request->input('query', '');
            
            if (empty($query)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Query tidak boleh kosong',
                    'data' => []
                ], 400);
            }

            // Security: Only allow SELECT queries
            $queryUpper = strtoupper(trim($query));
            if (!str_starts_with($queryUpper, 'SELECT')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya query SELECT yang diizinkan untuk keamanan',
                    'data' => []
                ], 403);
            }

            // Additional security: Block dangerous keywords
            $dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE', 'EXEC', 'EXECUTE'];
            foreach ($dangerousKeywords as $keyword) {
                if (str_contains($queryUpper, $keyword)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Query mengandung kata kunci yang tidak diizinkan',
                        'data' => []
                    ], 403);
                }
            }

            // Limit results to prevent large responses
            if (!str_contains($queryUpper, 'LIMIT')) {
                // Add LIMIT if not present (max 100 rows)
                $query = rtrim($query, ';') . ' LIMIT 100';
            }

            // Execute query
            $results = DB::select($query);

            // Convert to array for JSON response
            $data = array_map(function($item) {
                return (array) $item;
            }, $results);

            Log::info('WhatsApp Query Executed', [
                'query' => $query,
                'rows_returned' => count($data)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Query berhasil dieksekusi',
                'data' => $data,
                'count' => count($data)
            ], 200);

        } catch (\Exception $e) {
            Log::error('WhatsApp Query Error: ' . $e->getMessage(), [
                'query' => $request->input('query', '')
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengeksekusi query: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get stock by material name (intent: cek_stok_bahan_by_nama)
     */
    public function getStockByMaterialName(Request $request)
    {
        try {
            $namaBahan = $request->input('nama_bahan', '');
            
            if (empty($namaBahan)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Parameter nama_bahan tidak boleh kosong',
                    'data' => []
                ], 400);
            }

            $results = TblBahan::with(['kategori:id_kategori,nama_kategori'])
                ->where('nama_bahan', 'LIKE', '%' . $namaBahan . '%')
                ->select('id_bahan', 'nama_bahan', 'stok_bahan', 'min_stok', 'satuan', 'id_kategori')
                ->orderBy('nama_bahan')
                ->limit(10)
                ->get()
                ->map(function($item) {
                    return [
                        'id_bahan' => $item->id_bahan,
                        'nama_bahan' => $item->nama_bahan,
                        'stok_bahan' => $item->stok_bahan,
                        'min_stok' => $item->min_stok,
                        'satuan' => $item->satuan,
                        'nama_kategori' => $item->kategori->nama_kategori ?? 'Tidak ada kategori'
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diambil',
                'data' => $results,
                'count' => $results->count()
            ], 200);

        } catch (\Exception $e) {
            Log::error('WhatsApp Get Stock By Name Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get low stock materials (intent: list_bahan_stok_rendah)
     */
    public function getLowStockMaterials(Request $request)
    {
        try {
            $toleransiPersen = $request->input('toleransi_persen', 10);
            
            $results = TblBahan::with(['kategori:id_kategori,nama_kategori'])
                ->select('id_bahan', 'nama_bahan', 'stok_bahan', 'min_stok', 'satuan', 'id_kategori')
                ->whereRaw('stok_bahan <= min_stok * (1 + ?)', [$toleransiPersen / 100])
                ->orderBy('stok_bahan', 'ASC')
                ->limit(50)
                ->get()
                ->map(function($item) {
                    return [
                        'id_bahan' => $item->id_bahan,
                        'nama_bahan' => $item->nama_bahan,
                        'stok_bahan' => $item->stok_bahan,
                        'min_stok' => $item->min_stok,
                        'satuan' => $item->satuan,
                        'nama_kategori' => $item->kategori->nama_kategori ?? 'Tidak ada kategori'
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diambil',
                'data' => $results,
                'count' => $results->count()
            ], 200);

        } catch (\Exception $e) {
            Log::error('WhatsApp Get Low Stock Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get stock summary by category (intent: ringkasan_stok_per_kategori)
     */
    public function getStockSummaryByCategory()
    {
        try {
            $results = DB::table('tbl_kategori as k')
                ->leftJoin('tbl_bahan as b', 'k.id_kategori', '=', 'b.id_kategori')
                ->select(
                    'k.id_kategori',
                    'k.nama_kategori',
                    DB::raw('COUNT(b.id_bahan) as jumlah_bahan'),
                    DB::raw('COALESCE(SUM(b.stok_bahan), 0) as total_stok')
                )
                ->groupBy('k.id_kategori', 'k.nama_kategori')
                ->orderBy('k.nama_kategori', 'ASC')
                ->get()
                ->map(function($item) {
                    return [
                        'id_kategori' => $item->id_kategori,
                        'nama_kategori' => $item->nama_kategori,
                        'jumlah_bahan' => (int) $item->jumlah_bahan,
                        'total_stok' => (float) $item->total_stok
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diambil',
                'data' => $results,
                'count' => $results->count()
            ], 200);

        } catch (\Exception $e) {
            Log::error('WhatsApp Get Stock Summary Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get products and variants (intent: daftar_produk_dan_varian)
     */
    public function getProductsAndVariants(Request $request)
    {
        try {
            $namaProduk = $request->input('nama_produk', '');
            
            $query = TblProduk::with(['varian:id_varian,id_produk,nama_varian,stok_varian,unit'])
                ->select('id_produk', 'nama_produk');
            
            if (!empty($namaProduk)) {
                $query->where('nama_produk', 'LIKE', '%' . $namaProduk . '%');
            }
            
            $results = $query->orderBy('nama_produk', 'ASC')
                ->limit(50)
                ->get()
                ->flatMap(function($produk) {
                    if ($produk->varian->isEmpty()) {
                        return [[
                            'id_produk' => $produk->id_produk,
                            'nama_produk' => $produk->nama_produk,
                            'id_varian' => null,
                            'nama_varian' => null,
                            'stok_varian' => null,
                            'unit' => null
                        ]];
                    }
                    
                    return $produk->varian->map(function($varian) use ($produk) {
                        return [
                            'id_produk' => $produk->id_produk,
                            'nama_produk' => $produk->nama_produk,
                            'id_varian' => $varian->id_varian,
                            'nama_varian' => $varian->nama_varian,
                            'stok_varian' => $varian->stok_varian,
                            'unit' => $varian->unit
                        ];
                    });
                })
                ->take(50);

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diambil',
                'data' => $results->values(),
                'count' => $results->count()
            ], 200);

        } catch (\Exception $e) {
            Log::error('WhatsApp Get Products Variants Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get today's transaction summary (intent: ringkasan_transaksi_hari_ini)
     */
    public function getTodayTransactionSummary()
    {
        try {
            $result = TblTransaksi::select(
                    DB::raw('DATE(tanggal_waktu) as tanggal'),
                    DB::raw('COUNT(id_transaksi) as jumlah_transaksi'),
                    DB::raw('SUM(total_transaksi) as total_penjualan')
                )
                ->whereDate('tanggal_waktu', today())
                ->groupBy(DB::raw('DATE(tanggal_waktu)'))
                ->first();

            if (!$result) {
                return response()->json([
                    'success' => true,
                    'message' => 'Belum ada transaksi hari ini',
                    'data' => [],
                    'count' => 0
                ], 200);
            }

            $data = [[
                'tanggal' => $result->tanggal,
                'jumlah_transaksi' => (int) $result->jumlah_transaksi,
                'total_penjualan' => (float) $result->total_penjualan
            ]];

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diambil',
                'data' => $data,
                'count' => 1
            ], 200);

        } catch (\Exception $e) {
            Log::error('WhatsApp Get Today Transaction Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }
}
