import React, { useState, useEffect } from "react";
import UserForm from "../components/UserForm"; // Import Form
import UserTable from "../components/UserTable"; // Import Tabel
import API_BASE_URL from "../config";

export default function ManajemenUser() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const token = localStorage.getItem("token");
    const authHeaders = {
        "Content-Type": "application/json",
        'Accept': 'application/json',
        Authorization: `Bearer ${token}`,
    };

    // --- 1. FETCH USERS ---
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/users`, {
                headers: authHeaders,
            });

            if (response.status === 401) {
                alert("Sesi habis. Silakan login ulang.");
                localStorage.clear();
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

    useEffect(() => {
        fetchUsers();
    }, []);

    // --- 2. ADD USER LOGIC (VERSI LEBIH DETAIL) ---
    const handleAddUser = async (newUser, onSuccess) => {
        // Validasi Frontend
        if (newUser.password.length < 6) {
            alert("Password minimal 6 karakter!");
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify(newUser),
            });
            const data = await response.json();

            if (response.ok) {
                alert("User berhasil dibuat!");
                onSuccess();
                fetchUsers();
            } else {
                // --- UPDATE BAGIAN INI ---
                // Cek apakah Laravel mengirim detail error validasi
                if (data.errors) {
                    let pesanError = "";
                    Object.keys(data.errors).forEach((key) => {
                        pesanError += `• ${data.errors[key][0]}\n`;
                    });
                    alert("Gagal Validasi:\n" + pesanError);
                } else {
                    // Jika error umum (bukan validasi)
                    alert(
                        "Gagal: " +
                            (data.message || "Terjadi kesalahan server."),
                    );
                }
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan koneksi internet/server.");
        }
        setSubmitting(false);
    };

    // --- 3. DELETE USER LOGIC ---
    const handleDelete = async (id, name) => {
        if (
            !confirm(
                `Yakin ingin menghapus user "${name}"? Akses login mereka akan hilang.`,
            )
        )
            return;

        try {
            // PERBAIKAN URL:
            const response = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
                method: "DELETE",
                headers: authHeaders,
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
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 min-h-screen animate-fade-in-up">
            {/* Header */}
            <div className="mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    Manajemen Pengguna
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    Kelola akses dan daftar pengguna sistem
                </p>
            </div>

            {/* Panggil Komponen Form */}
            <UserForm onAddUser={handleAddUser} isLoading={submitting} />

            {/* Panggil Komponen Tabel */}
            <UserTable
                users={users}
                loading={loading}
                onDelete={handleDelete}
            />
        </div>
    );
}
