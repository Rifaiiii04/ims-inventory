<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OcrController extends Controller
{
    private $ocrServiceUrl = 'http://127.0.0.1:5000';
    
    /**
     * Process receipt image using OCR service
     */
    public function processReceipt(Request $request): JsonResponse
    {
        return $this->processPhoto($request);
    }
    
    /**
     * Process photo using OCR service
     */
    public function processPhoto(Request $request): JsonResponse
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'image' => 'required|image|mimes:jpeg,png,jpg|max:10240' // 10MB max
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid image file',
                    'details' => $validator->errors()
                ], 400);
            }
            
            // Check if OCR service is running
            $healthResponse = Http::timeout(5)->get($this->ocrServiceUrl . '/health');
            if (!$healthResponse->successful()) {
                return response()->json([
                    'success' => false,
                    'error' => 'OCR service is not available',
                    'message' => 'Please make sure the OCR service is running on port 5000'
                ], 503);
            }
            
            // Prepare image file for OCR service
            $imageFile = $request->file('image');
            
            // Send request to OCR service with increased timeout (60 seconds for OCR processing)
            try {
                $response = Http::timeout(60)->attach(
                    'image', 
                    file_get_contents($imageFile->getPathname()),
                    $imageFile->getClientOriginalName()
                )->post($this->ocrServiceUrl . '/process-photo');
            } catch (\Exception $e) {
                // Handle HTTP client errors including timeout
                Log::error('OCR service request error', [
                    'error' => $e->getMessage(),
                    'exception_type' => get_class($e)
                ]);
                
                $errorMessage = $e->getMessage();
                
                // Check for timeout errors
                if (str_contains($errorMessage, 'timed out') || 
                    str_contains($errorMessage, 'timeout') ||
                    str_contains($errorMessage, 'Operation timed out') ||
                    str_contains($errorMessage, 'cURL error 28')) {
                    return response()->json([
                        'success' => false,
                        'error' => 'OCR processing timeout',
                        'message' => 'Proses OCR memakan waktu terlalu lama (lebih dari 60 detik). Pastikan Python OCR service berjalan di port 5000. Silakan coba lagi dengan foto yang lebih kecil atau jelas, atau tunggu beberapa saat.'
                    ], 504);
                }
                
                // Check for connection errors
                if (str_contains($errorMessage, 'Connection refused') ||
                    str_contains($errorMessage, 'Failed to connect') ||
                    str_contains($errorMessage, 'could not resolve host')) {
                    return response()->json([
                        'success' => false,
                        'error' => 'OCR service not available',
                        'message' => 'Tidak dapat menghubungi OCR service. Pastikan Python OCR service berjalan di port 5000.'
                    ], 503);
                }
                
                return response()->json([
                    'success' => false,
                    'error' => 'OCR service error',
                    'message' => 'Gagal menghubungi OCR service: ' . $errorMessage
                ], 503);
            }
            
            if (!$response->successful()) {
                Log::error('OCR service error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                
                return response()->json([
                    'success' => false,
                    'error' => 'OCR processing failed',
                    'message' => 'Failed to process image with OCR service'
                ], 500);
            }
            
            $ocrData = $response->json();
            
            if (!$ocrData || !isset($ocrData['success'])) {
                Log::error('OCR service invalid response', [
                    'response' => $ocrData
                ]);
                
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid OCR response',
                    'message' => 'OCR service mengembalikan respons yang tidak valid'
                ], 500);
            }
            
            if (!$ocrData['success']) {
                return response()->json([
                    'success' => false,
                    'error' => $ocrData['error'] ?? 'OCR processing failed',
                    'message' => $ocrData['message'] ?? 'OCR processing failed'
                ], 500);
            }
            
            // Validate and clean OCR data
            $validatedItems = $this->validateOcrData($ocrData['data']['items'] ?? []);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'items' => $validatedItems,
                    'count' => count($validatedItems)
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('OCR Controller Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Check if it's a timeout error
            if (str_contains($e->getMessage(), 'timed out') || str_contains($e->getMessage(), 'timeout')) {
                return response()->json([
                    'success' => false,
                    'error' => 'OCR processing timeout',
                    'message' => 'Proses OCR memakan waktu terlalu lama. Silakan coba lagi dengan foto yang lebih kecil atau jelas.'
                ], 504);
            }
            
            return response()->json([
                'success' => false,
                'error' => 'Internal server error',
                'message' => 'An error occurred while processing the image'
            ], 500);
        }
    }
    
    /**
     * Health check for OCR service
     */
    public function healthCheck(): JsonResponse
    {
        try {
            $response = Http::timeout(5)->get($this->ocrServiceUrl . '/health');
            
            if ($response->successful()) {
                $data = $response->json();
                return response()->json([
                    'success' => true,
                    'ocr_service' => $data,
                    'laravel_api' => 'healthy'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'OCR service is not responding',
                    'status' => $response->status()
                ], 503);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Cannot connect to OCR service',
                'message' => $e->getMessage()
            ], 503);
        }
    }
    
    /**
     * Validate and clean OCR data
     */
    private function validateOcrData(array $items): array
    {
        $validatedItems = [];
        
        foreach ($items as $item) {
            // Only skip if nama_barang is empty (harga can be null/empty, user can fill it later)
            if (empty($item['nama_barang'])) {
                continue;
            }
            
            // Clean and validate data
            $validatedItem = [
                'nama_barang' => trim($item['nama_barang']),
                'jumlah' => $this->validateQuantity($item['jumlah'] ?? '1'),
                'harga' => !empty($item['harga']) && $item['harga'] !== 'null' 
                    ? $this->validatePrice($item['harga']) 
                    : 0, // Default to 0 if harga is null/empty
                'unit' => $this->validateUnit($item['unit'] ?? 'pcs'),
                'category_id' => $this->validateCategoryId($item['category_id'] ?? 1),
                'minStock' => $this->validateMinStock($item['minStock'] ?? 10)
            ];
            
            // Only add if nama_barang is not empty (harga can be 0, user can fill it later)
            if (!empty($validatedItem['nama_barang'])) {
                $validatedItems[] = $validatedItem;
            }
        }
        
        return $validatedItems;
    }
    
    /**
     * Validate quantity
     */
    private function validateQuantity($quantity): int
    {
        $qty = (int) $quantity;
        return max(1, $qty);
    }
    
    /**
     * Validate price
     */
    private function validatePrice($price): int
    {
        // Handle null, empty, or string 'null'
        if (empty($price) || $price === 'null' || $price === null) {
            return 0;
        }
        
        // Convert to string for processing
        $priceStr = (string) $price;
        
        // Remove non-numeric characters except dots and commas
        $cleanPrice = preg_replace('/[^0-9.,]/', '', $priceStr);
        
        // If empty after cleaning, return 0
        if (empty($cleanPrice)) {
            return 0;
        }
        
        // Handle Indonesian number format (1.500.000 or 1,500,000)
        if (strpos($cleanPrice, '.') !== false && strpos($cleanPrice, ',') !== false) {
            // Format: 1.500.000,50
            $cleanPrice = str_replace('.', '', $cleanPrice);
            $cleanPrice = str_replace(',', '.', $cleanPrice);
        } elseif (strpos($cleanPrice, '.') !== false) {
            // Check if it's thousands separator or decimal
            $parts = explode('.', $cleanPrice);
            if (count($parts) === 2 && strlen($parts[1]) <= 2) {
                // Decimal: 1500.50
                $cleanPrice = $cleanPrice;
            } else {
                // Thousands separator: 1.500.000
                $cleanPrice = str_replace('.', '', $cleanPrice);
            }
        } elseif (strpos($cleanPrice, ',') !== false) {
            // Format: 1,500,000 or 1500,50
            $parts = explode(',', $cleanPrice);
            if (count($parts) === 2 && strlen($parts[1]) <= 2) {
                // Decimal: 1500,50
                $cleanPrice = str_replace(',', '.', $cleanPrice);
            } else {
                // Thousands separator: 1,500,000
                $cleanPrice = str_replace(',', '', $cleanPrice);
            }
        }
        
        $price = (float) $cleanPrice;
        return max(0, (int) $price);
    }
    
    /**
     * Validate unit
     */
    private function validateUnit($unit): string
    {
        $validUnits = ['pcs', 'kg', 'gram', 'liter', 'ml', 'porsi', 'bungkus', 'botol', 'kaleng'];
        $unit = strtolower(trim($unit));
        
        return in_array($unit, $validUnits) ? $unit : 'pcs';
    }
    
    /**
     * Validate category ID
     */
    private function validateCategoryId($categoryId): int
    {
        $id = (int) $categoryId;
        return max(1, $id);
    }
    
    /**
     * Validate minimum stock
     */
    private function validateMinStock($minStock): int
    {
        $stock = (int) $minStock;
        return max(0, $stock);
    }
}