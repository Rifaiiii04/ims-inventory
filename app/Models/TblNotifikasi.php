<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblNotifikasi extends Model
{
    use HasFactory;

    protected $table = 'tbl_notifikasi';
    protected $primaryKey = 'id_notifikasi';

    protected $fillable = [
        'id_bahan',
        'batas_minimum',
        'jadwal',
        'aktif',
        'terakhir_kirim',
        'created_by'
    ];

    protected $casts = [
        'aktif' => 'boolean',
        'batas_minimum' => 'decimal:2',
        'terakhir_kirim' => 'datetime'
    ];

    public function bahan()
    {
        return $this->belongsTo(TblBahan::class, 'id_bahan', 'id_bahan');
    }
}
