<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblVarian extends Model
{
    use HasFactory;

    protected $table = 'tbl_varian';
    protected $primaryKey = 'id_varian';

    protected $fillable = [
        'nama_varian',
        'id_produk',
        'stok_varian',
        'unit',
        'conversion_rate',
        'conversion_unit',
        'description',
    ];

    protected $casts = [
        'stok_varian' => 'decimal:2',
        'conversion_rate' => 'decimal:2',
    ];

    // Relasi dengan produk
    public function produk()
    {
        return $this->belongsTo(TblProduk::class, 'id_produk', 'id_produk');
    }

    // Relasi dengan komposisi
    public function komposisi()
    {
        return $this->hasMany(TblKomposisi::class, 'id_varian', 'id_varian');
    }
}
