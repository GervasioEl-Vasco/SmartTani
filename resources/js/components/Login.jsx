import React, { useState } from 'react';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Simpan token di LocalStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user_name', data.user.name);
                localStorage.setItem('user_role', data.user.role);
                // Panggil fungsi parent untuk update status login
                onLogin();
            } else {
                setError(data.message || 'Login gagal');
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi');
        }
        setLoading(false);
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.card}>
                <div style={styles.logoContainer}>
                    {/* Ganti path logo jika ada */}
                    <div style={styles.logoCircle}>🌾</div> 
                </div>
                <h2 style={styles.title}>Smart Tani Login</h2>
                <p style={styles.subtitle}>Masuk untuk memantau Greenhouse</p>

                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input 
                            type="email" 
                            style={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input 
                            type="password" 
                            style={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p style={styles.error}>{error}</p>}

                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Memproses...' : 'MASUK'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    wrapper: {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Segoe UI, sans-serif'
    },
    card: {
        background: 'white', padding: '2.5rem', borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px'
    },
    logoContainer: { display: 'flex', justifyContent: 'center', marginBottom: '1rem' },
    logoCircle: {
        width: '60px', height: '60px', background: '#16a34a', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', color: 'white'
    },
    title: { textAlign: 'center', color: '#1f2937', marginBottom: '0.5rem', marginTop: 0 },
    subtitle: { textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', marginBottom: '2rem' },
    inputGroup: { marginBottom: '1.5rem' },
    label: { display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '500' },
    input: {
        width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db',
        fontSize: '1rem', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box'
    },
    button: {
        width: '100%', padding: '0.875rem', backgroundColor: '#16a34a', color: 'white',
        border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
        marginTop: '1rem'
    },
    error: { color: '#ef4444', textAlign: 'center', fontSize: '0.875rem', marginTop: '-0.5rem', marginBottom: '1rem' }
};