import React, { useState, useEffect } from 'react';
import ChartCard from '../components/ChartCard';
// IMPORT CONFIG AGAR IP KONSISTEN
import { API_BASE_URL } from "../config";

export default function Analisis() { 
    // Props { latestData } sudah dihapus sesuai permintaan
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- LOGIKA AMBIL DATA DARI DATABASE MYSQL ---
    const fetchHistoryData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/sensors/history`);    
            if (response.ok) {
                const data = await response.json();

                // Format data agar cocok dengan Recharts
                const formattedData = data.map(item => ({
                    ...item,
                    // Ubah created_at menjadi Jam:Menit
                    waktu: new Date(item.created_at).toLocaleTimeString('id-ID', { 
                        hour: '2-digit', minute: '2-digit' 
                    }),
                    // Pastikan angka desimal
                    suhuRuangan: parseFloat(item.suhu_ruangan),
                    kelembabanRuangan: parseFloat(item.kelembaban_ruangan),
                    suhuTanah: parseFloat(item.suhu_tanah),
                    kelembabanTanah: parseFloat(item.kelembaban_tanah),
                    phAir: parseFloat(item.ph_air),
                    kualitasAir: parseFloat(item.kualitas_air),
                }));

                // Membalik urutan agar grafik jalan dari kiri (lama) ke kanan (baru)
                // Tergantung respon Laravel, kalau Laravel kirim DESC (terbaru dulu), kita reverse.
                setHistory(formattedData.reverse()); 
                setLoading(false);
            }
        } catch (error) {
            console.error("Gagal mengambil data history:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistoryData();

        // Refresh grafik setiap 1 menit
        const interval = setInterval(fetchHistoryData, 60000);
        return () => clearInterval(interval);
    }, []);

    // --- TAMPILAN LOADING ---
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-500">Memuat riwayat data sensor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            
            {/* Header */}
                <div className="text-right hidden md:block">
                    <button 
                        onClick={() => { setLoading(true); fetchHistoryData(); }}
                        className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-200 hover:bg-green-100 transition"
                    >
                        Refresh Data
                    </button>
                </div>

            {/* Grid Grafik */}
            {history.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <ChartCard 
                        title="Suhu Ruangan" 
                        data={history} 
                        dataKey="suhuRuangan" 
                        color="#ef4444" 
                        unit="°C"
                    />
                    <ChartCard 
                        title="Kelembaban Udara" 
                        data={history} 
                        dataKey="kelembabanRuangan" 
                        color="#3b82f6" 
                        unit="%"
                    />
                    <ChartCard 
                        title="Suhu Tanah" 
                        data={history} 
                        dataKey="suhuTanah" 
                        color="#f97316" 
                        unit="°C"
                    />
                    <ChartCard 
                        title="Kelembaban Tanah" 
                        data={history} 
                        dataKey="kelembabanTanah" 
                        color="#0ea5e9" 
                        unit="%"
                    />
                    <ChartCard 
                        title="pH Air" 
                        data={history} 
                        dataKey="phAir" 
                        color="#8b5cf6" 
                        unit=" pH"
                    />
                    <ChartCard 
                        title="Kualitas Air" 
                        data={history} 
                        dataKey="kualitasAir" 
                        color="#6366f1" 
                        unit=" PPM"
                    />
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Belum ada riwayat data di database.</p>
                </div>
            )}
        </div>
    );
}