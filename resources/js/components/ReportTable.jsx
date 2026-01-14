import React from 'react';

const ReportTable = ({ data, loading }) => {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-green-50">
                    <tr>
                        <th className="px-4 py-3 text-left font-bold text-green-800">Waktu</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-600">Suhu Udara</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-600">Lembab Udara</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-600">Suhu Tanah</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-600">Lembab Tanah</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-600">pH Air</th>
                        
                        {/* --- STATUS DIPISAH JADI 3 KOLOM --- */}
                        <th className="px-4 py-3 text-center font-bold text-gray-600">Pompa</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-600">Kipas</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-600">Atap</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {loading ? (
                        <tr><td colSpan="9" className="p-4 text-center text-gray-400">Menunggu data...</td></tr>
                    ) : data.length === 0 ? (
                        <tr><td colSpan="9" className="p-4 text-center text-gray-400">Belum ada data terekam.</td></tr>
                    ) : (
                        data.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                                    {item.tanggal} <span className="text-xs font-bold text-gray-400 ml-1">{item.waktu}</span>
                                </td>
                                
                                {/* PERBAIKAN: Gunakan snake_case (suhu_ruangan) sesuai database MySQL */}
                                <td className="px-4 py-2 text-center font-medium">{item.suhu_ruangan}°C</td>
                                <td className="px-4 py-2 text-center">{item.kelembaban_ruangan}%</td>
                                <td className="px-4 py-2 text-center">{item.suhu_tanah}°C</td>
                                <td className="px-4 py-2 text-center">{item.kelembaban_tanah}%</td>
                                <td className="px-4 py-2 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.ph_air < 6 || item.ph_air > 8 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {item.ph_air}
                                    </span>
                                </td>

                                {/* --- STATUS DIPISAH --- */}
                                <td className="px-4 py-2 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.status_pompa ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                        {item.status_pompa ? 'ON' : 'OFF'}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.status_kipas ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
                                        {item.status_kipas ? 'ON' : 'OFF'}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.status_atap ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                                        {item.status_atap ? 'BUKA' : 'TUTUP'}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ReportTable;