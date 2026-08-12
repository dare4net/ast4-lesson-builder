"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { normalizeSlides, formatSlideTitle, isInteractiveComponent } from '@/lib/lesson-utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Award, Lock, Unlock, CheckCircle2, Circle, ArrowLeft, Eye, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Lesson } from '@/types/lesson';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { syncEngine } from '@/lib/sync-engine';
import { TutorLessonContent } from './TutorLessonContent';

import { ScoringProvider } from '@/context/scoring-context';
import { NavigationLockProvider } from '@/context/navigation-lock-context';
import { ReadAloudProvider } from '@/context/read-aloud-context';

import { SoundEffects } from '@/lib/sound-effects';

export function TutorLessonViewer({
    initialLesson,
    initialInteraction,
    studentId,
    studentName = 'Student',
    returnUrl
}: {
    initialLesson?: Lesson;
    initialInteraction?: any;
    studentId: string;
    studentName?: string;
    returnUrl?: string;
}) {
    const router = useRouter();
    const [lessonData, setLessonData] = useState<Lesson | null>(() => {
        if (initialLesson) {
            return { ...initialLesson, slides: normalizeSlides(initialLesson.slides) };
        }
        return null;
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isHydrated, setIsHydrated] = useState(false);
    const [resolvedInteraction, setResolvedInteraction] = useState<any>(null);

    // Mute sound effects and cancel speech synthesis while in Tutor Inspection Mode
    useEffect(() => {
        SoundEffects.mute();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        return () => {
            SoundEffects.unmute();
        };
    }, []);

    // Hydrate student interaction state (read-only — never saves back)
    useEffect(() => {
        let isMounted = true;
        async function initializeState() {
            if (!initialLesson) return;

            const latestData = initialInteraction;
            if (!isMounted) return;

            const normalizedSlides = normalizeSlides(initialLesson.slides);
            // Apply saved slide states from student interaction
            const initializedSlides = normalizedSlides.map(slide => {
                const savedSlide = latestData?.lessonState?.slides?.find((s: any) => s.id === slide.id);
                return {
                    ...slide,
                    state: savedSlide?.state || slide.state,
                    status: savedSlide?.status || slide.status
                };
            });

            if (latestData?.lessonState?.currentSlideIndex !== undefined) {
                setCurrentSlideIndex(latestData.lessonState.currentSlideIndex);
            }

            setLessonData({ ...initialLesson, slides: initializedSlides });
            setResolvedInteraction(latestData);
            setIsHydrated(true);
        }
        initializeState();
        return () => { isMounted = false; };
    }, [initialLesson, initialInteraction, studentId]);

    const handleJumpToSlide = (index: number) => {
        setCurrentSlideIndex(index);
        setIsSidebarOpen(false);
    };

    const handleGoBack = useCallback(() => {
        if (returnUrl) {
            router.push(returnUrl);
        } else if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            router.push('/dashboard/tutor/students');
        }
    }, [returnUrl, router]);

    const renderSidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-900 text-white border-r border-slate-800">
            {/* Tutor Mode Banner */}
            <div className="p-4 bg-amber-500/10 border-b border-amber-500/30">
                <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Tutor Inspection Mode</span>
                </div>
                <p className="text-xs font-bold text-amber-200/80 mt-1">
                    Viewing: <span className="text-white font-extrabold">{studentName}</span>
                </p>
            </div>

            {/* Lesson Title */}
            <div className="p-5 border-b border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <h2 className="text-xs font-semibold text-slate-400">Lesson Under Review</h2>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight leading-snug">{formatSlideTitle(lessonData?.title, 20)}</h3>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-5 space-y-6">
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-slate-400">Slides</h3>
                        <div className="space-y-1.5">
                            {lessonData?.slides.map((slide, index) => (
                                <Button
                                    key={slide.id}
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start text-left h-auto py-2.5 px-3.5 rounded-xl transition-all border border-transparent",
                                        index === currentSlideIndex
                                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-semibold"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                                    )}
                                    onClick={() => handleJumpToSlide(index)}
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <span className={cn(
                                            "text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border shrink-0",
                                            index === currentSlideIndex ? "bg-amber-500 border-amber-500 text-white" : "border-slate-700 text-slate-500"
                                        )}>
                                            {index + 1}
                                        </span>
                                        <span className="text-xs font-medium truncate flex-1">{formatSlideTitle(slide.title, 20)}</span>
                                        <div className="flex items-center gap-1.5">
                                            {slide.status === "completed" ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                                            ) : (
                                                <Circle className="h-3.5 w-3.5 text-slate-700" />
                                            )}
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Score from student progress */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-1.5">
                            <Award className="h-4 w-4 text-amber-400" />
                            <h3 className="text-xs font-semibold text-slate-400">Student Score</h3>
                        </div>
                        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400">Points Earned</span>
                                <span className="text-lg font-black text-white tabular-nums">
                                    {resolvedInteraction?.lessonState?.score || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400">Progress</span>
                                <span className="text-xs font-bold text-amber-400">
                                    {resolvedInteraction?.lessonState?.progress || 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900">
                <Button
                    variant="default"
                    className="w-full rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black uppercase text-[10px] tracking-wider transition-all h-10 flex items-center justify-center gap-2 shadow-md shadow-amber-600/20"
                    onClick={handleGoBack}
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Student
                </Button>
            </div>
        </div>
    );

    if (!lessonData) {
        return (
            <div className="h-screen w-screen flex items-center justify-center p-4 bg-slate-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-slate-800 border-t-amber-500 rounded-full animate-spin" />
                    <span className="text-slate-400 font-medium text-xs">Loading student lesson...</span>
                </div>
            </div>
        );
    }

    return (
        <ScoringProvider lesson={lessonData} initialScore={resolvedInteraction?.lessonState?.score || 0}>
            <NavigationLockProvider>
                <ReadAloudProvider initialEnabled={false}>
                    <div className="h-screen w-screen flex overflow-hidden bg-slate-950">
                        {/* Desktop Sidebar */}
                        <div className={cn(
                            "hidden md:flex flex-col shrink-0 h-full transition-all duration-300 ease-in-out overflow-hidden",
                            isSidebarOpen ? "w-80" : "w-0"
                        )}>
                            <div className="w-80 h-full">
                                {renderSidebarContent()}
                            </div>
                        </div>

                        {/* Mobile Sheet */}
                        <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                            <SheetContent side="left" className="w-80 p-0 border-r-0">
                                {renderSidebarContent()}
                            </SheetContent>
                        </Sheet>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col relative h-full bg-white dark:bg-slate-950 overflow-hidden">
                            {/* Tutor Banner */}
                            <div className="shrink-0 bg-amber-500/10 border-b-2 border-amber-500/30 px-5 py-2.5 flex items-center justify-between z-40">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded-full md:hidden"
                                        onClick={() => setIsMobileSheetOpen(true)}
                                    >
                                        <Eye className="w-4 h-4 text-amber-500" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded-full hidden md:flex"
                                        onClick={() => setIsSidebarOpen(prev => !prev)}
                                    >
                                        <Eye className="w-4 h-4 text-amber-500" />
                                    </Button>

                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                                            Read-Only Tutor View
                                        </span>
                                        <span className="text-xs font-bold text-amber-800 hidden sm:inline">— {studentName}'s Session</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-amber-700 tabular-nums">
                                        Slide {currentSlideIndex + 1}/{lessonData.slides.length}
                                    </span>
                                </div>
                            </div>

                            {/* Lesson Content */}
                            <div className="flex-1 relative overflow-hidden">
                                {isHydrated ? (
                                    <TutorLessonContent
                                        lesson={lessonData}
                                        currentSlideIndex={currentSlideIndex}
                                        onSlideChange={setCurrentSlideIndex}
                                        initialComponentStates={resolvedInteraction?.componentsState || {}}
                                        studentId={studentId}
                                    />
                                ) : (
                                    <div className="flex-1 flex items-center justify-center bg-slate-950 h-full">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-slate-800 border-t-amber-500 rounded-full animate-spin" />
                                            <span className="text-slate-400 font-medium text-xs">Hydrating student state...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ReadAloudProvider>
            </NavigationLockProvider>
        </ScoringProvider>
    );
}
