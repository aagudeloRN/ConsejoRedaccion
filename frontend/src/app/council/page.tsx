"use client";

import { useUser } from '@/context/UserContext';
import { useState, useEffect } from 'react';
import { News } from '@/types';
import VoteCard from '@/components/VoteCard';
import Link from 'next/link';
import API_BASE_URL from '@/config/api';

export default function CouncilPage() {
    const { currentUser } = useUser();
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Administrador';

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/news/`);
            if (res.ok) {
                const data = await res.json();
                // Filter news that are either In Council OR (if Admin) allow selecting new ones
                setNews(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCouncilStatus = async (newsId: number, currentStatus: boolean) => {
        try {
            const res = await fetch(`${API_BASE_URL}/votes/council/${newsId}?in_council=${!currentStatus}`, {
                method: 'PUT'
            });
            if (res.ok) {
                // Update local state
                setNews(prev => prev.map(n => n.id === newsId ? { ...n, in_council: !currentStatus } : n));
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-6">Cargando consejo...</div>;

    // Filter news actively in council
    const activeCouncilNews = news.filter(n => n.in_council);
    // Filter news pending to be added (only for Admin view)
    const pendingNews = news.filter(n => !n.in_council && n.status === 'Identificado');

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="bg-gray-100 p-2 rounded-full hover:bg-gray-200" title="Volver al Inicio">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    </Link>
                    <h1 className="text-3xl font-bold text-rutan-primary">Consejo de Redacción - Votación</h1>
                </div>
                <div className="text-sm text-gray-500">
                    Usuario: <span className="font-bold">{currentUser?.name}</span>
                </div>
            </div>

            {/* Voting Section (Visible to All) */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Noticias en Votación ({activeCouncilNews.length})</h2>
                {activeCouncilNews.length === 0 ? (
                    <p className="text-gray-500 italic">No hay noticias activas en este consejo. Espera a que el Administrador las active.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeCouncilNews.map(n => (
                            <div key={n.id} className="relative group">
                                <VoteCard newsItem={n} onVote={fetchNews} />
                                {isAdmin && (
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => toggleCouncilStatus(n.id, true)}
                                            className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold hover:bg-red-200 shadow-sm"
                                            title="Quitar del Consejo"
                                        >
                                            ✕ Quitar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Admin Section: Manage Council */}
            {isAdmin && (
                <div className="mt-12 border-t pt-8">
                    <h2 className="text-xl font-bold text-rutan-primary mb-4">Administración del Consejo (Solo Admin)</h2>
                    <p className="text-sm text-gray-600 mb-4">Selecciona las noticias que entrarán a votación esta semana. (O quita las activas arriba).</p>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {pendingNews.map(n => (
                                    <tr key={n.id}>
                                        <td className="px-6 py-4 text-sm text-gray-900">{n.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{n.detection_date}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => toggleCouncilStatus(n.id, false)}
                                                className="text-rutan-blue hover:text-blue-900 font-bold text-sm"
                                            >
                                                + Agregar al Consejo
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {pendingNews.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No hay noticias pendientes.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 flex justify-end space-x-4">
                        {activeCouncilNews.length > 0 && (
                            <button
                                onClick={async () => {
                                    if (confirm("¿Estás seguro de CERRAR EL CONSEJO? Esto quitará todas las noticias de la mesa para iniciar una nueva semana.")) {
                                        await fetch(`${API_BASE_URL}/votes/council/close`, { method: 'POST' });
                                        fetchNews();
                                    }
                                }}
                                className="text-red-600 hover:text-red-800 font-medium px-4 py-2 border border-red-200 rounded hover:bg-red-50"
                            >
                                Cerrar Consejo Actual
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* General Navigation: Visible to everyone */}
            <div className="mt-8 flex justify-end border-t pt-6">
                <Link href="/council/matrix" className="flex items-center space-x-2 bg-rutan-secondary text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 shadow-md transition">
                    <span>Ver Resultados en Matriz</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </Link>
            </div>
        </div>
    );
}
