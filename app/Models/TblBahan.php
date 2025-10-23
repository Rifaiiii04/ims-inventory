<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblBahan extends Model
{
    use HasFactory;

    protected $table = 'tbl_bahan';
    protected $primaryKey = 'id_bahan';

    protected $fillable = [
        'nama_bahan',
        'id_kategori',
        'harga_beli',
        'stok_bahan',
        'satuan',
        'min_stok',
        'updated_by',
    ];

    protected $casts = [
        'harga_beli' => 'decimal:2',
        'stok_bahan' => 'decimal:2',
        'min_stok' => 'decimal:2',
    ];

    // Relasi dengan kategori
    public function kategori()
    {
        return $this->belongsTo(TblKategori::class, 'id_kategori', 'id_kategori');
    }

    // Relasi dengan user yang update
    public function user()
    {
        return $this->belongsTo(TblUser::class, 'updated_by', 'id_user');
    }

    // Relasi dengan history perubahan
    public function stockHistory()
    {
        return $this->hasMany(TblStockHistory::class, 'id_bahan', 'id_bahan');
    }

    // Relasi dengan komposisi
    public function komposisi()
    {
        return $this->hasMany(TblKomposisi::class, 'id_bahan', 'id_bahan');
    }
}
