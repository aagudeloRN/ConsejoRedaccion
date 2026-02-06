"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { User } from '@/types';
import API_BASE_URL from '@/config/api';

export default function UserManagementPage() {
    const { currentUser } = useUser();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // New User State
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newRole, setNewRole] = useState("Editor / Analista CTI");
    const roles = ["Administrador", "Dirección Ejecutiva", "Editor / Analista CTI", "Líder CP", "Lector", "Postulador"];
    const [password, setPassword] = useState("");

    // Editing State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editName, setEditName] = useState("");
    const [editRole, setEditRole] = useState("");
    const [editPassword, setEditPassword] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/users/`);
            if (res.ok) setUsers(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/users/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, role: newRole, password: password || undefined })
            });
            if (res.ok) {
                setNewName("");
                setPassword("");
                setShowCreate(false);
                fetchUsers();
            } else {
                const err = await res.json();
                alert(err.detail || "Error al crear usuario");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setEditName(user.name);
        setEditRole(user.role);
        setEditPassword(""); // Clear password field for security/cleanness
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            const res = await fetch(`${API_BASE_URL}/users/${editingUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName,
                    role: editRole,
                    password: editPassword || undefined
                })
            });
            if (res.ok) {
                setEditingUser(null);
                fetchUsers();
            } else {
                const err = await res.json();
                alert(err.detail || "Error al actualizar usuario");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleActive = async (user: User) => {
        try {
            const res = await fetch(`${API_BASE_URL}/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !user.active })
            });
            if (res.ok) {
                fetchUsers();
            } else {
                const err = await res.json();
                alert(err.detail || "Error al cambiar estado del usuario");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión al servidor");
        }
    };

    const deleteUser = async (user: User) => {
        if (!confirm(`¿Estás seguro de eliminar a ${user.name}?`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/users/${user.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchUsers();
            } else {
                const err = await res.json();
                alert(err.detail || "Error al eliminar usuario");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión al servidor");
        }
    };

    if (currentUser?.role !== 'Administrador' && currentUser?.role !== 'Admin') {
        return <div className="p-12 text-center text-red-500 font-bold">Acceso Denegado. Solo administradores.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    </Link>
                    <h1 className="text-3xl font-bold text-rutan-primary">Gestión de Usuarios</h1>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-rutan-tertiary text-white px-4 py-2 rounded font-bold shadow-sm"
                >
                    {showCreate ? "Cancelar" : "+ Nuevo Usuario"}
                </button>
            </div>

            {showCreate && (
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-rutan-tertiary transition">
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Completo</label>
                            <input
                                required
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-rutan-blue"
                                placeholder="Ej: Maria Perez"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rol</label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                            >
                                {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña (Opcional)</label>
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-rutan-blue"
                                placeholder="Para Admin/Exec"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full bg-rutan-primary text-white py-2 rounded font-bold">Guardar Usuario</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-4 underline">Nombre</th>
                            <th className="px-6 py-4">Rol</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 italic">
                        {users.map((user) => (
                            <tr key={user.id} className={user.active ? "" : "opacity-50 grayscale"}>
                                <td className="px-6 py-4 font-bold text-gray-800">{user.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{user.role}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {user.active ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-xs font-bold text-rutan-tertiary hover:underline"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => toggleActive(user)}
                                        className="text-xs font-bold text-rutan-blue hover:underline"
                                    >
                                        {user.active ? "Desactivar" : "Reactivar"}
                                    </button>
                                    <button
                                        onClick={() => deleteUser(user)}
                                        className="text-xs font-bold text-red-500 hover:underline"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                                <input
                                    className="w-full border p-2 rounded"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Rol</label>
                                <select
                                    className="w-full border p-2 rounded"
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value)}
                                >
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nueva Contraseña (opcional)</label>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded"
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                    placeholder="Dejar en blanco para no cambiar"
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-600">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-rutan-primary text-white rounded font-bold">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
