<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sensor extends Model
{
    use HasFactory;

    // Sambungkan ke tabel yang Anda buat di HeidiSQL
    protected $table = 'tb_sensor';

    // Daftar kolom (sesuai nama di HeidiSQL)
    protected $fillable = [
        'suhu_ruangan',
        'kelembaban_ruangan',
        'ph_air',
        'kualitas_air',
        'suhu_tanah',
        'kelembaban_tanah',
        'status_kipas',
        'status_pompa',
        'status_atap'
    ];
}