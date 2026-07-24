'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams?.get('role') || 'tutor';
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            if (role === 'student') {
                router.push('/dashboard/student');
            } else if (role === 'tutor') {
                router.push('/dashboard/tutor');
            } else {
                router.push('/studio/programs');
            }
        } catch (err: any) {
            setError(err.message || 'Access Denied: Invalid Credentials');
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
                        <ShieldCheck className="w-8 h-8 text-emerald-500" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                    </div>
                </div>
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-2">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">{role} Access Point</span>
                    </div>
                    <CardTitle className="text-3xl font-black text-white tracking-tight capitalize">{role} Login</CardTitle>
                    <CardDescription className="text-slate-400 font-medium">
                        Enter secure credentials to initialize interface
                    </CardDescription>
                </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 px-8">
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

                    <div className="space-y-2">
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
                                className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 text-white pl-12 h-12 rounded-xl placeholder:text-slate-700 transition-all"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access Key</Label>
                            <Link href="#" className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest">Reset Key</Link>
                        </div>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                                <Lock className="w-4 h-4" />
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 text-white pl-12 h-12 rounded-xl placeholder:text-slate-700 transition-all"
                                required
                                disabled={loading}
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
                                Authorizing...
                            </>
                        ) : (
                            <>
                                Initialize Session
                                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>

                    <div className="w-full h-px bg-slate-800/50" />

                    <p className="text-[10px] font-bold text-center text-slate-500 uppercase tracking-widest leading-relaxed">
                        UNREGISTRED IDENTITY?{' '}
                        <Link href={`/auth/signup?role=${role}`} className="text-emerald-500 hover:text-emerald-400 font-black hover:underline underline-offset-4">
                            START RECRUITMENT
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none" />
            </div>

            <Suspense fallback={<div className="text-white text-sm font-semibold">Loading login...</div>}>
                <LoginForm />
            </Suspense>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] pointer-events-none">
                AST v4.0.1 // SECURE TERMINAL
            </div>
        </div>
    );
}
