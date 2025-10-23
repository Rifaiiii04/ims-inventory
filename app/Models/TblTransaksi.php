<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblTransaksi extends Model
{
    use HasFactory;

    protected $table = 'tbl_transaksi';
    protected $primaryKey = 'id_transaksi';

    protected $fillable = [
        'tanggal_waktu',
        'total_transaksi',
        'metode_bayar',
        'nama_pelanggan',
        'catatan',
        'created_by',
    ];

    protected $casts = [
        'tanggal_waktu' => 'datetime',
        'total_transaksi' => 'decimal:2',
    ];

    // Relasi dengan user
    public function user()
    {
        return $this->belongsTo(TblUser::class, 'created_by', 'id_user');
    }

    // Relasi dengan detail transaksi
    public function details()
    {
        return $this->hasMany(TblTransaksiDetail::class, 'id_transaksi', 'id_transaksi');
    }
}
