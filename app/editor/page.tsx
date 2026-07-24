'use client';

import { LessonBuilder } from '@/components/lesson-builder';
import ProtectedRoute from '@/components/auth/protected-route';

export default function EditorPage() {
    return (
        <ProtectedRoute>
            <main className="min-h-screen">
                <LessonBuilder />
            </main>
        </ProtectedRoute>
    );
}
