import React from 'react';

export default function StatsCard({ label, value, colorClass }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
      <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${colorClass}`}>{value}</p>
    </div>
  );
}