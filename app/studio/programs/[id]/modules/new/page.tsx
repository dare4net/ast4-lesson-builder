'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';

function NewModuleContent() {
    const router = useRouter();
    const params = useParams();
    const programId = params.id as string;

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Create New Module</CardTitle>
                        <CardDescription>
                            Add a new module to organize related lessons
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name">Module Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Introduction to Variables"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="What topics does this module cover..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={loading}
                                    rows={4}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={loading || !name.trim()}>
                                    {loading ? 'Creating...' : 'Create Module'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={loading}
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

export default function NewModulePage() {
    return (
        <ProtectedRoute>
            <NewModuleContent />
        </ProtectedRoute>
    );
}
