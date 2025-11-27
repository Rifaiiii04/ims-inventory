<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblNotifikasi;
use App\Models\TblBahan;
use App\Models\TblSettings;
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
}
