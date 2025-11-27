<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\VariantController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CompositionController;
use App\Http\Controllers\Api\CashierController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\WhatsAppAgentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Temporary public routes for testing (without api middleware)
Route::middleware(['throttle:api'])->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/compositions', [CompositionController::class, 'index']);
    Route::post('/compositions', [CompositionController::class, 'store']);
    Route::put('/compositions/{id}', [CompositionController::class, 'update']);
    Route::delete('/compositions/{id}', [CompositionController::class, 'destroy']);
    Route::get('/compositions/variants/list', [CompositionController::class, 'variants']);
    Route::get('/compositions/ingredients/list', [CompositionController::class, 'ingredients']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    Route::get('/dashboard/summary', [DashboardController::class, 'getSummary']);
    Route::get('/dashboard/low-stock', [DashboardController::class, 'getLowStockAlerts']);
    Route::get('/reports/inventory', [ReportController::class, 'getInventoryReport']);
    Route::get('/reports/sales', [ReportController::class, 'getSalesReport']);
    Route::get('/reports/categories', [ReportController::class, 'getCategories']);
    Route::post('/reports/inventory/export/pdf', [ReportController::class, 'exportPDF']);
    Route::get('/reports/sales/export/pdf', [ReportController::class, 'exportSalesPDF']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    
    // Report routes (export only - protected)
    Route::post('/reports/inventory/export/excel', [ReportController::class, 'exportExcel']);
    Route::post('/reports/inventory/export/pdf', [ReportController::class, 'exportPDF']);
    
    // Stock routes - specific routes must come before apiResource to avoid route conflicts
    Route::get('/stocks/low-stock', [StockController::class, 'lowStock']); // New route for NotificationManagement
    Route::get('/stocks/low-stock/alerts', [StockController::class, 'lowStock']); // Keep for backward compatibility
    Route::get('/stocks/categories/list', [StockController::class, 'categories']);
    Route::get('/stocks/history', [StockController::class, 'history']);
    Route::post('/stocks/bulk-delete', [StockController::class, 'bulkDelete']);
    Route::post('/stocks/batch-notification', [StockController::class, 'sendBatchStockNotification']); // Updated route name
    Route::post('/stocks/send-batch-notification', [StockController::class, 'sendBatchStockNotification']); // Keep for backward compatibility
    Route::apiResource('stocks', StockController::class);
    Route::get('/stocks/{id}/history', [StockController::class, 'history']); // Must be after apiResource
    
    // Variant routes
    Route::apiResource('variants', VariantController::class);
    Route::get('/variants/products/list', [VariantController::class, 'products']);
    
    // Product routes
    Route::apiResource('products', ProductController::class);
    Route::get('/products/categories/list', [ProductController::class, 'categories']);
    Route::get('/products/ingredients/list', [ProductController::class, 'ingredients']);
    
    // Composition routes (moved to public section above)
    
    // Category routes (moved to public section above)
    
    // Cashier routes
    Route::get('/cashiers/statistics', [CashierController::class, 'statistics']);
    Route::post('/cashiers/{id}/reset-password', [CashierController::class, 'resetPassword']);
    Route::apiResource('cashiers', CashierController::class);
    
    // Transaction routes
    Route::get('/transactions/products', [TransactionController::class, 'getProducts']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/transactions/history', [TransactionController::class, 'getHistory']);
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);
    Route::get('/transactions/{id}/print', [TransactionController::class, 'printReceipt']);
    Route::get('/transactions/sales/report', [TransactionController::class, 'salesReport']);
    Route::get('/transactions/export/pdf', [TransactionController::class, 'exportPDF']);
    Route::get('/transactions/export/excel', [TransactionController::class, 'exportExcel']);
    
    // WhatsApp Agent routes
    Route::post('/whatsapp/stock', [WhatsAppAgentController::class, 'processStockMessage']);
    Route::get('/whatsapp/low-stock', [WhatsAppAgentController::class, 'getLowStockAlerts']);
    Route::post('/whatsapp/send-notification', [WhatsAppAgentController::class, 'sendLowStockNotification']);
    
    // Notification routes - specific routes must come before apiResource to avoid route conflicts
    Route::get('/notifications/settings', [NotificationController::class, 'getSettings']);
    Route::put('/notifications/settings', [NotificationController::class, 'updateSettings']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::post('/notifications/low-stock', [NotificationController::class, 'createLowStockNotification']);
    Route::post('/notifications/trigger-all', [NotificationController::class, 'triggerNotification']);
    Route::post('/notifications/process-scheduled', [NotificationController::class, 'processScheduledNotifications']);
    Route::apiResource('notifications', NotificationController::class);
    Route::post('/notifications/{id}/trigger', [NotificationController::class, 'triggerNotification']);
    
    // Default Laravel Sanctum route
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

// Public WhatsApp Agent routes (for webhook)
Route::post('/whatsapp/webhook', [WhatsAppAgentController::class, 'processStockMessage']);

// Test route for n8n stock notification
Route::post('/test/stock-notification', function (Request $request) {
    try {
        $webhookUrl = config('services.n8n.webhook_url');
        $timeout = config('services.n8n.timeout', 5);
        
        // Data test dari request atau default
        $testData = $request->all() ?: [
            'nama_bahan' => 'Beras Test',
            'stok_bahan' => 3,
            'id_bahan' => 999,
            'satuan' => 'kg',
            'min_stok' => 5
        ];
        
        if (empty($webhookUrl)) {
            return response()->json([
                'success' => false,
                'message' => 'N8N webhook URL tidak dikonfigurasi',
                'config' => [
                    'webhook_url' => $webhookUrl,
                    'enabled' => config('services.n8n.enabled', true),
                    'timeout' => $timeout
                ]
            ], 400);
        }
        
        // Kirim test request ke n8n
        $response = \Illuminate\Support\Facades\Http::timeout($timeout)
            ->post($webhookUrl, $testData);
        
        return response()->json([
            'success' => true,
            'message' => 'Test notification sent to n8n',
            'test_data' => $testData,
            'n8n_response' => $response->json(),
            'n8n_status' => $response->status(),
            'config' => [
                'webhook_url' => $webhookUrl,
                'enabled' => config('services.n8n.enabled', true),
                'timeout' => $timeout
            ]
        ], 200);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error sending test notification',
            'error' => $e->getMessage(),
            'config' => [
                'webhook_url' => config('services.n8n.webhook_url'),
                'enabled' => config('services.n8n.enabled', true),
                'timeout' => config('services.n8n.timeout', 5)
            ]
        ], 500);
    }
});

// OCR routes
use App\Http\Controllers\Api\OcrController;
Route::post('/ocr/process-receipt', [OcrController::class, 'processReceipt']);
Route::post('/ocr/process-photo', [OcrController::class, 'processPhoto']);
Route::get('/ocr/health', [OcrController::class, 'healthCheck']);

// Debug route
Route::post('/ocr/test', function() {
    $testData = [
        'success' => true,
        'data' => [
            'items' => [
                [
                    'nama_barang' => 'Nasi Putih',
                    'jumlah' => '5',
                    'harga' => '25000',
                    'unit' => 'kg',
                    'category_id' => 1
                ]
            ]
        ]
    ];
    
    $controller = new App\Http\Controllers\Api\OcrController();
    $reflection = new ReflectionClass($controller);
    $method = $reflection->getMethod('validateOcrData');
    $method->setAccessible(true);
    
    $result = $method->invoke($controller, $testData['data']['items']);
    
    return response()->json([
        'test_data' => $testData,
        'validated_result' => $result,
        'count' => count($result)
    ]);
});
