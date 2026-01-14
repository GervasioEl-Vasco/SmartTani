import React from 'react';
import ControlCard from './ControlCard';

const DeviceGrid = ({ deviceStatus, handleToggle }) => {
    return (
        <>
            <ControlCard
                label="Kipas Exhaust"
                isOn={deviceStatus.status_kipas}
                isDisabled={deviceStatus.mode_otomatis}
                onToggle={() => handleToggle("status_kipas", deviceStatus.status_kipas)}
            />
            <ControlCard
                label="Pompa Irigasi"
                isOn={deviceStatus.status_pompa}
                isDisabled={deviceStatus.mode_otomatis}
                onToggle={() => handleToggle("status_pompa", deviceStatus.status_pompa)}
            />
            <ControlCard
                label="Atap Greenhouse"
                isOn={deviceStatus.status_atap}
                onText="TERBUKA"
                offText="TERTUTUP"
                isDisabled={deviceStatus.mode_otomatis}
                onToggle={() => handleToggle("status_atap", deviceStatus.status_atap)}
            />
        </>
    );
};

export default DeviceGrid;