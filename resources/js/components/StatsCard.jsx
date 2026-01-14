import React from 'react';

const StatsCard = ({ label, value, colorClass }) => {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">{label}</span>
            <span className={`text-2xl font-extrabold mt-1 ${colorClass}`}>
                {value}
            </span>
        </div>
    );
};

export default StatsCard;