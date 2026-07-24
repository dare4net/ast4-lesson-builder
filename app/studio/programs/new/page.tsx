'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';

function NewProgramContent() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await apiClient.studio.createProgram({ name, description });
            router.push(`/studio/programs/${result.program._id}`);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create program');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Background Glow */}
            <div className="fixed top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950/0 to-slate-950/0 pointer-events-none" />

            <div className="container mx-auto px-6 py-12 max-w-2xl relative z-10">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-8 text-slate-500 hover:text-white pl-0 hover:bg-transparent transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Programs
                </Button>

                <Card className="bg-[#0F172A]/90 border-slate-800 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="border-b border-slate-800/80 pb-6">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-xs font-mono uppercase tracking-[0.2em]">Program Architecture</span>
                        </div>
                        <CardTitle className="text-3xl font-black text-white">Create New Program</CardTitle>
                        <CardDescription className="text-slate-400 text-sm">
                            Set up a new educational program folder to organize your modules and lessons.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl text-sm flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Program Title <span className="text-emerald-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Python Programming Fundamentals"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-emerald-500/50 text-white placeholder:text-slate-600 h-12 rounded-xl text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Program Overview
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Brief summary of skills, concepts, and target audience..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={loading}
                                    rows={4}
                                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-emerald-500/50 text-white placeholder:text-slate-600 rounded-xl resize-none text-sm"
                                />
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-800/80">
                                <Button
                                    type="submit"
                                    disabled={loading || !name.trim()}
                                    className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold px-8 h-11 rounded-full shadow-lg shadow-emerald-500/10"
                                >
                                    {loading ? 'Creating Program...' : 'Initialize Program'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.back()}
                                    disabled={loading}
                                    className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full px-6"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function NewProgramPage() {
    return (
        <ProtectedRoute>
            <NewProgramContent />
        </ProtectedRoute>
    );
}
