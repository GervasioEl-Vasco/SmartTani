<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DeviceController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// 1. ROUTE USER (Bawaan Laravel)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// 2. ROUTE AUTH (Login, Logout, Register)
Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function(){
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/users', [AuthController::class, 'index']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::delete('/auth/users/{id}', [AuthController::class, 'destroy']);
});

// 3. ROUTE SENSOR (DATA HISTORIS DARI MYSQL)
// -----------------------------------------------------------
// Ambil data terkini (opsional, dashboard utama pakai Firebase)
Route::get('/sensors/current', [SensorController::class, 'current']); 

// Ambil data untuk Grafik Analisis (50 data terakhir)
Route::get('/sensors/history', [SensorController::class, 'history']);

// [BARU] Ambil data untuk Tabel Laporan (Filter Tanggal)
Route::get('/sensors/report', [SensorController::class, 'report']);

// Endpoint Simpan Manual (Bukan untuk ESP32 lagi, tapi untuk testing Postman/Sync)
Route::post('/sensors', [SensorController::class, 'store']);


// 4. ROUTE DEVICE SETTINGS (KONTROL ALAT)
// -----------------------------------------------------------
// React ambil status terakhir (opsional, karena React baca Firebase)
Route::get('/device/status', [DeviceController::class, 'getStatus']); 

// Update status (opsional, jika ingin simpan log perubahan status ke MySQL)
Route::post('/device/control', [DeviceController::class, 'updateStatus']);

// Route User Management (Admin)
Route::apiResource('users', UserController::class);