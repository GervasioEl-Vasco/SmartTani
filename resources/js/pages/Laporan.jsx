import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReportTable from '../components/ReportTable';
import StatsCard from '../components/StatsCard';
// IMPORT CONFIG AGAR IP KONSISTEN (Supaya bisa dibuka di HP)
import API_BASE_URL from "../config";

export default function Laporan() {
    const [dataLaporan, setDataLaporan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/sensors/report?date=${selectedDate}`);

                const result = await response.json();

                const formattedData = Array.isArray(result) ? result.map(item => ({
                    ...item,
                    tanggal: new Date(item.created_at).toLocaleDateString('id-ID'),
                    waktu: new Date(item.created_at).toLocaleTimeString('id-ID'),
                    // Konversi ke boolean agar aman
                    status_pompa: Boolean(parseInt(item.status_pompa)),
                    status_kipas: Boolean(parseInt(item.status_kipas)),
                    status_kipas2: Boolean(parseInt(item.status_kipas2)),
                })) : [];

                // Kita balik urutannya biar data terbaru ada di atas (opsional)
                setDataLaporan(formattedData.reverse());
                setLoading(false);
            } catch (error) {
                console.error("Gagal ambil data:", error);
                setLoading(false);
            }
        };
        fetchData();
        
        // Auto-refresh tiap 5 menit untuk update data laporan
        const interval = setInterval(fetchData, 300000);
        
        return () => clearInterval(interval);
    }, [selectedDate]);

    // ... (Bagian Statistik) ...
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

    // --- EXPORT PDF ---
    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Laporan Monitoring SmartTani", 14, 15);
        doc.setFontSize(10);
        doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 22);

        // Mapping Data untuk PDF
        const tableRows = dataLaporan.map(item => [
            `${item.tanggal} ${item.waktu}`,
            `${item.suhu_ruangan}°C`,
            `${item.kelembaban_ruangan}%`,
            `${item.suhu_tanah}°C`,
            `${item.kelembaban_tanah}%`,
            `${item.kualitas_air} PPM`,
            item.ph_air,
            item.status_pompa ? "ON" : "OFF",
            item.status_kipas ? "ON" : "OFF",
            item.status_kipas2 ? "ON" : "OFF",
        ]);

        autoTable(doc, {
            head: [["Waktu", "Suhu Udara", "Kelembaban Ruang", "Suhu Tanah", "Kelembaban Tanah", "Kualitas Air", "pH", "Pompa", "Kipas", "Kipas2"]],
            body: tableRows,
            startY: 28,
            theme: 'grid',
            headStyles: { fillColor: [22, 163, 74] },
            styles: { fontSize: 7, cellPadding: 1 } // Font dikecilkan biar muat
        });
        doc.save(`Laporan_SmartTani_${new Date().toLocaleString('id-ID')}.pdf`);
    };

    // --- EXPORT CSV ---
    const downloadCSV = () => {
        let csv = 'No,Waktu,Suhu Ruang,Lembab Ruang,Suhu Tanah,Lembab Tanah,Kualitas Air,pH Air,Pompa,Kipas,Kipas2\n';
        dataLaporan.forEach((item, idx) => {
            csv += `${idx + 1},"${item.tanggal} ${item.waktu}",${item.suhu_ruangan},${item.kelembaban_ruangan},${item.suhu_tanah},${item.kelembaban_tanah},${item.kualitas_air},${item.ph_air},${item.status_pompa ? 'ON' : 'OFF'},${item.status_kipas ? 'ON' : 'OFF'},${item.status_kipas2 ? 'ON' : 'OFF'}\n`;
        });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        link.download = `Laporan_SmartTani_${new Date().toLocaleString('id-ID')}.csv`;
        link.click();
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Laporan Data Historis</h2>
                    <div className="mt-4">
                        <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 mb-2">Pilih Tanggal:</label>
                        <input
                            type="date"
                            id="date-picker"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={downloadCSV} disabled={loading || dataLaporan.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-bold shadow-md disabled:opacity-50 transition">
                        Download CSV
                    </button>
                    <button onClick={downloadPDF} disabled={loading || dataLaporan.length === 0} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-bold shadow-md disabled:opacity-50 transition">
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Statistik Ringkas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatsCard label="Total Data" value={dataLaporan.length} colorClass="text-blue-600" />
                <StatsCard label="Rata-rata Suhu" value={`${avgSuhu}°C`} colorClass="text-orange-500" />
                <StatsCard label="Rata-rata pH Air" value={avgPH} colorClass="text-purple-600" />
            </div>

            <ReportTable data={dataLaporan} loading={loading} />
        </div>
    );
}