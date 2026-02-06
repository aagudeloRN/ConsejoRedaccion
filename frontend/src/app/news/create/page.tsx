"use client";

import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import AIAnalysisResult from '@/components/AIAnalysisResult';
import WarningMessage from '@/components/WarningMessage';
import UserSelector from '@/components/UserSelector';
import { News } from '@/types';
import API_BASE_URL from '@/config/api';

export default function CreateNewsPage() {
    const { currentUser } = useUser();
    const router = useRouter();

    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [analysis, setAnalysis] = useState<News | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleProcess = async () => {
        if (!url && !file) {
            setError("Debes ingresar una URL o seleccionar un archivo PDF.");
            return;
        }
        setError(null);
        setIsProcessing(true);
        setAnalysis(null);

        const formData = new FormData();
        if (url) formData.append("url", url);
        if (file) formData.append("file", file);

        try {
            const res = await fetch(`${API_BASE_URL}/news/analyze`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Error en el análisis");
            }

            const data = await res.json();
            setAnalysis(data);
        } catch (err) {
            console.error(err);
            setError("Ocurrió un error al procesar la información. Verifica la API KEY o el servicio.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = async (editedAnalysis: News) => {
        if (!editedAnalysis || !currentUser) return;
        setIsSaving(true);

        // Use edited data
        const finalAnalysis = editedAnalysis;

        try {
            // Prepare payload manually to match backend schema
            const payload = {
                title: finalAnalysis.title,
                status: "Identificado", // Default status
                original_url: finalAnalysis.original_url,
                classifications: finalAnalysis.classifications,
                content_processed: finalAnalysis.classifications?.content_processed || "",
                summary: finalAnalysis.classifications?.summary || "",
                postulator_id: currentUser.id,
                category: finalAnalysis.category || "Trend"
            };

            const res = await fetch(`${API_BASE_URL}/news/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push("/"); // Redirect to dashboard
            } else {
                setError("Error al guardar en base de datos.");
            }
        } catch (err) {
            console.error(err);
            setError("Error de conexión al guardar.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Registrar Novedad</h1>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Enlace (URL)</label>
                        <input
                            type="text"
                            placeholder="https://example.com/noticia..."
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                setFile(null); // Clear file if URL is typed
                            }}
                            disabled={!!file}
                        />
                    </div>

                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-500">O subir documento</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Archivo PDF</label>
                        <input
                            type="file"
                            accept="application/pdf"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setFile(e.target.files[0]);
                                    setUrl(''); // Clear URL if file selected
                                }
                            }}
                            disabled={!!url}
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Usuario postulador:</label>
                        <UserSelector />
                        {!currentUser && (
                            <p className="text-xs text-red-500 mt-1">Debes seleccionar un usuario.</p>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleProcess}
                        disabled={isProcessing || (!url && !file) || !currentUser}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isProcessing ? "Procesando con IA..." : "Procesar con IA"}
                    </button>
                </div>
            </div>

            {analysis && analysis.title === "PDF No Procesable (Requiere OCR)" ? (
                <div className="mt-8">
                    <WarningMessage message={analysis.classifications.summary} />
                    <div className="mt-4 flex justify-end">
                        <button onClick={() => setAnalysis(null)} className="text-sm text-gray-500 hover:text-gray-700">
                            Volver
                        </button>
                    </div>
                </div>
            ) : (
                <AIAnalysisResult
                    analysis={analysis}
                    onSave={handleSave}
                    onCancel={() => setAnalysis(null)}
                    isSaving={isSaving}
                />
            )}

        </div>
    );
}
