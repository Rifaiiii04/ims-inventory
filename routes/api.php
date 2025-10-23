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

// Temporary public routes for testing
Route::get('/products', [ProductController::class, 'index']);
Route::get('/compositions', [CompositionController::class, 'index']);
Route::get('/dashboard/summary', [DashboardController::class, 'getSummary']);
Route::get('/dashboard/low-stock', [DashboardController::class, 'getLowStockAlerts']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    
    // Dashboard routes
    
    // Stock routes
    Route::apiResource('stocks', StockController::class);
    Route::get('/stocks/low-stock/alerts', [StockController::class, 'lowStock']);
    Route::get('/stocks/categories/list', [StockController::class, 'categories']);
    Route::get('/stocks/history', [StockController::class, 'history']);
    Route::get('/stocks/{id}/history', [StockController::class, 'history']);
    
    // Variant routes
    Route::apiResource('variants', VariantController::class);
    Route::get('/variants/products/list', [VariantController::class, 'products']);
    
    // Product routes
    Route::apiResource('products', ProductController::class);
    Route::get('/products/categories/list', [ProductController::class, 'categories']);
    Route::get('/products/ingredients/list', [ProductController::class, 'ingredients']);
    
    // Composition routes
    Route::apiResource('compositions', CompositionController::class);
    Route::get('/compositions/variants/list', [CompositionController::class, 'variants']);
    Route::get('/compositions/ingredients/list', [CompositionController::class, 'ingredients']);
    
    // Category routes
    Route::apiResource('categories', CategoryController::class);
    
    // Cashier routes
    Route::get('/cashiers/statistics', [CashierController::class, 'statistics']);
    Route::apiResource('cashiers', CashierController::class);
    
    // Transaction routes
    Route::get('/transactions/products', [TransactionController::class, 'getProducts']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/transactions/history', [TransactionController::class, 'getHistory']);
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);
    Route::get('/transactions/sales/report', [TransactionController::class, 'salesReport']);
    Route::get('/transactions/export/pdf', [TransactionController::class, 'exportPDF']);
    Route::get('/transactions/export/excel', [TransactionController::class, 'exportExcel']);
    
    // WhatsApp Agent routes
    Route::post('/whatsapp/stock', [WhatsAppAgentController::class, 'processStockMessage']);
    Route::get('/whatsapp/low-stock', [WhatsAppAgentController::class, 'getLowStockAlerts']);
    Route::post('/whatsapp/send-notification', [WhatsAppAgentController::class, 'sendLowStockNotification']);
    
    // Notification routes
    Route::apiResource('notifications', NotificationController::class);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::post('/notifications/low-stock', [NotificationController::class, 'createLowStockNotification']);
    
    // Default Laravel Sanctum route
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

// Public WhatsApp Agent routes (for webhook)
Route::post('/whatsapp/webhook', [WhatsAppAgentController::class, 'processStockMessage']);
