import React, { useState, useEffect } from "react";
import Analisis from "./Analisis";
import Laporan from "./Laporan";
import Login from "./Login";
import ManajemenUser from "./ManajemenUser";
import Navbar from "../components/Navbar";
import AutoModeCard from "../components/AutoModeCard";
import DeviceGrid from "../components/DeviceGrid";
import SensorGrid from "../components/SensorGrid";
import API_BASE_URL from "../config";

// --- FUNGSI HELPER PENTING ---
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
        status_kipas2: false,
        status_pompa: false,
        mode_otomatis: false,
    });

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
                    
                    // 1. UPDATE SENSOR (Selalu update)
                    setSensorData({
                        suhuRuangan: parseFloat(data.suhu_ruangan || 0),
                        kelembabanRuangan: parseFloat(data.kelembaban_ruangan || 0),
                        phAir: parseFloat(data.ph_air || 0),
                        suhuTanah: parseFloat(data.suhu_tanah || 0),
                        kelembabanTanah: parseFloat(data.kelembaban_tanah || 0),
                        kualitasAir: parseFloat(data.kualitas_air || 0),
                    });

                    // 2. UPDATE STATUS ALAT 
                    if (!isUpdating) {
                        setDeviceStatus({
                            status_kipas: parseStatus(data.status_kipas),
                            status_kipas2: parseStatus(data.status_kipas2),
                            status_pompa: parseStatus(data.status_pompa),
                            mode_otomatis: parseStatus(data.mode_otomatis),
                        });
                    }
                }
            } catch (error) {
                console.error("Gagal konek ke Laravel:", error);
            }
        };

        fetchData();
        
        // Polling tiap 1 menit untuk monitoring berkala
        const interval = setInterval(fetchData, 60000); 

        return () => clearInterval(interval);

    }, [isLoggedIn, isUpdating]);


    // =================================================================
    // 2. FUNGSI KLIK TOMBOL
    // =================================================================
    const handleToggle = async (key, currentValue) => {
        setIsUpdating(true);
        const newValue = !currentValue;
        
        // Optimistic Update
        setDeviceStatus((prev) => ({ ...prev, [key]: newValue }));

        try {
            const endpoint = `${API_BASE_URL}/device/status`; 

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

            setTimeout(() => {
                setIsUpdating(false);
            }, 3000);

        } catch (error) {
            console.error("Gagal update status:", error);
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
                        <DeviceGrid
                            deviceStatus={deviceStatus}
                            handleToggle={
                                userRole === 'admin'
                                    ? handleToggle
                                    : () => alert("Akses Ditolak: Hanya Admin yang boleh mengontrol alat!")
                            }
                        />
                        <SensorGrid sensorData={sensorData} />
                    </div>
                )}

                <div className="mt-6">
                    {activeTab === "Analisis" && <Analisis latestData={sensorData} />}
                    {activeTab === "Laporan" && <Laporan latestData={sensorData} />}
                    {activeTab === "ManajemenUser" && userRole === "admin" && <ManajemenUser />}
                </div>
            </div>
        </div>
    );
}