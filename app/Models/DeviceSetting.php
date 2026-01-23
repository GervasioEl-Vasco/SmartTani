<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceSetting extends Model
{
    use HasFactory;

    protected $table = 'device_settings';

    protected $fillable = [
        'status_kipas',
        'status_pompa',
        'status_kipas2',
        'mode_otomatis'
    ];
}