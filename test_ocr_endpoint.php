<?php
/**
 * Test script untuk OCR endpoint Laravel
 */

// Test data yang akan dikirim ke endpoint
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
            ],
            [
                'nama_barang' => 'Ayam Utuh',
                'jumlah' => '2', 
                'harga' => '50000',
                'unit' => 'ekor',
                'category_id' => 1
            ]
        ]
    ]
];

echo "=== Test OCR Data Validation ===\n";
echo "Test Data:\n";
echo json_encode($testData, JSON_PRETTY_PRINT) . "\n\n";

// Simulate validation function
function validateOcrData($classifiedData) {
    $validatedItems = [];
    
    echo "Validating OCR Data:\n";
    echo "Data type: " . gettype($classifiedData) . "\n";
    echo "Is array: " . (is_array($classifiedData) ? 'Yes' : 'No') . "\n";
    
    if (!is_array($classifiedData)) {
        echo "ERROR: Data is not an array\n";
        return $validatedItems;
    }
    
    foreach ($classifiedData as $index => $item) {
        echo "\nProcessing item $index:\n";
        echo "Item type: " . gettype($item) . "\n";
        echo "Item data: " . json_encode($item) . "\n";
        
        if (!is_array($item)) {
            echo "Skipping non-array item\n";
            continue;
        }
        
        if (empty($item['nama_barang'])) {
            echo "Skipping item due to missing nama_barang\n";
            continue;
        }
        
        $validatedItem = [
            'nama_barang' => trim($item['nama_barang']),
            'jumlah' => floatval($item['jumlah'] ?? '1'),
            'harga' => floatval($item['harga'] ?? '0'),
            'unit' => isset($item['unit']) ? trim($item['unit']) : 'pcs',
            'category_id' => isset($item['category_id']) ? (int)$item['category_id'] : 1,
            'minStock' => 10
        ];
        
        $validatedItems[] = $validatedItem;
        echo "Added validated item: " . json_encode($validatedItem) . "\n";
    }
    
    echo "\nFinal validated items count: " . count($validatedItems) . "\n";
    return $validatedItems;
}

// Test validation
$result = validateOcrData($testData['data']['items']);

echo "\n=== Final Result ===\n";
echo "Validated items: " . json_encode($result, JSON_PRETTY_PRINT) . "\n";
echo "Count: " . count($result) . "\n";
