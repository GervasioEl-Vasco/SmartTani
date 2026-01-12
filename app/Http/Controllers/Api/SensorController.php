<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Sensor;
use App\Models\DeviceSetting;
use Carbon\Carbon; // Tambahkan ini untuk pengolahan waktu

class SensorController extends Controller
{
    // 1. DATA TERKINI (Untuk Dashboard Gauge)
    public function current()
    {
        $data = Sensor::latest()->first();

        if (!$data) {
            // Default value jika database kosong
            return response()->json([
                'suhu_ruangan' => 0,
                'kelembaban_ruangan' => 0,
                'ph_air' => 0,
                'kualitas_air' => 0,
                'suhu_tanah' => 0,
                'kelembaban_tanah' => 0,
                'status_kipas' => false,
                'status_pompa' => false,
                'status_atap' => false
            ]);
        }

        return response()->json([
            'suhu_ruangan' => $data->suhu_ruangan,
            'kelembaban_ruangan' => $data->kelembaban_ruangan,
            'ph_air' => $data->ph_air,
            'kualitas_air' => $data->kualitas_air,
            'suhu_tanah' => $data->suhu_tanah,
            'kelembaban_tanah' => $data->kelembaban_tanah,
            'status_kipas' => (bool) $data->status_kipas,
            'status_pompa' => (bool) $data->status_pompa,
            'status_atap' => (bool) $data->status_atap,
        ]);
    }

    // 2. SIMPAN DATA & LOGIKA OTOMATIS (Dari ESP32)
    public function store(Request $request)
    {
        // Simpan data sensor yang dikirim ESP32
        $sensor = Sensor::create($request->all());

        // Cek Logika Otomatis
        $setting = DeviceSetting::first();

        // Pastikan setting ada (Safety)
        if (!$setting) {
            $setting = DeviceSetting::create(['status_kipas' => 0, 'status_pompa' => 0, 'status_atap' => 0, 'mode_otomatis' => 0]);
        }

        if ($setting->mode_otomatis == 1) {
            // A. Logika Kipas (Suhu > 30 nyala)
            if ($request->suhu_ruangan > 30) {
                $setting->status_kipas = 1;
            } else {
                $setting->status_kipas = 0;
            }

            // B. Logika Pompa (Lembab < 40 nyala)
            if ($request->kelembaban_tanah < 40) {
                $setting->status_pompa = 1;
            } else {
                $setting->status_pompa = 0;
            }

            // C. Logika Atap (Jam Malam 18:00 - 06:00)
            // Kita pakai jam server (Laravel) biar akurat
            $jamSekarang = Carbon::now()->hour; // Format 0-23

            if ($jamSekarang >= 18 || $jamSekarang < 6) {
                $setting->status_atap = 0; // Malam = Tutup (0)
            } else {
                $setting->status_atap = 1; // Siang = Buka (1)
            }

            // Simpan perubahan status alat ke database
            $setting->save();
        }

        return response()->json(['message' => 'Data tersimpan & Logika Otomatis dijalankan', 'data' => $sensor]);
    }

    // 3. RIWAYAT / LAPORAN (Interval 5 Menit)
    public function history(Request $request)
    {
        // 1. Ambil tanggal dari filter atau default hari ini
        $date = $request->query('date', date('Y-m-d'));

        // 2. Ambil semua data yang menitnya kelipatan 10 (Gerbang dibuka)
        $rawData = Sensor::query()
            ->whereDate('created_at', $date)
            // Ubah angka 5 jadi 10 jika ingin interval 10 menit
            ->whereRaw('MINUTE(created_at) % 10 = 0')
            ->orderBy('created_at', 'asc') // Urutkan dari pagi ke malam
            ->get();

        // 3. LOGIKA BARU: GROUPING & DISTINCT
        // Kita paksa agar dalam 1 menit yang sama, cuma diambil 1 data pertama
        $filteredData = $rawData->unique(function ($item) {
            // Kita jadikan "Tahun-Bulan-Hari Jam:Menit" sebagai ID unik
            // Data dengan menit yang sama akan dianggap duplikat dan dibuang sisanya
            return $item->created_at->format('Y-m-d H:i');
        });

        // 4. Reset index array supaya rapi saat jadi JSON
        return response()->json($filteredData->values());
    }
}
