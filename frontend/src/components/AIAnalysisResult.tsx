"use client";

import { useState, useEffect } from "react";
import { News } from "../types";
import TagInput from "./TagInput";

interface AIAnalysisResultProps {
    analysis: News | null;
    onSave: (editedAnalysis: News) => void;
    onCancel: () => void;
    isSaving: boolean;
}

export default function AIAnalysisResult({ analysis, onSave, onCancel, isSaving }: AIAnalysisResultProps) {
    const [editableAnalysis, setEditableAnalysis] = useState<News | null>(null);

    useEffect(() => {
        if (analysis) {
            setEditableAnalysis({ ...analysis });
        }
    }, [analysis]);

    if (!editableAnalysis) return null;

    const handleChange = (field: string, value: string) => {
        setEditableAnalysis((prev) => {
            if (!prev) return null;

            // Handle nested classifications
            if (['summary', 'theme', 'geography', 'impact'].includes(field)) {
                return {
                    ...prev,
                    classifications: {
                        ...prev.classifications,
                        [field]: value
                    }
                };
            }

            return { ...prev, [field]: value };
        });
    };

    const handleKeywordsChange = (newKeywords: string[]) => {
        setEditableAnalysis((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                classifications: {
                    ...prev.classifications,
                    keywords: newKeywords
                }
            };
        });
    };

    return (
        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
                <h2 className="text-lg font-bold text-gray-900">Resultado del Análisis (IA) - <span className="text-gray-500 font-normal text-base">Puedes editar la información antes de guardar</span></h2>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Título Sugerido</label>
                    <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        value={editableAnalysis.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Resumen</label>
                    <textarea
                        rows={6}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        value={editableAnalysis.classifications?.summary || ""}
                        onChange={(e) => handleChange('summary', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Temática Principal</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            value={editableAnalysis.classifications?.theme || ""}
                            onChange={(e) => handleChange('theme', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ámbito Geográfico</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            value={editableAnalysis.classifications?.geography || ""}
                            onChange={(e) => handleChange('geography', e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Impacto para Ruta N</label>
                    <textarea
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        value={editableAnalysis.classifications?.impact || ""}
                        onChange={(e) => handleChange('impact', e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Palabras Clave</label>
                    <TagInput
                        tags={editableAnalysis.classifications?.keywords || []}
                        onChange={handleKeywordsChange}
                        placeholder="Escribe y presiona Enter..."
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancelar
                </button>
                <button
                    onClick={() => onSave(editableAnalysis)}
                    disabled={isSaving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isSaving ? "Guardando..." : "Guardar Novedad"}
                </button>
            </div>
        </div>
    );
}
