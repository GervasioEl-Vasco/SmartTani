import React, { useState, useEffect } from 'react';
import '../../css/laporan.css'; // Gunakan CSS yang sama agar rapi

export default function ManajemenUser() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(true);

    const BASE_URL = 'http://127.0.0.1:8000';
    const token = localStorage.getItem('token'); 

    // Header wajib ada Token agar dikenali Laravel
    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 1. Fetch Users (Route: /api/auth/users)
    const fetchUsers = async () => {
        setLoading(true);
        try {
            // PERBAIKAN: Tambahkan /auth/
            const response = await fetch(`${BASE_URL}/api/auth/users`, { headers: authHeaders });
            
            if (response.status === 401) {
                alert("Sesi habis. Silakan login ulang.");
                window.location.reload();
                return;
            }

            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error:", error);
        }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, []);

    // 2. Tambah User (Route: /api/auth/register)
    const handleAddUser = async (e) => {
        e.preventDefault();
        if (newUser.password.length < 6) {
            alert("Password minimal 6 karakter!");
            return;
        }

        try {
            // PERBAIKAN: Tambahkan /auth/
            const response = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify(newUser)
            });
            
            const data = await response.json();

            if(response.ok) {
                alert("✅ User berhasil dibuat!");
                setNewUser({ name: '', email: '', password: '' }); // Reset form
                fetchUsers(); // Refresh tabel otomatis
            } else {
                alert("❌ Gagal: " + (data.message || "Email mungkin sudah dipakai."));
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan koneksi.");
        }
    };

    // 3. Hapus User (Route: /api/auth/users/{id})
    const handleDelete = async (id) => {
        if(!confirm("Yakin ingin menghapus user ini? Akses login mereka akan hilang.")) return;

        try {
            // PERBAIKAN: Tambahkan /auth/
            const response = await fetch(`${BASE_URL}/api/auth/users/${id}`, {
                method: 'DELETE',
                headers: authHeaders
            });

            if (response.ok) {
                fetchUsers();
            } else {
                alert("Gagal menghapus user.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="laporan-wrapper">
            <div className="container">
                <div className="report-card">
                    <div className="report-header">
                        <div>
                            <h2 className="report-title">👥 Manajemen Pengguna</h2>
                            <p className="report-subtitle">Kelola siapa saja yang bisa mengakses sistem ini</p>
                        </div>
                    </div>
                    
                    {/* Form Tambah User */}
                    <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '2rem' }}>
                        <h3 style={{fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#166534'}}>+ Tambah Pengguna Baru</h3>
                        <form onSubmit={handleAddUser} className="actions-container" style={{flexWrap: 'wrap'}}>
                            <input 
                                placeholder="Nama Lengkap" 
                                className="filter-select"
                                style={{flex: 1}}
                                value={newUser.name}
                                onChange={e => setNewUser({...newUser, name: e.target.value})}
                                required
                            />
                            <input 
                                type="email" 
                                placeholder="Email Login" 
                                className="filter-select"
                                style={{flex: 1}}
                                value={newUser.email}
                                onChange={e => setNewUser({...newUser, email: e.target.value})}
                                required
                            />
                            <input 
                                type="password" 
                                placeholder="Password (Min 6)" 
                                className="filter-select"
                                style={{flex: 1}}
                                value={newUser.password}
                                onChange={e => setNewUser({...newUser, password: e.target.value})}
                                required
                            />
                            <button type="submit" className="btn-action btn-pdf">
                                Simpan User
                            </button>
                        </form>
                    </div>

                    {/* Tabel User */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="text-center">ID</th>
                                    <th>Nama Pengguna</th>
                                    <th>Email</th>
                                    <th className="text-center">Tanggal Dibuat</th>
                                    <th className="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center p-4">Memuat data pengguna...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center p-4">Tidak ada data.</td></tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user.id}>
                                            <td className="text-center">{user.id}</td>
                                            <td style={{fontWeight: 'bold', color: '#1f2937'}}>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td className="text-center">
                                                {new Date(user.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="text-center">
                                                {/* Jangan biarkan user menghapus dirinya sendiri */}
                                                {user.email === localStorage.getItem('user_email') ? (
                                                    <span className="status-badge bg-green">Akun Anda</span>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleDelete(user.id)}
                                                        style={{
                                                            background: '#fee2e2', color: '#ef4444', 
                                                            padding: '6px 12px', borderRadius: '6px', 
                                                            border: '1px solid #fecaca', cursor: 'pointer', 
                                                            fontSize: '12px', fontWeight: 'bold'
                                                        }}
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}