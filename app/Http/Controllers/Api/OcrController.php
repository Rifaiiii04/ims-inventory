<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OcrController extends Controller
{
    private $geminiApiKey = 'AIzaSyBzb2hZXhceAjTlW1nfiXdlK710-t5TQ20';
    private $geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

    /**
     * Process receipt image using EasyOCR + Gemini
     * Endpoint: POST /api/ocr/process-photo
     */
    public function processPhoto(Request $request)
    {
        try {
            // Step 1: Validate request
            $validator = Validator::make($request->all(), [
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max
            ]);

            if ($validator->fails()) {
                Log::error('Photo Validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid image file. Please upload a valid image (JPEG, PNG, JPG, GIF) up to 10MB.',
                    'errors' => $validator->errors()
                ], 400);
            }

            $image = $request->file('image');
            Log::info('Photo processing request', [
                'filename' => $image->getClientOriginalName(), 
                'size' => $image->getSize(),
                'mime_type' => $image->getMimeType()
            ]);

            // Step 2: Extract text using EasyOCR (via Python service)
            Log::info('Starting OCR text extraction...');
            $ocrResponse = $this->extractTextWithOCR($image);
            
            if (!$ocrResponse['success']) {
                Log::error('OCR extraction failed', ['error' => $ocrResponse['message']]);
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengekstrak teks dari gambar. ' . $ocrResponse['message']
                ], 500);
            }

            $extractedText = $ocrResponse['text'];
            Log::info('OCR extraction completed', ['text_length' => strlen($extractedText)]);

            // Step 3: Parse text using Gemini
            Log::info('Starting Gemini text classification...');
            $geminiResponse = $this->classifyTextWithGemini($extractedText);
            
            if (!$geminiResponse['success']) {
                Log::error('Gemini classification failed', ['error' => $geminiResponse['message']]);
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengklasifikasikan teks. ' . $geminiResponse['message']
                ], 500);
            }

            $items = $geminiResponse['items'];
            Log::info('Gemini classification completed', ['items_count' => count($items)]);

            // Step 4: Validate and clean items
            $validatedItems = $this->validateItems($items);

            if (empty($validatedItems)) {
                Log::warning('No valid items found after validation');
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada item yang ditemukan dalam foto. Coba foto yang lebih jelas atau pastikan struk terlihat dengan baik.'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Foto berhasil diproses',
                'data' => [
                    'items' => $validatedItems
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Photo Processing Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memproses foto. Silakan coba lagi.'
            ], 500);
        }
    }

    /**
     * Extract text using EasyOCR via Python service
     */
    private function extractTextWithOCR($image)
    {
        try {
            $response = Http::timeout(60)
                ->attach('image', file_get_contents($image), $image->getClientOriginalName())
                ->post('http://127.0.0.1:5000/extract-text');

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'message' => 'OCR service tidak tersedia. Pastikan Python OCR service berjalan di port 5000.'
                ];
            }

            $result = $response->json();

            if (!$result['success']) {
                return [
                    'success' => false,
                    'message' => $result['error'] ?? 'Gagal mengekstrak teks dari gambar'
                ];
            }

            return [
                'success' => true,
                'text' => $result['text'] ?? ''
            ];

        } catch (\Exception $e) {
            Log::error('OCR Service Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'OCR service tidak dapat diakses'
            ];
        }
    }

    /**
     * Classify text using Gemini API
     */
    private function classifyTextWithGemini($text)
    {
        try {
            if (empty(trim($text))) {
                return [
                    'success' => false,
                    'message' => 'Tidak ada teks yang dapat diklasifikasikan'
                ];
            }

            $prompt = "Berikut adalah teks hasil OCR dari struk belanja:\n\n" . $text . "\n\nTolong ekstrak menjadi array JSON dengan format:\n[\n  {\n    \"nama_barang\": \"nama item\",\n    \"jumlah\": 1,\n    \"harga\": 10000\n  }\n]\n\nAturan:\n1. Hanya ekstrak item yang jelas merupakan barang belanjaan\n2. Jika ada data yang tidak jelas, abaikan\n3. Untuk harga, gunakan hanya angka (tanpa Rp, titik, koma)\n4. Untuk jumlah, gunakan angka (default 1 jika tidak jelas)\n5. Koreksi penulisan nama barang jika ada kesalahan\n6. Hanya kembalikan JSON array, tanpa penjelasan lain";

            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post($this->geminiApiUrl . '?key=' . $this->geminiApiKey, [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.1,
                        'maxOutputTokens' => 2048,
                    ]
                ]);

            if (!$response->successful()) {
                Log::error('Gemini API Error: ' . $response->body());
                return [
                    'success' => false,
                    'message' => 'Gemini API tidak dapat diakses'
                ];
            }

            $result = $response->json();
            $generatedText = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

            // Clean response
            $generatedText = trim($generatedText);
            if (strpos($generatedText, '```json') !== false) {
                $generatedText = substr($generatedText, 7);
            }
            if (strpos($generatedText, '```') !== false) {
                $generatedText = substr($generatedText, 0, strpos($generatedText, '```'));
            }
            $generatedText = trim($generatedText);

            if (empty($generatedText) || $generatedText === '[]') {
                return [
                    'success' => false,
                    'message' => 'Tidak ada item yang dapat diekstrak dari teks'
                ];
            }

            $items = json_decode($generatedText, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('JSON Parse Error: ' . json_last_error_msg(), ['text' => $generatedText]);
                return [
                    'success' => false,
                    'message' => 'Gagal memparse hasil dari Gemini'
                ];
            }

            if (!is_array($items)) {
                return [
                    'success' => false,
                    'message' => 'Format hasil tidak valid'
                ];
            }

            return [
                'success' => true,
                'items' => $items
            ];

        } catch (\Exception $e) {
            Log::error('Gemini Classification Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Gagal mengklasifikasikan teks dengan Gemini'
            ];
        }
    }

    /**
     * Validate and clean items
     */
    private function validateItems($items)
    {
        $validatedItems = [];

        if (!is_array($items)) {
            return $validatedItems;
        }

        foreach ($items as $item) {
            if (!is_array($item)) {
                continue;
            }

            // Validate required fields
            if (empty($item['nama_barang'])) {
                continue;
            }

            // Clean and validate data
            $validatedItem = [
                'nama_barang' => trim($item['nama_barang']),
                'jumlah' => $this->cleanNumericValue($item['jumlah'] ?? 1),
                'harga' => $this->cleanNumericValue($item['harga'] ?? 0),
                'unit' => 'pcs',
                'category_id' => 1,
                'minStock' => 10
            ];

            // Only add items with valid data
            if ($validatedItem['nama_barang'] && $validatedItem['harga'] > 0) {
                $validatedItems[] = $validatedItem;
            }
        }

        return $validatedItems;
    }

    /**
     * Clean numeric values
     */
    private function cleanNumericValue($value)
    {
        if (is_numeric($value)) {
            return (float) $value;
        }

        // Remove all non-numeric characters except decimal point
        $cleaned = preg_replace('/[^0-9.]/', '', $value);
        
        // Convert to float
        $numeric = floatval($cleaned);
        
        return $numeric > 0 ? $numeric : 0;
    }

    /**
     * Check OCR service health
     */
    public function healthCheck()
    {
        try {
            $response = Http::timeout(5)->get('http://127.0.0.1:5000/health');
            
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
