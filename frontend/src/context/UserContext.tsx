"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import API_BASE_URL from '@/config/api';

interface UserContextType {
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
    users: User[];
    loading: boolean;
    login: (user: User) => void;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/users/`);
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);

                    // Check localStorage for saved user
                    const savedUser = localStorage.getItem('rutan_user');
                    if (savedUser) {
                        try {
                            const parsed = JSON.parse(savedUser);
                            // Verify user still exists and is active
                            const activeUser = data.find((u: User) => u.id === parsed.id && u.active);
                            if (activeUser) {
                                setCurrentUser(activeUser);
                            } else {
                                localStorage.removeItem('rutan_user');
                            }
                        } catch (e) {
                            localStorage.removeItem('rutan_user');
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const login = (user: User) => {
        setCurrentUser(user);
        localStorage.setItem('rutan_user', JSON.stringify(user));
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('rutan_user');
    };

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser, users, loading, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
