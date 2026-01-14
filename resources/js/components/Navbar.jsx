import React, { useState } from 'react';

const Navbar = ({ activeTab, setActiveTab, userRole }) => {
    const [isOpen, setIsOpen] = useState(false);

    const menus = [
        { id: 'Dashboard', label: 'Monitoring' },
        { id: 'Analisis', label: 'Analisis' },
        { id: 'Laporan', label: 'Laporan' },
    ];

    if (userRole === 'admin') {
        menus.push({ id: 'ManajemenUser', label: 'Users' });
    }

    return (
        // BACKGROUND: Gradient Hijau Tua -> Hijau Segar (Lebih Smooth)
        <nav className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-800 shadow-xl sticky top-0 z-50 border-b border-white/5 backdrop-blur-lg font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* --- LOGO SECTION --- */}
                    <div className="flex items-center gap-3">

                            <img
                                className="h-12 w-auto object-contain"
                                src="images/logo.png"
                                alt="SmartTani Logo"
                            />
                    </div>

                    {/* --- MENU DESKTOP (Garis Halus & Animasi) --- */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-8">
                            {menus.map((menu) => {
                                const isActive = activeTab === menu.id;
                                return (
                                    <button
                                        key={menu.id}
                                        onClick={() => setActiveTab(menu.id)}
                                        className="relative group py-2"
                                    >
                                        {/* Teks Menu */}
                                        <span className={`text-sm font-medium transition-colors duration-300 ${
                                            isActive ? 'text-white font-bold' : 'text-emerald-100/80 group-hover:text-white'
                                        }`}>
                                            {menu.label}
                                        </span>

                                        {/* GARIS BAWAH HALUS (Rounded & Animated) */}
                                        <span className={`absolute bottom-0 left-0 h-[3px] rounded-full transition-all duration-300 ease-out ${
                                            isActive 
                                                ? 'w-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]' // Aktif: Hijau muda bercahaya
                                                : 'w-0 bg-white/50 group-hover:w-full' // Hover: Putih pudar setengah
                                        }`}></span>
                                    </button>
                                );
                            })}
                            
                            {/* Tombol Logout Desktop */}
                            <div className="pl-6 ml-2 border-l border-white/10">
                                <button 
                                    onClick={() => { localStorage.clear(); window.location.reload(); }}
                                    className="text-red-300 hover:text-red-100 text-sm font-semibold transition-colors duration-200 flex items-center gap-2 px-3 py-1 rounded-full hover:bg-red-500/20"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- TOMBOL HAMBURGER MOBILE --- */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
                        >
                            {!isOpen ? (
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MENU MOBILE (Warna Diperbaiki) --- */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                {/* Background disesuaikan agar nyambung dengan navbar atas (Hijau Gelap) */}
                <div className="px-3 pt-2 pb-4 space-y-2 bg-emerald-900 border-t border-white/5 shadow-inner">
                    {menus.map((menu) => {
                        const isActive = activeTab === menu.id;
                        return (
                            <button
                                key={menu.id}
                                onClick={() => {
                                    setActiveTab(menu.id);
                                    setIsOpen(false);
                                }}
                                // Gaya Mobile: Soft Glow Background (Bukan garis kasar lagi)
                                className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                                    isActive
                                        ? 'bg-white/10 text-white shadow-lg backdrop-blur-md border border-white/10' // Aktif: Transparan putih lembut
                                        : 'text-emerald-200/70 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Indikator Titik Kecil saat Aktif */}
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_currentColor]"></div>}
                                    {menu.label}
                                </div>
                            </button>
                        );
                    })}
                    
                    {/* Logout Mobile */}
                    <div className="pt-3 mt-2 border-t border-white/5">
                        <button 
                            onClick={() => { localStorage.clear(); window.location.reload(); }}
                            className="w-full flex items-center gap-2 text-red-300 hover:text-white hover:bg-red-500/20 px-4 py-3 rounded-xl text-base font-medium transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;