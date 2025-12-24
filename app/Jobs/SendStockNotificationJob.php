<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\TblBahan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class SendStockNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $idBahan;
    public $tries = 2; // Retry maksimal 2 kali
    public $timeout = 10; // Timeout 10 detik

    /**
     * Create a new job instance.
     */
    public function __construct($idBahan)
    {
        $this->idBahan = $idBahan;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Cek apakah notifikasi diaktifkan
            if (!config('services.n8n.enabled', true)) {
                return;
            }
            
            $notificationEnabled = \App\Models\TblSettings::getValue('notification_enabled', true);
            if (!$notificationEnabled) {
                return;
            }

            // Load stock dengan kategori
            $stock = TblBahan::with('kategori')->find($this->idBahan);
            
            if (!$stock) {
                Log::warning('Stock not found for notification', ['bahan_id' => $this->idBahan]);
                return;
            }

            // Cek apakah stok di bawah min_stok
            if ($stock->stok_bahan >= $stock->min_stok) {
                return;
            }

            // Cek cooldown 5 menit menggunakan cache
            $cacheKey = 'stock_notification_' . $stock->id_bahan;
            $lastSent = cache()->get($cacheKey);
            
            if ($lastSent) {
                $fiveMinutesAgo = now()->subMinutes(5);
                if ($lastSent->gt($fiveMinutesAgo)) {
                    return; // Skip, baru dikirim
                }
            }

            // Gunakan batch notification jika diaktifkan
            if (config('services.n8n.batch_notification', true)) {
                // Trigger batch notification (akan handle semua stok menipis)
                $this->sendBatchStockNotification();
                return;
            }

            // Kirim single notification
            $webhookUrl = config('services.n8n.webhook_url');
            $timeout = config('services.n8n.timeout', 5);

            if (empty($webhookUrl)) {
                Log::warning('N8N webhook URL tidak dikonfigurasi');
                return;
            }

            Http::timeout($timeout)->post($webhookUrl, [
                'nama_bahan' => $stock->nama_bahan,
                'stok_bahan' => (float)$stock->stok_bahan,
                'id_bahan' => $stock->id_bahan,
                'satuan' => $stock->satuan,
                'min_stok' => (float)$stock->min_stok,
                'kategori' => $stock->kategori->nama_kategori ?? 'Tidak ada kategori',
            ]);

            // Update cache untuk cooldown
            cache()->put($cacheKey, now(), now()->addMinutes(5));

            Log::info('Stock notification sent via job', [
                'bahan_id' => $stock->id_bahan,
                'nama_bahan' => $stock->nama_bahan
            ]);

        } catch (\Exception $e) {
            Log::error('SendStockNotificationJob error: ' . $e->getMessage(), [
                'bahan_id' => $this->idBahan,
                'trace' => $e->getTraceAsString()
            ]);
            // Don't throw - notifications are non-critical
        }
    }

    /**
     * Send batch stock notification
     */
    private function sendBatchStockNotification()
    {
        try {
            $webhookUrl = config('services.n8n.webhook_url');
            $timeout = config('services.n8n.timeout', 5);

            if (empty($webhookUrl)) {
                return;
            }

            // Get all low stock items
            $lowStocks = TblBahan::with('kategori')
                ->whereColumn('stok_bahan', '<', 'min_stok')
                ->where('stok_bahan', '>', 0)
                ->get();

            if ($lowStocks->isEmpty()) {
                return;
            }

            $items = $lowStocks->map(function ($stock) {
                return [
                    'nama_bahan' => $stock->nama_bahan,
                    'stok_bahan' => (float)$stock->stok_bahan,
                    'id_bahan' => $stock->id_bahan,
                    'satuan' => $stock->satuan,
                    'min_stok' => (float)$stock->min_stok,
                    'kategori' => $stock->kategori->nama_kategori ?? 'Tidak ada kategori',
                ];
            })->toArray();

            Http::timeout($timeout)->post($webhookUrl, [
                'batch' => true,
                'items' => $items
            ]);

            Log::info('Batch stock notification sent via job', [
                'count' => count($items)
            ]);

        } catch (\Exception $e) {
            Log::error('Batch stock notification job error: ' . $e->getMessage());
        }
    }
}
