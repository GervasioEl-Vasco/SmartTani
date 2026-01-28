import React from 'react';
import ControlCard from './ControlCard';

const DeviceGrid = ({ deviceStatus, handleToggle }) => {
    return (
        <>
            <ControlCard
                label="Kipas Exhaust 1"
                isOn={deviceStatus.status_kipas}
                isDisabled={deviceStatus.mode_otomatis}
                onToggle={() => handleToggle("status_kipas", deviceStatus.status_kipas)}
            />
            <ControlCard
                label="Pompa Air"
                isOn={deviceStatus.status_pompa}
                isDisabled={deviceStatus.mode_otomatis}
                onToggle={() => handleToggle("status_pompa", deviceStatus.status_pompa)}
                
            />
            <ControlCard
                label="Pompa"
                isOn={deviceStatus.status_kipas2}
                isDisabled={deviceStatus.mode_otomatis}
                onToggle={() => handleToggle("status_kipas2", deviceStatus.status_kipas2)}

            />
        </>
    );
};

export default DeviceGrid;