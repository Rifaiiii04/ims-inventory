<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblKomposisi extends Model
{
    use HasFactory;

    protected $table = 'tbl_komposisi';
    protected $primaryKey = 'id_komposisi';

    protected $fillable = [
        'id_varian',
        'id_bahan',
        'jumlah_per_porsi',
        'satuan',
    ];

    protected $casts = [
        'jumlah_per_porsi' => 'decimal:2',
    ];

    // Relasi dengan varian
    public function varian()
    {
        return $this->belongsTo(TblVarian::class, 'id_varian', 'id_varian');
    }

    // Relasi dengan bahan
    public function bahan()
    {
        return $this->belongsTo(TblBahan::class, 'id_bahan', 'id_bahan');
    }
}