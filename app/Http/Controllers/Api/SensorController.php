<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Sensor;
use App\Models\DeviceSetting; // Pastikan Model ini di-import!

class SensorController extends Controller
{
    // ============================================================================
    // 1. INPUT DATA DARI ESP32 (POST)
    // ============================================================================
    public function store(Request $request)
    {
        // Validasi data
        $validated = $request->validate([
            'suhu_ruangan'       => 'required|numeric',
            'kelembaban_ruangan' => 'required|numeric',
            'suhu_tanah'         => 'required|numeric',
            'kelembaban_tanah'   => 'required|numeric',
            'ph_air'             => 'required|numeric',
            'kualitas_air'       => 'nullable|numeric', 
            
            // Status alat (Boleh ada, boleh tidak)
            'status_pompa'       => 'nullable',
            'status_kipas'       => 'nullable',
            'status_kipas2'        => 'nullable',
            'mode_otomatis'      => 'nullable' 
        ]);

        Log::info('DATA DARI ESP32:', $request->all());

        $sensor = Sensor::create($request->only([
            'suhu_ruangan',
            'kelembaban_ruangan',
            'suhu_tanah',
            'kelembaban_tanah',
            'ph_air',
            'kualitas_air'
        ]));


        $setting = DeviceSetting::first();
        if($setting) {
             $setting->update($request->only([
                 'status_pompa', 'status_kipas', 'status_kipas2', 'mode_otomatis'
             ]));
        }

        return response()->json([
            'message' => 'Data berhasil disimpan ke Local Server',
            'data' => $sensor
        ], 201);
    }

    // ============================================================================
    // 2. DATA TERKINI UNTUK DASHBOARD (GET)
    // ============================================================================
    public function current()
    {
        // 1. Ambil Data Sensor Terakhir
        $sensorData = Sensor::latest()->first();

        // 2. Ambil Status Alat dari Tabel Setting (YANG BENAR)
        $deviceStatus = DeviceSetting::first();

        // Siapkan default values jika tabel kosong
        $response = [
            'suhu_ruangan' => 0,
            'kelembaban_ruangan' => 0,
            'ph_air' => 0,
            'kualitas_air' => 0,
            'suhu_tanah' => 0,
            'kelembaban_tanah' => 0,
            // Default Status
            'status_kipas' => 0,
            'status_pompa' => 0,
            'status_kipas2' => 0,
            'mode_otomatis' => 0 
        ];

        // Timpa dengan data sensor jika ada
        if ($sensorData) {
            $response['suhu_ruangan'] = $sensorData->suhu_ruangan;
            $response['kelembaban_ruangan'] = $sensorData->kelembaban_ruangan;
            $response['ph_air'] = $sensorData->ph_air;
            $response['kualitas_air'] = $sensorData->kualitas_air;
            $response['suhu_tanah'] = $sensorData->suhu_tanah;
            $response['kelembaban_tanah'] = $sensorData->kelembaban_tanah;
        }

        // Timpa dengan status alat jika ada (PENTING BIAR TOMBOL GAK MANTUL)
        if ($deviceStatus) {
            $response['status_kipas'] = $deviceStatus->status_kipas;
            $response['status_pompa'] = $deviceStatus->status_pompa;
            $response['status_kipas2'] = $deviceStatus->status_kipas2;
            $response['mode_otomatis'] = $deviceStatus->mode_otomatis;
        }

        return response()->json($response);
    }

    // ============================================================================
    // 3. RIWAYAT GRAFIK (GET)
    // ============================================================================
    public function history()
    {
        $data = Sensor::latest()
            ->take(50)
            ->get()
            ->reverse() 
            ->values();

        return response()->json($data);
    }

    // ============================================================================
    // 4. LAPORAN & TABEL (GET)
    // ============================================================================
    public function report(Request $request)
    {
        $date = $request->query('date', date('Y-m-d'));

        $data = Sensor::whereDate('created_at', $date)
            ->orderBy('created_at', 'desc')
            ->take(100)
            ->get();

        return response()->json($data);
    }
}