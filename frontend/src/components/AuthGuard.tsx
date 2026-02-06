"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { currentUser, loading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!currentUser && pathname !== '/login') {
                router.push('/login');
            }
        }
    }, [currentUser, loading, pathname, router]);

    // If loading or (not logged in and not on login page), show nothing or a spinner
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rutan-primary"></div>
            </div>
        );
    }

    if (!currentUser && pathname !== '/login') {
        return null;
    }

    return <>{children}</>;
}
