'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';

function NewModuleContent() {
    const router = useRouter();
    const params = useParams();
    const programId = (params?.id as string) || '';

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await apiClient.studio.createModule(programId, { name, description });
            router.push(`/studio/programs/${programId}`);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create module');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="h-1.5 w-full bg-[#58CC02]" />

            <div className="container mx-auto px-6 py-10 max-w-2xl">
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Program
                </button>

                <Card className="bg-white border-2 border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 pb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#58CC02]/10 border border-[#58CC02]/20 mb-3 w-fit">
                            <Sparkles className="w-3.5 h-3.5 text-[#58CC02]" />
                            <span className="text-xs font-bold text-[#58CC02]">New Module</span>
                        </div>
                        <CardTitle className="text-2xl font-extrabold text-slate-800">Create New Module</CardTitle>
                        <CardDescription className="text-slate-500 text-sm">
                            Add a new module block to structure your program's lessons and activities.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2.5">
                                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-bold text-slate-700">
                                    Module Title <span className="text-[#58CC02]">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Introduction to Variables & Functions"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="h-11 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-[#58CC02] focus:bg-white transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-xs font-bold text-slate-700">
                                    Module Description
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="What core topics, exercises, and outcomes does this module cover..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={loading}
                                    rows={4}
                                    className="rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-[#58CC02] focus:bg-white transition-all resize-none text-sm"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={loading || !name.trim()}
                                    className="h-11 px-6 rounded-xl font-extrabold text-sm text-white flex items-center gap-2 border-b-4 transition-all duration-150 active:border-b-0 active:translate-y-[2px] disabled:opacity-60 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}
                                >
                                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : 'Create Module'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    disabled={loading}
                                    className="h-11 px-5 rounded-xl font-semibold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function NewModulePage() {
    return <ProtectedRoute><NewModuleContent /></ProtectedRoute>;
}
