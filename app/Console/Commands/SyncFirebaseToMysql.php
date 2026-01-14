<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Sensor; // Gunakan Model Sensor lama Anda

class SyncFirebaseToMysql extends Command
{
    protected $signature = 'firebase:sync';
    protected $description = 'Ambil data realtime Firebase simpan ke MySQL History';

    public function handle()
    {
        // URL Database Firebase Anda (Pastikan akhiran .json)
        $url = "https://smarttani-a4a11-default-rtdb.asia-southeast1.firebasedatabase.app/sensors.json";

        $response = Http::get($url);

        if ($response->successful()) {
            $data = $response->json();
            
            if ($data) {
                // Simpan ke tabel sensors menggunakan Model Sensor
                // Sesuaikan nama kolom kiri dengan nama kolom di database MySQL Anda
                Sensor::create([
                    'suhu_ruangan'       => $data['suhu_ruangan'] ?? 0,
                    'kelembaban_ruangan' => $data['kelembaban_ruangan'] ?? 0,
                    'suhu_tanah'         => $data['suhu_tanah'] ?? 0,
                    'kelembaban_tanah'   => $data['kelembaban_tanah'] ?? 0,
                    'ph_air'             => $data['ph_air'] ?? 0,
                    'kualitas_air'       => $data['kualitas_air'] ?? 0,
                    
                    // Jika tabel lama Anda tidak punya kolom status, hapus 3 baris bawah ini
                    'status_pompa'       => $data['status_pompa'] ?? false,
                    'status_kipas'       => $data['status_kipas'] ?? false,
                    'status_atap'        => $data['status_atap'] ?? false,
                ]);

                $this->info('✅ Data tersimpan ke MySQL: ' . now());
            }
        }
    }
}