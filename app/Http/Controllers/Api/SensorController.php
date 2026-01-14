<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Sensor;
use Carbon\Carbon;

class SensorController extends Controller
{
    // 1. DATA TERKINI (Untuk Dashboard - Opsional jika Firebase down)
    public function current()
    {
        $data = Sensor::latest()->first();

        if (!$data) {
            return response()->json([
                'suhu_ruangan' => 0, 'kelembaban_ruangan' => 0,
                'ph_air' => 0, 'kualitas_air' => 0,
                'suhu_tanah' => 0, 'kelembaban_tanah' => 0,
                'status_kipas' => false, 'status_pompa' => false, 'status_atap' => false
            ]);
        }
        return response()->json($data);
    }

    // 2. RIWAYAT / LAPORAN (Untuk Grafik & Tabel Laporan)
    // Mengambil 50 data terakhir untuk Grafik Analisis
    public function history()
    {
        // Ambil 50 data terakhir, urutkan dari yang terlama ke terbaru
        // Ini cocok untuk grafik (sumbu X waktu bergerak ke kanan)
        $data = Sensor::latest()
            ->take(50)
            ->get()
            ->reverse()
            ->values();

        return response()->json($data);
    }

    // 3. LAPORAN LENGKAP (Untuk Halaman Laporan & Export PDF)
    // Bisa difilter berdasarkan tanggal
    public function report(Request $request)
    {
        // Ambil filter tanggal (default hari ini)
        $date = $request->query('date', date('Y-m-d'));

        // Ambil data pada tanggal tersebut
        // Jika datanya terlalu banyak (misal tiap menit ada), kita ambil tiap 10 menit
        $data = Sensor::whereDate('created_at', $date)
            //->whereRaw('MINUTE(created_at) % 10 = 0') // Filter interval 10 menit
            ->orderBy('created_at', 'desc') // Paling baru di atas
            ->take(100)
            ->get();

        // Jika kosong, kembalikan array kosong
        if ($data->isEmpty()) {
            return response()->json([]);
        }

        return response()->json($data);
    }
}