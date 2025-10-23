<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblStockHistory extends Model
{
    use HasFactory;

    protected $table = 'tbl_stock_history';
    protected $primaryKey = 'id_history';

    protected $fillable = [
        'id_bahan',
        'action',
        'old_data',
        'new_data',
        'description',
        'changed_by',
    ];

    protected $casts = [
        'old_data' => 'array',
        'new_data' => 'array',
        'created_at' => 'datetime',
    ];

    // Relasi dengan bahan
    public function bahan()
    {
        return $this->belongsTo(TblBahan::class, 'id_bahan', 'id_bahan');
    }

    // Relasi dengan user yang melakukan perubahan
    public function user()
    {
        return $this->belongsTo(TblUser::class, 'changed_by', 'id_user');
    }

    // Scope untuk filter berdasarkan action
    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    // Scope untuk filter berdasarkan bahan
    public function scopeByBahan($query, $idBahan)
    {
        return $query->where('id_bahan', $idBahan);
    }
}
