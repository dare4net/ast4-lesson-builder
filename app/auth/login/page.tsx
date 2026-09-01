'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthShell } from '@/components/auth/auth-shell';
import { studentPostAuthPath, safeNextPath } from '@/lib/onboarding';
import { homePathForRole } from '@/lib/home-path';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams?.get('role') || 'tutor';
    const next = searchParams?.get('next');
    const { login, logout } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isStudent = role === 'student';
    const isOrg = role === 'organization';
    const accent = isStudent ? '#1CB0F6' : isOrg ? '#0EA5E9' : '#58CC02';
    const accentBorder = isStudent ? '#0090CC' : isOrg ? '#0284C7' : '#378000';
    const nextQuery = next ? `&next=${encodeURIComponent(next)}` : '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const loggedInUser = await login(email, password);
            const userRole = loggedInUser?.role?.toLowerCase() || 'student';
            const dest = safeNextPath(next);

            if (isOrg) {
                if (userRole === 'student') {
                    logout();
                    setError('Access denied: Students use the student portal. Club staff should sign in here.');
                    setLoading(false);
                    return;
                }
                router.push(dest || '/dashboard/org');
                return;
            }

            if (!isStudent && userRole === 'student') {
                logout();
                setError('Access denied: This account is registered as a Student. Please log in via the Student Portal.');
                setLoading(false);
                return;
            }

            if (userRole === 'organization') {
                router.push(dest || '/dashboard/org');
                return;
            }

            if (userRole === 'tutor' || userRole === 'teacher' || userRole === 'admin') {
                router.push(dest || homePathForRole(userRole));
                return;
            }

            router.push(studentPostAuthPath(loggedInUser, next));
        } catch (err: any) {
            setError(err.message || 'Invalid email or password. Please try again.');
            setLoading(false);
        }
    };

    return (
        <AuthShell role={role} mode="login" next={next}>
            <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back</h1>
                <p className="text-slate-500 text-sm font-semibold mt-1">
                    {isStudent
                        ? 'Jump back into lessons, stars, and pride.'
                        : isOrg
                          ? 'Manage cohorts, seats, and join codes for your club.'
                          : 'Open your studio and keep building.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3.5 text-xs font-bold text-red-600 bg-red-50 border-2 border-red-200 rounded-2xl"
                    >
                        {error}
                    </motion.div>
                )}

                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            id="email" type="email" placeholder="you@example.com"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-11 rounded-xl border-2 border-slate-200 bg-slate-50/80 text-slate-800 placeholder:text-slate-400 focus:border-[#58CC02] focus:bg-white font-semibold text-sm"
                            required disabled={loading}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            id="password" type="password" placeholder="••••••••"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-11 rounded-xl border-2 border-slate-200 bg-slate-50/80 text-slate-800 placeholder:text-slate-400 focus:border-[#58CC02] focus:bg-white font-semibold text-sm"
                            required disabled={loading}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 border-b-4 active:border-b-0 active:translate-y-[2px] disabled:opacity-70 uppercase tracking-wider"
                    style={{ backgroundColor: accent, borderColor: accentBorder }}
                >
                    {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</>
                    ) : (
                        <>Sign In <ArrowRight className="w-4 h-4" /></>
                    )}
                </button>

                <p className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500 font-bold">
                    {isOrg ? (
                        <>Club access is invite-only. Use the link from your invite email.</>
                    ) : (
                        <>
                            Don&apos;t have an account?{' '}
                            <Link href={`/auth/signup?role=${role}${nextQuery}`} className="font-extrabold hover:underline" style={{ color: accent }}>
                                Create an Account
                            </Link>
                        </>
                    )}
                </p>
            </form>
        </AuthShell>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen grid place-items-center text-slate-600 text-xs font-extrabold">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
