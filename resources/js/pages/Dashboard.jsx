import React, { useState, useEffect } from "react";
import Analisis from "./Analisis";
import Laporan from "./Laporan";
import Login from "./Login";
import ManajemenUser from "./ManajemenUser";
import Navbar from "../components/Navbar";
import AutoModeCard from "../components/AutoModeCard";
import DeviceGrid from "../components/DeviceGrid";
import SensorGrid from "../components/SensorGrid";

// 1. IMPORT FIREBASE
import { db } from "../firebaseConfig";
import { ref, onValue, set } from "firebase/database";

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
        status_atap: false,
        mode_otomatis: false,
    });

    // 2. KONEKSI KE FIREBASE (MENGGANTIKAN FETCH LARAVEL)
    useEffect(() => {
        if (!isLoggedIn) return;

        // A. DENGAR SENSOR (Realtime)
        const sensorRef = ref(db, "sensors");
        const unsubscribeSensor = onValue(sensorRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setSensorData({
                    suhuRuangan: data.suhu_ruangan || 0,
                    kelembabanRuangan: data.kelembaban_ruangan || 0,
                    phAir: data.ph_air || 0,
                    suhuTanah: data.suhu_tanah || 0,
                    kelembabanTanah: data.kelembaban_tanah || 0,
                    kualitasAir: data.kualitas_air || 0, // Jika ada sensor TDS
                });
            }
        });

        // B. DENGAR STATUS ALAT (Agar sinkron dengan ESP32/HP lain)
        const deviceRef = ref(db, "devices");
        const unsubscribeDevice = onValue(deviceRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setDeviceStatus({
                    status_kipas: Boolean(data.kipas),
                    status_pompa: Boolean(data.pompa),
                    status_atap: Boolean(data.atap),
                    mode_otomatis: Boolean(data.mode_otomatis),
                });
            }
        });

        // Cleanup saat pindah halaman
        return () => {
            unsubscribeSensor();
            unsubscribeDevice();
        };
    }, [isLoggedIn]);

    // 3. FUNGSI KLIK TOMBOL (Kirim ke Firebase)
    const handleToggle = (key, currentValue) => {
        const dbKeyMap = {
            status_kipas: "kipas",
            status_pompa: "pompa",
            status_atap: "atap",
            mode_otomatis: "mode_otomatis",
        };

        const dbKey = dbKeyMap[key];
        const newValue = !currentValue;

        // Update Lokal biar cepat
        setDeviceStatus((prev) => ({ ...prev, [key]: newValue }));

        // Kirim ke Firebase
        set(ref(db, "devices/" + dbKey), newValue).catch((error) => {
            console.error("Error Firebase:", error);
            // Kembalikan jika gagal
            setDeviceStatus((prev) => ({ ...prev, [key]: currentValue }));
        });
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
                        {activeTab === "Analisis" && "Analisis Data"}
                        {activeTab === "Laporan" && "Laporan Data"}
                        {activeTab === "ManajemenUser" && "Manajemen User"}
                    </h1>
                </div>

                {activeTab === "Dashboard" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AutoModeCard
                            isAuto={deviceStatus.mode_otomatis}
                            onToggle={() =>
                                handleToggle(
                                    "mode_otomatis",
                                    deviceStatus.mode_otomatis
                                )
                            }
                        />
                        <DeviceGrid
                            deviceStatus={deviceStatus}
                            handleToggle={handleToggle}
                        />
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
