<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DeviceSetting;

class DeviceController extends Controller
{
    public function getStatus()
    {
        $device = DeviceSetting::first();
        if (!$device) {
            $device = DeviceSetting::create([
                'status_kipas' => 0,
                'status_pompa' => 0,
                'status_atap' => 0,
                'mode_otomatis' => 0
            ]);
        }

        return response()->json($device);
    }

    public function updateStatus(Request $request)
    {
        // 1. Ambil data pertama, atau buat baru jika kosong
        $device = DeviceSetting::firstOrNew([], [
            'status_kipas' => 0,
            'status_pompa' => 0,
            'status_atap' => 0,
            'mode_otomatis' => 0
        ]);

        // 2. UPDATE DATA (Lebih Robust/Kuat)
        // Logikanya: Ambil input dari React. Jika tidak ada, biarkan nilai lama ($device->xxx)
        $device->status_kipas  = $request->input('status_kipas', $device->status_kipas);
        $device->status_pompa  = $request->input('status_pompa', $device->status_pompa);
        $device->status_atap   = $request->input('status_atap', $device->status_atap);
        $device->mode_otomatis = $request->input('mode_otomatis', $device->mode_otomatis);

        // 3. Simpan ke Database
        $device->save();

        return response()->json([
            'message' => 'Berhasil update!',
            'data' => $device,
            'input_diterima' => $request->all() // Debugging: Biar kita tahu apa yang dikirim React
        ]);
    }
}