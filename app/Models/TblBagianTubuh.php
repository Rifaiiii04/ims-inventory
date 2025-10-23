<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblBagianTubuh extends Model
{
    use HasFactory;

    protected $table = 'tbl_bagian_tubuh';
    protected $primaryKey = 'id_bagian';

    protected $fillable = [
        'id_produk',
        'nama_bagian',
        'jumlah_per_ekor',
        'persentase_penggunaan',
        'harga_per_potong',
        'unit',
        'deskripsi',
        'is_aktif',
    ];

    protected $casts = [
        'jumlah_per_ekor' => 'decimal:2',
        'persentase_penggunaan' => 'decimal:2',
        'harga_per_potong' => 'decimal:2',
        'is_aktif' => 'boolean',
    ];

    // Relasi dengan produk
    public function produk()
    {
        return $this->belongsTo(TblProduk::class, 'id_produk', 'id_produk');
    }
}
