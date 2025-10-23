<?php

namespace App\Traits;

use App\Models\TblStockHistory;

trait StockHistoryTrait
{
    /**
     * Log stock history
     */
    protected function logStockHistory($idBahan, $action, $oldData = null, $newData = null, $description = null, $userId = null)
    {
        TblStockHistory::create([
            'id_bahan' => $idBahan,
            'action' => $action,
            'old_data' => $oldData,
            'new_data' => $newData,
            'description' => $description,
            'changed_by' => $userId ?? auth()->id(),
        ]);
    }

    /**
     * Get changes between old and new data
     */
    protected function getChanges($oldData, $newData)
    {
        $changes = [];
        
        if (!$oldData || !$newData) {
            return $changes;
        }
        
        foreach ($newData as $key => $newValue) {
            $oldValue = $oldData[$key] ?? null;
            
            if ($oldValue !== $newValue) {
                $changes[$key] = [
                    'old' => $oldValue,
                    'new' => $newValue
                ];
            }
        }
        
        return $changes;
    }

    /**
     * Generate description for changes
     */
    protected function generateChangeDescription($changes, $action)
    {
        $descriptions = [];
        
        if (empty($changes)) {
            return '';
        }
        
        foreach ($changes as $field => $change) {
            $fieldName = $this->getFieldDisplayName($field);
            
            switch ($action) {
                case 'create':
                    $descriptions[] = "Menambahkan {$fieldName}: {$change['new']}";
                    break;
                case 'update':
                    $descriptions[] = "Mengubah {$fieldName} dari '{$change['old']}' menjadi '{$change['new']}'";
                    break;
                case 'delete':
                    $descriptions[] = "Menghapus {$fieldName}: {$change['old']}";
                    break;
            }
        }
        
        return implode(', ', $descriptions);
    }

    /**
     * Get display name for field
     */
    protected function getFieldDisplayName($field)
    {
        $fieldNames = [
            'nama_bahan' => 'Nama Bahan',
            'id_kategori' => 'Kategori',
            'harga_beli' => 'Harga Beli',
            'stok_bahan' => 'Stok',
            'satuan' => 'Satuan',
            'min_stok' => 'Minimum Stok',
        ];
        
        return $fieldNames[$field] ?? $field;
    }
}
