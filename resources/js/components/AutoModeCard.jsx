import React from 'react';

const AutoModeCard = ({ isAuto, onToggle }) => {
    return (
        <div className="lg:col-span-3 bg-green-50 border-2 border-green-500 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center transition-all hover:shadow-md">
            <div className="mb-4 sm:mb-0">
                <h3 className="text-green-800 font-bold text-lg flex items-center gap-2">
                    MODE OTOMATIS
                </h3>
            </div>

            <div className="flex items-center gap-4">
                <span className={`font-bold text-sm ${isAuto ? "text-green-700" : "text-gray-500"}`}>
                    {isAuto ? "AKTIF" : "NON-AKTIF"}
                </span>
                
                {/* Custom Toggle Switch */}
                <div 
                    onClick={onToggle}
                    className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isAuto ? 'bg-green-600' : 'bg-gray-300'}`}
                >
                    <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isAuto ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
            </div>
        </div>
    );
};

export default AutoModeCard;