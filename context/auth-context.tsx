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
    handle?: string | null;
    isPublicProfile?: boolean;
    accentColor?: string | null;
    avatarId?: string | null;
    avatarFrame?: string | null;
    nameplate?: string | null;
    pinnedStatKey?: string | null;
    onboardingCompletedAt?: string | Date | null;
    onboardingSkippedAt?: string | Date | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    signup: (email: string, password: string, fullName: string, role: string) => Promise<void>;
    establishSession: (newToken: string, responseUser?: Partial<User> | null) => User;
    logout: () => void;
    updateUser: (partial: Partial<User>) => void;
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
                            handle: storedUser?.handle ?? decoded.handle ?? null,
                            isPublicProfile: storedUser?.isPublicProfile === true,
                            accentColor: storedUser?.accentColor ?? null,
                            avatarId: storedUser?.avatarId ?? null,
                            onboardingCompletedAt: storedUser?.onboardingCompletedAt ?? null,
                            onboardingSkippedAt: storedUser?.onboardingSkippedAt ?? null,
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

    useEffect(() => {
        if (!token) return
        let cancelled = false
        apiClient.profile.get().then((profile) => {
            if (cancelled || !profile) return
            setUser((current) => {
                if (!current) return current
                const next = {
                    ...current,
                    full_name: profile.full_name || current.full_name,
                    fullName: profile.full_name || current.fullName,
                    handle: profile.handle ?? current.handle ?? null,
                    isPublicProfile: profile.isPublicProfile === true,
                    accentColor: profile.accentColor ?? current.accentColor ?? null,
                    avatarId: profile.avatarId ?? current.avatarId ?? null,
                    avatarFrame: profile.avatarFrame ?? current.avatarFrame ?? null,
                    nameplate: profile.nameplate ?? current.nameplate ?? null,
                    pinnedStatKey: profile.pinnedStatKey ?? current.pinnedStatKey ?? null,
                    onboardingCompletedAt: profile.onboardingCompletedAt ?? current.onboardingCompletedAt ?? null,
                    onboardingSkippedAt: profile.onboardingSkippedAt ?? current.onboardingSkippedAt ?? null,
                }
                apiClient.setUser(next)
                return next
            })
        }).catch(() => {})
        return () => {
            cancelled = true
        }
    }, [token])

    const establishSession = (newToken: string, responseUser?: Partial<User> | null): User => {
        apiClient.setToken(newToken);
        const decoded = jwtDecode<User>(newToken);
        const fullUserData: User = {
            ...decoded,
            email: responseUser?.email || decoded.email,
            full_name: responseUser?.full_name || responseUser?.fullName || decoded.full_name || decoded.fullName,
            handle: responseUser?.handle ?? null,
            isPublicProfile: responseUser?.isPublicProfile === true,
            accentColor: responseUser?.accentColor || null,
            avatarId: responseUser?.avatarId || null,
            onboardingCompletedAt: responseUser?.onboardingCompletedAt || null,
            onboardingSkippedAt: responseUser?.onboardingSkippedAt || null,
            role: responseUser?.role || decoded.role,
        };
        apiClient.setUser(fullUserData);
        setToken(newToken);
        setUser(fullUserData);
        return fullUserData;
    };

    const login = async (email: string, password: string): Promise<User> => {
        try {
            const data = await apiClient.login(email, password);
            const { token: newToken, user: responseUser } = data;
            return establishSession(newToken, {
                ...responseUser,
                email: responseUser?.email || email,
            });
        } catch (error: any) {
            console.error('Login failed:', error);
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const signup = async (email: string, password: string, fullName: string, role: string) => {
        try {
            const data = await apiClient.signup(email, password, fullName, role);
            const { token: newToken, user: responseUser } = data;
            establishSession(newToken, {
                ...responseUser,
                email: responseUser?.email || email,
                full_name: fullName || responseUser?.full_name,
            });
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

    const updateUser = (partial: Partial<User>) => {
        setUser((current) => {
            if (!current) return current;
            const next = { ...current, ...partial };
            apiClient.setUser(next);
            return next;
        });
    };

    const value: AuthContextType = {
        user,
        token,
        loading,
        login,
        signup,
        establishSession,
        logout,
        updateUser,
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
