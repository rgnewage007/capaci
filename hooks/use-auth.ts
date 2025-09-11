'use client';

import { useState, useEffect } from 'react';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    return {
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
    };
}