<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sensor extends Model
{
    use HasFactory;

    // Sambungkan ke tabel
    protected $table = 'tb_sensor';
    protected $guarded = [];

    protected $fillable = [
        'suhu_ruangan',
        'kelembaban_ruangan',
        'suhu_tanah',
        'kelembaban_tanah',
        'ph_air',
        'kualitas_air',
        'status_pompa',
        'status_kipas',
        'status_kipas2'
    ];
}
