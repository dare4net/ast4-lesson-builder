"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
import { FileUploader } from './FileUploader';
import { LessonContent } from './LessonContent';
import { FeedbackSettingsButton } from '@/components/ui/feedback-settings';
import { TopProgressBar } from './TopProgressBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Clock, User, Award, LogOut } from 'lucide-react';
import { ScoringProvider } from '@/context/scoring-context';
import type { ComponentAttemptRecord } from '@/context/scoring-context';
import { ScoreDisplay } from '@/components/ui/score-display';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/types/lesson';
import { normalizeSlides, formatSlideTitle } from '@/lib/lesson-utils';
import { getSlideTheme } from '@/lib/slide-themes';
import { NavigationLockProvider } from '@/context/navigation-lock-context';
import { useRouter } from 'next/navigation';
import { appEventBus } from '@/lib/event-bus';
import { initAchievementListener } from '@/lib/achievement-listener';
import { GamificationHeader } from '@/components/gamification/GamificationHeader';
import { GamificationHubModal } from '@/components/gamification/GamificationHubModal';
import { GamificationToastContainer } from '@/components/ui/gamification-toast';
import { useGamification } from '@/context/gamification-context';
import { apiClient } from '@/lib/api-client';
import { buildStudentViewerHref } from '@/lib/viewer-url';
import { resolveLessonModuleId, resolveNextLesson, type NextLesson } from '@/lib/next-lesson';
import { LivePowerupsProvider } from '@/context/live-powerups-context';
import { LivePowerupBar } from '@/components/store/live-powerup-bar';
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
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [nextLesson, setNextLesson] = useState<NextLesson | null>(null);
  const { starBalance, level } = useGamification();
  const lessonContentRef = useRef<any>(null);
  const lessonCompletedEmittedRef = useRef(false);
  const lessonReviewedEmittedRef = useRef(false);
  const resolvedInteraction = initialInteraction;
  const attemptsMapRef = useRef<Record<string, ComponentAttemptRecord>>(resolvedInteraction?.attemptsMap || {});
  const interactionVersionRef = useRef<number>(Number(resolvedInteraction?.version) || 0);

  const currentSlideIndexRef = useRef(currentSlideIndex);
  const currentScoreRef = useRef(currentScore);
  const totalPossibleScoreRef = useRef(totalPossibleScore);
  const lessonDataRef = useRef(lessonData);

  useEffect(() => { currentSlideIndexRef.current = currentSlideIndex; }, [currentSlideIndex]);
  useEffect(() => { currentScoreRef.current = currentScore; }, [currentScore]);
  useEffect(() => { totalPossibleScoreRef.current = totalPossibleScore; }, [totalPossibleScore]);
  useEffect(() => { lessonDataRef.current = lessonData; }, [lessonData]);

  const handleAttemptsMapChange = useCallback((map: Record<string, ComponentAttemptRecord>) => {
    attemptsMapRef.current = map;
  }, []);

  useEffect(() => {
    if (!userId) return;
    return initAchievementListener(userId);
  }, [userId]);

  useEffect(() => {
    if (!lessonData?.id || lessonReviewedEmittedRef.current) return;
    const alreadyDone = (lessonData.slides || []).every((slide) => slide.status === 'completed');
    if (!alreadyDone) return;
    lessonReviewedEmittedRef.current = true;
    appEventBus.emit('LESSON_REVIEWED', { lessonId: lessonData.id });
  }, [lessonData?.id]);

  const currentLessonId = lessonData?.id
  const moduleId = resolveLessonModuleId(lessonData)

  useEffect(() => {
    if (!currentLessonId || !moduleId) {
      setNextLesson(null)
      return
    }

    let cancelled = false
    apiClient.lessons.getModuleLessons(moduleId)
      .then((rows) => {
        if (!cancelled) setNextLesson(resolveNextLesson(currentLessonId, rows))
      })
      .catch(() => {
        if (!cancelled) setNextLesson(null)
      })

    return () => {
      cancelled = true
    }
  }, [currentLessonId, moduleId])

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
      const result = await saveUserInteraction(userId, currentLessonData.id, {
        componentsState,
        attemptsMap: attemptsMapRef.current,
        version: interactionVersionRef.current,
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
      if (result.version != null) {
        interactionVersionRef.current = result.version;
      }
    }
  }, [userId]);

  const handleSlidesUpdate = useCallback((updatedSlides: any[]) => {
    if (lessonData && userId) {
      const newLessonData = { ...lessonData, slides: updatedSlides };
      setLessonData(newLessonData);
      lessonDataRef.current = newLessonData;

      const allCompleted = updatedSlides.every(s => s.status === 'completed');
      if (allCompleted) {
        const earnedPoints = currentScoreRef.current || 0;
        const possiblePoints = totalPossibleScoreRef.current || 0;
        const percentage = possiblePoints > 0 ? Math.round((earnedPoints / possiblePoints) * 100) : 0;

        import('@/lib/api-client').then(({ apiClient }) => {
          apiClient.lessons.markCompleted(lessonData.id, earnedPoints, possiblePoints)
            .then(() => {
              if (lessonCompletedEmittedRef.current) return;
              lessonCompletedEmittedRef.current = true;
              appEventBus.emit('LESSON_COMPLETED', {
                lessonId: lessonData.id,
                programId: (lessonData as { programId?: string }).programId,
                score: earnedPoints,
                maxScore: possiblePoints,
                percentage,
              });
            })
            .catch((err: any) => {
              console.error('[Viewer] Failed to mark lesson as completed:', err);
            });
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
          attemptsMap: attemptsMapRef.current,
          version: interactionVersionRef.current,
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
        }).then((result) => {
          if (result?.version != null) {
            interactionVersionRef.current = result.version;
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

  const handleNextLesson = useCallback((nextLessonId: string) => {
    performSave(true);
    const returnUrl = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('returnUrl') || undefined
      : undefined;
    router.push(buildStudentViewerHref(nextLessonId, { returnUrl }));
  }, [performSave, router]);

  const handleJumpToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    lessonContentRef.current?.setCurrentSlideIndex(index);
    setIsSidebarOpen(false);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-800">
      <div className="relative p-6 bg-gradient-to-br from-emerald-50 via-white to-sky-50 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.12)]">
        <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#58CC02]" />
          <h2 className="text-[10px] font-black uppercase tracking-wider text-[#58CC02]">Course Lesson</h2>
        </div>
        <h3 className="text-lg font-extrabold text-slate-800 tracking-tight leading-snug">{lessonData?.title}</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-6">
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-[#1CB0F6]">Slides</h3>
            <div className="space-y-1.5">
              {lessonData?.slides.map((slide, index) => {
                const theme = getSlideTheme(index);
                const isActive = index === currentSlideIndex;
                const isDone = slide.status === 'completed';
                return (
                  <Button
                    key={slide.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left h-auto py-2.5 px-3.5 rounded-xl transition-all border-2",
                      isActive
                        ? "font-extrabold shadow-sm"
                        : "hover:bg-slate-50 text-slate-600 border-transparent"
                    )}
                    style={isActive ? {
                      backgroundColor: theme.solidBgHex,
                      borderColor: theme.btnBgHex,
                      color: theme.textHex,
                    } : undefined}
                    onClick={() => handleJumpToSlide(index)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span
                        className="text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shrink-0 text-white"
                        style={{ backgroundColor: isDone ? '#58CC02' : theme.btnBgHex }}
                      >
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold truncate flex-1">{formatSlideTitle(slide.title, 20)}</span>
                      {isActive && (
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.btnBgHex }} />
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-[#FF9600] flex items-center gap-1.5">
              <Award className="h-4 w-4" />
              Score Overview
            </h3>
            <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200">
              <ScoreDisplay />
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t-2 border-slate-100 text-xs">
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-slate-500 flex items-center gap-1.5 font-bold">
                <User className="h-3.5 w-3.5 text-[#CE82FF]" />
                Instructor
              </span>
              <span className="font-extrabold">{lessonData?.author}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <span className="text-slate-500 flex items-center gap-1.5 font-bold">
                <Clock className="h-3.5 w-3.5 text-[#1CB0F6]" />
                Duration
              </span>
              <span className="font-extrabold">{lessonData?.duration} minutes</span>
            </div>

            {lessonData?.description && (
              <div className="space-y-1">
                <span className="text-[#CE82FF] font-black uppercase tracking-wider text-[10px]">Summary</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">{lessonData.description}</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="relative p-4 bg-white shadow-[0_-8px_20px_-14px_rgba(15,23,42,0.12)]">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <Button
          variant="outline"
          className="w-full min-h-11 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white font-extrabold text-xs"
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
      <div className="h-dvh w-screen flex items-center justify-center p-4 bg-gradient-to-b from-sky-50 to-emerald-50">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#58CC02] rounded-full animate-spin" />
          <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Loading lesson...</h2>
        </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center p-4 bg-gradient-to-b from-sky-50 to-emerald-50">
        <Card className="p-8 w-full max-w-lg bg-white border-2 border-slate-200 shadow-xl rounded-2xl">
          <div className="text-center space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#58CC02]/10 flex items-center justify-center mb-4 border-2 border-[#58CC02]/30 text-[#58CC02]">
                <Award className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Upload Lesson File</h2>
              <p className="text-slate-500 text-xs mt-1">Select a lesson JSON file to start learning</p>
            </div>

            <div className="p-6 bg-sky-50/80 border-2 border-sky-100 rounded-xl">
              <FileUploader onFileUpload={handleFileUpload} />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border-2 border-red-200 p-3 text-red-600 text-xs font-medium">
                {error}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const currentLive = Boolean(
    lessonData?.slides?.[currentSlideIndex]?.components?.some((comp: any) =>
      comp.mode === 'live' || comp.props?.mode === 'live' || Number(comp.props?.timeLimit) > 0
    )
  );

  return (
    <LivePowerupsProvider>
    <ScoringProvider
      lesson={lessonData}
      initialScore={resolvedInteraction?.lessonState?.score || 0}
      componentsState={resolvedInteraction?.componentsState}
      initialAttemptsMap={resolvedInteraction?.attemptsMap}
      onAttemptsMapChange={handleAttemptsMapChange}
    >
      <NavigationLockProvider>
        <div className="h-dvh w-screen flex overflow-hidden bg-gradient-to-b from-sky-50 to-emerald-50 relative">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetContent side="left" className="p-0 border-r-0 w-80 bg-white text-slate-800 z-50">
              {renderSidebarContent()}
            </SheetContent>
          </Sheet>

          <div className="flex-1 flex flex-col relative bg-white overflow-hidden">
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
                  currentSlide={currentSlideIndex + 1}
                  score={currentScore}
                  lessonTitle={lessonData?.title}
                  isCompleted={isAllCompleted}
                  onMenuClick={() => setIsSidebarOpen(true)}
                  rightContent={
                    <div className="flex items-center gap-1.5">
                      <FeedbackSettingsButton />
                      <GamificationHeader
                        starBalance={starBalance}
                        level={level}
                        onOpenHub={() => setIsHubOpen(true)}
                      />
                    </div>
                  }
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
                nextLesson={nextLesson}
                onNextLesson={handleNextLesson}
                hideChromeHeader
              />
              <LivePowerupBar visible={currentLive} />
            </div>
          </div>
        </div>
        <GamificationToastContainer />
        <GamificationHubModal
          isOpen={isHubOpen}
          onClose={() => setIsHubOpen(false)}
          starBalance={starBalance}
          userId={userId}
        />
      </NavigationLockProvider>
    </ScoringProvider>
    </LivePowerupsProvider>
  );
}