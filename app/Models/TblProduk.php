<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblProduk extends Model
{
    use HasFactory;

    protected $table = 'tbl_produk';
    protected $primaryKey = 'id_produk';

    protected $fillable = [
        'nama_produk',
        'id_kategori',
        'deskripsi',
        'harga',
        'created_by',
        'status',
    ];

    protected $casts = [
        'harga' => 'decimal:2',
    ];

    // Relasi dengan kategori
    public function kategori()
    {
        return $this->belongsTo(TblKategori::class, 'id_kategori', 'id_kategori');
    }

    // Relasi dengan user yang membuat
    public function user()
    {
        return $this->belongsTo(TblUser::class, 'created_by', 'id_user');
    }

    // Relasi dengan varian
    public function varian()
    {
        return $this->hasMany(TblVarian::class, 'id_produk', 'id_produk');
    }

    // Relasi dengan komposisi melalui varian
    public function komposisi()
    {
        return $this->hasManyThrough(TblKomposisi::class, TblVarian::class, 'id_produk', 'id_varian', 'id_produk', 'id_varian');
    }

    // Relasi dengan bagian tubuh
    public function bagianTubuh()
    {
        return $this->hasMany(TblBagianTubuh::class, 'id_produk', 'id_produk');
    }
}
