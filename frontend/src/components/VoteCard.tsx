"use client";

import { useState } from 'react';
import { News } from '@/types';
import { useUser } from '@/context/UserContext';
import TagInput from './TagInput'; // Wait, tag input is for arrays, we need a single select for category or free text
import API_BASE_URL from '@/config/api';

interface VoteCardProps {
    newsItem: News;
    onVote: () => void; // Callback to refresh or remove from view
}

export default function VoteCard({ newsItem, onVote }: VoteCardProps) {
    const { currentUser } = useUser();
    const [impact, setImpact] = useState(3);
    const [relevance, setRelevance] = useState(3);
    const [category, setCategory] = useState("Semana");
    const [submitted, setSubmitted] = useState(false);

    // Check if user has already voted
    const hasVoted = newsItem.votes?.some(v => v.user_id === currentUser?.id);

    // Determine effective submitted state
    const isSubmitted = submitted || hasVoted;

    const handleSubmit = async () => {
        if (!currentUser) return;

        try {
            const res = await fetch(`${API_BASE_URL}/votes/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    news_id: newsItem.id,
                    user_id: currentUser.id,
                    impact_score: impact,
                    relevance_score: relevance,
                    category_suggestion: category
                })
            });

            if (res.ok) {
                setSubmitted(true);
                // Optionally call onVote() to remove card if we want to hide after voting
                // For now, show "Votado" state
            }
        } catch (error) {
            console.error("Error voting", error);
        }
    };

    if (isSubmitted) {
        return (
            <div className="bg-green-50 p-6 rounded-lg shadow border border-green-200 text-center animate-fade-in h-full flex flex-col justify-center">
                <p className="text-green-700 font-bold mb-2">
                    {hasVoted ? "¡Ya has votado!" : "¡Voto Registrado!"}
                </p>
                <p className="text-sm text-green-600">Gracias por tu participación.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-rutan-blue hover:shadow-lg transition-shadow">
            {/* Executive Priority Indicator */}
            {newsItem.is_prioritized && (
                <div className="mb-3 flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    <span className="text-lg">⭐</span>
                    <span className="text-xs font-bold uppercase">Prioridad Estratégica</span>
                </div>
            )}

            <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{newsItem.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{newsItem.classifications?.theme}</p>
            <p className="text-sm text-gray-700 mt-2 line-clamp-3">{newsItem.classifications?.summary}</p>

            <div className="space-y-4 border-t pt-4">
                {/* Impact Scale 1-5 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Impacto (1-5)</label>
                    <div className="flex justify-between px-2">
                        {[1, 2, 3, 4, 5].map(val => (
                            <button
                                key={val}
                                onClick={() => setImpact(val)}
                                className={`w-8 h-8 rounded-full font-bold text-sm transition-colors 
                                    ${impact === val ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 px-1 mt-1">
                        <span>Bajo</span>
                        <span>Alto</span>
                    </div>
                </div>

                {/* Relevance Scale 1-5 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relevancia (1-5)</label>
                    <div className="flex justify-between px-2">
                        {[1, 2, 3, 4, 5].map(val => (
                            <button
                                key={val}
                                onClick={() => setRelevance(val)}
                                className={`w-8 h-8 rounded-full font-bold text-sm transition-colors 
                                    ${relevance === val ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 px-1 mt-1">
                        <span>Baja</span>
                        <span>Alta</span>
                    </div>
                </div>

                {/* Category Suggestion */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Sugerida</label>
                    <select
                        className="block w-full rounded-md border-gray-300 py-1.5 text-base sm:text-sm"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="Semana">Priorizada Semana (Naranja)</option>
                        <option value="Luego">Priorizada Luego (Gris)</option>
                        <option value="Urgente">Coyuntural Urgente (Rojo)</option>
                        <option value="Archivar">Archivar</option>
                    </select>
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full bg-rutan-blue text-white font-bold py-2 rounded-md hover:bg-blue-700 transition"
                >
                    Enviar Voto
                </button>
            </div>
        </div>
    );
}
