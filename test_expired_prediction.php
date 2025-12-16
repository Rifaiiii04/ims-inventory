<?php
/**
 * Test script untuk expired prediction service
 * Jalankan: php test_expired_prediction.php
 */

$serviceUrl = 'http://127.0.0.1:5001';

// Test 1: Health check
echo "=== Test 1: Health Check ===\n";
$ch = curl_init($serviceUrl . '/health');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

// Test 2: Test Ollama
echo "=== Test 2: Test Ollama ===\n";
$ch = curl_init($serviceUrl . '/test-ollama');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

// Test 3: Predict single bahan
echo "=== Test 3: Predict Single Bahan ===\n";
$testData = [
    'bahan' => [
        'id_bahan' => 1,
        'nama_bahan' => 'Beras',
        'kategori' => 'Bahan Pokok',
        'stok_bahan' => 50,
        'satuan' => 'kg',
        'harga_beli' => 12000,
        'min_stok' => 10
    ]
];

$ch = curl_init($serviceUrl . '/predict-expiration');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

echo "=== Test Complete ===\n";
