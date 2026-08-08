"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
import { getComponentCategory, isInteractiveComponent, normalizeSlides, formatSlideTitle } from '@/lib/lesson-utils';
import { FileUploader } from './FileUploader';
import { LessonContent } from './LessonContent';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Clock, User, Award, Lock, Unlock, CheckCircle2, Circle, ArrowLeft, LogOut } from 'lucide-react';
import type { Lesson, SlideState, SlideStatus } from '@/types/lesson';
import { TopProgressBar } from './TopProgressBar';
import { ScoringProvider } from '@/context/scoring-context';
import { ScoreDisplay } from '@/components/ui/score-display';
import { cn } from '@/lib/utils';
import { NavigationLockProvider } from '@/context/navigation-lock-context';
import { useRouter } from 'next/navigation';
import { syncEngine } from '@/lib/sync-engine';
import { SyncStatusHUD } from './SyncStatusHUD';
import { ReadAloudProvider } from '@/context/read-aloud-context';
import { useLessonPreloader } from '@/hooks/use-lesson-preloader';

export function LessonViewer({ initialLesson, initialInteraction, userId }: { initialLesson?: Lesson, initialInteraction?: any, userId?: string }) {
  const router = useRouter();
  const [lessonData, setLessonData] = useState<Lesson | null>(() => {
    if (initialLesson) {
      return { ...initialLesson, slides: normalizeSlides(initialLesson.slides) };
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [resolvedInteraction, setResolvedInteraction] = useState<any>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [totalPossibleScore, setTotalPossibleScore] = useState(0);
  const [nextLesson, setNextLesson] = useState<{ id: string; title: string } | null>(null);

  // Preload all lesson media assets (images, audio, TTS) whenever any lesson is opened
  useLessonPreloader({
    lessonData,
    enabled: isHydrated && !!lessonData,
  });
  const lessonContentRef = useRef<any>(null);

  const currentSlideIndexRef = useRef(currentSlideIndex);
  const currentScoreRef = useRef(currentScore);
  const totalPossibleScoreRef = useRef(totalPossibleScore);
  const lessonDataRef = useRef(lessonData);

  useEffect(() => { currentSlideIndexRef.current = currentSlideIndex; }, [currentSlideIndex]);
  useEffect(() => { currentScoreRef.current = currentScore; }, [currentScore]);
  useEffect(() => { totalPossibleScoreRef.current = totalPossibleScore; }, [totalPossibleScore]);
  useEffect(() => { lessonDataRef.current = lessonData; }, [lessonData]);

  // Fetch sibling lessons for the module so we can surface "Next Lesson" on completion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const moduleId = searchParams.get('moduleId');
    const currentLessonId = initialLesson?.id; // ast UUID string — matches lessonId in the API response
    if (!moduleId || !currentLessonId) return;

    import('@/lib/api-client').then(({ apiClient }) => {
      apiClient.lessons.getModuleLessons(moduleId)
        .then((lessons: any[]) => {
          if (!Array.isArray(lessons)) return;
          // Already sorted by order: 1 on the backend — find current and pick the next
          const currentIdx = lessons.findIndex((l) => l.lessonId === currentLessonId);
          if (currentIdx !== -1 && currentIdx < lessons.length - 1) {
            const next = lessons[currentIdx + 1];
            const nextId = next.lessonId as string; // viewer UUID
            const nextTitle = (next.title || next.name || `Lesson ${currentIdx + 2}`) as string;
            setNextLesson({ id: nextId, title: nextTitle });
          }
        })
        .catch(() => {/* silently ignore */ });
    });
  }, [initialLesson?.id]);

  const isSlideAccessible = useCallback((index: number) => {
    if (!lessonData?.slides[index]) return false;
    return lessonData.slides[index].state !== "disabled";
  }, [lessonData]);

  const findNextAccessibleSlide = useCallback((currentIndex: number, direction: 1 | -1) => {
    if (!lessonData) return -1;
    let nextIndex = currentIndex;
    while (true) {
      nextIndex += direction;
      if (nextIndex < 0 || nextIndex >= lessonData.slides.length) return -1;
      if (isSlideAccessible(nextIndex)) return nextIndex;
    }
  }, [lessonData, isSlideAccessible]);

  useEffect(() => {
    let isMounted = true;
    async function initializeState() {
      if (!initialLesson) return;

      const latestData = await syncEngine.getLatestState(userId || '', initialLesson.id, initialInteraction);
      const lessonState = latestData?.lessonState;

      if (!isMounted) return;

      const normalizedSlides = normalizeSlides(initialLesson.slides);
      const initializedSlides = normalizedSlides.map(slide => {
        const savedSlide = lessonState?.slides?.find((s: { id: string }) => s.id === slide.id);
        const finalState = (savedSlide && 'state' in savedSlide) ?
          savedSlide.state as SlideState : slide.state;
        const finalStatus = (savedSlide && 'status' in savedSlide) ?
          savedSlide.status as SlideStatus : slide.status;

        return {
          ...slide,
          state: finalState,
          status: finalStatus
        };
      });

      if (lessonState?.currentSlideIndex !== undefined) {
        setCurrentSlideIndex(lessonState.currentSlideIndex);
      } else if (initialInteraction?.lessonState?.currentSlideIndex !== undefined) {
        setCurrentSlideIndex(initialInteraction.lessonState.currentSlideIndex);
      }

      const processedSlides = initializedSlides.map((slide, index) => {
        if (slide.status === "completed") return slide;
        const hasInteractiveComponents = slide.components.some(
          (comp: any) => isInteractiveComponent(comp.type)
        );
        if (!hasInteractiveComponents) {
          const updatedSlide = { ...slide, status: "completed" as const };
          if (index < initializedSlides.length - 1) {
            initializedSlides[index + 1] = { ...initializedSlides[index + 1], state: "active" as const };
          }
          return updatedSlide;
        }
        return slide;
      });

      setLessonData({ ...initialLesson, slides: processedSlides });
      setResolvedInteraction(latestData);

      // Restore persisted score values
      if (latestData?.lessonState?.score !== undefined) {
        setCurrentScore(latestData.lessonState.score);
      }
      if (latestData?.lessonState?.totalScore !== undefined) {
        setTotalPossibleScore(latestData.lessonState.totalScore);
      }

      setIsHydrated(true);
    }

    initializeState();
    return () => { isMounted = false; };
  }, [initialLesson, initialInteraction, userId]);

  useEffect(() => {
    if (lessonData && !isSlideAccessible(currentSlideIndex)) {
      const nextIndex = findNextAccessibleSlide(currentSlideIndex, 1);
      if (nextIndex !== -1) {
        setCurrentSlideIndex(nextIndex);
      }
    }
  }, [lessonData, currentSlideIndex, isSlideAccessible, findNextAccessibleSlide]);

  useEffect(() => {
    if (!userId || !lessonData || !isHydrated) return;

    const interval = setInterval(() => {
      saveInteraction();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, lessonData?.id, isHydrated]);

  const saveInteraction = useCallback((updatedSlides?: any[]) => {
    const currentLesson = updatedSlides ? { ...lessonData, slides: updatedSlides } : lessonDataRef.current;
    if (!userId || !currentLesson) return;

    const componentsState = lessonContentRef.current?.getAllComponentStates?.() || {};
    const totalSlides = currentLesson.slides.length;
    const completedSlides = currentLesson.slides.filter((s: any) => s.status === 'completed').length;
    const progress = totalSlides > 0 ? Math.round((completedSlides / totalSlides) * 100) : 0;

    const interactionData = {
      componentsState,
      lessonState: {
        slides: currentLesson.slides.map((slide: any) => ({
          id: slide.id,
          state: slide.state,
          status: slide.status
        })),
        currentSlideIndex: currentSlideIndexRef.current,
        lessonTitle: currentLesson.title,
        lessonDescription: currentLesson.description,
        progress,
        score: currentScoreRef.current,
        totalScore: totalPossibleScoreRef.current
      }
    };

    syncEngine.save(userId as string, currentLesson.id as string, interactionData);
  }, [userId]);

  useEffect(() => {
    if (isHydrated && userId && lessonData) {
      saveInteraction();
    }
  }, [currentSlideIndex, saveInteraction, isHydrated, userId]);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const content = await file.text();
      const parsed = JSON.parse(content);

      const requiredFields = ['id', 'title', 'description', 'author', 'level', 'duration', 'slides', 'createdAt', 'updatedAt'];
      for (const field of requiredFields) {
        if (!parsed[field]) {
          throw new Error(`Invalid lesson file format - missing required field: ${field}`);
        }
      }

      if (!Array.isArray(parsed.slides)) {
        throw new Error('Invalid lesson file format - slides must be an array');
      }

      setLessonData(parsed);
      setError(null);
    } catch (err) {
      setError('Failed to load lesson file. Please make sure it is a valid lesson JSON file.');
      setLessonData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleJumpToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    lessonContentRef.current?.setCurrentSlideIndex(index);
    setIsSidebarOpen(false);
  };

  const [slideProgress, setSlideProgress] = useState(0);

  const handleScoreUpdate = useCallback((score: number, total: number) => {
    setCurrentScore(score);
    setTotalPossibleScore(total);
  }, []);

  const handleSlidesUpdate = useCallback((updatedSlides: any[]) => {
    if (!lessonData || !userId) return;

    const newSlides = lessonData.slides.map(slide => {
      const updatedSlide = updatedSlides.find(s => s.id === slide.id);
      if (!updatedSlide) return slide;
      const newSlide = { ...slide };
      if ('state' in updatedSlide) newSlide.state = updatedSlide.state as SlideState;
      if ('status' in updatedSlide) newSlide.status = updatedSlide.status as SlideStatus;
      return newSlide;
    });

    const newLessonData = { ...lessonData, slides: newSlides };
    setLessonData(newLessonData);
    lessonDataRef.current = newLessonData;

    const allCompleted = newSlides.every(s => s.status === 'completed');
    if (allCompleted) {
      const finalScore = totalPossibleScoreRef.current > 0 ?
        Math.round((currentScoreRef.current / totalPossibleScoreRef.current) * 100) : 0;

      import('@/lib/api-client').then(({ apiClient }) => {
        apiClient.lessons.markCompleted(lessonData.id, finalScore).catch(err => {
          console.error('[Viewer] Failed to mark lesson as completed:', err);
        });
      });
    }

    saveInteraction(newSlides);
  }, [userId, lessonData, saveInteraction]);

  const handleProgressUpdate = useCallback((progress: number) => {
    setSlideProgress(progress);
  }, []);

  const handleEndLesson = useCallback(() => {
    saveInteraction();
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const returnUrl = searchParams.get('returnUrl');
      const paramModuleId = searchParams.get('moduleId');
      const lessonModuleId = (lessonData as any)?.moduleId || (lessonData as any)?.module_id;
      const moduleId = paramModuleId || lessonModuleId;

      if (returnUrl) {
        router.push(returnUrl);
        return;
      }

      if (moduleId) {
        router.push(`/studio/modules/${moduleId}`);
        return;
      }

      if (window.history.length > 1) {
        router.back();
        return;
      }
    }
    router.push('/dashboard/student');
  }, [saveInteraction, router, lessonData]);

  const handleNextLesson = useCallback((nextLessonId: string) => {
    saveInteraction();
    const searchParams = new URLSearchParams(window.location.search);
    const params = new URLSearchParams();
    // Preserve auth params + moduleId so next lesson can also find ITS next lesson
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');
    const moduleId = searchParams.get('moduleId');
    const returnUrl = searchParams.get('returnUrl');
    if (userId) params.set('userId', userId);
    if (token) params.set('token', token);
    if (moduleId) params.set('moduleId', moduleId);
    if (returnUrl) params.set('returnUrl', returnUrl);
    router.push(`/viewer/${nextLessonId}?${params.toString()}`);
  }, [saveInteraction, router]);

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white border-r border-slate-800">
      {/* Lesson Title Section */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <h2 className="text-xs font-semibold text-slate-400">Course Lesson</h2>
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight leading-snug">{formatSlideTitle(lessonData?.title, 20)}</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-6">
          {/* Navigation Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400">Lesson Modules</h3>
            <div className="space-y-1.5">
              {lessonData?.slides.map((slide, index) => (
                <Button
                  key={slide.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left h-auto py-2.5 px-3.5 rounded-xl transition-all border border-transparent",
                    index === currentSlideIndex
                      ? "bg-green-500/10 border-green-500/30 text-green-400 font-semibold"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                  onClick={() => handleJumpToSlide(index)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className={cn(
                      "text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border shrink-0",
                      index === currentSlideIndex ? "bg-green-500 border-green-500 text-white" : "border-slate-700 text-slate-500"
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
                      {slide.state === "disabled" ? (
                        <Lock className="h-3.5 w-3.5 text-red-400/60" />
                      ) : (
                        <Unlock className="h-3.5 w-3.5 text-slate-600" />
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Performance Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-green-400" />
                Score Overview
              </h3>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 space-y-3">
              <ScoreDisplay />
              <div className="pt-2 border-t border-slate-700/50">
                <SyncStatusHUD />
              </div>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-green-400" />
                Instructor
              </span>
              <span className="font-semibold">{lessonData?.author}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-green-400" />
                Duration
              </span>
              <span className="font-semibold">{lessonData?.duration} minutes</span>
            </div>

            {lessonData?.description && (
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Summary</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">{lessonData.description}</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer Section */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <Button
          variant="default"
          className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] tracking-wider transition-all h-10 flex items-center justify-center gap-2 shadow-md shadow-rose-600/20"
          onClick={handleEndLesson}
        >
          <LogOut className="w-3.5 h-3.5" />
          End Lesson
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-4 bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 border-3 border-slate-800 border-t-green-500 rounded-full animate-spin" />
          <h2 className="text-xs font-semibold text-slate-400">Loading lesson...</h2>
        </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-4 bg-slate-950">
        <Card className="p-8 w-full max-w-lg bg-slate-900 border-slate-800 shadow-xl rounded-2xl">
          <div className="text-center space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20 text-green-400">
                <Award className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-white">Upload Lesson File</h2>
              <p className="text-slate-400 text-xs mt-1">Select a lesson JSON file to start learning</p>
            </div>

            <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-xl">
              <FileUploader onFileUpload={handleFileUpload} />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const currentSlide = lessonData?.slides[currentSlideIndex];

  return (
    <ScoringProvider lesson={lessonData} initialScore={resolvedInteraction?.lessonState?.score || 0}>
      <NavigationLockProvider>
        <div className="h-screen w-screen flex overflow-hidden bg-slate-50 dark:bg-slate-950">
          {/* Desktop Sidebar — controlled by hamburger, collapses inline */}
          <div className={cn(
            "hidden md:flex flex-col shrink-0 h-full transition-all duration-300 ease-in-out overflow-hidden",
            isSidebarOpen ? "w-80" : "w-0"
          )}>
            <div className="w-80 h-full">
              {renderSidebarContent()}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col relative h-full bg-white dark:bg-slate-950 overflow-hidden">
            {/* Internal Progress Bar */}
            {(() => {
              const completedSlidesCount = lessonData?.slides.filter(s => s.status === 'completed').length || 0;
              const totalSlidesCount = lessonData?.slides.length || 0;
              const overallProgress = totalSlidesCount > 0 ? (completedSlidesCount / totalSlidesCount) * 100 : 0;
              const isAllCompleted = totalSlidesCount > 0 && completedSlidesCount === totalSlidesCount;

              return (
                <TopProgressBar
                  progress={overallProgress}
                  completedSlides={completedSlidesCount}
                  totalSlides={totalSlidesCount}
                  isCompleted={isAllCompleted}
                  onMenuClick={() => {
                    if (window.innerWidth >= 768) {
                      setIsSidebarOpen(prev => !prev);
                    } else {
                      setIsMobileSheetOpen(prev => !prev);
                    }
                  }}
                />
              );
            })()}

            {/* Mobile Menu Sheet — small screens only */}
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
              <SheetContent side="left" className="w-80 p-0 border-r-0">
                {renderSidebarContent()}
              </SheetContent>
            </Sheet>

            {/* Actual Slide Content */}
            <div className="flex-1 relative overflow-hidden">
              {isHydrated ? (
                <LessonContent
                  ref={lessonContentRef}
                  lesson={lessonData!}
                  currentSlideIndex={currentSlideIndex}
                  onSlideChange={setCurrentSlideIndex}
                  initialComponentStates={resolvedInteraction?.componentsState || {}}
                  onSlidesUpdate={handleSlidesUpdate}
                  onProgressUpdate={handleProgressUpdate}
                  onScoreUpdate={handleScoreUpdate}
                  onEndLesson={handleEndLesson}
                  nextLesson={nextLesson}
                  onNextLesson={handleNextLesson}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-slate-950 h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-slate-800 border-t-green-500 rounded-full animate-spin" />
                    <span className="text-slate-400 font-medium text-xs">
                      Loading lesson content...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </NavigationLockProvider>
    </ScoringProvider>
  );
}