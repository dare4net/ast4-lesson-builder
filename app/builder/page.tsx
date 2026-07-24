import { Suspense } from 'react';
import { LessonBuilder } from '@/components/lesson-builder';
import { Loader2 } from 'lucide-react';

export default function BuilderPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      }>
        <LessonBuilder />
      </Suspense>
    </div>
  );
}