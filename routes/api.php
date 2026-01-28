<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DeviceController;

/*
|--------------------------------------------------------------------------
| API Routes (Laravel 10/11)
|--------------------------------------------------------------------------
*/

// ========================================================================
// 1. ROUTE AUTH & USER (Manajemen Pengguna)
// ========================================================================
Route::post(uri: '/auth/login', action: [AuthController::class, 'login']);
Route::post(uri: '/auth/register', action: [AuthController::class, 'register']);


Route::middleware('auth:sanctum')->group(function(){
    Route::get('/user', function (Request $request) { return $request->user(); });
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/users', [AuthController::class, 'index']);
    Route::delete('/auth/users/{id}', [AuthController::class, 'destroy']);
    
    // Admin User Management
    Route::apiResource('users', UserController::class);
});

// ========================================================================
// 2. ROUTE SENSOR (Jantung Aplikasi)
// ========================================================================

// [PENTING] Jalur Masuk Data dari ESP32 (POST)
// Sesuai kodingan ESP32: http://.../api/sensors
Route::post('/sensors', [SensorController::class, 'store']);

// Jalur Lihat Data (Untuk React Dashboard/Tabel)
Route::get('/sensors', [SensorController::class, 'index']); 

// Ambil data terkini (Untuk Kartu Status Paling Atas)
Route::get('/sensors/current', [SensorController::class, 'current']); 

// Ambil data Grafik (50 data terakhir)
Route::get('/sensors/history', [SensorController::class, 'history']);

// Ambil data Laporan (Filter Tanggal & Export PDF)
Route::get('/sensors/report', [SensorController::class, 'report']);


// ========================================================================
// 3. ROUTE DEVICE SETTINGS (Kontrol Relay)
// ========================================================================

// [GET] ESP32 membaca status tombol disini
// Sesuai kodingan ESP32: http://.../api/device/status
Route::get('/device/status', [DeviceController::class, 'getStatus']); 

// [POST] React menekan tombol Update disini
// SAYA UBAH URL-NYA AGAR SAMA PERSIS DENGAN YANG GET (BIAR RAPI)
Route::post('/device/status', [DeviceController::class, 'updateStatus']);