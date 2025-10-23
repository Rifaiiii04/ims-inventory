<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblNotifikasi;
use App\Models\TblBahan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

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
}
