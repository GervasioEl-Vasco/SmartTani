import React, { useState } from 'react';

const UserForm = ({ onAddUser, isLoading }) => {
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Kirim data ke parent, lalu reset form jika berhasil (diatur parent)
        onAddUser(newUser, () => setNewUser({ name: '', email: '', password: '' }));
    };

    return (
        <div className="bg-green-50 border border-green-100 rounded-xl p-6 mb-8 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-green-800 font-bold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                Tambah Pengguna Baru
            </h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                    <input 
                        type="text"
                        placeholder="Nama Lengkap" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
                        value={newUser.name}
                        onChange={e => setNewUser({...newUser, name: e.target.value})}
                        required
                    />
                </div>
                <div className="md:col-span-1">
                    <input 
                        type="email" 
                        placeholder="Alamat Email" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
                        value={newUser.email}
                        onChange={e => setNewUser({...newUser, email: e.target.value})}
                        required
                    />
                </div>
                <div className="md:col-span-1">
                    <input 
                        type="password" 
                        placeholder="Password (Min 6)" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
                        value={newUser.password}
                        onChange={e => setNewUser({...newUser, password: e.target.value})}
                        required
                    />
                </div>
                <div className="md:col-span-1">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Menyimpan...
                            </>
                        ) : 'Simpan User'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;