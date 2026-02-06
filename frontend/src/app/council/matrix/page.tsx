"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MatrixChart from '@/components/MatrixChart';
import { useUser } from '@/context/UserContext';
import { News, User } from '@/types';
import API_BASE_URL from '@/config/api';

// Helper interface for processed chart data
interface ProcessedVoteData {
    id: number;
    title: string;
    avgImpact: number;
    avgRelevance: number;
    category: string;
    newsItem: News; // Keep reference to original news item
    hasExecutiveVote: boolean;
}

export default function MatrixPage() {
    const { currentUser } = useUser();
    const [chartData, setChartData] = useState<ProcessedVoteData[]>([]);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    // UI State for Modal
    const [selectedNews, setSelectedNews] = useState<ProcessedVoteData | null>(null);
    const [focus, setFocus] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchMatrixData();
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/users/`);
            if (res.ok) setAllUsers(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMatrixData = async () => {
        setLoading(true);
        try {
            const resNews = await fetch(`${API_BASE_URL}/news/`);
            if (resNews.ok) {
                const allNews: News[] = await resNews.json();
                const councilNews = allNews.filter((n: News) => n.in_council);

                const processed: ProcessedVoteData[] = [];

                for (const n of councilNews) {
                    const resVotes = await fetch(`${API_BASE_URL}/votes/news/${n.id}`);
                    if (resVotes.ok) {
                        const votes = await resVotes.json();
                        if (votes.length > 0) {
                            const totalImp = votes.reduce((sum: number, v: any) => sum + v.impact_score, 0);
                            const totalRel = votes.reduce((sum: number, v: any) => sum + v.relevance_score, 0);

                            const avgImp = totalImp / votes.length;
                            const avgRel = totalRel / votes.length;

                            let category = "Luego";
                            if (avgImp >= 3 && avgRel >= 3) category = "Urgente";
                            else if (avgRel >= 3 && avgImp < 3) category = "Semana";
                            else if (avgImp >= 3 && avgRel < 3) category = "Estrategico";

                            processed.push({
                                id: n.id,
                                title: n.title,
                                avgImpact: Number(avgImp.toFixed(1)),
                                avgRelevance: Number(avgRel.toFixed(1)),
                                category: category,
                                newsItem: n,
                                hasExecutiveVote: false // Initialize
                            });
                        }
                    }
                }
                setChartData(processed);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openAssignmentModal = (item: ProcessedVoteData) => {
        setSelectedNews(item);
        setFocus(item.newsItem.editorial_focus || "");
        setSelectedUsers(item.newsItem.assignees?.map(u => u.id) || []);
    };

    const handleSaveAssignment = async () => {
        if (!selectedNews) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/news/${selectedNews.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    is_prioritized: true,
                    editorial_focus: focus,
                    assignee_ids: selectedUsers,
                    status: 'Priorizado'
                })
            });

            if (res.ok) {
                setSelectedNews(null);
                fetchMatrixData(); // Refresh list
            }
        } catch (error) {
            console.error("Error saving assignment", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 text-gray-800">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="bg-gray-100 p-2 rounded-full hover:bg-gray-200" title="Volver al Inicio">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    </Link>
                    <h1 className="text-3xl font-bold text-rutan-primary">Resultados del Consejo</h1>
                </div>
                <Link href="/council" className="text-sm text-rutan-tertiary hover:underline">
                    ← Volver a Votación
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Mapa de Priorización (Consenso)</h2>
                {loading ? (
                    <p className="py-12 text-center text-gray-500">Calculando consenso de votos...</p>
                ) : (
                    <MatrixChart
                        dataPoints={chartData.map(d => ({
                            x: d.avgImpact,
                            y: d.avgRelevance,
                            title: d.title,
                            category: d.category,
                            is_prioritized: d.newsItem.is_prioritized || false
                        }))}
                    />
                )}
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center text-base">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    Tabla de Decisiones
                </h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr className="text-left">
                                <th className="px-4 py-3">Noticia</th>
                                <th className="px-4 py-3">Puntaje IR</th>
                                <th className="px-4 py-3">Cuadrante</th>
                                <th className="px-4 py-3">Responsables</th>
                                <th className="px-4 py-3 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {chartData.map(row => (
                                <tr key={row.id} className={`hover:bg-gray-50 transition border-l-4 ${row.hasExecutiveVote ? 'border-yellow-400 bg-yellow-50' : 'border-transparent'}`}>
                                    <td className="px-4 py-3 max-w-xs truncate font-medium text-gray-900 flex items-center" title={row.title}>
                                        {row.hasExecutiveVote && (
                                            <span className="mr-2 text-yellow-500 text-lg" title="Priorizado por Dirección Ejecutiva">★</span>
                                        )}
                                        {row.title}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-gray-600">I:{row.avgImpact} R:{row.avgRelevance}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] text-white font-bold uppercase
                                            ${row.category === 'Urgente' ? 'bg-red-500' :
                                                row.category === 'Semana' ? 'bg-orange-500' :
                                                    row.category === 'Estrategico' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                                            {row.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500 italic">
                                        {row.newsItem.assignees?.length ? row.newsItem.assignees.map(u => u.name).join(", ") : "Sin asignar"}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {(currentUser?.role === 'Administrador' || currentUser?.role === 'Admin') && (
                                            <button
                                                onClick={() => openAssignmentModal(row)}
                                                className="bg-rutan-blue text-white px-3 py-1.5 rounded text-xs hover:bg-opacity-90 transition font-bold shadow-sm"
                                            >
                                                Gestionar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assignment Modal */}
            {selectedNews && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 bg-rutan-primary">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-rutan-secondary uppercase tracking-wider mb-1">Priorización Editorial</p>
                                    <h2 className="text-xl font-bold text-white line-clamp-1">{selectedNews.title}</h2>
                                </div>
                                <button onClick={() => setSelectedNews(null)} className="text-white hover:text-gray-200 p-1">✕</button>
                            </div>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto flex-1">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-tighter">1. Enfoque Editorial / Instrucción</label>
                                <textarea
                                    className="w-full border-2 border-gray-100 rounded-lg p-4 text-sm focus:border-rutan-blue outline-none transition h-36 resize-none"
                                    placeholder="Define cómo se debe tratar esta noticia, qué fuentes consultar, o qué ángulo tomar para el boletín..."
                                    value={focus}
                                    onChange={(e) => setFocus(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-tighter">2. Asignar Responsables</label>
                                <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                                    {allUsers.filter(u => u.active).map(user => (
                                        <div
                                            key={user.id}
                                            onClick={() => {
                                                if (selectedUsers.includes(user.id)) setSelectedUsers(prev => prev.filter(id => id !== user.id));
                                                else setSelectedUsers(prev => [...prev, user.id]);
                                            }}
                                            className={`flex items-center p-3 rounded-lg cursor-pointer border-2 transition ${selectedUsers.includes(user.id)
                                                ? 'bg-blue-50 border-rutan-blue'
                                                : 'bg-white border-gray-100 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${selectedUsers.includes(user.id) ? 'bg-rutan-blue border-rutan-blue text-white' : 'border-gray-200'
                                                }`}>
                                                {selectedUsers.includes(user.id) && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{user.name}</p>
                                                <p className="text-[10px] text-gray-400">{user.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
                            <button
                                onClick={() => setSelectedNews(null)}
                                className="px-6 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-white hover:border-gray-300 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveAssignment}
                                disabled={saving}
                                className="px-8 py-2.5 bg-rutan-tertiary text-white rounded-lg text-sm font-black hover:bg-opacity-90 disabled:opacity-50 transition shadow-lg shadow-tertiary/20"
                            >
                                {saving ? "Guardando..." : "PRIORIZAR TEMA"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
