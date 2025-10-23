<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class TblUser extends Authenticatable
{
    use HasFactory, HasApiTokens;

    protected $table = 'tbl_user';
    protected $primaryKey = 'id_user';

    protected $fillable = [
        'nama_user',
        'username',
        'password',
        'level',
        'foto_profil',
        'tema',
        'bahasa',
        'notif_aktif',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
        'notif_aktif' => 'boolean',
    ];

    // Relasi dengan produk
    public function produk()
    {
        return $this->hasMany(TblProduk::class, 'created_by', 'id_user');
    }

    // Relasi dengan bahan
    public function bahan()
    {
        return $this->hasMany(TblBahan::class, 'updated_by', 'id_user');
    }

    // Relasi dengan transaksi
    public function transaksi()
    {
        return $this->hasMany(TblTransaksi::class, 'created_by', 'id_user');
    }

    // Relasi dengan notifikasi
    public function notifikasi()
    {
        return $this->hasMany(TblNotifikasi::class, 'created_by', 'id_user');
    }
}
