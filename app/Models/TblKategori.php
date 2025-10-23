<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblKategori extends Model
{
    use HasFactory;

    protected $table = 'tbl_kategori';
    protected $primaryKey = 'id_kategori';

    protected $fillable = [
        'nama_kategori',
        'deskripsi',
    ];

    // Relasi dengan produk
    public function produk()
    {
        return $this->hasMany(TblProduk::class, 'id_kategori', 'id_kategori');
    }

    // Relasi dengan bahan
    public function bahan()
    {
        return $this->hasMany(TblBahan::class, 'id_kategori', 'id_kategori');
    }
}
