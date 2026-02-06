"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import API_BASE_URL from '@/config/api';
import { User } from '@/types';

export default function LoginPage() {
    const { login, currentUser } = useUser();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | "">("");
    const [password, setPassword] = useState("");
    const [needsPassword, setNeedsPassword] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (currentUser) {
            router.push("/");
        }
        fetchUsers();
    }, [currentUser, router]);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/users/`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.filter((u: User) => u.active));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUserSelect = (userId: number) => {
        setSelectedUserId(userId);
        const user = users.find(u => u.id === userId);
        if (user) {
            // Check roles that require password
            const privilegedRoles = ["Administrador", "Dirección Ejecutiva", "Admin"];
            if (privilegedRoles.includes(user.role)) {
                setNeedsPassword(true);
            } else {
                setNeedsPassword(false);
            }
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!selectedUserId) return;

        try {
            // For privileged users, we verify password with backend
            if (needsPassword) {
                const res = await fetch(`${API_BASE_URL}/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: Number(selectedUserId), password })
                });

                if (res.ok) {
                    const data = await res.json();
                    login(data.user); // Context login
                    router.push("/");
                } else {
                    const err = await res.json();
                    setError(err.detail || "Error de autenticación");
                }
            } else {
                // Non-privileged users just login (Simulator mode)
                const user = users.find(u => u.id === Number(selectedUserId));
                if (user) {
                    login(user);
                    router.push("/");
                }
            }
        } catch (err) {
            console.error(err);
            setError("Error de conexión");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border-t-4 border-rutan-primary">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-rutan-primary">Consejo de Redacción</h1>
                    <p className="text-gray-500 text-sm">Repositorio CTi+E</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Selecciona tu Usuario</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-rutan-blue bg-white"
                            value={selectedUserId}
                            onChange={(e) => handleUserSelect(Number(e.target.value))}
                            required
                        >
                            <option value="">-- Seleccionar --</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.name} - {u.role}
                                </option>
                            ))}
                        </select>
                    </div>

                    {needsPassword && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
                            <input
                                type="password"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-rutan-blue"
                                placeholder="Ingresa tu clave de acceso"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <p className="text-xs text-blue-500 mt-1 cursor-help" title="Contacta a alvaro.agudelo@rutanmedellin.org">¿Olvidaste tu contraseña?</p>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-rutan-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transitionShadow shadow-lg"
                    >
                        Ingresar al Sistema
                    </button>
                </form>
            </div>
        </div>
    );
}
