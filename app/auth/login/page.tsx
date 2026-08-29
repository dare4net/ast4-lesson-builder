'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Loader2, ArrowRight, GraduationCap, BookOpenCheck, Sparkles, Zap, Flame, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams?.get('role') || 'tutor';
    const { login, logout } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isStudent = role === 'student';
    const accent = isStudent ? '#1CB0F6' : '#58CC02';
    const accentBorder = isStudent ? '#0090CC' : '#378000';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const loggedInUser = await login(email, password);
            const userRole = loggedInUser?.role?.toLowerCase() || 'student';

            // Role guard check: If logging in via Tutor Portal, user MUST have role 'tutor'
            if (!isStudent && userRole === 'student') {
                logout(); // clear token session created
                setError('Access denied: This account is registered as a Student. Please log in via the Student Portal.');
                setLoading(false);
                return;
            }

            // Redirect based on user role
            router.push(userRole === 'tutor' ? '/dashboard/tutor' : '/dashboard/student');
        } catch (err: any) {
            setError(err.message || 'Invalid email or password. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md flex flex-col items-center gap-5 z-10">
            {/* Main Auth Form Card - Clean border, NO drop shadow */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full bg-white border-2 border-slate-200 rounded-3xl overflow-hidden"
            >
                {/* Top accent stripe */}
                <div className="h-2 w-full" style={{ backgroundColor: accent }} />

                <div className="p-7 sm:p-8">
                    {/* Logo + Role badge */}
                    <div className="flex flex-col items-center gap-3 mb-6 text-center">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-white border-4 border-slate-100 border-b-4 border-b-slate-300 flex items-center justify-center overflow-hidden p-2">
                                <Image src="/icons/icon-192x192.png" alt="AST Logo" width={48} height={48} className="object-contain" priority />
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FFC800] border-2 border-white flex items-center justify-center shadow-sm">
                                <Sparkles className="w-3.5 h-3.5 text-slate-900 fill-slate-900" />
                            </div>
                        </div>

                        <div
                            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-black tracking-wide"
                            style={{ backgroundColor: `${accent}15`, borderColor: `${accent}40`, color: accent }}
                        >
                            {isStudent ? <GraduationCap className="w-4 h-4" /> : <BookOpenCheck className="w-4 h-4" />}
                            <span className="capitalize">{role} Portal Login</span>
                        </div>

                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Welcome Back</h1>
                            <p className="text-slate-500 text-xs font-semibold mt-0.5">Sign in to jump back into action</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-3.5 text-xs font-bold text-red-600 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-2"
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
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
                                    className="pl-10 h-11 rounded-xl border-2 border-slate-200 bg-slate-50/80 text-slate-800 placeholder:text-slate-400 focus:border-[#58CC02] focus:bg-white font-semibold text-sm transition-all"
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
                                    className="pl-10 h-11 rounded-xl border-2 border-slate-200 bg-slate-50/80 text-slate-800 placeholder:text-slate-400 focus:border-[#58CC02] focus:bg-white font-semibold text-sm transition-all"
                                    required disabled={loading}
                                />
                            </div>
                        </div>

                        {/* 3D Tactile Duo Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-3 px-5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all border-b-4 active:border-b-0 active:translate-y-[2px] disabled:opacity-70 disabled:cursor-not-allowed group uppercase tracking-wider"
                            style={{ backgroundColor: accent, borderColor: accentBorder }}
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</>
                            ) : (
                                <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>

                        <div className="pt-3 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-500 font-bold">
                                Don't have an account?{' '}
                                <Link href={`/auth/signup?role=${role}`} className="font-extrabold hover:underline" style={{ color: accent }}>
                                    Create an Account
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </motion.div>

            {/* Compact Centered Standalone Button below auth form */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="w-full flex justify-center"
            >
                <Link href={`/auth/login?role=${isStudent ? 'tutor' : 'student'}`}>
                    <button
                        type="button"
                        className="py-2 px-4 rounded-xl font-black text-xs text-white inline-flex items-center justify-center gap-1.5 transition-all border-b-4 active:border-b-0 active:translate-y-[2px] shadow-sm uppercase tracking-wider"
                        style={{
                            backgroundColor: isStudent ? '#58CC02' : '#1CB0F6',
                            borderColor: isStudent ? '#378000' : '#0090CC'
                        }}
                    >
                        <span className="flex items-center gap-1.5">
                            {isStudent ? <Zap className="w-3.5 h-3.5 fill-white" /> : <GraduationCap className="w-3.5 h-3.5" />}
                            {isStudent ? 'Switch to Teacher Studio' : 'Switch to Student Portal'}
                        </span>
                    </button>
                </Link>
            </motion.div>
        </div>
    );
}

function LoginFloatingBadges() {
    const reduceMotion = useReducedMotion()
    return (
        <>
            <motion.div
                className="absolute top-12 left-10 p-3 bg-white border-2 border-[#FFC800] rounded-2xl hidden md:flex items-center gap-2"
                animate={reduceMotion ? undefined : { y: [0, -8, 0], rotate: [-3, 3, -3] }}
                transition={reduceMotion ? undefined : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className="w-7 h-7 rounded-xl bg-[#FFC800] flex items-center justify-center text-white font-black text-xs">
                    <Zap className="w-3.5 h-3.5 fill-white" />
                </div>
                <span className="text-xs font-black text-slate-800">Ready to Learn</span>
            </motion.div>

            <motion.div
                className="absolute bottom-16 right-10 p-3 bg-white border-2 border-[#FF4B4B] rounded-2xl hidden md:flex items-center gap-2"
                animate={reduceMotion ? undefined : { y: [0, 8, 0], rotate: [3, -3, 3] }}
                transition={reduceMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className="w-7 h-7 rounded-xl bg-[#FF4B4B] flex items-center justify-center text-white font-black text-xs">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                </div>
                <span className="text-xs font-black text-slate-800">Streak On!</span>
            </motion.div>
        </>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden select-none">
            {/* Rainbow Duo Top Bar */}
            <div className="absolute top-0 inset-x-0 h-2.5 flex z-20">
                <div className="flex-1 bg-[#58CC02]" />
                <div className="flex-1 bg-[#1CB0F6]" />
                <div className="flex-1 bg-[#FFC800]" />
                <div className="flex-1 bg-[#FF4B4B]" />
                <div className="flex-1 bg-[#CE82FF]" />
            </div>

            {/* Canvas Dot Pattern Background */}
            <div
                className="absolute inset-0 opacity-[0.2] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#1CB0F6 1.5px, transparent 1.5px)`,
                    backgroundSize: '28px 28px'
                }}
            />

            {/* Decorative Floating Badges */}
            <LoginFloatingBadges />

            <Suspense fallback={<div className="text-slate-600 text-xs font-extrabold">Loading...</div>}>
                <LoginForm />
            </Suspense>

            <p className="mt-6 text-[11px] font-black text-slate-400 uppercase tracking-widest z-10">
                After-School Tech Studio • Interactive Learning Platform
            </p>
        </div>
    );
}

