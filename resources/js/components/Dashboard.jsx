import React, { useState, useEffect } from "react";
import { User, Menu, X, LogOut, Users } from "lucide-react";
import Analisis from "./Analisis";
import Laporan from "./Laporan";
import Login from "./Login";
import ManajemenUser from "./ManajemenUser";
import "../../css/dashboard.css";

export default function Dashboard() {
    // 1. State Auth & UI
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const userRole = localStorage.getItem("user_role");

    // 2. State Data Sensor (Baca Saja)
    const [sensorData, setSensorData] = useState({
        suhuRuangan: 0,
        kelembabanRuangan: 0,
        phAir: 0,
        suhuTanah: 0,
        kelembabanTanah: 0,
        kualitasAir: 0,
    });

    // 3. State Status Alat (Bisa Diubah/Klik)
    const [deviceStatus, setDeviceStatus] = useState({
        status_kipas: false,
        status_pompa: false,
        status_atap: false,
        mode_otomatis: false,
    });

    const BASE_URL = "http://127.0.0.1:8000";

    // --- FUNGSI 1: AMBIL DATA (Gabungan Sensor & Status Alat) ---
    const fetchData = async () => {
        try {
            // A. Ambil Data Sensor
            const resSensor = await fetch(`${BASE_URL}/api/sensors/current`);
            const dataSensor = await resSensor.json();
            setSensorData({
                suhuRuangan: dataSensor.suhu_ruangan || 0,
                kelembabanRuangan: dataSensor.kelembaban_ruangan || 0,
                phAir: dataSensor.ph_air || 0,
                suhuTanah: dataSensor.suhu_tanah || 0,
                kelembabanTanah: dataSensor.kelembaban_tanah || 0,
                kualitasAir: dataSensor.kualitas_air || 0,
            });

            // B. Ambil Status Alat (Untuk posisi tombol on/off)
            const resDevice = await fetch(`${BASE_URL}/api/device/status`);
            const dataDevice = await resDevice.json();
            setDeviceStatus({
                status_kipas: Boolean(dataDevice.status_kipas),
                status_pompa: Boolean(dataDevice.status_pompa),
                status_atap: Boolean(dataDevice.status_atap),
                mode_otomatis: Boolean(dataDevice.mode_otomatis),
            });
        } catch (error) {
            console.error("Gagal update data:", error);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchData();
            // Refresh cepat (2 detik) agar responsif saat mode otomatis jalan
            const interval = setInterval(fetchData, 2000);
            return () => clearInterval(interval);
        }
    }, [isLoggedIn]);

    // --- FUNGSI 2: TOMBOL DIKLIK (Kirim Perintah ke Laravel) ---
    const handleToggle = async (key, currentValue) => {
        const newValue = !currentValue;

        // 1. Update UI duluan (biar cepat/tidak lag)
        setDeviceStatus((prev) => ({ ...prev, [key]: newValue }));

        try {
            // 2. Kirim ke Database
            await fetch(`${BASE_URL}/api/device/control`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [key]: newValue ? 1 : 0 }),
            });
        } catch (error) {
            console.error("Gagal kirim perintah:", error);
            // Balikin posisi tombol jika error internet
            setDeviceStatus((prev) => ({ ...prev, [key]: currentValue }));
        }
    };

    // --- FUNGSI 3: LOGOUT ---
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user_name");
        localStorage.removeItem("user_role");
        setIsLoggedIn(false);
        setActiveTab("Dashboard");
    };

    if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;

    // --- KOMPONEN: KARTU KONTROL (Switch) ---
    const ControlCard = ({
        label,
        isOn,
        onToggle,
        isDisabled,
        onText = "NYALA",
        offText = "MATI",
    }) => (
        <div className={`card ${isDisabled ? "opacity-60" : ""}`}>
            <div className="card-header">
                <p className="card-label" style={{ margin: 0 }}>
                    {label}
                </p>
                {/* Tombol Switch */}
                <label className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={isOn}
                        onChange={onToggle}
                        disabled={isDisabled}
                    />
                    <span className="slider"></span>
                </label>
            </div>
            <div
                className={`status-value ${isOn ? "status-on" : "status-off"}`}
            >
                {isOn ? onText : offText}
            </div>
        </div>
    );

    // --- KOMPONEN: GAUGE (Tetap) ---
    const CircularGauge = ({ value, max, color, label, unit }) => {
        const percentage = (value / max) * 100;
        const circumference = 2 * Math.PI * 52;
        const offset = circumference - (percentage / 100) * circumference;
        return (
            <div className="card">
                <div className="gauge-container">
                    <svg
                        width="120"
                        height="120"
                        style={{ transform: "rotate(-90deg)" }}
                    >
                        <circle cx="60" cy="60" r="52" className="gauge-bg" />
                        <circle
                            cx="60"
                            cy="60"
                            r="52"
                            className="gauge-progress"
                            stroke={color}
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                        />
                    </svg>
                    <div className="gauge-value">
                        {value}
                        {unit}
                    </div>
                </div>
                <p className="card-label">{label}</p>
            </div>
        );
    };

    const SimpleCard = ({ label, value, unit }) => (
        <div className="card">
            <p className="card-label">{label}</p>
            <div className="simple-value">{value}</div>
            <p className="simple-unit">{unit}</p>
        </div>
    );

    return (
        <div className="dashboard-wrapper">
            {/* Navbar */}
            <nav className="navbar">
                <div className="nav-left">
                    <div className="logo">
                        <img
                            src="images/logo.png"
                            alt="Smart Tani Logo"
                            className="logo-image"
                        />
                    </div>
                    <button
                        className="hamburger-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
                        <button
                            className={
                                activeTab === "Dashboard" ? "active" : ""
                            }
                            onClick={() => {
                                setActiveTab("Dashboard");
                                setIsMenuOpen(false);
                            }}
                        >
                            Dashboard
                        </button>
                        <button
                            className={activeTab === "Analisis" ? "active" : ""}
                            onClick={() => {
                                setActiveTab("Analisis");
                                setIsMenuOpen(false);
                            }}
                        >
                            Analisis
                        </button>
                        <button
                            className={activeTab === "Laporan" ? "active" : ""}
                            onClick={() => {
                                setActiveTab("Laporan");
                                setIsMenuOpen(false);
                            }}
                        >
                            Laporan
                        </button>
                        {userRole === "admin" && (
                            <button
                                className={
                                    activeTab === "ManajemenUser"
                                        ? "active"
                                        : ""
                                }
                                onClick={() => {
                                    setActiveTab("ManajemenUser");
                                    setIsMenuOpen(false);
                                }}
                            >
                                Users
                            </button>
                        )}

                        <button
                            className="mobile-logout-btn"
                            onClick={handleLogout}
                        >
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <LogOut size={18} /> Logout
                            </span>
                        </button>
                    </div>
                </div>
                <div
                    className="nav-right"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                    }}
                >
                    <div
                        className="user-info"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <div className="user-icon">
                            <User size={20} />
                        </div>
                        <span
                            className="user-name"
                            style={{ fontWeight: "600", color: "#374151" }}
                        >
                            {localStorage.getItem("user_name")}
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: "#fee2e2",
                            color: "#ef4444",
                            border: "none",
                            padding: "8px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
                {isMenuOpen && (
                    <div
                        className="menu-overlay"
                        onClick={() => setIsMenuOpen(false)}
                    ></div>
                )}
            </nav>

            <div className="container">
                <h1 className="title">
                    {activeTab === "Dashboard" &&
                        "Monitoring & Kontrol Smart Tani"}
                    {activeTab === "Analisis" && "Analisis Data"}
                    {activeTab === "Laporan" && "Laporan PDF & CSV"}
                    {activeTab === "ManajemenUser" && "Manajemen User"}
                </h1>

                {/* === TAB DASHBOARD === */}
                {activeTab === "Dashboard" && (
                    <div className="grid">
                        {/* 1. MASTER CONTROL (MODE OTOMATIS) */}
                        <div
                            className="card"
                            style={{
                                border: "2px solid #16a34a",
                                background: "#f0fdf4",
                            }}
                        >
                            <div className="card-header">
                                <p
                                    className="card-label"
                                    style={{
                                        margin: 0,
                                        color: "#166534",
                                        fontWeight: "bold",
                                    }}
                                >
                                    MODE OTOMATIS
                                </p>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={deviceStatus.mode_otomatis}
                                        onChange={() =>
                                            handleToggle(
                                                "mode_otomatis",
                                                deviceStatus.mode_otomatis
                                            )
                                        }
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div
                                className="status-value"
                                style={{
                                    color: deviceStatus.mode_otomatis
                                        ? "#16a34a"
                                        : "#6b7280",
                                }}
                            >
                                {deviceStatus.mode_otomatis
                                    ? "AKTIF"
                                    : "TIDAK AKTIF"}
                            </div>
                        </div>

                        {/* 2. KARTU KONTROL ALAT (Bisa diklik jika mode otomatis mati) */}
                        <ControlCard
                            label="Kontrol Kipas"
                            isOn={deviceStatus.status_kipas}
                            isDisabled={deviceStatus.mode_otomatis} // KUNCI JIKA AUTO
                            onToggle={() =>
                                handleToggle(
                                    "status_kipas",
                                    deviceStatus.status_kipas
                                )
                            }
                        />
                        <ControlCard
                            label="Kontrol Pompa"
                            isOn={deviceStatus.status_pompa}
                            isDisabled={deviceStatus.mode_otomatis} // KUNCI JIKA AUTO
                            onToggle={() =>
                                handleToggle(
                                    "status_pompa",
                                    deviceStatus.status_pompa
                                )
                            }
                        />
                        <ControlCard
                            label="Kontrol Atap"
                            isOn={deviceStatus.status_atap}
                            onText="TERBUKA"
                            offText="TERTUTUP"
                            isDisabled={deviceStatus.mode_otomatis}
                            onToggle={() =>
                                handleToggle(
                                    "status_atap",
                                    deviceStatus.status_atap
                                )
                            }
                        />

                        {/* 3. MONITORING SENSOR */}
                        <CircularGauge
                            value={sensorData.suhuRuangan}
                            max={100}
                            color="#ef4444"
                            label="Suhu Ruangan"
                            unit="°C"
                        />
                        <CircularGauge
                            value={sensorData.kelembabanRuangan}
                            max={100}
                            color="#3b82f6"
                            label="Kelembaban Ruangan"
                            unit="%"
                        />
                        <CircularGauge
                            value={parseFloat(sensorData.phAir)}
                            max={14}
                            color="#6366f1"
                            label="pH air"
                            unit=""
                        />
                        <CircularGauge
                            value={sensorData.suhuTanah}
                            max={100}
                            color="#ef4444"
                            label="Suhu Tanah"
                            unit="°C"
                        />
                        <CircularGauge
                            value={sensorData.kelembabanTanah}
                            max={100}
                            color="#3b82f6"
                            label="Kelembaban Tanah"
                            unit="%"
                        />
                        <SimpleCard
                            label="Kualitas Air"
                            value={sensorData.kualitasAir}
                            unit="PPM"
                        />
                    </div>
                )}

                {activeTab === "Analisis" && <Analisis />}
                {activeTab === "Laporan" && <Laporan />}
                {activeTab === "ManajemenUser" &&
                    userRole === "admin" &&
                    isLoggedIn && <ManajemenUser />}
            </div>
        </div>
    );
}
