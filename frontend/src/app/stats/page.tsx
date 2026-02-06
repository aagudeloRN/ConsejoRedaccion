"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import API_BASE_URL from '@/config/api';

interface UserStat {
    id: number;
    name: string;
    postulations: number;
    prioritized: number;
    assigned: number;
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState<UserStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/analytics/users`);
            if (res.ok) setStats(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6">Cargando estadísticas...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-4">
                <Link href="/" className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                </Link>
                <h1 className="text-3xl font-bold text-rutan-primary">Desempeño del Equipo</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-rutan-blue">
                    <p className="text-gray-500 text-sm uppercase font-bold">Total Colaboradores</p>
                    <p className="text-4xl font-black text-rutan-primary">{stats.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-rutan-secondary">
                    <p className="text-gray-500 text-sm uppercase font-bold">Total Postulaciones</p>
                    <p className="text-4xl font-black text-rutan-primary">{stats.reduce((acc, s) => acc + s.postulations, 0)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-rutan-tertiary">
                    <p className="text-gray-500 text-sm uppercase font-bold">Efectividad Global</p>
                    <p className="text-4xl font-black text-rutan-primary">
                        {Math.round((stats.reduce((acc, s) => acc + s.prioritized, 0) / stats.reduce((acc, s) => acc + s.postulations, 0) || 0) * 100)}%
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-rutan-primary text-white">
                        <tr>
                            <th className="px-6 py-4 text-left font-semibold">Corresponsable</th>
                            <th className="px-6 py-4 text-center font-semibold text-rutan-secondary">Postuladas</th>
                            <th className="px-6 py-4 text-center font-semibold text-rutan-tertiary">Priorizadas</th>
                            <th className="px-6 py-4 text-center font-semibold text-rutan-blue">Asignadas (En Curso)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {stats.sort((a, b) => b.postulations - a.postulations).map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-bold text-gray-700">{user.name}</td>
                                <td className="px-6 py-4 text-center bg-gray-50 font-mono">{user.postulations}</td>
                                <td className="px-6 py-4 text-center bg-white font-mono text-green-600 font-bold">{user.prioritized}</td>
                                <td className="px-6 py-4 text-center bg-gray-50 font-mono text-blue-600 font-bold">{user.assigned}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-sm flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                    <p className="font-bold mb-1">Nota sobre efectividad:</p>
                    <p>La columna "Priorizadas" refleja cuántas de las noticias postuladas por el usuario llegaron a ganar el consenso del consejo (Cuadrante Urgente/Estratégico).</p>
                </div>
            </div>
        </div>
    );
}
