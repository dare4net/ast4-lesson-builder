'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { apiClient } from '@/lib/api-client';
import { defaultLesson } from '@/lib/default-lesson';

function NewLessonContent() {
    const router = useRouter();
    const params = useParams();
    const moduleId = params.id as string;
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    const handleCreateLesson = async () => {
        setCreating(true);
        setError('');

        try {
            // Create skeletal lesson in DB immediately
            const lessonData = {
                title: defaultLesson.title,
                description: defaultLesson.description,
                slides: defaultLesson.slides,
                settings: {},
            };

            const result = await apiClient.studio.createLesson(moduleId, lessonData);

            // Redirect to editor with the new lessonId
            // The editor will load this specific lesson record
            router.push(`/editor?lessonId=${result.lesson._id}`);
        } catch (err: any) {
            console.error('Failed to create lesson:', err);
            setError('Failed to initialize lesson. Please try again.');
            setCreating(false);
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
                        <CardTitle>Create New Lesson</CardTitle>
                        <CardDescription>
                            Initialize a new lesson in the database and open the editor
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 py-8 text-center">
                        <p className="text-gray-600">
                            Click below to create a new lesson. This will create a database record and take you to the studio to start editing.
                        </p>

                        {error && (
                            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <Button onClick={handleCreateLesson} size="lg" disabled={creating}>
                                {creating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create & Open Editor'
                                )}
                            </Button>
                            <Button variant="outline" onClick={() => router.back()} disabled={creating}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function NewLessonPage() {
    return (
        <ProtectedRoute>
            <NewLessonContent />
        </ProtectedRoute>
    );
}
