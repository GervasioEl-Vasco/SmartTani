<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpMqtt\Client\Facades\MQTT; // Library MQTT
use Illuminate\Support\Facades\Http; // Library HTTP buat ke Firebase
use App\Models\Sensor;

class IotListener extends Command
{
    protected $signature = 'iot:listen';
    protected $description = 'Menghubungkan MQTT -> MySQL -> Firebase';

    public function handle()
    {
        $this->info('Menunggu data MQTT (Topik: smarttani/sensor)...');

        $mqtt = MQTT::connection();
        
        // Subscribe ke topik ESP32
        $mqtt->subscribe('smarttani/sensor', function (string $topic, string $message) {
            
            $this->info("📥 Masuk: " . $message);
            $data = json_decode($message, true);

            if ($data) {
                // ---------------------------------------------
                // 1. SIMPAN KE MYSQL (Untuk Laporan PDF)
                // ---------------------------------------------
                Sensor::create([
                    'suhu_ruangan'       => $data['suhu'] ?? 0,
                    'kelembaban_ruangan' => $data['hum'] ?? 0,
                    'suhu_tanah'         => $data['soil_temp'] ?? 0,
                    'kelembaban_tanah'   => $data['soil_hum'] ?? 0,
                    'ph_air'             => $data['ph'] ?? 0,
                    'kualitas_air'       => $data['water_quality'] ?? 0,
                    'status_kipas'       => $data['fan_status'] ?? 0,
                    'status_pompa'       => $data['pump_status'] ?? 0,
                    'status_atap'        => $data['roof_status'] ?? 0,
                ]);
                $this->info('Saved to MySQL');

                // ---------------------------------------------
                // 2. KIRIM KE FIREBASE (Untuk Realtime Dashboard)
                // ---------------------------------------------
                // Kita pakai HTTP biasa (Jalan Tikus) biar gak error library
                $firebaseUrl = "https://smarttani-a4a11-default-rtdb.asia-southeast1.firebasedatabase.app/monitoring.json";
                $secret = "KsYAKBj028xvR5gP2kjaPE9SefbtP9RjfGqlN3Jb"; 

                // Pakai PUT agar menimpa data lama (Realtime View)
                // Pakai POST jika ingin menambah history di Firebase juga
                Http::put("$firebaseUrl?auth=$secret", $data);
                
                $this->info('Synced to Firebase');
            }
        }, 0);

        $mqtt->loop(true);
    }
}