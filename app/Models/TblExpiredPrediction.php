<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TblExpiredPrediction extends Model
{
    use HasFactory;

    protected $table = 'tbl_expired_predictions';
    protected $primaryKey = 'id_prediksi';

    protected $fillable = [
        'id_bahan',
        'tanggal_prediksi_expired',
        'alasan_prediksi',
        'confidence_score',
        'data_bahan',
        'created_by'
    ];

    protected $casts = [
        'tanggal_prediksi_expired' => 'date',
        'confidence_score' => 'decimal:2',
        'data_bahan' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relasi dengan bahan
    public function bahan()
    {
        return $this->belongsTo(TblBahan::class, 'id_bahan', 'id_bahan');
    }

    // Relasi dengan user yang membuat prediksi
    public function user()
    {
        return $this->belongsTo(TblUser::class, 'created_by', 'id_user');
    }
}
