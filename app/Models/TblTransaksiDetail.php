<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblTransaksiDetail extends Model
{
    use HasFactory;

    protected $table = 'tbl_transaksi_detail';
    protected $primaryKey = 'id_detail';

    protected $fillable = [
        'id_transaksi',
        'id_produk',
        'id_varian',
        'jumlah',
        'harga_satuan',
        'total_harga',
    ];

    protected $casts = [
        'jumlah' => 'decimal:2',
        'harga_satuan' => 'decimal:2',
        'total_harga' => 'decimal:2',
    ];

    // Relasi dengan transaksi
    public function transaksi()
    {
        return $this->belongsTo(TblTransaksi::class, 'id_transaksi', 'id_transaksi');
    }

    // Relasi dengan produk
    public function produk()
    {
        return $this->belongsTo(TblProduk::class, 'id_produk', 'id_produk');
    }

    // Relasi dengan varian
    public function varian()
    {
        return $this->belongsTo(TblVarian::class, 'id_varian', 'id_varian');
    }
}
