<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DeviceController;

// Route User (Bawaan)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Route Sensor (PENTING)
Route::get('/sensors/current', [SensorController::class, 'current']); // React ambil data
Route::post('/sensors', [SensorController::class, 'store']);          // ESP32 kirim data

// Route User Management (Admin)
Route::apiResource('users', UserController::class);

// Route History Sensor
Route::get('/sensors/history', [SensorController::class, 'history']);

// Route Auth (Login, Logout, Register)
Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function(){
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/users', [AuthController::class, 'index']); // List semua user
    Route::post('/auth/register', [AuthController::class, 'register']); // Tambah user baru
    Route::delete('/auth/users/{id}', [AuthController::class, 'destroy']); // Hapus user
});

// Route Device Settings (Kipas, Pompa, Atap, Mode Otomatis)
Route::get('/device/status', [DeviceController::class, 'getStatus']); // React ambil status
Route::post('/device/status', [DeviceController::class, 'updateStatus']); // React update status

Route::post('/device/control', [DeviceController::class, 'updateStatus']);