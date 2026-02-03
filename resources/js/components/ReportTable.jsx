import React from 'react';

export default function ReportTable({ data, loading }) {
  if (loading) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
        <p className="text-gray-400 text-sm">Memuat data tabel...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-400">Belum ada data laporan.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suhu R.</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lembab R.</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suhu T.</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lembab T.</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">kualitas air</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">pH Air</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                <div className="font-medium">{item.tanggal}</div>
                <div className="text-xs text-gray-500">{item.waktu}</div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{item.suhu_ruangan}°C</td>
              <td className="px-4 py-3 text-sm text-gray-600">{item.kelembaban_ruangan}%</td>
              <td className="px-4 py-3 text-sm text-gray-600">{item.suhu_tanah}°C</td>
              <td className="px-4 py-3 text-sm text-gray-600">{item.kelembaban_tanah}%</td>
              <td className="px-4 py-3 text-sm text-gray-600">{item.kualitas_air}PPM</td>
              <td className="px-4 py-3 text-sm text-gray-600 font-medium text-purple-600">{item.ph_air}</td>
              <td className="px-4 py-3 text-sm text-center space-x-1">
                {/* Badge Status Mini */}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status_pompa ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                  P
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status_kipas ? 'bg-green-100 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
                  K
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status_kipas2 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  K2
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}