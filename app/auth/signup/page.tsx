'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, User, Loader2, ArrowRight, GraduationCap, BookOpenCheck } from 'lucide-react';
import { motion } from 'framer-motion';

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams?.get('role') || 'tutor';
    const { signup } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isStudent = role === 'student';
    const accent = isStudent ? '#1CB0F6' : '#58CC02';
    const accentBorder = isStudent ? '#1899D6' : '#3B8C00';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        setLoading(true);
        try {
            await signup(email, password, fullName, role);
            router.push(isStudent ? '/dashboard/student' : '/dashboard/tutor');
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md bg-white border-2 border-slate-200 shadow-xl rounded-3xl overflow-hidden"
        >
            {/* Top accent stripe */}
            <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />

            <div className="p-8">
                {/* Logo + Role badge */}
                <div className="flex flex-col items-center gap-3 mb-7">
                    <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
                        <Image src="/icons/icon-192x192.png" alt="AST Logo" width={44} height={44} className="object-contain" priority />
                    </div>
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold"
                        style={{ backgroundColor: `${accent}15`, borderColor: `${accent}30`, color: accent }}
                    >
                        {isStudent ? <GraduationCap className="w-3.5 h-3.5" /> : <BookOpenCheck className="w-3.5 h-3.5" />}
                        <span className="capitalize">{role} Account Registration</span>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Create Account</h1>
                        <p className="text-slate-500 text-xs font-medium mt-0.5">Get started with After-School Tech Studio</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
                        >
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="fullName" className="text-xs font-bold text-slate-700">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                id="fullName" type="text" placeholder="Jane Doe"
                                value={fullName} onChange={(e) => setFullName(e.target.value)}
                                className="pl-10 h-11 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-[#58CC02] focus:bg-white font-medium text-sm transition-all"
                                required disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                id="email" type="email" placeholder="you@example.com"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 h-11 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-[#58CC02] focus:bg-white font-medium text-sm transition-all"
                                required disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-xs font-bold text-slate-700">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                id="password" type="password" placeholder="At least 8 characters"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 h-11 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-[#58CC02] focus:bg-white font-medium text-sm transition-all"
                                required disabled={loading} minLength={8}
                            />
                        </div>
                    </div>

                    {/* 3D Duo button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3 px-5 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 transition-all duration-150 border-b-4 active:border-b-0 active:translate-y-[2px] disabled:opacity-70 disabled:cursor-not-allowed group"
                        style={{ backgroundColor: accent, borderColor: accentBorder }}
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</>
                        ) : (
                            <>Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                        )}
                    </button>

                    <div className="pt-3 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-500 font-medium">
                            Already have an account?{' '}
                            <Link href={`/auth/login?role=${role}`} className="font-bold hover:underline" style={{ color: accent }}>
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#58CC02]" />
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/3 right-1/4 w-[40%] h-[40%] bg-[#1CB0F6]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/3 left-1/4 w-[40%] h-[40%] bg-[#58CC02]/5 rounded-full blur-[100px]" />
            </div>

            <Suspense fallback={<div className="text-slate-600 text-xs font-semibold">Loading...</div>}>
                <SignupForm />
            </Suspense>

            <p className="mt-6 text-[11px] font-medium text-slate-400">
                After-School Tech Studio • Account Registration
            </p>
        </div>
    );
}
