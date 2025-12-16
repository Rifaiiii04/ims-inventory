<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblNotifikasi;
use App\Models\TblBahan;
use App\Models\TblSettings;
use App\Models\TblExpiredPrediction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Get all notifications
     */
    public function index(Request $request)
    {
        try {
            $notifications = TblNotifikasi::with(['bahan:id_bahan,nama_bahan,min_stok'])
                ->orderBy('created_at', 'desc')
                ->get();

            $formattedNotifications = $notifications->map(function($notification) {
                return [
                    'id' => $notification->id_notifikasi,
                    'judul' => 'Peringatan Stok ' . ($notification->bahan->nama_bahan ?? 'Unknown'),
                    'pesan' => 'Stok ' . ($notification->bahan->nama_bahan ?? 'Unknown') . ' mencapai batas minimum ' . ($notification->bahan->min_stok ?? $notification->batas_minimum),
                    'tipe' => 'low_stock',
                    'status' => $notification->aktif ? 'active' : 'inactive',
                    'batas_minimum' => $notification->bahan->min_stok ?? $notification->batas_minimum,
                    'min_stok_bahan' => $notification->bahan->min_stok,
                    'jadwal' => $notification->jadwal,
                    'terakhir_kirim' => $notification->terakhir_kirim,
                    'created_by' => $notification->created_by,
                    'created_at' => $notification->created_at,
                    'updated_at' => $notification->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedNotifications
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data notifikasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new notification
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_bahan' => 'required|exists:tbl_bahan,id_bahan',
                'jadwal' => 'required|in:harian,mingguan,real-time',
                'aktif' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get bahan data to use its min_stok
            $bahan = TblBahan::find($request->id_bahan);
            if (!$bahan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bahan tidak ditemukan'
                ], 404);
            }

            $notification = TblNotifikasi::create([
                'id_bahan' => $request->id_bahan,
                'batas_minimum' => $bahan->min_stok, // Use min_stok from bahan
                'jadwal' => $request->jadwal,
                'aktif' => $request->aktif ?? true,
                'created_by' => 1, // TODO: Get from auth
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil dibuat',
                'data' => $notification
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat membuat notifikasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update notification
     */
    public function update(Request $request, $id)
    {
        try {
            $notification = TblNotifikasi::find($id);
            
            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notifikasi tidak ditemukan'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'jadwal' => 'sometimes|in:harian,mingguan,real-time',
                'aktif' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update only allowed fields (batas_minimum is read-only from bahan)
            $updateData = $request->only(['jadwal', 'aktif']);
            $notification->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil diperbarui',
                'data' => $notification
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui notifikasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete notification
     */
    public function destroy($id)
    {
        try {
            $notification = TblNotifikasi::find($id);
            
            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notifikasi tidak ditemukan'
                ], 404);
            }

            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus notifikasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($id)
    {
        try {
            $notification = TblNotifikasi::find($id);
            
            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notifikasi tidak ditemukan'
                ], 404);
            }

            $notification->update(['terakhir_kirim' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil ditandai sebagai dibaca'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui notifikasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        try {
            TblNotifikasi::whereNull('terakhir_kirim')->update(['terakhir_kirim' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Semua notifikasi berhasil ditandai sebagai dibaca'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui notifikasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unread notifications count
     */
    public function getUnreadCount()
    {
        try {
            $count = TblNotifikasi::where('status', 'unread')->count();

            return response()->json([
                'success' => true,
                'data' => ['count' => $count]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil jumlah notifikasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create low stock notification
     */
    public function createLowStockNotification()
    {
        try {
            $lowStockItems = TblBahan::whereColumn('stok_bahan', '<', 'min_stok')->get();

            if ($lowStockItems->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Tidak ada stok yang menipis'
                ], 200);
            }

            $message = "🚨 *ALERT STOK MENIPIS* 🚨\n\n";
            foreach ($lowStockItems as $item) {
                $message .= "• *{$item->nama_bahan}*\n";
                $message .= "  Stok: {$item->stok_bahan} {$item->satuan}\n";
                $message .= "  Minimum: {$item->min_stok} {$item->satuan}\n";
                $message .= "  Kekurangan: " . ($item->min_stok - $item->stok_bahan) . " {$item->satuan}\n\n";
            }
            $message .= "Segera lakukan restocking! 📦";

            $notification = TblNotifikasi::create([
                'judul' => 'Alert Stok Menipis',
                'pesan' => $message,
                'tipe' => 'low_stock',
                'status' => 'unread'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi stok menipis berhasil dibuat',
                'data' => $notification
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat membuat notifikasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send notification to n8n based on notification settings
     * Mengirim notifikasi ke n8n berdasarkan pengaturan yang dikonfigurasi
     */
    public function sendNotificationToN8n($notificationId = null)
    {
        try {
            // Cek apakah n8n diaktifkan
            if (!config('services.n8n.enabled', true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notifikasi n8n tidak diaktifkan'
                ], 400);
            }

            $webhookUrl = config('services.n8n.webhook_url');
            $timeout = config('services.n8n.timeout', 5);

            if (empty($webhookUrl)) {
                Log::warning('N8N webhook URL tidak dikonfigurasi');
                return response()->json([
                    'success' => false,
                    'message' => 'N8N webhook URL tidak dikonfigurasi'
                ], 400);
            }

            // Jika notificationId diberikan, kirim untuk notifikasi spesifik
            if ($notificationId) {
                $notification = TblNotifikasi::with(['bahan.kategori'])->find($notificationId);
                
                if (!$notification) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Notifikasi tidak ditemukan'
                    ], 404);
                }

                // Cek apakah notifikasi aktif
                if (!$notification->aktif) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Notifikasi tidak aktif'
                    ], 400);
                }

                // Cek apakah stok bahan sudah di bawah batas minimum
                $bahan = $notification->bahan;
                if (!$bahan || $bahan->stok_bahan >= $bahan->min_stok) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Stok bahan masih di atas batas minimum'
                    ], 400);
                }

                // Format data untuk n8n
                $data = [
                    'nama_bahan' => $bahan->nama_bahan,
                    'stok_bahan' => (float)$bahan->stok_bahan,
                    'id_bahan' => $bahan->id_bahan,
                    'satuan' => $bahan->satuan,
                    'min_stok' => (float)$bahan->min_stok,
                    'kategori' => $bahan->kategori->nama_kategori ?? 'Tidak ada kategori',
                ];

                // Kirim ke n8n
                Http::timeout($timeout)->post($webhookUrl, $data);

                // Update terakhir_kirim
                $notification->update(['terakhir_kirim' => now()]);

                Log::info('Notification sent to n8n', [
                    'notification_id' => $notification->id_notifikasi,
                    'bahan_id' => $bahan->id_bahan,
                    'nama_bahan' => $bahan->nama_bahan
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Notifikasi berhasil dikirim ke n8n',
                    'data' => $data
                ], 200);
            }

            // Jika tidak ada notificationId, kirim semua notifikasi aktif yang memenuhi syarat
            $notifications = TblNotifikasi::with(['bahan.kategori'])
                ->where('aktif', true)
                ->get();

            $itemsToSend = [];
            $sentCount = 0;

            foreach ($notifications as $notification) {
                $bahan = $notification->bahan;
                
                // Skip jika bahan tidak ditemukan atau stok masih cukup
                if (!$bahan || $bahan->stok_bahan >= $bahan->min_stok) {
                    continue;
                }

                // Cek jadwal
                $shouldSend = $this->shouldSendBasedOnSchedule($notification);
                if (!$shouldSend) {
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

                // Update terakhir_kirim
                $notification->update(['terakhir_kirim' => now()]);
                $sentCount++;
            }

            if (empty($itemsToSend)) {
                return response()->json([
                    'success' => true,
                    'message' => 'Tidak ada notifikasi yang perlu dikirim',
                    'data' => []
                ], 200);
            }

            // Kirim batch ke n8n
            Http::timeout($timeout)->post($webhookUrl, [
                'items' => $itemsToSend,
                'batch' => true,
                'total_items' => count($itemsToSend)
            ]);

            Log::info('Batch notifications sent to n8n', [
                'total_items' => count($itemsToSend),
                'sent_count' => $sentCount
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil dikirim ke n8n',
                'total_items' => count($itemsToSend),
                'sent_count' => $sentCount,
                'data' => $itemsToSend
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to send notification to n8n: ' . $e->getMessage(), [
                'error' => $e->getMessage(),
                'notification_id' => $notificationId ?? 'all'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim notifikasi ke n8n',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Trigger manual notification send
     * Endpoint untuk trigger manual dari frontend
     */
    public function triggerNotification(Request $request, $id = null)
    {
        // Jika id tidak ada di route, cek dari request body
        if (!$id) {
            $id = $request->input('id');
        }
        
        return $this->sendNotificationToN8n($id);
    }

    /**
     * Check if notification should be sent based on schedule
     * Cek apakah notifikasi harus dikirim berdasarkan jadwal
     */
    private function shouldSendBasedOnSchedule($notification)
    {
        $jadwal = $notification->jadwal;
        $terakhirKirim = $notification->terakhir_kirim;

        // Real-time: selalu kirim jika belum pernah dikirim atau sudah lebih dari 5 menit
        if ($jadwal === 'real-time') {
            if (!$terakhirKirim) {
                return true;
            }
            $fiveMinutesAgo = now()->subMinutes(5);
            return $terakhirKirim->lt($fiveMinutesAgo);
        }

        // Harian: kirim jika belum pernah dikirim hari ini
        if ($jadwal === 'harian') {
            if (!$terakhirKirim) {
                return true;
            }
            return !$terakhirKirim->isToday();
        }

        // Mingguan: kirim jika belum pernah dikirim minggu ini
        if ($jadwal === 'mingguan') {
            if (!$terakhirKirim) {
                return true;
            }
            $startOfWeek = now()->startOfWeek();
            return $terakhirKirim->lt($startOfWeek);
        }

        return false;
    }

    /**
     * Process scheduled notifications
     * Method untuk dipanggil oleh scheduler (cron job)
     */
    public function processScheduledNotifications()
    {
        try {
            // Cek apakah n8n diaktifkan
            if (!config('services.n8n.enabled', true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notifikasi n8n tidak diaktifkan'
                ], 400);
            }

            $webhookUrl = config('services.n8n.webhook_url');
            $timeout = config('services.n8n.timeout', 5);

            if (empty($webhookUrl)) {
                return response()->json([
                    'success' => false,
                    'message' => 'N8N webhook URL tidak dikonfigurasi'
                ], 400);
            }

            $notifications = TblNotifikasi::with(['bahan.kategori'])
                ->where('aktif', true)
                ->get();

            $processed = 0;
            $sent = 0;
            $itemsToSend = [];

            foreach ($notifications as $notification) {
                $bahan = $notification->bahan;
                
                // Skip jika bahan tidak ditemukan atau stok masih cukup
                if (!$bahan || $bahan->stok_bahan >= $bahan->min_stok) {
                    continue;
                }

                // Cek jadwal
                if (!$this->shouldSendBasedOnSchedule($notification)) {
                    continue;
                }

                $processed++;

                $itemsToSend[] = [
                    'nama_bahan' => $bahan->nama_bahan,
                    'stok_bahan' => (float)$bahan->stok_bahan,
                    'id_bahan' => $bahan->id_bahan,
                    'satuan' => $bahan->satuan,
                    'min_stok' => (float)$bahan->min_stok,
                    'kategori' => $bahan->kategori->nama_kategori ?? 'Tidak ada kategori',
                ];

                // Update terakhir_kirim
                $notification->update(['terakhir_kirim' => now()]);
            }

            if (empty($itemsToSend)) {
                return response()->json([
                    'success' => true,
                    'message' => 'Tidak ada notifikasi yang perlu dikirim',
                    'processed' => $processed,
                    'sent' => 0
                ], 200);
            }

            // Kirim batch ke n8n
            try {
                Http::timeout($timeout)->post($webhookUrl, [
                    'items' => $itemsToSend,
                    'batch' => true,
                    'total_items' => count($itemsToSend)
                ]);

                $sent = count($itemsToSend);

                Log::info('Scheduled notifications processed and sent to n8n', [
                    'processed' => $processed,
                    'sent' => $sent
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send scheduled notifications to n8n: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengirim notifikasi ke n8n',
                    'error' => $e->getMessage(),
                    'processed' => $processed,
                    'sent' => 0
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Scheduled notifications processed',
                'processed' => $processed,
                'sent' => $sent
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to process scheduled notifications: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses scheduled notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get notification settings
     */
    public function getSettings()
    {
        try {
            // Try to get from database, if not found, return default
            $notificationEnabled = true; // Default value
            
            try {
                $notificationEnabled = TblSettings::getValue('notification_enabled', true);
            } catch (\Exception $e) {
                // If table doesn't exist or error, use default
                Log::warning('Failed to get notification_enabled from settings, using default: ' . $e->getMessage());
                $notificationEnabled = true;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'notification_enabled' => (bool) $notificationEnabled,
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in getSettings: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil pengaturan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update notification settings
     */
    public function updateSettings(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'notification_enabled' => 'required|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            try {
                TblSettings::setValue(
                    'notification_enabled',
                    $request->notification_enabled,
                    'boolean',
                    'Enable/disable notification system'
                );
            } catch (\Exception $e) {
                Log::error('Failed to update notification_enabled: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal menyimpan pengaturan ke database',
                    'error' => $e->getMessage()
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Pengaturan berhasil diperbarui',
                'data' => [
                    'notification_enabled' => (bool) $request->notification_enabled,
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in updateSettings: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui pengaturan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate expiration predictions for stock materials using Python service (Ollama gemma3:1b)
     * Generate prediksi expired untuk bahan stok menggunakan Python service
     */
    private function getExpiredPredictionServiceUrl()
    {
        $host = env('EXPIRED_PREDICTION_SERVICE_HOST', '127.0.0.1');
        $port = env('EXPIRED_PREDICTION_SERVICE_PORT', '5002');
        return "http://{$host}:{$port}";
    }

    public function generateExpiredPredictions(Request $request)
    {
        try {
            // Set maximum execution time to 900 seconds (15 minutes) for prediction processing
            set_time_limit(900);
            
            Log::info('Starting expired predictions generation');
            
            // Get all bahan with stock
            $bahanList = TblBahan::with('kategori')
                ->where('stok_bahan', '>', 0)
                ->get();

            if ($bahanList->isEmpty()) {
                Log::info('No bahan with stock found');
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada bahan dengan stok untuk diprediksi'
                ], 400);
            }

            Log::info('Found bahan with stock', ['count' => $bahanList->count()]);

            // Cek prediksi yang sudah ada untuk menghindari duplikasi
            $existingPredictions = TblExpiredPrediction::whereIn('id_bahan', $bahanList->pluck('id_bahan'))
                ->pluck('id_bahan')
                ->toArray();
            
            // Filter hanya bahan yang belum ada prediksinya
            $bahanToPredict = $bahanList->filter(function($bahan) use ($existingPredictions) {
                return !in_array($bahan->id_bahan, $existingPredictions);
            });
            
            if ($bahanToPredict->isEmpty()) {
                Log::info('All bahan already have predictions');
                return response()->json([
                    'success' => true,
                    'message' => 'Semua bahan sudah memiliki prediksi expired. Tidak ada data baru untuk di-generate.',
                    'data' => [
                        'total' => $bahanList->count(),
                        'berhasil' => 0,
                        'gagal' => 0,
                        'predictions' => [],
                        'errors' => [],
                        'skipped' => $bahanList->count()
                    ]
                ], 200);
            }
            
            Log::info('Bahan yang akan di-generate', [
                'total_bahan' => $bahanList->count(),
                'sudah_ada_prediksi' => count($existingPredictions),
                'akan_di_generate' => $bahanToPredict->count()
            ]);

            // Check if Python service is running
            try {
                $healthResponse = Http::timeout(5)->get($this->getExpiredPredictionServiceUrl() . '/health');
                if (!$healthResponse->successful()) {
                    $serviceUrl = $this->getExpiredPredictionServiceUrl();
                    return response()->json([
                        'success' => false,
                        'message' => 'Expired Prediction Service tidak tersedia',
                        'error' => "Pastikan Python expired prediction service berjalan di {$serviceUrl}"
                    ], 503);
                }
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghubungi Expired Prediction Service',
                    'error' => 'Pastikan Python expired prediction service berjalan di ' . $this->getExpiredPredictionServiceUrl() . '. Error: ' . $e->getMessage()
                ], 503);
            }

            // Prepare bahan list for Python service dengan data lengkap (hanya yang belum ada prediksi)
            $bahanDataList = [];
            foreach ($bahanToPredict as $bahan) {
                // Hitung umur stok (hari sejak dibuat)
                $umurStok = null;
                if ($bahan->created_at) {
                    $umurStok = $bahan->created_at->diffInDays(now());
                }
                
                // Hitung hari sejak terakhir update
                $hariSejakUpdate = null;
                if ($bahan->updated_at) {
                    $hariSejakUpdate = $bahan->updated_at->diffInDays(now());
                }
                
                $bahanDataList[] = [
                    'id_bahan' => $bahan->id_bahan,
                    'nama_bahan' => $bahan->nama_bahan,
                    'kategori' => $bahan->kategori->nama_kategori ?? 'Tidak ada kategori',
                    'stok_bahan' => (float)$bahan->stok_bahan,
                    'satuan' => $bahan->satuan,
                    'harga_beli' => (float)$bahan->harga_beli,
                    'min_stok' => (float)$bahan->min_stok,
                    'tanggal_dibuat' => $bahan->created_at ? $bahan->created_at->format('Y-m-d') : null,
                    'terakhir_update' => $bahan->updated_at ? $bahan->updated_at->format('Y-m-d') : date('Y-m-d'),
                    'umur_stok_hari' => $umurStok,
                    'hari_sejak_update' => $hariSejakUpdate,
                ];
            }
            
            // Tambahkan informasi bahan sejenis untuk konteks (untuk setiap bahan)
            // Group by kategori untuk memberikan konteks bahan sejenis
            $bahanByKategori = $bahanList->groupBy('id_kategori');
            foreach ($bahanDataList as &$bahanData) {
                $kategoriId = null;
                foreach ($bahanList as $bahan) {
                    if ($bahan->id_bahan == $bahanData['id_bahan']) {
                        $kategoriId = $bahan->id_kategori;
                        break;
                    }
                }
                
                if ($kategoriId && isset($bahanByKategori[$kategoriId])) {
                    $bahanSejenis = $bahanByKategori[$kategoriId]
                        ->where('id_bahan', '!=', $bahanData['id_bahan'])
                        ->take(3) // Ambil 3 bahan sejenis sebagai referensi
                        ->map(function($b) {
                            return [
                                'nama' => $b->nama_bahan,
                                'stok' => (float)$b->stok_bahan,
                                'satuan' => $b->satuan,
                            ];
                        })
                        ->values()
                        ->toArray();
                    
                    $bahanData['bahan_sejenis'] = $bahanSejenis;
                } else {
                    $bahanData['bahan_sejenis'] = [];
                }
            }
            unset($bahanData); // Unset reference

            // Call Python service for batch prediction
            try {
                Log::info('Calling Python service for batch prediction', [
                    'url' => $this->getExpiredPredictionServiceUrl() . '/predict-expiration-batch',
                    'bahan_count' => count($bahanDataList),
                    'timeout' => 900
                ]);
                
                $startTime = microtime(true);
                try {
                    $response = Http::timeout(900)->post($this->getExpiredPredictionServiceUrl() . '/predict-expiration-batch', [
                        'bahan_list' => $bahanDataList
                    ]);
                    
                    $elapsedTime = round(microtime(true) - $startTime, 2);
                    Log::info('Python service response received', [
                        'status' => $response->status(),
                        'successful' => $response->successful(),
                        'elapsed_time_seconds' => $elapsedTime
                    ]);
                } catch (\Illuminate\Http\Client\ConnectionException $e) {
                    $elapsedTime = round(microtime(true) - $startTime, 2);
                    Log::error('Connection timeout to Python service', [
                        'error' => $e->getMessage(),
                        'elapsed_time_seconds' => $elapsedTime,
                        'url' => $this->getExpiredPredictionServiceUrl() . '/predict-expiration-batch'
                    ]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Timeout: Python service tidak merespons dalam waktu 900 detik',
                        'error' => 'Service mungkin sedang memproses atau mengalami masalah. Silakan coba lagi atau cek log Python service.',
                        'elapsed_time' => $elapsedTime
                    ], 504);
                } catch (\Exception $e) {
                    $elapsedTime = round(microtime(true) - $startTime, 2);
                    Log::error('Error calling Python service', [
                        'error' => $e->getMessage(),
                        'class' => get_class($e),
                        'elapsed_time_seconds' => $elapsedTime
                    ]);
                    throw $e;
                }

                if (!$response->successful()) {
                    $errorBody = $response->body();
                    $errorBodyPreview = strlen($errorBody) > 500 ? substr($errorBody, 0, 500) . '...' : $errorBody;
                    
                    Log::error('Python service returned non-success status', [
                        'status' => $response->status(),
                        'body' => $errorBody,
                        'headers' => $response->headers()
                    ]);
                    
                    try {
                        $errorJson = $response->json();
                        $errorMessage = $errorJson['message'] ?? $errorJson['error'] ?? 'Unknown error';
                    } catch (\Exception $e) {
                        $errorMessage = $errorBodyPreview;
                    }
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'Gagal memanggil Expired Prediction Service',
                        'error' => 'Status: ' . $response->status() . ' - ' . $errorMessage,
                        'details' => config('app.debug') ? $errorBodyPreview : null
                    ], 500);
                }

                try {
                    $serviceData = $response->json();
                    Log::info('Python service JSON parsed successfully', [
                        'has_success' => isset($serviceData['success']),
                        'has_data' => isset($serviceData['data'])
                    ]);
                } catch (\Exception $e) {
                    $bodyPreview = strlen($response->body()) > 1000 ? substr($response->body(), 0, 1000) . '...' : $response->body();
                    Log::error('Failed to parse Python service JSON response', [
                        'error' => $e->getMessage(),
                        'body_preview' => $bodyPreview,
                        'body_length' => strlen($response->body())
                    ]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Gagal memparse response dari Python service',
                        'error' => $e->getMessage(),
                        'details' => config('app.debug') ? 'Response body: ' . $bodyPreview : null
                    ], 500);
                }
                
                // Log response for debugging
                Log::info('Python service response', [
                    'status' => $response->status(),
                    'has_data' => isset($serviceData['data']),
                    'success' => $serviceData['success'] ?? false,
                    'predictions_count' => count($serviceData['data']['predictions'] ?? []),
                    'errors_count' => count($serviceData['data']['errors'] ?? []),
                    'response_keys' => array_keys($serviceData ?? [])
                ]);
                
                // Debug: Log full response if debug mode
                if (config('app.debug')) {
                    Log::debug('Full Python service response', [
                        'response' => $serviceData
                    ]);
                }
                
                if (!$serviceData || !isset($serviceData['success']) || !$serviceData['success']) {
                    Log::error('Python service returned error', [
                        'response' => $serviceData
                    ]);
                    return response()->json([
                        'success' => false,
                        'message' => $serviceData['message'] ?? 'Gagal memprediksi expired',
                        'error' => $serviceData['error'] ?? 'Unknown error'
                    ], 500);
                }

                // Check if data exists
                if (!isset($serviceData['data']) || !is_array($serviceData['data'])) {
                    Log::error('Python service response missing data', [
                        'response' => $serviceData
                    ]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Response dari Python service tidak valid',
                        'error' => 'Data tidak ditemukan dalam response'
                    ], 500);
                }

                // Save predictions to database
                $predictions = [];
                $errors = [];

                foreach ($serviceData['data']['predictions'] ?? [] as $predictionData) {
                    try {
                        $bahanData = $predictionData['bahan'] ?? [];
                        $prediction = $predictionData['prediction'] ?? [];
                        
                        Log::debug('Processing prediction data', [
                            'has_bahan' => !empty($bahanData),
                            'has_prediction' => !empty($prediction),
                            'bahan_id' => $bahanData['id_bahan'] ?? 'missing',
                            'expired_date' => $prediction['expired_date'] ?? 'missing'
                        ]);
                        
                        if (!isset($bahanData['id_bahan']) || !isset($prediction['expired_date'])) {
                            Log::warning('Skipping prediction - missing data', [
                                'bahan_data' => $bahanData,
                                'prediction' => $prediction,
                                'missing_id_bahan' => !isset($bahanData['id_bahan']),
                                'missing_expired_date' => !isset($prediction['expired_date'])
                            ]);
                            $errors[] = [
                                'bahan' => $bahanData['nama_bahan'] ?? 'Unknown',
                                'error' => 'Data tidak lengkap: ' . (!isset($bahanData['id_bahan']) ? 'id_bahan missing' : 'expired_date missing')
                            ];
                            continue;
                        }

                        // Validate expired_date format
                        try {
                            $expiredDate = \Carbon\Carbon::parse($prediction['expired_date']);
                        } catch (\Exception $e) {
                            Log::warning('Invalid expired_date format', [
                                'date' => $prediction['expired_date'],
                                'error' => $e->getMessage()
                            ]);
                            $errors[] = [
                                'bahan' => $bahanData['nama_bahan'] ?? 'Unknown',
                                'error' => 'Format tanggal tidak valid: ' . $prediction['expired_date']
                            ];
                            continue;
                        }

                        try {
                            // Cek apakah prediksi sudah ada untuk bahan ini (prevent duplicate)
                            $existingPrediction = TblExpiredPrediction::where('id_bahan', $bahanData['id_bahan'])->first();
                            
                            if ($existingPrediction) {
                                Log::info('Prediction already exists, skipping', [
                                    'bahan_id' => $bahanData['id_bahan'],
                                    'bahan_name' => $bahanData['nama_bahan'] ?? 'Unknown',
                                    'existing_prediction_id' => $existingPrediction->id_prediksi
                                ]);
                                continue; // Skip, jangan create duplicate
                            }
                            
                            $userId = auth()->check() ? auth()->id() : 1;
                            
                            $dataToSave = [
                                'id_bahan' => $bahanData['id_bahan'],
                                'tanggal_prediksi_expired' => $expiredDate->format('Y-m-d'),
                                'alasan_prediksi' => $prediction['reason'] ?? 'Prediksi berdasarkan kategori dan karakteristik bahan',
                                'confidence_score' => min(100, max(0, (float)($prediction['confidence'] ?? 50))),
                                'data_bahan' => $bahanData,
                                'created_by' => $userId,
                            ];
                            
                            Log::debug('Saving prediction to database', [
                                'bahan_id' => $bahanData['id_bahan'],
                                'expired_date' => $dataToSave['tanggal_prediksi_expired'],
                                'confidence' => $dataToSave['confidence_score']
                            ]);
                            
                            $savedPrediction = TblExpiredPrediction::create($dataToSave);
                            
                            Log::debug('Prediction saved successfully', [
                                'id_prediksi' => $savedPrediction->id_prediksi
                            ]);
                            
                        } catch (\Illuminate\Database\QueryException $e) {
                            Log::error('Database error saving prediction', [
                                'error' => $e->getMessage(),
                                'code' => $e->getCode(),
                                'sql' => $e->getSql() ?? 'N/A',
                                'bindings' => $e->getBindings() ?? [],
                                'bahan_id' => $bahanData['id_bahan'] ?? null
                            ]);
                            
                            $errors[] = [
                                'bahan' => $bahanData['nama_bahan'] ?? 'Unknown',
                                'error' => 'Database error: ' . $e->getMessage()
                            ];
                            continue;
                        } catch (\Exception $e) {
                            Log::error('Unexpected error saving prediction', [
                                'error' => $e->getMessage(),
                                'class' => get_class($e),
                                'bahan_id' => $bahanData['id_bahan'] ?? null
                            ]);
                            
                            $errors[] = [
                                'bahan' => $bahanData['nama_bahan'] ?? 'Unknown',
                                'error' => 'Unexpected error: ' . $e->getMessage()
                            ];
                            continue;
                        }

                        $predictions[] = [
                            'id_prediksi' => $savedPrediction->id_prediksi,
                            'bahan' => $bahanData,
                            'tanggal_prediksi_expired' => $savedPrediction->tanggal_prediksi_expired?->format('Y-m-d'),
                            'alasan_prediksi' => $savedPrediction->alasan_prediksi,
                            'confidence_score' => $savedPrediction->confidence_score,
                        ];
                    } catch (\Exception $e) {
                        Log::error('Error processing prediction', [
                            'error' => $e->getMessage(),
                            'class' => get_class($e),
                            'trace' => $e->getTraceAsString(),
                            'bahan_data' => $bahanData ?? null,
                            'prediction' => $prediction ?? null
                        ]);
                        $errors[] = [
                            'bahan' => $bahanData['nama_bahan'] ?? 'Unknown',
                            'error' => 'Gagal memproses: ' . $e->getMessage()
                        ];
                        continue;
                    }
                }

                // Add errors from service
                foreach ($serviceData['data']['errors'] ?? [] as $error) {
                    if (is_array($error)) {
                        $errors[] = $error;
                    } else {
                        $errors[] = [
                            'bahan' => 'Unknown',
                            'error' => is_string($error) ? $error : 'Unknown error from service'
                        ];
                    }
                }

                Log::info('Expired predictions processing completed', [
                    'total_bahan' => $bahanList->count(),
                    'berhasil' => count($predictions),
                    'gagal' => count($errors),
                    'has_predictions' => count($predictions) > 0,
                    'has_errors' => count($errors) > 0
                ]);

                $skippedCount = count($existingPredictions);
                $responseMessage = '';
                if (count($predictions) > 0) {
                    $responseMessage = "Prediksi expired berhasil di-generate untuk " . count($predictions) . " bahan";
                    if ($skippedCount > 0) {
                        $responseMessage .= " ({$skippedCount} bahan sudah memiliki prediksi dan dilewati)";
                    }
                } else {
                    $responseMessage = 'Tidak ada prediksi yang berhasil di-generate';
                    if ($skippedCount > 0) {
                        $responseMessage .= " ({$skippedCount} bahan sudah memiliki prediksi)";
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => $responseMessage,
                    'data' => [
                        'total_bahan' => $bahanList->count(),
                        'berhasil' => count($predictions),
                        'gagal' => count($errors),
                        'dilewati' => $skippedCount,
                        'predictions' => $predictions,
                        'errors' => $errors
                    ]
                ], 200);

            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::error('Connection error to expired prediction service', [
                    'error' => $e->getMessage(),
                    'url' => $this->getExpiredPredictionServiceUrl()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghubungi Expired Prediction Service',
                    'error' => 'Pastikan Python expired prediction service berjalan di ' . $this->getExpiredPredictionServiceUrl(),
                    'details' => $e->getMessage()
                ], 503);
            } catch (\Illuminate\Http\Client\RequestException $e) {
                Log::error('Request exception to expired prediction service', [
                    'error' => $e->getMessage(),
                    'response' => $e->response ? [
                        'status' => $e->response->status(),
                        'body' => $e->response->body()
                    ] : null
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal memanggil Expired Prediction Service',
                    'error' => $e->getMessage(),
                    'details' => $e->response ? 'Status: ' . $e->response->status() . ' - ' . substr($e->response->body(), 0, 500) : 'No response'
                ], 500);
            } catch (\Exception $e) {
                Log::error('Error calling expired prediction service', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'class' => get_class($e)
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan saat memanggil Expired Prediction Service',
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'class' => get_class($e)
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Error generating expired predictions', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat generate prediksi expired',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'class' => get_class($e),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }


    /**
     * Get expired predictions
     */
    public function getExpiredPredictions(Request $request)
    {
        try {
            $predictions = TblExpiredPrediction::with(['bahan.kategori', 'user'])
                ->orderBy('tanggal_prediksi_expired', 'asc')
                ->orderBy('created_at', 'desc')
                ->get();

            $formatted = $predictions->map(function($prediction) {
                try {
                    // Ambil terakhir_update dari data_bahan atau dari relasi bahan
                    $terakhirUpdate = null;
                    if ($prediction->data_bahan && isset($prediction->data_bahan['terakhir_update'])) {
                        $terakhirUpdate = $prediction->data_bahan['terakhir_update'];
                    } elseif ($prediction->bahan && $prediction->bahan->updated_at) {
                        $terakhirUpdate = $prediction->bahan->updated_at->format('Y-m-d');
                    }
                    
                    // Gunakan terakhir_update sebagai created_at untuk kolom DIBUAT
                    $createdAtDisplay = $terakhirUpdate ?? ($prediction->created_at ? $prediction->created_at->format('Y-m-d') : null);
                    
                    return [
                        'id_prediksi' => $prediction->id_prediksi,
                        'id_bahan' => $prediction->id_bahan,
                        'nama_bahan' => $prediction->bahan->nama_bahan ?? 'Unknown',
                        'kategori' => $prediction->bahan->kategori->nama_kategori ?? 'Tidak ada kategori',
                        'tanggal_prediksi_expired' => $prediction->tanggal_prediksi_expired ? $prediction->tanggal_prediksi_expired->format('Y-m-d') : null,
                        'alasan_prediksi' => $prediction->alasan_prediksi ?? '',
                        'confidence_score' => (float)($prediction->confidence_score ?? 0),
                        'created_at' => $createdAtDisplay,
                        'created_by' => $prediction->user->name ?? ($prediction->user->email ?? 'System'),
                    ];
                } catch (\Exception $e) {
                    Log::warning('Error formatting prediction ' . $prediction->id_prediksi . ': ' . $e->getMessage());
                    return [
                        'id_prediksi' => $prediction->id_prediksi,
                        'id_bahan' => $prediction->id_bahan,
                        'nama_bahan' => 'Unknown',
                        'kategori' => 'Tidak ada kategori',
                        'tanggal_prediksi_expired' => null,
                        'alasan_prediksi' => '',
                        'confidence_score' => 0,
                        'created_at' => null,
                        'created_by' => 'System',
                    ];
                }
            });

            return response()->json([
                'success' => true,
                'data' => $formatted
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching expired predictions: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data prediksi expired',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete expired prediction
     */
    public function deleteExpiredPrediction($id)
    {
        try {
            $prediction = TblExpiredPrediction::find($id);
            
            if (!$prediction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Prediksi expired tidak ditemukan'
                ], 404);
            }

            $bahanName = $prediction->bahan->nama_bahan ?? 'Unknown';
            $prediction->delete();

            Log::info('Expired prediction deleted', [
                'id_prediksi' => $id,
                'bahan' => $bahanName
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Prediksi expired berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error deleting expired prediction: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus prediksi expired',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete multiple expired predictions (bulk delete)
     */
    public function deleteExpiredPredictionsBulk(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'ids' => 'required|array',
                'ids.*' => 'required|integer|exists:tbl_expired_predictions,id_prediksi'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $ids = $request->ids;
            $deletedCount = TblExpiredPrediction::whereIn('id_prediksi', $ids)->delete();

            Log::info('Bulk deleted expired predictions', [
                'count' => $deletedCount,
                'ids' => $ids
            ]);

            return response()->json([
                'success' => true,
                'message' => "Berhasil menghapus {$deletedCount} prediksi expired",
                'deleted_count' => $deletedCount
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error bulk deleting expired predictions: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus prediksi expired',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Smart update expired prediction for a single bahan (called after restock)
     * Update atau generate prediksi expired untuk satu bahan setelah restock
     */
    public function smartUpdateExpiredPrediction($idBahan)
    {
        try {
            // Get bahan data
            $bahan = TblBahan::with('kategori')->find($idBahan);
            
            if (!$bahan || $bahan->stok_bahan <= 0) {
                return [
                    'success' => false,
                    'message' => 'Bahan tidak ditemukan atau stok kosong'
                ];
            }

            // Prepare bahan data for prediction
            $bahanData = [
                'id_bahan' => $bahan->id_bahan,
                'nama_bahan' => $bahan->nama_bahan,
                'kategori' => $bahan->kategori->nama_kategori ?? 'Tidak ada kategori',
                'stok_bahan' => (float)$bahan->stok_bahan,
                'satuan' => $bahan->satuan,
                'harga_beli' => (float)$bahan->harga_beli,
                'min_stok' => (float)$bahan->min_stok,
                'terakhir_update' => $bahan->updated_at ? $bahan->updated_at->format('Y-m-d') : date('Y-m-d'),
            ];

            // Check if prediction service is available
            try {
                $healthResponse = Http::timeout(5)->get($this->getExpiredPredictionServiceUrl() . '/health');
                if (!$healthResponse->successful()) {
                    Log::warning('Expired Prediction Service not available for smart update', [
                        'bahan_id' => $idBahan
                    ]);
                    return [
                        'success' => false,
                        'message' => 'Expired Prediction Service tidak tersedia'
                    ];
                }
            } catch (\Exception $e) {
                Log::warning('Cannot connect to Expired Prediction Service for smart update', [
                    'bahan_id' => $idBahan,
                    'error' => $e->getMessage()
                ]);
                return [
                    'success' => false,
                    'message' => 'Tidak dapat menghubungi Expired Prediction Service'
                ];
            }

            // Call Python service for single prediction
            // Use shorter timeout to prevent PHP execution timeout (60s limit)
            try {
                $response = Http::timeout(15)->post($this->getExpiredPredictionServiceUrl() . '/predict-expiration', [
                    'bahan' => $bahanData
                ]);

                if (!$response->successful()) {
                    Log::warning('Python service returned error for smart update', [
                        'bahan_id' => $idBahan,
                        'status' => $response->status()
                    ]);
                    return [
                        'success' => false,
                        'message' => 'Gagal memanggil Expired Prediction Service'
                    ];
                }

                $serviceData = $response->json();
                
                if (!$serviceData || !isset($serviceData['success']) || !$serviceData['success']) {
                    Log::warning('Python service returned unsuccessful response for smart update', [
                        'bahan_id' => $idBahan,
                        'response' => $serviceData
                    ]);
                    return [
                        'success' => false,
                        'message' => $serviceData['message'] ?? 'Gagal memprediksi expired'
                    ];
                }

                $predictionData = $serviceData['data'] ?? [];
                $prediction = $predictionData['prediction'] ?? [];
                
                if (!isset($prediction['expired_date'])) {
                    return [
                        'success' => false,
                        'message' => 'Response tidak valid'
                    ];
                }

                // Check if prediction already exists for this bahan
                $existingPrediction = TblExpiredPrediction::where('id_bahan', $idBahan)
                    ->orderBy('created_at', 'desc')
                    ->first();

                // Validate expired_date format
                try {
                    $expiredDate = \Carbon\Carbon::parse($prediction['expired_date']);
                } catch (\Exception $e) {
                    Log::warning('Invalid expired_date format in smart update', [
                        'date' => $prediction['expired_date'],
                        'bahan_id' => $idBahan
                    ]);
                    return [
                        'success' => false,
                        'message' => 'Format tanggal tidak valid'
                    ];
                }

                if ($existingPrediction) {
                    // Update existing prediction
                    $existingPrediction->update([
                        'tanggal_prediksi_expired' => $expiredDate->format('Y-m-d'),
                        'alasan_prediksi' => $prediction['reason'] ?? 'Prediksi di-update setelah restock',
                        'confidence_score' => min(100, max(0, (float)($prediction['confidence'] ?? 50))),
                        'data_bahan' => $bahanData,
                        'created_by' => auth()->id() ?? 1,
                    ]);

                    Log::info('Expired prediction updated after restock', [
                        'id_prediksi' => $existingPrediction->id_prediksi,
                        'bahan_id' => $idBahan,
                        'bahan' => $bahan->nama_bahan
                    ]);

                    return [
                        'success' => true,
                        'message' => 'Prediksi expired berhasil di-update',
                        'action' => 'updated',
                        'prediction_id' => $existingPrediction->id_prediksi
                    ];
                } else {
                    // Create new prediction
                    $newPrediction = TblExpiredPrediction::create([
                        'id_bahan' => $idBahan,
                        'tanggal_prediksi_expired' => $expiredDate->format('Y-m-d'),
                        'alasan_prediksi' => $prediction['reason'] ?? 'Prediksi baru setelah restock',
                        'confidence_score' => min(100, max(0, (float)($prediction['confidence'] ?? 50))),
                        'data_bahan' => $bahanData,
                        'created_by' => auth()->id() ?? 1,
                    ]);

                    Log::info('New expired prediction created after restock', [
                        'id_prediksi' => $newPrediction->id_prediksi,
                        'bahan_id' => $idBahan,
                        'bahan' => $bahan->nama_bahan
                    ]);

                    return [
                        'success' => true,
                        'message' => 'Prediksi expired baru berhasil dibuat',
                        'action' => 'created',
                        'prediction_id' => $newPrediction->id_prediksi
                    ];
                }

            } catch (\Exception $e) {
                Log::error('Error in smart update expired prediction', [
                    'bahan_id' => $idBahan,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return [
                    'success' => false,
                    'message' => 'Terjadi kesalahan saat update prediksi expired',
                    'error' => $e->getMessage()
                ];
            }

        } catch (\Exception $e) {
            Log::error('Error in smartUpdateExpiredPrediction', [
                'bahan_id' => $idBahan,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'message' => 'Terjadi kesalahan',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Delete all expired predictions
     */
    public function deleteAllExpiredPredictions(Request $request)
    {
        try {
            if (!$request->has('confirm') || $request->confirm !== true) {
                return response()->json([
                    'success' => false,
                    'message' => 'Konfirmasi diperlukan untuk menghapus semua prediksi'
                ], 400);
            }

            $deletedCount = TblExpiredPrediction::count();
            TblExpiredPrediction::truncate();

            Log::info('All expired predictions deleted', [
                'count' => $deletedCount
            ]);

            return response()->json([
                'success' => true,
                'message' => "Berhasil menghapus semua prediksi expired ({$deletedCount} data)",
                'deleted_count' => $deletedCount
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error deleting all expired predictions: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus semua prediksi expired',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
