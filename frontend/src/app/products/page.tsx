"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { Product, News, User } from '@/types';
import API_BASE_URL from '@/config/api';

interface ProductWithInfo extends Product {
    news_title?: string;
    creator_name?: string;
}

export default function ProductsPage() {
    const { currentUser } = useUser();
    const [products, setProducts] = useState<ProductWithInfo[]>([]);
    const [news, setNews] = useState<News[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>("all");

    const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Administrador';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, newsRes, usersRes] = await Promise.all([
                fetch(`${API_BASE_URL}/products/`),
                fetch(`${API_BASE_URL}/news/?include_archived=true`),
                fetch(`${API_BASE_URL}/users/`)
            ]);

            if (productsRes.ok && newsRes.ok && usersRes.ok) {
                const productsData = await productsRes.json();
                const newsData = await newsRes.json();
                const usersData = await usersRes.json();

                setNews(newsData);
                setUsers(usersData);

                // Enrich products with news title and creator name
                const enrichedProducts = productsData.map((p: Product) => ({
                    ...p,
                    news_title: newsData.find((n: News) => n.id === p.news_id)?.title || 'Noticia no encontrada',
                    creator_name: usersData.find((u: User) => u.id === p.user_id)?.name || 'Usuario desconocido'
                }));

                setProducts(enrichedProducts);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId: number) => {
        if (!confirm('¿Eliminar este producto?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/products/${productId}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== productId));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredProducts = filterType === "all"
        ? products
        : products.filter(p => p.product_type === filterType);

    const productTypes = ["Boletín", "Cápsula", "Análisis", "Link", "Nota"];

    if (loading) return <div className="p-6 text-gray-500">Cargando productos...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                    </Link>
                    <h1 className="text-3xl font-bold text-rutan-primary">Repositorio de Productos</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-500">Filtrar:</label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="border rounded px-3 py-1 text-sm"
                    >
                        <option value="all">Todos</option>
                        {productTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-4">Producto</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Noticia Asociada</th>
                            <th className="px-6 py-4">Creado por</th>
                            <th className="px-6 py-4">Fecha</th>
                            {isAdmin && <th className="px-6 py-4 text-right">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                                    No hay productos registrados aún.
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{product.name}</div>
                                        {product.description && (
                                            <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.product_type === 'Boletín' ? 'bg-red-100 text-red-700' :
                                                product.product_type === 'Cápsula' ? 'bg-purple-100 text-purple-700' :
                                                    product.product_type === 'Análisis' ? 'bg-blue-100 text-blue-700' :
                                                        product.product_type === 'Link' ? 'bg-green-100 text-green-700' :
                                                            'bg-gray-100 text-gray-700'
                                            }`}>
                                            {product.product_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/news/${product.news_id}`}
                                            className="text-rutan-blue hover:underline text-sm"
                                        >
                                            {product.news_title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{product.creator_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(product.created_at).toLocaleDateString()}
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-bold"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="text-center text-sm text-gray-500">
                Total: {filteredProducts.length} productos
            </div>
        </div>
    );
}
