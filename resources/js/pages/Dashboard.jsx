import React, { useState, useEffect } from "react";
import Analisis from "./Analisis";
import Laporan from "./Laporan";
import Login from "./Login";
import ManajemenUser from "./ManajemenUser";
import Navbar from "../components/Navbar";
import AutoModeCard from "../components/AutoModeCard";
import DeviceGrid from "../components/DeviceGrid";
import SensorGrid from "../components/SensorGrid";
import { API_BASE_URL } from "../config"; 

// --- FUNGSI HELPER PENTING (Biar Gak Salah Baca Data) ---
// Ini memastikan "1", 1, "true", true semuanya dianggap NYALA.
const parseStatus = (val) => {
    return String(val) === "1" || val === 1 || val === true || String(val).toLowerCase() === "true";
};

export default function Dashboard() {
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );
    const [activeTab, setActiveTab] = useState("Dashboard");
    const userRole = localStorage.getItem("user_role");

    // State Data Sensor
    const [sensorData, setSensorData] = useState({
        suhuRuangan: 0,
        kelembabanRuangan: 0,
        phAir: 0,
        suhuTanah: 0,
        kelembabanTanah: 0,
        kualitasAir: 0,
    });

    // State Status Alat
    const [deviceStatus, setDeviceStatus] = useState({
        status_kipas: false,
        status_pompa: false,
        status_kipas2: false,
        mode_otomatis: false,
    });

    // --- STATE PENGUNCI (ANTI MENTAL) ---
    const [isUpdating, setIsUpdating] = useState(false);

    // =================================================================
    // 1. AMBIL DATA DARI LARAVEL (POLLING)
    // =================================================================
    useEffect(() => {
        if (!isLoggedIn) return;

        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/sensors/current`);
                if (response.ok) {
                    const data = await response.json();

                    console.log("Data Mentah dari Laravel:", data);
                    
                    // 1. UPDATE SENSOR 
                    setSensorData({
                        suhuRuangan: parseFloat(data.suhu_ruangan || 0),
                        kelembabanRuangan: parseFloat(data.kelembaban_ruangan || 0),
                        phAir: parseFloat(data.ph_air || 0),
                        suhuTanah: parseFloat(data.suhu_tanah || 0),
                        kelembabanTanah: parseFloat(data.kelembaban_tanah || 0),
                        kualitasAir: parseFloat(data.kualitas_air || 0),
                    });

                    // 2. UPDATE STATUS ALAT 
                    // Logika: Hanya update status alat dari DB kalau user TIDAK sedang menekan tombol.
                    if (!isUpdating) {
                        setDeviceStatus({
                            // PERBAIKAN: Gunakan parseStatus biar akurat
                            status_kipas: parseStatus(data.status_kipas),
                            status_pompa: parseStatus(data.status_pompa),
                            status_kipas2: parseStatus(data.status_kipas2),
                            mode_otomatis: parseStatus(data.mode_otomatis),
                        });
                    }
                }
            } catch (error) {
                console.error("Gagal konek ke Laravel:", error);
            }
        };

        // Fetch pertama kali
        fetchData();
        
        // Polling tiap 2 detik
        const interval = setInterval(fetchData, 2000); 

        return () => clearInterval(interval);

    }, [isLoggedIn, isUpdating]); 


    // =================================================================
    // 2. FUNGSI KLIK TOMBOL (FIXED)
    // =================================================================
    const handleToggle = async (key, currentValue) => {
        // 1. KUNCI POLLING (Supaya data lama dari server gak menimpa tombol kita)
        setIsUpdating(true);

        // 2. Tentukan Nilai Baru (Boolean)
        const newValue = !currentValue;

        // 3. OPTIMISTIC UPDATE (Ubah UI duluan biar cepat & gak mantul)
        setDeviceStatus((prev) => ({ ...prev, [key]: newValue }));

        try {
            const endpoint = `${API_BASE_URL}/device/status`; 

            // 4. KIRIM KE SERVER (Format Angka 1 atau 0)
            // Database lebih suka angka 1/0 daripada true/false
            const payload = {
                [key]: newValue ? 1 : 0 
            };

            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log(`Berhasil update ${key} ke ${newValue ? 1 : 0}`);

            // 5. Buka Kuncian setelah 3 detik
            // Kita kasih waktu server buat simpan data, baru kita polling lagi
            setTimeout(() => {
                setIsUpdating(false); 
            }, 3000);

        } catch (error) {
            console.error("Gagal update status:", error);
            // Kalau error beneran, baru balikin tombolnya (Rollback)
            setDeviceStatus((prev) => ({ ...prev, [key]: currentValue }));
            setIsUpdating(false);
            alert("Gagal terhubung ke Server!");
        }
    };

    if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userRole={userRole}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 border-b border-gray-200 pb-5">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {activeTab === "Dashboard" && "Dashboard Monitoring"}
                        {activeTab === "Analisis" && "Analisis Tanaman"}
                        {activeTab === "Laporan" && "Laporan & Riwayat"}
                        {activeTab === "ManajemenUser" && "Manajemen Pengguna"}
                    </h1>
                </div>

                {activeTab === "Dashboard" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* 1. KARTU OTOMATIS */}
                        <AutoModeCard
                            isAuto={deviceStatus.mode_otomatis}
                            onToggle={
                                userRole === 'admin' 
                                ? () => handleToggle("mode_otomatis", deviceStatus.mode_otomatis)
                                : null
                            }
                        />

                        {/* 2. GRID TOMBOL ALAT */}
                        <DeviceGrid
                            deviceStatus={deviceStatus}
                            handleToggle={
                                userRole === 'admin' 
                                ? handleToggle 
                                : () => alert("Akses Ditolak: Hanya Admin yang boleh mengontrol alat!") 
                            }
                        />

                        {/* 3. GRID SENSOR */}
                        <SensorGrid sensorData={sensorData} />
                    </div>
                )}

                <div className="mt-6">
                    {activeTab === "Analisis" && (
                        <Analisis latestData={sensorData} />
                    )}
                    {activeTab === "Laporan" && (
                        <Laporan latestData={sensorData} />
                    )}
                    {activeTab === "ManajemenUser" && userRole === "admin" && (
                        <ManajemenUser />
                    )}
                </div>
            </div>
        </div>
    );
}