<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OcrController extends Controller
{
    private $pythonServiceUrl = 'http://127.0.0.1:5000';

    /**
     * Process receipt image using OCR + Gemini
     */
    public function processReceipt(Request $request)
    {
        try {
            Log::info('OCR Request received', [
                'has_file' => $request->hasFile('image'),
                'file_size' => $request->hasFile('image') ? $request->file('image')->getSize() : 'no file',
                'content_type' => $request->header('Content-Type')
            ]);

            $validator = Validator::make($request->all(), [
                'image' => 'required|image|mimes:jpeg,png,jpg|max:10240', // Max 10MB
            ]);

            if ($validator->fails()) {
                Log::error('OCR Validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid image format',
                    'errors' => $validator->errors()
                ], 400);
            }

            // Get image file
            $image = $request->file('image');
            
            // Convert image to base64
            $imageData = base64_encode(file_get_contents($image->getPathname()));
            
            // Send to Python OCR service
            $response = Http::timeout(60)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($this->pythonServiceUrl . '/process-receipt', [
                    'image' => $imageData
                ]);

            if (!$response->successful()) {
                Log::error('OCR Service Error: ' . $response->body());
                return response()->json([
                    'success' => false,
                    'message' => 'OCR service unavailable. Please make sure Python OCR service is running on port 5000.'
                ], 500);
            }

            $ocrResult = $response->json();

            if (!$ocrResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $ocrResult['error'] ?? 'OCR processing failed'
                ], 400);
            }

            // Validate and clean the classified data
            $validatedData = $this->validateOcrData($ocrResult['classified_data']);

            return response()->json([
                'success' => true,
                'message' => 'Receipt processed successfully',
                'data' => [
                    'raw_text' => $ocrResult['raw_text'],
                    'items' => $validatedData
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('OCR Processing Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to process receipt'
            ], 500);
        }
    }

    /**
     * Validate and clean OCR data
     */
    private function validateOcrData($classifiedData)
    {
        $validatedItems = [];

        Log::info('Validating OCR Data', ['raw_data' => $classifiedData]);

        // Handle case where classifiedData is not an array
        if (!is_array($classifiedData)) {
            Log::error('OCR data is not an array', ['data' => $classifiedData]);
            return $validatedItems;
        }

        foreach ($classifiedData as $item) {
            // Skip if item is not an array
            if (!is_array($item)) {
                Log::info('Skipping non-array item', ['item' => $item]);
                continue;
            }

            // More lenient validation - check if we have at least nama_barang
            if (empty($item['nama_barang'])) {
                Log::info('Skipping item due to missing nama_barang', ['item' => $item]);
                continue;
            }

            // Clean and validate data with defaults
            $validatedItem = [
                'nama_barang' => trim($item['nama_barang']),
                'jumlah' => $this->cleanNumericValue($item['jumlah'] ?? '1'),
                'harga' => $this->cleanNumericValue($item['harga'] ?? '0'),
                'unit' => isset($item['unit']) ? trim($item['unit']) : 'pcs',
                'category_id' => isset($item['category_id']) ? (int)$item['category_id'] : 1,
                'minStock' => 10 // Default minimum stock
            ];

            // More lenient validation - accept items even with 0 harga/jumlah
            $validatedItems[] = $validatedItem;
            Log::info('Added validated item', ['item' => $validatedItem]);
        }

        Log::info('Final validated items', ['count' => count($validatedItems), 'items' => $validatedItems]);

        return $validatedItems;
    }

    /**
     * Clean numeric values (remove non-numeric characters)
     */
    private function cleanNumericValue($value)
    {
        // Remove all non-numeric characters except decimal point
        $cleaned = preg_replace('/[^0-9.]/', '', $value);
        
        // Convert to float
        $numeric = floatval($cleaned);
        
        return $numeric > 0 ? $numeric : 0;
    }

    /**
     * Process text directly with Gemini (without OCR)
     */
    public function processPhoto(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max
            ]);

            if ($validator->fails()) {
                Log::error('Photo Validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid image file',
                    'errors' => $validator->errors()
                ], 400);
            }

            $image = $request->file('image');
            
            Log::info('Photo processing request', ['filename' => $image->getClientOriginalName(), 'size' => $image->getSize()]);

            // Send to Python service for Gemini Vision processing
            $response = Http::timeout(120)
                ->attach('image', file_get_contents($image), $image->getClientOriginalName())
                ->post($this->pythonServiceUrl . '/process-photo');

            if (!$response->successful()) {
                Log::error('Photo Processing Service Error: ' . $response->body());
                return response()->json([
                    'success' => false,
                    'message' => 'Photo processing service unavailable. Please make sure Python service is running on port 5000.'
                ], 500);
            }

            $result = $response->json();

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['error'] ?? 'Photo processing failed'
                ], 400);
            }

            // Log the raw response for debugging
            Log::info('OCR Service Response', [
                'success' => $result['success'],
                'items_count' => count($result['data']['items'] ?? []),
                'raw_items' => $result['data']['items'] ?? []
            ]);

            // Validate and clean the classified data
            $validatedData = $this->validateOcrData($result['data']['items']);

            // If no items after validation, return error message
            if (empty($validatedData)) {
                Log::warning('No items after validation - all items were filtered out');
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada item yang ditemukan dalam foto. Coba foto yang lebih jelas.'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Photo processed successfully',
                'data' => [
                    'items' => $validatedData
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Photo Processing Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to process photo'
            ], 500);
        }
    }

    /**
     * Check OCR service health
     */
    public function healthCheck()
    {
        try {
            $response = Http::timeout(5)->get($this->pythonServiceUrl . '/health');
            
            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'OCR service is running'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'OCR service is not responding'
                ], 503);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'OCR service is unavailable'
            ], 503);
        }
    }
}
