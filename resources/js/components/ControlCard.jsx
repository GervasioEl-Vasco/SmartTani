import React from 'react';

const ControlCard = ({ label, isOn, onToggle, isDisabled, onText = "NYALA", offText = "MATI" }) => {
    return (
        <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}>
            <div className="flex justify-between items-center mb-4">
                <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">{label}</p>
                {/* Switch Toggle */}
                <div 
                    onClick={!isDisabled ? onToggle : undefined}
                    className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isOn ? 'bg-green-500' : 'bg-gray-300'} ${isDisabled ? 'cursor-not-allowed' : ''}`}
                >
                    <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isOn ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
            </div>
            <div className={`text-2xl font-bold tracking-tight ${isOn ? "text-green-600" : "text-gray-400"}`}>
                {isOn ? onText : offText}
            </div>
        </div>
    );
};

export default ControlCard;