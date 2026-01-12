import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../../css/analisis.css'; 

export default function Analisis() {
    const [chartData, setChartData] = useState({
        suhuRuangan: [],
        kelembabanRuangan: [],
        suhuTanah: [],
        kelembabanTanah: [],
        phAir: [],
        kualitasAir: []
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    const BASE_URL = 'http://127.0.0.1:8000'; 
    const HISTORY_ENDPOINT = '/api/sensors/history';

    const fetchHistoryData = async () => {
        try {
            const response = await fetch(`${BASE_URL}${HISTORY_ENDPOINT}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            const formatTime = (isoString) => {
                const date = new Date(isoString);
                return date.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                });
            };

            const formatted = {
                suhuRuangan: data.map(item => ({
                    time: formatTime(item.created_at),
                    value: parseFloat(item.suhu_ruangan) || 0
                })).slice(-20), // Ambil 20 data terakhir
                kelembabanRuangan: data.map(item => ({
                    time: formatTime(item.created_at),
                    value: parseFloat(item.kelembaban_ruangan) || 0
                })).slice(-20),
                suhuTanah: data.map(item => ({
                    time: formatTime(item.created_at),
                    value: parseFloat(item.suhu_tanah) || 0
                })).slice(-20),
                kelembabanTanah: data.map(item => ({
                    time: formatTime(item.created_at),
                    value: parseFloat(item.kelembaban_tanah) || 0
                })).slice(-20),
                phAir: data.map(item => ({
                    time: formatTime(item.created_at),
                    value: parseFloat(item.ph_air) || 0
                })).slice(-20),
                kualitasAir: data.map(item => ({
                    time: formatTime(item.created_at),
                    value: parseFloat(item.kualitas_air) || 0
                })).slice(-20)
            };
            
            setChartData(formatted);
            setLastUpdate(new Date());
            setLoading(false);
            setError(null);
        } catch (error) {
            console.error('Error fetching history data:', error);
            setError('Gagal memuat data. Silakan coba lagi.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistoryData();
        const interval = setInterval(fetchHistoryData, 5000); 
        return () => clearInterval(interval);
    }, []);

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-time">{label}</p>
                    <p className="tooltip-value">
                        Nilai: <strong>{payload[0].value.toFixed(2)}</strong>
                    </p>
                </div>
            );
        }
        return null;
    };

    // Komponen Chart dengan desain lebih baik
    const ChartCard = ({ title, data, color, unit, yMax = 100, icon }) => {
        const latestValue = data.length > 0 ? data[data.length - 1].value : 0;
        
        return (
            <div className="chart-card">
                <div className="chart-header">
                    <div className="chart-title-wrapper">
                        {icon && <span className="chart-icon">{icon}</span>}
                        <h3 className="chart-title">{title}</h3>
                    </div>
                    <div className="chart-value-display">
                        <span className="current-value">{latestValue.toFixed(1)}</span>
                        <span className="value-unit">{unit}</span>
                    </div>
                </div>
                
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                            data={data} 
                            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                        >
                            <defs>
                                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={color} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                            <XAxis 
                                dataKey="time" 
                                tick={{ fontSize: 10, fill: '#6b7280' }}
                                interval="preserveEnd"
                                angle={-15}
                                textAnchor="end"
                                height={50}
                            />
                            <YAxis 
                                domain={[0, yMax]}
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                width={40}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={color}
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: color, strokeWidth: 2, stroke: '#fff' }}
                                fill={`url(#gradient-${title})`}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="chart-footer">
                    <span className="data-points">
                        {data.length} data points
                    </span>
                </div>
            </div>
        );
    };

    if (loading && chartData.suhuRuangan.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Memuat data analisis...</p>
            </div>
        );
    }

    return (
        <div className="analisis-content">
            {/* Header Section */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Analisis Data Sensor</h1>
                    <p className="page-subtitle">Monitoring real-time data lingkungan hidroponik</p>
                </div>
                {lastUpdate && (
                    <div className="last-update">
                        <span className="update-indicator"></span>
                        <span>Update terakhir: {lastUpdate.toLocaleTimeString('id-ID')}</span>
                    </div>
                )}
            </div>

            {error && (
                <div className="error-banner">
                     {error}
                    <button onClick={fetchHistoryData} className="retry-btn">Coba Lagi</button>
                </div>
            )}

            {/* Charts Grid */}
            <div className="charts-grid">
                <ChartCard 
                    title="Suhu Ruangan" 
                    data={chartData.suhuRuangan} 
                    color="#ef4444"
                    unit="°C"
                    yMax={50}
                />
                <ChartCard 
                    title="Kelembaban Ruangan" 
                    data={chartData.kelembabanRuangan} 
                    color="#3b82f6"
                    unit="%"
                    yMax={100}
                />
                <ChartCard 
                    title="Suhu Tanah" 
                    data={chartData.suhuTanah} 
                    color="#f59e0b"
                    unit="°C"
                    yMax={50}
                />
                <ChartCard 
                    title="Kelembaban Tanah" 
                    data={chartData.kelembabanTanah} 
                    color="#10b981"
                    unit="%"
                    yMax={100}
                />
                <ChartCard 
                    title="pH Air" 
                    data={chartData.phAir} 
                    color="#8b5cf6"
                    unit="pH"
                    yMax={14}
                />
                <ChartCard 
                    title="Kualitas Air" 
                    data={chartData.kualitasAir} 
                    color="#6366f1"
                    unit="PPM"
                    yMax={500}
                />
            </div>
        </div>
    );
}