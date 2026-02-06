"use client";

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { productService } from '@/services/productService';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { useUser } from '@/context/UserContext';

interface ProductManagerProps {
    newsId: number;
    readOnly?: boolean;
    onStatusUpdate?: () => void; // Callback to refresh news status if needed
}

export default function ProductManager({ newsId, readOnly = false, onStatusUpdate }: ProductManagerProps) {
    const { currentUser } = useUser();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form States
    const [isAdding, setIsAdding] = useState(false);
    const [type, setType] = useState('Boletín');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        loadProducts();
    }, [newsId]);

    const loadProducts = async () => {
        try {
            const data = await productService.getByNewsId(newsId);
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('news_id', newsId.toString());
        formData.append('user_id', currentUser.id.toString());
        formData.append('product_type', type);
        formData.append('name', name);
        if (description) formData.append('description', description);
        if (url) formData.append('url', url);
        if (file) formData.append('file', file);

        try {
            await productService.create(formData);
            await loadProducts();
            resetForm();
            if (onStatusUpdate) onStatusUpdate();
        } catch (error) {
            alert('Error al guardar producto');
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setIsAdding(false);
        setType('Boletín');
        setName('');
        setDescription('');
        setUrl('');
        setFile(null);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        try {
            await productService.delete(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    const hasMandatory = products.some(p => ['Boletín', 'Cápsula', 'Análisis'].includes(p.product_type));

    return (
        <div className="bg-white rounded-lg shadow p-6 mt-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Entregables y Productos</h2>
                    <p className="text-sm text-gray-500">{readOnly ? 'Productos generados para esta noticia.' : 'Gestiona los documentos de soporte y enlaces relacionados.'}</p>
                </div>
                {!readOnly && !isAdding && (
                    <Button onClick={() => setIsAdding(true)} size="sm">
                        + Agregar Producto
                    </Button>
                )}
            </div>

            {/* Validation Alert */}
            {!hasMandatory && products.length > 0 && (
                <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                ⚠️ Se requiere al menos un documento de soporte (Boletín, Cápsula, Análisis) para completar el proceso.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Form */}
            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rutan-primary focus:ring focus:ring-rutan-primary focus:ring-opacity-50"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="Boletín">Boletín PDF</option>
                                <option value="Cápsula">Cápsula</option>
                                <option value="Análisis">Documento de Análisis</option>
                                <option value="Link">Enlace Externo</option>
                                <option value="Nota">Nota Interna</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre / Título</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rutan-primary focus:ring focus:ring-rutan-primary focus:ring-opacity-50"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    {['Boletín', 'Cápsula', 'Análisis'].includes(type) ? (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Archivo (PDF, Doc, Imagen)</label>
                            <input
                                type="file"
                                required
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rutan-primary file:text-white hover:file:bg-opacity-90"
                            />
                        </div>
                    ) : type === 'Link' ? (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">URL</label>
                            <input
                                type="url"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rutan-primary focus:ring focus:ring-rutan-primary focus:ring-opacity-50"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>
                    ) : null}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                        <textarea
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rutan-primary focus:ring focus:ring-rutan-primary focus:ring-opacity-50"
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                        <Button type="submit" disabled={uploading}>
                            {uploading ? 'Guardando...' : 'Guardar Producto'}
                        </Button>
                    </div>
                </form>
            )}

            {/* List */}
            {products.length === 0 && !loading ? (
                <p className="text-gray-500 text-center py-8">No hay productos registrados aún.</p>
            ) : (
                <div className="space-y-4">
                    {products.map((product) => (
                        <div key={product.id} className="flex items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-shrink-0 mt-1">
                                {['Boletín', 'Cápsula', 'Análisis'].includes(product.product_type) ? (
                                    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path></svg>
                                ) : (
                                    <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"></path></svg>
                                )}
                            </div>
                            <div className="ml-4 flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-900">{product.name}</h3>
                                    <Badge variant="neutral" size="sm">{product.product_type}</Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                                <div className="mt-2 text-xs text-gray-400">
                                    Registrado por User #{product.user_id} el {new Date(product.created_at).toLocaleDateString()}
                                </div>
                                <div className="mt-2 flex space-x-4 text-sm font-medium">
                                    {product.url ? (
                                        <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-rutan-blue hover:underline">Abrir Enlace ↗</a>
                                    ) : product.file_path ? (
                                        <span className="text-gray-500 italic">Archivo adjunto (Local)</span>
                                    ) : null}
                                    {!readOnly && (
                                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800">Eliminar</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
