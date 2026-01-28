<?php

use Illuminate\Support\Facades\Route;

// Serve React App untuk semua route non-API
Route::get('/{any}', function () {
    return view('dashboard');
})->where('any', '.*');
