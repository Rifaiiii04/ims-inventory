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
            
            // Send request to OCR service
            $response = Http::timeout(30)->attach(
                'image', 
                file_get_contents($imageFile->getPathname()),
                $imageFile->getClientOriginalName()
            )->post($this->ocrServiceUrl . '/process-photo');
            
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
            
            if (!$ocrData['success']) {
                return response()->json([
                    'success' => false,
                    'error' => $ocrData['error'] ?? 'OCR processing failed'
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
            // Validate required fields
            if (empty($item['nama_barang']) || empty($item['harga'])) {
                continue;
            }
            
            // Clean and validate data
            $validatedItem = [
                'nama_barang' => trim($item['nama_barang']),
                'jumlah' => $this->validateQuantity($item['jumlah'] ?? '1'),
                'harga' => $this->validatePrice($item['harga']),
                'unit' => $this->validateUnit($item['unit'] ?? 'pcs'),
                'category_id' => $this->validateCategoryId($item['category_id'] ?? 1),
                'minStock' => $this->validateMinStock($item['minStock'] ?? 10)
            ];
            
            // Only add if valid
            if ($validatedItem['nama_barang'] && $validatedItem['harga'] > 0) {
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
        // Remove non-numeric characters except dots and commas
        $cleanPrice = preg_replace('/[^0-9.,]/', '', $price);
        
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