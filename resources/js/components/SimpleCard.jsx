import React from 'react';

const SimpleCard = ({ label, value, unit }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-2">{label}</p>
            <div className="text-4xl font-extrabold text-teal-600">{value}</div>
            <p className="text-sm font-medium text-gray-400 mt-1">{unit}</p>
        </div>
    );
};

export default SimpleCard;