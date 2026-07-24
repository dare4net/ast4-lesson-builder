"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
import { FileUploader } from './FileUploader';
import { LessonContent } from './LessonContent';
import { TopProgressBar } from './TopProgressBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Menu, Clock, User, Award } from 'lucide-react';
import { ScoringProvider } from '@/context/scoring-context';
import { ScoreDisplay } from '@/components/ui/score-display';
import { cn } from '@/lib/utils';
import type { Lesson } from '@/types/lesson';
import { NavigationLockProvider } from '@/context/navigation-lock-context';
import { apiClient } from '@/lib/api-client';

export function LessonViewer({ initialLesson, initialInteraction, userId }: { initialLesson?: Lesson, initialInteraction?: any, userId?: string }) {
  const [lessonData, setLessonData] = useState<Lesson | null>(() => {
    if (initialLesson && initialInteraction?.lessonState?.slides) {
      const slidesWithStatus = initialLesson.slides.map(s => {
        const savedSlide = initialInteraction.lessonState.slides.find((ss: any) => ss.id === s.id);
        return savedSlide ? { ...s, status: savedSlide.status, state: savedSlide.state } : s;
      });
      return { ...initialLesson, slides: slidesWithStatus };
    }
    return initialLesson || null;
  });
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialInteraction?.lessonState?.currentSlideIndex || 0);
  const [loading, setLoading] = useState<boolean>(!initialLesson);
  const [slideProgress, setSlideProgress] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [totalPossibleScore, setTotalPossibleScore] = useState(0);
  const lessonContentRef = useRef<any>(null);

  // Refs for tracking latest state in periodic timer
  const currentSlideIndexRef = useRef(currentSlideIndex);
  const currentScoreRef = useRef(currentScore);
  const totalPossibleScoreRef = useRef(totalPossibleScore);
  const lessonDataRef = useRef(lessonData);

  useEffect(() => { currentSlideIndexRef.current = currentSlideIndex; }, [currentSlideIndex]);
  useEffect(() => { currentScoreRef.current = currentScore; }, [currentScore]);
  useEffect(() => { totalPossibleScoreRef.current = totalPossibleScore; }, [totalPossibleScore]);
  useEffect(() => { lessonDataRef.current = lessonData; }, [lessonData]);

  // Function to check if a slide is accessible
  const isSlideAccessible = useCallback((index: number) => {
    if (!lessonData?.slides[index]) return false;
    return lessonData.slides[index].state !== "disabled";
  }, [lessonData]);

  // Function to find next accessible slide
  const findNextAccessibleSlide = useCallback((currentIndex: number, direction: 1 | -1) => {
    if (!lessonData) return -1;
    let nextIndex = currentIndex;
    while (true) {
      nextIndex += direction;
      if (nextIndex < 0 || nextIndex >= lessonData.slides.length) return -1;
      if (isSlideAccessible(nextIndex)) return nextIndex;
    }
  }, [lessonData, isSlideAccessible]);

  // Modified slide navigation functions
  const goToNextSlide = useCallback(() => {
    const nextIndex = findNextAccessibleSlide(currentSlideIndex, 1);
    if (nextIndex !== -1) setCurrentSlideIndex(nextIndex);
  }, [currentSlideIndex, findNextAccessibleSlide]);

  const goToPreviousSlide = useCallback(() => {
    const prevIndex = findNextAccessibleSlide(currentSlideIndex, -1);
    if (prevIndex !== -1) setCurrentSlideIndex(prevIndex);
  }, [currentSlideIndex, findNextAccessibleSlide]);

  // Modified setCurrentSlideIndex to respect disabled state
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

  // Helper for actual saving
  const performSave = useCallback(async (isImmediate = false) => {
    const componentsState = lessonContentRef.current?.getAllComponentStates?.();
    const currentLessonData = lessonDataRef.current;

    if (componentsState && currentLessonData && userId) {
      const completedSlides = currentLessonData.slides.filter(s => s.status === 'completed').length;
      const totalSlides = currentLessonData.slides.length;
      const overallProgress = totalSlides > 0 ? Math.round((completedSlides / totalSlides) * 100) : 0;

      const { saveUserInteraction } = await import('@/lib/user-interactions');
      const ok = await saveUserInteraction(userId, currentLessonData.id, {
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
      console.log(`[LessonViewer] ${isImmediate ? 'Immediate' : 'Periodic'} save result:`, ok);
    }
  }, [userId]);

  const handleSlidesUpdate = useCallback((updatedSlides: any[]) => {
    if (lessonData && userId) {
      const newLessonData = { ...lessonData, slides: updatedSlides };
      setLessonData(newLessonData);
      lessonDataRef.current = newLessonData; // Update ref immediately for save

      // Check if ALL slides are completed
      const allCompleted = updatedSlides.every(s => s.status === 'completed');
      if (allCompleted) {
        console.log('[LessonViewer] All slides completed. Marking lesson as finished.');
        const finalScore = totalPossibleScoreRef.current > 0 ? Math.round((currentScoreRef.current / totalPossibleScoreRef.current) * 100) : 0;

        apiClient.lessons.markCompleted(lessonData.id, finalScore).then(() => {
          console.log('[LessonViewer] Lesson successfully marked as completed on backend');
        }).catch((err: any) => {
          console.error('[LessonViewer] Failed to mark lesson as completed:', err);
        });
      }

      // Trigger immediate save when slides update
      performSave(true);
    }
  }, [lessonData, userId, performSave]);

  // Auto-skip disabled slides on initial load
  useEffect(() => {
    if (lessonData && !isSlideAccessible(currentSlideIndex)) {
      const nextIndex = findNextAccessibleSlide(currentSlideIndex, 1);
      if (nextIndex !== -1) {
        setCurrentSlideIndex(nextIndex);
      }
    }
  }, [lessonData, currentSlideIndex, isSlideAccessible, findNextAccessibleSlide]);

  // Save on slide change
  useEffect(() => {
    performSave(true);
  }, [currentSlideIndex, performSave]);

  // Heartbeat save every 30s
  useEffect(() => {
    if (!userId || !lessonData) return;
    const interval = setInterval(() => performSave(), 30000);
    return () => clearInterval(interval);
  }, [userId, lessonData?.id, performSave]);

  // Save an initial interaction if none exists
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
        }).then((ok) => {
          console.log('[LessonViewer] Initial saveUserInteraction result:', ok);
        });
      });
    }
    // Only run once on mount when userId/lessonData are available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, lessonData]);

  // Handle file upload with loading state
  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const content = await file.text();
      const parsed = JSON.parse(content);

      // Validate required Lesson fields
      const requiredFields = ['id', 'title', 'description', 'author', 'level', 'duration', 'slides', 'createdAt', 'updatedAt'];
      for (const field of requiredFields) {
        if (!parsed[field]) {
          throw new Error(`Invalid lesson file format - missing required field: ${field}`);
        }
      }

      if (!Array.isArray(parsed.slides)) {
        throw new Error('Invalid lesson file format - slides must be an array');
      }

      // Validate slide structure
      for (const slide of parsed.slides) {
        const requiredSlideFields = ['id', 'title', 'components'];
        for (const field of requiredSlideFields) {
          if (!slide[field]) {
            throw new Error(`Invalid slide format - missing required field: ${field}`);
          }
        }

        if (!Array.isArray(slide.components)) {
          throw new Error('Invalid slide format - components must be an array');
        }

        // Validate components
        for (const component of slide.components) {
          const requiredComponentFields = ['id', 'type', 'props'];
          for (const field of requiredComponentFields) {
            if (!component[field]) {
              throw new Error(`Invalid component format - missing required field: ${field}`);
            }
          }
        }
      }

      setLessonData(parsed);
      setError(null);
    } catch (err) {
      setError('Failed to load lesson file. Please make sure it\'s a valid After School Tech lesson file.');
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

  const handleJumpToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    lessonContentRef.current?.setCurrentSlideIndex(index);
    setIsSidebarOpen(false);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0F172A] border-r border-slate-800">
      {/* Lesson Title Section */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
          <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Active Course</h2>
        </div>
        <h3 className="text-xl font-black text-emerald-400 tracking-tight leading-tight">{lessonData?.title}</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-10">
          {/* Navigation Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Curriculum Stream</h3>
            <div className="space-y-2">
              {lessonData?.slides.map((slide, index) => (
                <Button
                  key={slide.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left h-auto py-3 px-4 rounded-xl transition-all duration-300 border border-transparent",
                    index === currentSlideIndex
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5 translate-x-1"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  )}
                  onClick={() => handleJumpToSlide(index)}
                >
                  <div className="flex items-center gap-4 w-full">
                    <span className={cn(
                      "text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border shrink-0 transition-colors",
                      index === currentSlideIndex ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-800 text-slate-600"
                    )}>
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold truncate flex-1">{slide.title}</span>
                    {index === currentSlideIndex && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Performance Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <Award className="h-3 w-3 text-emerald-500" />
              Live Analytics
            </h3>
            <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 shadow-inner">
              <ScoreDisplay />
            </div>
          </div>

          {/* Metadata Section */}
          <div className="space-y-6">
            <div className="space-y-2 group">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2 transition-colors">
                <User className="h-3 w-3 text-emerald-500/50" />
                Architect
              </h3>
              <p className="text-sm font-bold text-slate-300 pl-5">{lessonData?.author}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <Clock className="h-3 w-3 text-emerald-500/50" />
                Estimated Flow
              </h3>
              <p className="text-sm font-bold text-slate-300 pl-5">{lessonData?.duration} minutes</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Summary</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed pl-1">{lessonData?.description}</p>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer Section */}
      <div className="p-6 border-t border-slate-800 bg-slate-950/20">
        <Button
          variant="ghost"
          className="w-full rounded-full border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest h-11"
          onClick={resetViewer}
        >
          Terminate Session
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-4 bg-[#0F172A]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
            </div>
          </div>
          <h2 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] animate-pulse">Initializing Studio Stream</h2>
        </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-4 bg-[#0F172A]">
        <Card className="p-10 w-full max-w-xl bg-slate-900/40 border-slate-800 shadow-2xl rounded-[2rem] backdrop-blur-xl">
          <div className="text-center space-y-8">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-6 shadow-inner border border-emerald-500/20">
                <Award className="h-10 w-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Enter the Studio</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Deploy your education artifacts to begin</p>
            </div>

            <div className="p-8 bg-slate-950/40 border border-slate-800 rounded-2xl shadow-inner">
              <FileUploader onFileUpload={handleFileUpload} />
            </div>

            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-400 text-xs font-bold uppercase tracking-widest">
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
        <div className="h-screen w-screen flex overflow-hidden bg-white selection:bg-emerald-500 selection:text-slate-950">
          {/* Desktop/Tablet Sidebar */}
          <div className="hidden md:block w-80 shrink-0">
            {renderSidebarContent()}
          </div>
          {/* ... */}
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col relative bg-emerald-50/10 overflow-hidden">
            <TopProgressBar
              progress={slideProgress}
              isCompleted={lessonData?.slides[currentSlideIndex]?.status === "completed"}
              onMenuClick={() => setIsSidebarOpen(true)}
            />

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
              />
            </div>
          </div>
        </div>
      </NavigationLockProvider>
    </ScoringProvider>
  );
}