'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, Loader2, Sparkles, ChevronRight, Fingerprint } from 'lucide-react';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Access Denied: Security Key must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            await signup(email, password, fullName, role);
            if (role === 'student') {
                router.push('/dashboard/student');
            } else if (role === 'tutor') {
                router.push('/dashboard/tutor');
            } else {
                router.push('/studio/programs');
            }
        } catch (err: any) {
            setError(err.message || 'Recruitment Failed: Registration Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border-slate-800 shadow-2xl relative z-10 rounded-[2rem] overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

            <CardHeader className="space-y-4 pt-8 text-center">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-center relative shadow-lg shadow-emerald-500/10">
                        <Fingerprint className="w-8 h-8 text-emerald-500" />
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                </div>
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-2">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">{role} Recruitment</span>
                    </div>
                    <CardTitle className="text-3xl font-black text-white tracking-tight capitalize">Join The Team</CardTitle>
                    <CardDescription className="text-slate-400 font-medium">
                        Register your identity for portal access
                    </CardDescription>
                </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5 px-8">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3"
                        >
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity Name</Label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                                <User className="w-4 h-4" />
                            </div>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Operator Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 text-white pl-12 h-11 rounded-xl placeholder:text-slate-700 transition-all font-medium"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Terminal ID (Email)</Label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                                <Mail className="w-4 h-4" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                placeholder="operator@afterschool.tech"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 text-white pl-12 h-11 rounded-xl placeholder:text-slate-700 transition-all font-medium"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Access Key</Label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                                <Lock className="w-4 h-4" />
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="At least 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 text-white pl-12 h-11 rounded-xl placeholder:text-slate-700 transition-all font-medium"
                                required
                                disabled={loading}
                                minLength={8}
                            />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-6 pb-8 px-8 pt-4">
                    <Button
                        type="submit"
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest h-12 rounded-xl shadow-lg shadow-emerald-500/20 group transition-all"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Confirm Recruitment
                                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>

                    <div className="w-full h-px bg-slate-800/50" />

                    <p className="text-[10px] font-bold text-center text-slate-500 uppercase tracking-widest leading-relaxed">
                        ALREADY ENLISTED?{' '}
                        <Link href={`/auth/login?role=${role}`} className="text-emerald-500 hover:text-emerald-400 font-black hover:underline underline-offset-4">
                            INITIALIZE SESSION
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            </div>

            <Suspense fallback={<div className="text-white text-sm font-semibold">Loading signup...</div>}>
                <SignupForm />
            </Suspense>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] pointer-events-none">
                AST v4.0.1 // RECRUITMENT TERMINAL
            </div>
        </div>
    );
}
