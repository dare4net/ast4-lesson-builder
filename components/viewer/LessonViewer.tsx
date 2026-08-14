"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
import { FileUploader } from './FileUploader';
import { LessonContent } from './LessonContent';
import { TopProgressBar } from './TopProgressBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Clock, User, Award, ArrowLeft, LogOut } from 'lucide-react';
import { ScoringProvider } from '@/context/scoring-context';
import { ScoreDisplay } from '@/components/ui/score-display';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/types/lesson';
import { normalizeSlides, formatSlideTitle } from '@/lib/lesson-utils';
import { NavigationLockProvider } from '@/context/navigation-lock-context';
import { apiClient } from '@/lib/api-client';

import { useRouter } from 'next/navigation';
export function LessonViewer({ initialLesson, initialInteraction, userId }: { initialLesson?: Lesson, initialInteraction?: any, userId?: string }) {
  const router = useRouter();
  const [lessonData, setLessonData] = useState<Lesson | null>(() => {
    if (initialLesson && initialInteraction?.lessonState?.slides) {
      const normalizedSlides = normalizeSlides(initialLesson.slides);
      const slidesWithStatus = normalizedSlides.map(s => {
        const savedSlide = initialInteraction.lessonState.slides.find((ss: any) => ss.id === s.id);
        return savedSlide ? { ...s, status: savedSlide.status, state: savedSlide.state } : s;
      });
      return { ...initialLesson, slides: slidesWithStatus };
    }
    if (initialLesson) {
      return { ...initialLesson, slides: normalizeSlides(initialLesson.slides) };
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialInteraction?.lessonState?.currentSlideIndex || 0);
  const [loading, setLoading] = useState<boolean>(!initialLesson);
  const [slideProgress, setSlideProgress] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [totalPossibleScore, setTotalPossibleScore] = useState(0);
  const lessonContentRef = useRef<any>(null);

  const currentSlideIndexRef = useRef(currentSlideIndex);
  const currentScoreRef = useRef(currentScore);
  const totalPossibleScoreRef = useRef(totalPossibleScore);
  const lessonDataRef = useRef(lessonData);

  useEffect(() => { currentSlideIndexRef.current = currentSlideIndex; }, [currentSlideIndex]);
  useEffect(() => { currentScoreRef.current = currentScore; }, [currentScore]);
  useEffect(() => { totalPossibleScoreRef.current = totalPossibleScore; }, [totalPossibleScore]);
  useEffect(() => { lessonDataRef.current = lessonData; }, [lessonData]);

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

  const handleSlideChange = useCallback((index: number) => {
    if (isSlideAccessible(index)) {
      setCurrentSlideIndex(index);
    }
  }, [isSlideAccessible]);

  const handleProgressUpdate = (progress: number) => {
    setSlideProgress(progress);
  };

  const handleScoreUpdate = (score: number, total: number) => {
    setCurrentScore(score);
    setTotalPossibleScore(total);
  };

  const performSave = useCallback(async (isImmediate = false) => {
    const componentsState = lessonContentRef.current?.getAllComponentStates?.();
    const currentLessonData = lessonDataRef.current;

    if (componentsState && currentLessonData && userId) {
      const completedSlides = currentLessonData.slides.filter(s => s.status === 'completed').length;
      const totalSlides = currentLessonData.slides.length;
      const overallProgress = totalSlides > 0 ? Math.round((completedSlides / totalSlides) * 100) : 0;

      const { saveUserInteraction } = await import('@/lib/user-interactions');
      await saveUserInteraction(userId, currentLessonData.id, {
        componentsState,
        lessonState: {
          slides: currentLessonData.slides.map(s => ({
            id: s.id,
            state: s.state,
            status: s.status
          })),
          currentSlideIndex: currentSlideIndexRef.current,
          lessonTitle: currentLessonData.title,
          lessonDescription: currentLessonData.description,
          progress: overallProgress,
          score: currentScoreRef.current,
          totalScore: totalPossibleScoreRef.current
        }
      });
    }
  }, [userId]);

  const handleSlidesUpdate = useCallback((updatedSlides: any[]) => {
    if (lessonData && userId) {
      const newLessonData = { ...lessonData, slides: updatedSlides };
      setLessonData(newLessonData);
      lessonDataRef.current = newLessonData;

      const allCompleted = updatedSlides.every(s => s.status === 'completed');
      if (allCompleted) {
        const finalScore = totalPossibleScoreRef.current > 0 ? Math.round((currentScoreRef.current / totalPossibleScoreRef.current) * 100) : 0;

        apiClient.lessons.markCompleted(lessonData.id, finalScore).catch((err: any) => {
          console.error('[LessonViewer] Failed to mark lesson as completed:', err);
        });
      }

      performSave(true);
    }
  }, [lessonData, userId, performSave]);

  useEffect(() => {
    if (lessonData && !isSlideAccessible(currentSlideIndex)) {
      const nextIndex = findNextAccessibleSlide(currentSlideIndex, 1);
      if (nextIndex !== -1) {
        setCurrentSlideIndex(nextIndex);
      }
    }
  }, [lessonData, currentSlideIndex, isSlideAccessible, findNextAccessibleSlide]);

  useEffect(() => {
    performSave(true);
  }, [currentSlideIndex, performSave]);

  useEffect(() => {
    if (!userId || !lessonData) return;
    const interval = setInterval(() => performSave(), 30000);
    return () => clearInterval(interval);
  }, [userId, lessonData?.id, performSave]);

  useEffect(() => {
    if (!userId || !lessonData) return;
    const componentsState = lessonContentRef.current?.getAllComponentStates?.() || {};
    if (userId && lessonData) {
      import('@/lib/user-interactions').then(({ saveUserInteraction }) => {
        saveUserInteraction(userId, lessonData.id, {
          componentsState,
          lessonState: {
            slides: lessonData.slides.map(s => ({
              id: s.id,
              state: s.state,
              status: s.status
            })),
            currentSlideIndex,
            lessonTitle: lessonData.title,
            lessonDescription: lessonData.description
          }
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, lessonData]);

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

  const resetViewer = () => {
    setLessonData(null);
    setError(null);
    setCurrentSlideIndex(0);
  };

  const handleEndLesson = useCallback(() => {
    performSave(true);
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
    resetViewer();
  }, [performSave, router, lessonData]);

  const handleJumpToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    lessonContentRef.current?.setCurrentSlideIndex(index);
    setIsSidebarOpen(false);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white border-r border-slate-800">
      {/* Lesson Title Section */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <h2 className="text-xs font-semibold text-slate-400">Course Lesson</h2>
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight leading-snug">{lessonData?.title}</h3>
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
                    {index === currentSlideIndex && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Performance Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-green-400" />
              Score Overview
            </h3>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <ScoreDisplay />
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
          onClick={() => {
            if (lessonContentRef.current?.triggerEndLesson) {
              lessonContentRef.current.triggerEndLesson();
              setIsSidebarOpen(false);
            } else {
              handleEndLesson();
            }
          }}
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

  return (
    <ScoringProvider lesson={lessonData}>
      <NavigationLockProvider>
        <div className="h-screen w-screen flex overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
          {/* Collapsible Sidebar Drawer (Hidden by default on all screens) */}
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetContent side="left" className="p-0 border-r-0 w-80 bg-slate-900 text-white z-50">
              {renderSidebarContent()}
            </SheetContent>
          </Sheet>

          {/* Main Content Area (Full screen width by default) */}
          <div className="flex-1 flex flex-col relative bg-white dark:bg-slate-950 overflow-hidden">
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
                  onMenuClick={() => setIsSidebarOpen(true)}
                />
              );
            })()}

            <div className="flex-1 relative overflow-hidden">
              <LessonContent
                ref={lessonContentRef}
                lesson={lessonData!}
                currentSlideIndex={currentSlideIndex}
                onSlideChange={handleSlideChange}
                initialComponentStates={initialInteraction?.componentsState || {}}
                onProgressUpdate={handleProgressUpdate}
                onSlidesUpdate={handleSlidesUpdate}
                onScoreUpdate={handleScoreUpdate}
                onEndLesson={handleEndLesson}
              />
            </div>
          </div>
        </div>
      </NavigationLockProvider>
    </ScoringProvider>
  );
}