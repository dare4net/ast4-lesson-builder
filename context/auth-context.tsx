'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

export interface User {
    user_id: string;
    role: string;
    email?: string;
    full_name?: string;
    fullName?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    signup: (email: string, password: string, fullName: string, role: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Initialize auth from localStorage on mount
    useEffect(() => {
        const initAuth = () => {
            try {
                const storedToken = apiClient.getToken();
                const storedUser = apiClient.getUser();

                if (storedToken) {
                    try {
                        const decoded = jwtDecode<User>(storedToken);
                        // Merge decoded token claims with stored full profile details (email, full_name)
                        const fullUser: User = {
                            ...decoded,
                            ...(storedUser || {}),
                            email: storedUser?.email || decoded.email,
                            full_name: storedUser?.full_name || storedUser?.fullName || decoded.full_name || decoded.fullName,
                        };
                        setUser(fullUser);
                        setToken(storedToken);
                    } catch (error) {
                        console.error('[auth-context] Invalid or expired token format:', error);
                        apiClient.clearToken();
                        setUser(null);
                        setToken(null);
                    }
                }
            } catch (err) {
                console.error('[auth-context] Critical startup init error:', err);
                apiClient.clearToken();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string): Promise<User> => {
        try {
            const data = await apiClient.login(email, password);
            const { token: newToken, user: responseUser } = data;

            apiClient.setToken(newToken);
            const decoded = jwtDecode<User>(newToken);

            // Merge decoded JWT with any extra fields returned in the API login response
            const fullUserData: User = {
                ...decoded,
                email: responseUser?.email || decoded.email || email,
                full_name: responseUser?.full_name || responseUser?.fullName || decoded.full_name || decoded.fullName,
            };

            apiClient.setUser(fullUserData);
            setToken(newToken);
            setUser(fullUserData);
            return fullUserData;
        } catch (error: any) {
            console.error('Login failed:', error);
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const signup = async (email: string, password: string, fullName: string, role: string) => {
        try {
            const data = await apiClient.signup(email, password, fullName, role);
            const { token: newToken, user: responseUser } = data;

            apiClient.setToken(newToken);
            const decoded = jwtDecode<User>(newToken);

            const fullUserData: User = {
                ...decoded,
                email: responseUser?.email || decoded.email || email,
                full_name: fullName || responseUser?.full_name || decoded.full_name,
            };

            apiClient.setUser(fullUserData);
            setToken(newToken);
            setUser(fullUserData);
        } catch (error: any) {
            console.error('Signup failed:', error);
            throw new Error(error.response?.data?.message || 'Signup failed');
        }
    };

    const logout = () => {
        apiClient.clearToken();
        setToken(null);
        setUser(null);
        router.push('/');
    };

    const value: AuthContextType = {
        user,
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!token && !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
