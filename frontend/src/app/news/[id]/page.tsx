"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { News } from '@/types';
import Link from 'next/link';
import TagInput from '@/components/TagInput'; // Reusing for display if we want, or simple pills
import ProductManager from '@/components/ProductManager';
import API_BASE_URL from '@/config/api';

export default function NewsDetailPage() {
    const { id } = useParams();
    const { currentUser } = useUser();
    const router = useRouter();
    const [news, setNews] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/news/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setNews(data);
                } else {
                    // Handle 404
                    router.push('/');
                }
            } catch (error) {
                console.error("Failed to fetch news detail", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchNews();
    }, [id, router]);

    const handleTogglePriority = async () => {
        if (!news || !currentUser) return;

        try {
            const res = await fetch(`${API_BASE_URL}/news/${news.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_prioritized: !news.is_prioritized })
            });

            if (res.ok) {
                const updated = await res.json();
                setNews(updated);
            } else {
                alert('Error al actualizar prioridad');
            }
        } catch (error) {
            console.error('Error toggling priority:', error);
            alert('Error al actualizar prioridad');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando detalle...</div>;
    if (!news) return <div className="p-8 text-center text-red-500">Novedad no encontrada.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Link href="/" className="text-sm text-rutan-tertiary hover:underline flex items-center">
                    ← Volver al Dashboard
                </Link>
                <div className={`px-3 py-1 rounded-full text-sm font-bold 
                ${news.status === 'Identificado' ? 'bg-yellow-100 text-yellow-800' :
                        news.status === 'Priorizado' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'}`}>
                    {news.status}
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-rutan-blue">
                <div className="mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{news.title}</h1>
                    <div className="flex flex-wrap text-sm text-gray-500 gap-4">
                        <span>Detectado: <strong>{news.detection_date}</strong></span>
                        <span>Postulado por: <strong>{news.postulator?.name || `Usuario #${news.postulator_id}`}</strong></span>
                    </div>
                </div>

                {/* Executive Priority Toggle - Only for Dirección Ejecutiva */}
                {currentUser?.role === "Dirección Ejecutiva" && (
                    <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={news.is_prioritized || false}
                                onChange={handleTogglePriority}
                                className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500 cursor-pointer"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">⭐</span>
                                    <span className="font-bold text-amber-900 group-hover:text-amber-700 transition-colors">
                                        Marcar como Prioridad Estratégica
                                    </span>
                                </div>
                                <p className="text-xs text-amber-700 mt-1 ml-9">
                                    Esta noticia se destacará con estrella dorada en todas las vistas del sistema
                                </p>
                            </div>
                        </label>
                    </div>
                )}

                {/* Priority Indicator - Visible to everyone */}
                {news.is_prioritized && (
                    <div className="mb-6 bg-amber-100 border border-amber-300 p-3 rounded-lg flex items-center gap-2">
                        <span className="text-2xl">⭐</span>
                        <span className="font-bold text-amber-900">Prioridad Estratégica de la Dirección Ejecutiva</span>
                    </div>
                )}

                <div className="space-y-6">

                    {news.original_url && (
                        <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                            <span className="font-semibold mr-2">Fuente Original:</span>
                            <a href={news.original_url} target="_blank" rel="noopener noreferrer" className="text-rutan-blue hover:underline break-all">
                                {news.original_url}
                            </a>
                        </div>
                    )}

                    <div>
                        <h3 className="text-lg font-semibold text-rutan-primary mb-2">Resumen Ejecutivo</h3>
                        <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                            {news.classifications?.summary || news.summary}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-md font-semibold text-gray-900 mb-1">Temática</h3>
                            <p className="text-gray-600 bg-gray-50 p-2 rounded">{news.classifications?.theme || "N/A"}</p>
                        </div>
                        <div>
                            <h3 className="text-md font-semibold text-gray-900 mb-1">Geografía</h3>
                            <p className="text-gray-600 bg-gray-50 p-2 rounded">{news.classifications?.geography || "N/A"}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-md font-semibold text-gray-900 mb-1">Impacto para Ruta N</h3>
                        <p className="text-gray-700 p-3 bg-blue-50 rounded border border-blue-100">
                            {news.classifications?.impact || "N/A"}
                        </p>
                    </div>


                    <div>
                        <h3 className="text-md font-semibold text-gray-600 mb-2">Palabras Clave</h3>
                        <div className="flex flex-wrap gap-2">
                            {news.classifications?.keywords?.map((k: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                    {k}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Product Management Section - Visible to everyone, editable for assigned */}
                    {news.id && currentUser && (
                        <ProductManager
                            newsId={news.id}
                            readOnly={!news.assignees?.some(a => a.id === currentUser.id)}
                        />
                    )}

                </div>
            </div>
        </div>
    );
}
