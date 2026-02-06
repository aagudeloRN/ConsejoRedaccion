"use client";

import { useUser } from '@/context/UserContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { News } from '@/types';
import API_BASE_URL from '@/config/api';

export default function Home() {
  const { currentUser, loading: userLoading } = useUser();
  const [news, setNews] = useState<News[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Helper for highlighting search terms
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ?
            <span key={i} className="bg-yellow-200 font-bold px-0.5 rounded text-gray-900">{part}</span> :
            part
        )}
      </>
    );
  };

  const fetchNews = async (query = "", archivedOnly = false) => {
    setLoadingNews(true);
    setCurrentPage(1); // Reset on new search
    try {
      // Always include archived in API call, filter in frontend for cleaner UX
      let url = `${API_BASE_URL}/news/?include_archived=true`;
      if (query) url += `&q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (res.ok) {
        let data = await res.json();
        // Filter based on archivedOnly mode
        if (archivedOnly) {
          data = data.filter((n: News) => n.status === 'Archivado');
        } else {
          data = data.filter((n: News) => n.status !== 'Archivado');
        }
        // Sort by detection date descending
        setNews(data.sort((a: News, b: News) =>
          new Date(b.detection_date).getTime() - new Date(a.detection_date).getTime()
        ));
      }
    } catch (error) {
      console.error("Failed to fetch news", error);
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews(searchTerm, showArchived);
  };

  const toggleArchived = () => {
    const newValue = !showArchived;
    setShowArchived(newValue);
    fetchNews(searchTerm, newValue);
  };

  if (userLoading) return (
    <div className="p-6 space-y-6">
      <div className="h-10 w-64 skeleton opacity-50"></div>
      <div className="h-32 w-full skeleton opacity-30"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-40 skeleton opacity-20"></div>
        <div className="h-40 skeleton opacity-20"></div>
        <div className="h-40 skeleton opacity-20"></div>
      </div>
    </div>
  );

  // Stats
  const totalNews = news.length;
  const identified = news.filter(n => n.status === 'Identificado').length;
  const inProgress = news.filter(n => n.status === 'En desarrollo').length;
  const prioritized = news.filter(n => n.status === 'Priorizado').length;

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-rutan-primary">
          Bienvenido, <span className="text-rutan-secondary">{currentUser ? currentUser.name : 'Invitado'}</span>
          {currentUser && (
            <span className="ml-3 text-xs bg-gray-100 text-gray-500 py-1 px-2 rounded-full font-medium border border-gray-200 uppercase tracking-wider">
              🛡️ {currentUser.role}
            </span>
          )}
        </h1>
        <div className="text-sm text-gray-500">
          Fecha Actual: {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar noticias por título, tema o contenido..."
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-rutan-blue outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="bg-rutan-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 font-bold"
          >
            Buscar
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => { setSearchTerm(""); fetchNews("", showArchived); }}
              className="text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-md border border-gray-300"
            >
              Limpiar
            </button>
          )}
        </form>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => { setShowArchived(false); fetchNews(searchTerm, false); }}
              className={`px-4 py-2 rounded-md text-sm font-bold transition ${!showArchived
                ? 'bg-white text-rutan-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              📋 Activas
            </button>
            <button
              type="button"
              onClick={() => { setShowArchived(true); fetchNews(searchTerm, true); }}
              className={`px-4 py-2 rounded-md text-sm font-bold transition ${showArchived
                ? 'bg-white text-gray-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              📦 Ver Archivadas
            </button>
          </div>
          <Link href="/products" className="text-xs text-rutan-blue hover:underline">
            📦 Ver Productos Generados
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ... stats ... */}
        {/* Resumen Semanal Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-rutan-secondary">
          <h3 className="text-lg font-semibold text-rutan-primary mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Resumen Semanal
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex justify-between">
              <span>Novedades detectadas:</span>
              <span className="font-bold text-rutan-primary bg-gray-100 px-2 rounded-full">{totalNews}</span>
            </li>
            <li className="flex justify-between">
              <span>Pendientes priorizar:</span>
              <span className="font-bold text-rutan-orange">{identified}</span>
            </li>
            <li className="flex justify-between">
              <span>En desarrollo:</span>
              <span className="font-bold text-rutan-tertiary">{inProgress}</span>
            </li>
            <li className="flex justify-between">
              <span>Priorizados:</span>
              <span className="font-bold text-rutan-blue">{prioritized}</span>
            </li>
          </ul>
        </div>

        {/* Estadísticas Card - Restricted Role */}
        {(currentUser?.role === 'Administrador' || currentUser?.role === 'Admin' || currentUser?.role === 'Dirección Ejecutiva') && (
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-rutan-primary">
            <h3 className="text-lg font-semibold text-rutan-primary mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              Desempeño Equipo
            </h3>
            <p className="text-sm text-gray-500 mb-4">Consulta las estadísticas de postulación y efectividad de los corresponsales.</p>
            <Link href="/stats" className="flex items-center justify-center w-full bg-rutan-primary text-white py-3 px-4 rounded-md hover:bg-opacity-90 transition shadow-sm font-bold">
              Ver Estadísticas →
            </Link>
          </div>
        )}

        {/* Acciones Rápidas Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-rutan-tertiary">
          <h3 className="text-lg font-semibold text-rutan-primary mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Acciones Rápidas
          </h3>
          <div className="space-y-3">
            <Link href="/news/create" className="flex items-center justify-center w-full bg-rutan-blue text-white py-3 px-4 rounded-md hover:bg-opacity-90 transition shadow-sm font-bold">
              + Registrar Novedad
            </Link>
            <Link href="/council" className="flex items-center justify-center w-full bg-gray-50 text-rutan-primary border border-gray-200 py-3 px-4 rounded-md hover:bg-gray-100 transition font-bold">
              Ir al Consejo →
            </Link>
            {(currentUser?.role === 'Administrador' || currentUser?.role === 'Admin') && (
              <Link href="/users/manage" className="flex items-center justify-center w-full text-xs text-gray-500 hover:text-rutan-primary transition py-2 underline">
                Gestionar Usuarios
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mis Asignaciones */}
      {currentUser && (
        <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-md border-l-4 border-rutan-blue overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <svg className="w-6 h-6 mr-2 text-rutan-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                Mis Asignaciones Pendientes
              </h3>
              <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border">
                {news.filter(n => n.assignees?.some(a => a.id === currentUser.id)).length} Tareas
              </span>
            </div>

            {news.filter(n => n.assignees?.some(a => a.id === currentUser.id)).length === 0 ? (
              <p className="text-gray-500 italic text-sm">No tienes productos asignados actualmente. ¡Buen trabajo!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {news.filter(n => n.assignees?.some(a => a.id === currentUser.id)).map(assignment => (
                  <div key={assignment.id} className="bg-white p-4 rounded border border-blue-100 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-rutan-primary line-clamp-1 mb-1">{assignment.title}</h4>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">PRIORIZADO</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded mt-2">
                      <span className="font-bold text-gray-700 block mb-1">Enfoque Editorial:</span>
                      {assignment.editorial_focus || "Sin instrucciones específicas."}
                    </div>
                    <div className="flex justify-end">
                      <Link href={`/news/${assignment.id}`} className="text-xs bg-rutan-blue text-white px-3 py-1.5 rounded font-bold hover:bg-opacity-90">
                        Gestionar Producto →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="bg-rutan-primary px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h3 className="text-lg font-semibold text-white">Nuestro AGORA</h3>
        </div>

        {loadingNews ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-8 w-24 skeleton opacity-20"></div>
                <div className="h-8 flex-1 skeleton opacity-20"></div>
                <div className="h-8 w-20 skeleton opacity-20"></div>
                <div className="h-8 w-24 skeleton opacity-20"></div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-2">No hay novedades registradas aún.</p>
            <Link href="/news/create" className="text-rutan-tertiary hover:underline text-sm font-bold">
              ¡Sé el primero en registrar una!
            </Link>
          </div>
        ) : (
          <div className="z-10 relative"> {/* Container for z-index layering */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky-header shadow-sm">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Ingesta
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título / Temática
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  {(currentUser?.role === 'Administrador' || currentUser?.role === 'Admin') && (
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consejo
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {news.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                  <tr key={item.id} className="premium-row hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.detection_date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {item.is_prioritized && (
                          <span className="text-xl animate-pulse" title="Prioridad Estratégica - Dirección Ejecutiva">⭐</span>
                        )}
                        <div className="tooltip-container group">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1 max-w-md hover:text-rutan-blue transition-colors cursor-help" title={item.title}>
                            {highlightText(item.title, searchTerm)}
                          </div>
                          {/* Rich Tooltip - Prioritizing Impact */}
                          <div className="tooltip-content p-4 bg-gray-900 text-white text-xs rounded-lg shadow-2xl border border-gray-700 mb-2 pointer-events-none">
                            <div className="font-bold border-b border-gray-700 pb-1 mb-2 text-rutan-secondary flex items-center">
                              <span className="mr-2">💡</span> Relevancia para Ruta N
                            </div>
                            <p className="leading-relaxed text-blue-200 font-medium mb-3">
                              {item.classifications?.impact || "Analizando impacto..."}
                            </p>

                            <div className="font-bold border-b border-gray-700 pb-1 mb-1 text-gray-400 text-[10px] uppercase">
                              Resumen Ejecutivo
                            </div>
                            <p className="leading-relaxed italic opacity-80 line-clamp-3">
                              {item.classifications?.summary || "Sin resumen disponible."}
                            </p>

                            <div className="mt-3 pt-2 border-t border-gray-800 flex justify-between text-[10px] text-gray-500">
                              <span className="flex items-center">🏷️ {item.classifications?.theme || "General"}</span>
                              <span className="flex items-center">📍 {item.classifications?.geography || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                        {item.in_council && (
                          <span className="flex-shrink-0 bg-rutan-orange text-white text-[9px] font-black px-1.5 py-0.5 rounded flex items-center shadow-sm">
                            <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            EN CONSEJO
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex items-center">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                          🏷️ {item.classifications?.theme || "Sin temática"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex items-center text-xs leading-5 font-bold rounded-full border shadow-sm
                        ${item.status === 'Archivado' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                          item.status === 'Identificado' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            item.status === 'Priorizado' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-green-50 text-green-700 border-green-200'}`}>
                        {item.status === 'Archivado' && <span className="mr-1">📦</span>}
                        {item.status === 'Identificado' && <span className="mr-1">🔍</span>}
                        {item.status === 'Priorizado' && <span className="mr-1">⚡</span>}
                        {item.status === 'En desarrollo' && <span className="mr-1">⚙️</span>}
                        {item.status === 'Producto generado' && <span className="mr-1">✅</span>}
                        {item.status === 'Archivado' ? 'Archivado' : item.status}
                      </span>
                    </td>
                    {(currentUser?.role === 'Administrador' || currentUser?.role === 'Admin') && (
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={async () => {
                            const newStatus = !item.in_council;
                            await fetch(`${API_BASE_URL}/votes/council/${item.id}?in_council=${newStatus}`, { method: 'PUT' });
                            fetchNews();
                          }}
                          className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 mx-auto ${item.in_council ? 'bg-rutan-tertiary' : 'bg-gray-300'}`}
                        >
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${item.in_council ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link href={`/news/${item.id}`} className="text-rutan-tertiary hover:text-indigo-900 font-bold">
                        Ver Detalle →
                      </Link>
                      {(currentUser?.role === 'Administrador' || currentUser?.role === 'Admin') && (
                        <>
                          {item.status === 'Archivado' ? (
                            <button
                              onClick={async () => {
                                if (confirm("¿Reactivar esta noticia?")) {
                                  await fetch(`${API_BASE_URL}/news/${item.id}/reactivate`, { method: 'PATCH' });
                                  fetchNews(searchTerm, showArchived);
                                }
                              }}
                              className="text-green-500 hover:text-green-700 ml-2"
                              title="Reactivar noticia"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                if (confirm("¿Archivar esta noticia?")) {
                                  await fetch(`${API_BASE_URL}/news/${item.id}/archive`, { method: 'PATCH' });
                                  fetchNews(searchTerm, showArchived);
                                }
                              }}
                              className="text-gray-400 hover:text-red-500 ml-2"
                              title="Archivar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (confirm(`⚠ ELIMINAR DEFINITIVAMENTE\n\n¿Borrar "${item.title}"?`)) {
                                await fetch(`${API_BASE_URL}/news/${item.id}`, { method: 'DELETE' });
                                fetchNews(searchTerm, showArchived);
                              }
                            }}
                            className="text-red-300 hover:text-red-600 ml-2"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {news.length > itemsPerPage && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(news.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(news.length / itemsPerPage)}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, news.length)}</span> de <span className="font-medium">{news.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {[...Array(Math.ceil(news.length / itemsPerPage))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                        ? 'z-10 bg-rutan-blue border-rutan-blue text-white'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(news.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(news.length / itemsPerPage)}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
