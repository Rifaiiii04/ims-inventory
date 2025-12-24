<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Log;

class UpdateExpiredPredictionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $idBahan;
    public $tries = 2; // Retry maksimal 2 kali
    public $timeout = 30; // Timeout 30 detik

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
            $notificationController = app(NotificationController::class);
            $result = $notificationController->smartUpdateExpiredPrediction($this->idBahan);
            
            if ($result['success']) {
                Log::info('Expired prediction updated via job', [
                    'bahan_id' => $this->idBahan,
                    'action' => $result['action'] ?? 'unknown'
                ]);
            } else {
                Log::warning('Expired prediction job failed', [
                    'bahan_id' => $this->idBahan,
                    'message' => $result['message'] ?? 'Unknown error'
                ]);
            }
        } catch (\Exception $e) {
            Log::error('UpdateExpiredPredictionJob error: ' . $e->getMessage(), [
                'bahan_id' => $this->idBahan,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e; // Re-throw untuk retry
        }
    }
}
