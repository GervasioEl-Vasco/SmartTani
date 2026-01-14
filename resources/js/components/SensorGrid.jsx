import React from 'react';
import SimpleCard from './SimpleCard';

const SensorGrid = ({ sensorData }) => {
    return (
        <>
            <SimpleCard
                label="Suhu Ruangan"
                value={sensorData.suhuRuangan}
                max={100}
                color="#ef4444"
                unit="°C"
            />
            <SimpleCard
                label="Kelembaban Udara"
                value={sensorData.kelembabanRuangan}
                max={100}
                color="#3b82f6"
                unit="%"
            />
            <SimpleCard
                label="pH Air"
                value={parseFloat(sensorData.phAir)}
                max={14}
                color="#8b5cf6"
                unit="pH"
            />
            <SimpleCard
                label="Suhu Tanah"
                value={sensorData.suhuTanah}
                max={100}
                color="#f97316"
                unit="°C"
            />
            <SimpleCard
                label="Kelembaban Tanah"
                value={sensorData.kelembabanTanah}
                max={100}
                color="#0ea5e9"
                unit="%"
            />
            <SimpleCard
                label="Kualitas Air"
                value={sensorData.kualitasAir}
                unit="PPM"
            />
        </>
    );
};

export default SensorGrid;