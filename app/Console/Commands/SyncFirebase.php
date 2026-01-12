<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Sensor;

class SyncFirebase extends Command
{
    protected $signature = 'firebase:sync';
    protected $description = 'Ambil 1 data terakhir dari Firebase dan simpan ke MySQL';

    public function handle()
    {
        $this->info(' Mengambil data di Firebase...');

        // ================= KONFIGURASI (ISI DENGAN DATA TEMAN) =================
        
        // 1. URL Database (Tanpa garis miring di akhir)
        $firebaseUrl = 'https://smarttani-a4a11-default-rtdb.asia-southeast1.firebasedatabase.app'; 
        
        // 2. Folder tempat teman simpan data (Misal: /monitoring atau /alat_a)
        $path = '/monitoring'; 
        
        // 3. Kode Rahasia (Database Secret)
        $secret = 'KsYAKBj028xvR5gP2kjaPE9SefbtP9RjfGqlN3Jb'; 

        // =======================================================================

        // URL Ajaib: Ambil data, urutkan dari key, ambil 1 yang paling baru
        $fullUrl = "$firebaseUrl$path.json?auth=$secret&orderBy=\"\$key\"&limitToLast=1";

        try {
            $response = Http::get($fullUrl);

            if ($response->successful()) {
                $rawData = $response->json();

                if (!empty($rawData)) {
                    // Karena formatnya {"-MzTx...": {data}}, kita ambil isi dalamnya saja
                    $data = current($rawData); 

                    $this->info('Data Diterima: ' . json_encode($data));

                    // --- MAPPING DATA (PENTING!) ---
                    // Kiri: Kolom MySQL Anda
                    // Kanan: Nama Key di JSON Firebase Teman ($data['nama_key'])
                    
                    Sensor::create([
                        // Data dari Device A (Firebase)
                        'suhu_ruangan'       => $data['suhu_udara'] ?? 0, // Contoh: teman pakai 'suhu_udara'
                        'kelembaban_ruangan' => $data['kelembaban'] ?? 0,
                        'suhu_tanah'         => $data['temp_tanah'] ?? 0,
                        'kelembaban_tanah'   => 0, 
                        'ph_air'             => 0,
                        'kualitas_air'       => 0,
                        'status_kipas'       => 0,
                        'status_pompa'       => 0,
                        'status_atap'        => 0,
                    ]);

                    $this->info('Berhasil disimpan ke MySQL!');
                } else {
                    $this->warn('Firebase kosong (Tidak ada data).');
                }
            } else {
                $this->error('Gagal Konek. Cek URL/Secret.');
                $this->error('Response: ' . $response->body());
            }
        } catch (\Exception $e) {
            $this->error('Error Sistem: ' . $e->getMessage());
        }
    }
}