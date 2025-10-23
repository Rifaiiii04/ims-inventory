<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TblNotifikasi;
use App\Models\TblBahan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    /**
     * Get all notifications
     */
    public function index(Request $request)
    {
        try {
            $notifications = TblNotifikasi::orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $notifications
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

            $notification->update(['status' => 'read']);

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
            TblNotifikasi::where('status', 'unread')->update(['status' => 'read']);

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
