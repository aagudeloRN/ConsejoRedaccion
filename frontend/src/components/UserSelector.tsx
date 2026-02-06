"use client";

import { useUser } from '../context/UserContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserSelector() {
    const { currentUser, logout, loading } = useUser();
    const router = useRouter();

    if (loading) return <div className="text-sm text-gray-400 animate-pulse">...</div>;
    if (!currentUser) return null;

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const isAdmin = currentUser.role === 'Administrador' || currentUser.role === 'Admin';

    return (
        <div className="flex items-center space-x-6">
            {isAdmin && (
                <Link
                    href="/users/manage"
                    className="flex items-center text-xs font-bold text-rutan-tertiary hover:text-rutan-primary transition-colors uppercase tracking-wider bg-tertiary/5 px-3 py-1.5 rounded-full border border-rutan-tertiary/20"
                >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Gestión Usuarios
                </Link>
            )}

            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-1.5 rounded-lg border border-gray-100">
                <div className="flex flex-col items-end leading-tight">
                    <span className="text-sm font-bold text-gray-800">{currentUser.name}</span>
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">{currentUser.role}</span>
                </div>
                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                <button
                    onClick={handleLogout}
                    className="text-xs font-black text-red-500 hover:text-red-700 transition uppercase tracking-widest"
                >
                    Salir
                </button>
            </div>
        </div>
    );
}
