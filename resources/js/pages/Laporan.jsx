import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReportTable from '../components/ReportTable';
import StatsCard from '../components/StatsCard';

export default function Laporan() {
    const [dataLaporan, setDataLaporan] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pastikan ini mengarah ke endpoint REPORT yang baru
    const BASE_URL = 'http://127.0.0.1:8000'; 
    const API_ENDPOINT = '/api/sensors/report';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${BASE_URL}${API_ENDPOINT}`);
                const result = await response.json();
                
                const formattedData = Array.isArray(result) ? result.map(item => ({
                    ...item,
                    tanggal: new Date(item.created_at).toLocaleDateString('id-ID'),
                    waktu: new Date(item.created_at).toLocaleTimeString('id-ID'),
                    // Konversi ke boolean agar aman
                    status_pompa: Boolean(item.status_pompa),
                    status_kipas: Boolean(item.status_kipas),
                    status_atap: Boolean(item.status_atap),
                })) : [];

                setDataLaporan(formattedData);
                setLoading(false);
            } catch (error) {
                console.error("Gagal ambil data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ... (Bagian Statistik Biarkan Saja) ...
    const avgSuhu = useMemo(() => {
        if (dataLaporan.length === 0) return 0;
        const total = dataLaporan.reduce((acc, curr) => acc + parseFloat(curr.suhu_ruangan || 0), 0);
        return (total / dataLaporan.length).toFixed(1);
    }, [dataLaporan]);

    const avgPH = useMemo(() => {
        if (dataLaporan.length === 0) return 0;
        const total = dataLaporan.reduce((acc, curr) => acc + parseFloat(curr.ph_air || 0), 0);
        return (total / dataLaporan.length).toFixed(1);
    }, [dataLaporan]);

    // --- UPDATE EXPORT PDF (SESUAIKAN KOLOM) ---
    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Laporan Monitoring SmartTani", 14, 15);
        doc.setFontSize(10);
        doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 22);

        // Mapping Data untuk PDF
        const tableRows = dataLaporan.map(item => [
            `${item.tanggal} ${item.waktu}`,
            `${item.suhu_ruangan}°C`,      // Pakai snake_case
            `${item.kelembaban_ruangan}%`, // Pakai snake_case
            `${item.suhu_tanah}°C`,         // Pakai snake_case
            `${item.kelembaban_tanah}%`,   // Pakai snake_case
            item.ph_air,
            item.status_pompa ? "ON" : "OFF",
            item.status_kipas ? "ON" : "OFF",
            item.status_atap ? "BUKA" : "TUTUP"
        ]);

        autoTable(doc, {
            // Header harus 9 kolom sesuai data di atas
            head: [["Waktu", "Suhu", "Hum", "Suhu T", "Hum T", "pH", "Pompa", "Kipas", "Atap"]],
            body: tableRows,
            startY: 28,
            theme: 'grid',
            headStyles: { fillColor: [22, 163, 74] },
            styles: { fontSize: 8 }
        });
        doc.save(`Laporan_${Date.now()}.pdf`);
    };

    // --- UPDATE EXPORT CSV (SESUAIKAN KOLOM) ---
    const downloadCSV = () => {
        let csv = 'No,Waktu,Suhu Ruang,Lembab Ruang,Suhu Tanah,Lembab Tanah,pH Air,Pompa,Kipas,Atap\n';
        dataLaporan.forEach((item, idx) => {
            csv += `${idx + 1},"${item.tanggal} ${item.waktu}",${item.suhu_ruangan},${item.kelembaban_ruangan},${item.suhu_tanah},${item.kelembaban_tanah},${item.ph_air},${item.status_pompa ? 'ON' : 'OFF'},${item.status_kipas ? 'ON' : 'OFF'},${item.status_atap ? 'BUKA' : 'TUTUP'}\n`;
        });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        link.download = `Laporan_${Date.now()}.csv`;
        link.click();
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in-up">
            {/* Header sama seperti sebelumnya */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">📄 Laporan Data Historis</h2>
                    <p className="text-gray-500 text-sm mt-1">Mengambil data lengkap dari Database MySQL</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={downloadCSV} disabled={loading || dataLaporan.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-bold shadow-md disabled:opacity-50">CSV</button>
                    <button onClick={downloadPDF} disabled={loading || dataLaporan.length === 0} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-bold shadow-md disabled:opacity-50">PDF</button>
                </div>
            </div>

            {/* Statistik */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatsCard label="Total Data" value={dataLaporan.length} colorClass="text-blue-600" />
                <StatsCard label="Rata-rata Suhu" value={`${avgSuhu}°C`} colorClass="text-orange-500" />
                <StatsCard label="Rata-rata pH Air" value={avgPH} colorClass="text-purple-600" />
            </div>

            <ReportTable data={dataLaporan} loading={loading} />
        </div>
    );
}