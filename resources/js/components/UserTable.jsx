import React from 'react';

const UserTable = ({ users, loading, onDelete }) => {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Pengguna</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Terdaftar Sejak</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {loading ? (
                        <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">Memuat data pengguna...</td></tr>
                    ) : users.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">Belum ada user lain.</td></tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-center text-gray-500">#{user.id}</td>
                                <td className="px-6 py-4 font-semibold text-gray-800 flex items-center gap-3">
                                    {/* Avatar Inisial */}
                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold uppercase shadow-sm border border-green-200">
                                        {user.name.charAt(0)}
                                    </div>
                                    {user.name}
                                </td>
                                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                <td className="px-6 py-4 text-center text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => onDelete(user.id, user.name)}
                                        className="text-red-500 hover:text-white bg-red-50 hover:bg-red-500 px-3 py-1.5 rounded-md text-xs font-bold transition-all border border-red-200 hover:border-red-500 shadow-sm"
                                        title="Hapus User Ini"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            {/* Footer Tabel */}
            {!loading && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-right text-xs text-gray-400">
                    Total Pengguna: {users.length}
                </div>
            )}
        </div>
    );
};

export default UserTable;