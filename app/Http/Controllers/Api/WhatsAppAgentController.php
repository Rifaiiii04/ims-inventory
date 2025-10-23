<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblBahan;
use App\Models\TblKategori;
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
}
