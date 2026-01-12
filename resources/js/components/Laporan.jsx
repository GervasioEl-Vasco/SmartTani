import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <--- PERBAIKAN 1: Import sebagai fungsi
import '../../css/laporan.css';

export default function Laporan() {
    const [dataLaporan, setDataLaporan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    // ===== KONFIGURASI BACKEND =====
    const BASE_URL = 'http://127.0.0.1:8000'; 
    const API_ENDPOINT = '/api/sensors/history';

    // 1. Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${BASE_URL}${API_ENDPOINT}`);
                const result = await response.json();
                
                if (Array.isArray(result)) {
                    setDataLaporan(result);
                } else {
                    setDataLaporan([]); 
                }
                setLoading(false);
            } catch (error) {
                console.error("Gagal ambil data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 2. Format Waktu
    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // 3. Filter Data
    const getFilteredData = () => {
        const now = new Date();
        return dataLaporan.filter(item => {
            const itemDate = new Date(item.created_at);
            switch(filter) {
                case 'today':
                    return itemDate.toDateString() === now.toDateString();
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return itemDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return itemDate >= monthAgo;
                default:
                    return true;
            }
        });
    };

    const filteredData = getFilteredData();

    // 4. Download PDF 
    const downloadPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        // Judul & Info
        doc.text("Laporan Monitoring SmartTani", pageWidth / 2, 17, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Periode Filter: ${filter.toUpperCase()}`, 14, 22);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 27);

        // Siapkan Data Tabel PDF
        const tableColumn = ["Waktu", "Suhu", "Hum", "Suhu Tanah","Kelembaban Tanah", "pH", "Kipas", "Pompa", "Atap"];
        const tableRows = [];

        filteredData.forEach(item => {
            const rowData = [
                formatDateTime(item.created_at),
                `${item.suhu_ruangan}°C`,
                `${item.kelembaban_ruangan}%`,
                `${item.suhu_tanah}°C`,
                `${item.kelembaban_tanah}%`,
                item.ph_air,
                item.status_kipas ? "ON" : "OFF",
                item.status_pompa ? "ON" : "OFF",
                item.status_atap ? "OPEN" : "CLOSE"
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 32,
            theme: 'grid',
            headStyles: { fillColor: [22, 163, 74] }, 
            styles: { fontSize: 8, cellPadding: 2 },
        });

        doc.save(`Laporan_SmartTani_${filter}.pdf`);
    };

    // 5. Download CSV
    const downloadCSV = () => {
        let csv = 'No,Waktu,Suhu Ruang,Kelembaban Ruang,Suhu Tanah,Kelembaban Tanah,pH Air,Kualitas Air,Kipas,Pompa,Atap\n';
        
        filteredData.forEach((item, index) => {
            csv += `${index + 1},`;
            csv += `"${formatDateTime(item.created_at)}",`;
            csv += `${item.suhu_ruangan},`;
            csv += `${item.kelembaban_ruangan},`;
            csv += `${item.suhu_tanah},`;
            csv += `${item.kelembaban_tanah},`;
            csv += `${item.ph_air},`;
            csv += `${item.kualitas_air},`;
            csv += `${item.status_kipas ? 'NYALA' : 'MATI'},`;
            csv += `${item.status_pompa ? 'NYALA' : 'MATI'},`;
            csv += `${item.status_atap ? 'TERBUKA' : 'TERTUTUP'}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Laporan_${filter}_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
    };

    return (
        <div className="laporan-wrapper">
            <div className="container">
                <div className="report-card">
                    {/* Header & Actions */}
                    <div className="report-header">
                        <div>
                            <h2 className="report-title">Laporan Data Sensor</h2>
                            <p className="report-subtitle">Rekap data historis kondisi Greenhouse</p>
                        </div>
                        
                        <div className="actions-container">
                            <select 
                                value={filter} 
                                onChange={(e) => setFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">Semua Data</option>
                                <option value="today">Hari Ini</option>
                                <option value="week">7 Hari Terakhir</option>
                                <option value="month">30 Hari Terakhir</option>
                            </select>
                            
                            <button onClick={downloadCSV} disabled={loading || filteredData.length === 0} className="btn-action btn-csv">
                                CSV
                            </button>
                            
                            <button onClick={downloadPDF} disabled={loading || filteredData.length === 0} className="btn-action btn-pdf">
                                PDF
                            </button>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">Total Data</div>
                            <div className="stat-value">{filteredData.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Rata-rata Suhu</div>
                            <div className="stat-value">
                                {filteredData.length > 0 
                                    ? (filteredData.reduce((sum, item) => sum + parseFloat(item.suhu_ruangan), 0) / filteredData.length).toFixed(1)
                                    : 0}°C
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Rata-rata pH Air</div>
                            <div className="stat-value">
                                {filteredData.length > 0 
                                    ? (filteredData.reduce((sum, item) => sum + parseFloat(item.ph_air), 0) / filteredData.length).toFixed(1)
                                    : 0}
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="text-center">No</th>
                                    <th>Waktu</th>
                                    <th className="text-center">Suhu R.</th>
                                    <th className="text-center">Hum R.</th>
                                    <th className="text-center">Suhu T.</th>
                                    <th className="text-center">Hum T.</th>
                                    <th className="text-center">pH Air</th>
                                    <th className="text-center">Kualitas</th>
                                    <th className="text-center">K</th>
                                    <th className="text-center">P</th>
                                    <th className="text-center">A</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="10" className="text-center p-4">Memuat data...</td></tr>
                                ) : filteredData.length === 0 ? (
                                    <tr><td colSpan="10" className="text-center p-4">Tidak ada data untuk filter ini.</td></tr>
                                ) : (
                                    filteredData.map((item, index) => (
                                        <tr key={index}>
                                            <td className="text-center">{index + 1}</td>
                                            <td>{formatDateTime(item.created_at)}</td>
                                            <td className="text-center">{item.suhu_ruangan}°C</td>
                                            <td className="text-center">{item.kelembaban_ruangan}%</td>
                                            <td className="text-center">{item.suhu_tanah}°C</td>
                                            <td className="text-center">{item.kelembaban_tanah}%</td>
                                            <td className="text-center">{item.ph_air}</td>
                                            <td className="text-center">{item.kualitas_air}</td>
                                            <td className="text-center"><span className={`status-badge ${item.status_kipas ? 'bg-green' : 'bg-gray'}`}>{item.status_kipas ? 'ON' : 'OFF'}</span></td>
                                            <td className="text-center"><span className={`status-badge ${item.status_pompa ? 'bg-green' : 'bg-gray'}`}>{item.status_pompa ? 'ON' : 'OFF'}</span></td>
                                            <td className="text-center"><span className={`status-badge ${item.status_atap ? 'bg-green' : 'bg-gray'}`}>{item.status_atap ? 'OP' : 'CL'}</span></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
                         <span>*K: Kipas, P: Pompa, A: Atap</span>
                         <span>Menampilkan {filteredData.length} data</span>
                    </div>
                </div>
            </div>
        </div>
    );
}