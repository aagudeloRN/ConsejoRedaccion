"use client";

import React, { useState, KeyboardEvent, useCallback } from 'react';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

export default React.memo(function TagInput({ tags, onChange, placeholder = "Agregar etiqueta..." }: TagInputProps) {
    const [input, setInput] = useState('');

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmedInput = input.trim();
            if (trimmedInput && !tags.includes(trimmedInput)) {
                onChange([...tags, trimmedInput]);
                setInput('');
            }
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            onChange(tags.filter((_, i) => i !== tags.length - 1));
        }
    }, [input, tags, onChange]);

    const removeTag = useCallback((index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    }, [tags, onChange]);

    const addTag = useCallback(() => {
        const trimmedInput = input.trim();
        if (trimmedInput && !tags.includes(trimmedInput)) {
            onChange([...tags, trimmedInput]);
            setInput('');
        }
    }, [input, tags, onChange]);

    return (
        <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white">
            {tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {tag}
                    <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                    >
                        <span className="sr-only">Remover etiqueta</span>
                        &times;
                    </button>
                </span>
            ))}
            <input
                type="text"
                className="flex-grow min-w-[100px] border-none focus:ring-0 p-1 text-sm outline-none"
                placeholder={tags.length === 0 ? placeholder : ""}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addTag}
            />
        </div>
    );
});
