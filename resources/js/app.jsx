import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './pages/Dashboard';

const root = createRoot(document.getElementById('app'));
root.render(
    <React.StrictMode>
        <Dashboard />
    </React.StrictMode>
);