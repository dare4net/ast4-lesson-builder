"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
import { getComponentCategory } from '@/lib/lesson-utils';
import { FileUploader } from './FileUploader';
import { LessonContent } from './LessonContent';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Menu, Clock, User, Award, Lock, Unlock, CheckCircle2, Circle } from 'lucide-react';
import type { Lesson, SlideState, SlideStatus } from '@/types/lesson';
import { TopProgressBar } from './TopProgressBar';
import { ScoringProvider } from '@/context/scoring-context';
import { ScoreDisplay } from '@/components/ui/score-display';
import { cn } from '@/lib/utils';
import { NavigationLockProvider } from '@/context/navigation-lock-context';
import { useRouter } from 'next/navigation';
import { syncEngine } from '@/lib/sync-engine';
import { SyncStatusHUD } from './SyncStatusHUD';

export function LessonViewer({ initialLesson, initialInteraction, userId }: { initialLesson?: Lesson, initialInteraction?: any, userId?: string }) {
  const router = useRouter();
  const [lessonData, setLessonData] = useState<Lesson | null>(initialLesson || null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState<boolean>(false); // Only set to true during actual file upload
  const [isHydrated, setIsHydrated] = useState(false);
  const [resolvedInteraction, setResolvedInteraction] = useState<any>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [totalPossibleScore, setTotalPossibleScore] = useState(0);
  const lessonContentRef = useRef<any>(null);

  // Refs for tracking latest state in periodic timer and callbacks
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

  // Initialize lesson data and score with saved states on mount
  useEffect(() => {
    let isMounted = true;
    async function initializeState() {
      if (!initialLesson) return;

      console.log('[Viewer] Initializing state for lesson:', initialLesson.id, 'User:', userId);

      // Get latest state (Priority: Local IndexedDB > Server initialInteraction)
      const latestData = await syncEngine.getLatestState(userId || '', initialLesson.id, initialInteraction);
      const lessonState = latestData?.lessonState;

      console.log('[Viewer] Resolved latest state:', lessonState ? 'Found' : 'Not Found', 'Slide Index:', lessonState?.currentSlideIndex);

      if (!isMounted) return;

      const initializedSlides = initialLesson.slides.map(slide => {
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

      // Set the last viewed slide from resolved latest state
      if (lessonState?.currentSlideIndex !== undefined) {
        console.log('[Viewer] Hydrating slide index:', lessonState.currentSlideIndex);
        setCurrentSlideIndex(lessonState.currentSlideIndex);
      } else if (initialInteraction?.lessonState?.currentSlideIndex !== undefined) {
        // Fallback to server initial interaction if syncEngine didn't return it for some reason
        console.log('[Viewer] Fallback hydrating slide index:', initialInteraction.lessonState.currentSlideIndex);
        setCurrentSlideIndex(initialInteraction.lessonState.currentSlideIndex);
      }

      // Process slides to auto-complete non-interactive ones
      const processedSlides = initializedSlides.map((slide, index) => {
        if (slide.status === "completed") return slide;
        const hasInteractiveComponents = slide.components.some(
          comp => getComponentCategory(comp.type) === "interactive"
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
      setIsHydrated(true);
    }

    initializeState();
    return () => { isMounted = false; };
  }, [initialLesson, initialInteraction, userId]);

  // Auto-skip disabled slides on initial load
  useEffect(() => {
    if (lessonData && !isSlideAccessible(currentSlideIndex)) {
      const nextIndex = findNextAccessibleSlide(currentSlideIndex, 1);
      if (nextIndex !== -1) {
        setCurrentSlideIndex(nextIndex);
      }
    }
  }, [lessonData, currentSlideIndex, isSlideAccessible, findNextAccessibleSlide]);

  // Periodic heartbeat save every 30s
  useEffect(() => {
    if (!userId || !lessonData || !isHydrated) return;

    const interval = setInterval(() => {
      saveInteraction();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, lessonData?.id, isHydrated]); // Depends on lesson ID to reset if lesson changes

  // Save interaction helper
  const saveInteraction = useCallback((updatedSlides?: any[]) => {
    const currentLesson = updatedSlides ? { ...lessonData, slides: updatedSlides } : lessonDataRef.current;
    if (!userId || !currentLesson) return;

    const componentsState = lessonContentRef.current?.getAllComponentStates?.() || {};

    // Calculate progress
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

    console.log('[Viewer] Triggering SyncEngine save:', { lessonId: currentLesson.id, progress });
    syncEngine.save(userId as string, currentLesson.id as string, interactionData);
  }, [userId]);

  // Save interaction on slide navigation
  useEffect(() => {
    if (isHydrated && userId && lessonData) {
      saveInteraction();
    }
  }, [currentSlideIndex, saveInteraction, isHydrated, userId]); // Only trigger on slide change indices

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

  const [slideProgress, setSlideProgress] = useState(0);

  const handleScoreUpdate = useCallback((score: number, total: number) => {
    setCurrentScore(score);
    setTotalPossibleScore(total);
  }, []);

  // Memoized slides update handler
  const handleSlidesUpdate = useCallback((updatedSlides: any[]) => {
    if (!lessonData || !userId) return;

    // Create the updated lesson data
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
    lessonDataRef.current = newLessonData; // Update ref immediately for save

    // Check if ALL slides are completed for backend marking
    const allCompleted = newSlides.every(s => s.status === 'completed');
    if (allCompleted) {
      console.log('[Viewer] All slides completed. Marking lesson as finished.');
      const finalScore = totalPossibleScoreRef.current > 0 ?
        Math.round((currentScoreRef.current / totalPossibleScoreRef.current) * 100) : 0;

      import('@/lib/api-client').then(({ apiClient }) => {
        apiClient.lessons.markCompleted(lessonData.id, finalScore).catch(err => {
          console.error('[Viewer] Failed to mark lesson as completed:', err);
        });
      });
    }

    // Trigger immediate save when slides update
    saveInteraction(newSlides);
  }, [userId, lessonData, saveInteraction]);

  // Handle slide progress update from LessonContent
  const handleProgressUpdate = useCallback((progress: number) => {
    setSlideProgress(progress);
  }, []);

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
                    "w-full justify-start text-left h-auto py-3 px-4 rounded-xl transition-all duration-300 border border-transparent group",
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

                    <div className="flex items-center gap-2">
                      {slide.status === "completed" ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Circle className="h-3 w-3 text-slate-800 group-hover:text-slate-600 transition-colors" />
                      )}
                      {slide.state === "disabled" ? (
                        <Lock className="h-3 w-3 text-rose-500/60" />
                      ) : (
                        <Unlock className="h-3 w-3 text-emerald-500/40" />
                      )}
                    </div>
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
          onClick={() => {
            saveInteraction();
            router.push('/dashboard/student');
          }}
        >
          Terminate Session
        </Button>
      </div>
    </div>
  );

  // NEW: Show loading spinner until lessonData is fully loaded
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



  const currentSlide = lessonData?.slides[currentSlideIndex];

  return (
    <ScoringProvider lesson={lessonData}>
      <NavigationLockProvider>
        <div className="h-screen w-screen flex overflow-hidden bg-white selection:bg-emerald-500 selection:text-slate-950">
          {/* Desktop/Tablet Sidebar */}
          <div className="hidden md:block w-80 shrink-0 h-full">
            {renderSidebarContent()}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col relative h-full bg-emerald-50/10 overflow-hidden">
            {/* Internal Progress Bar */}
            <TopProgressBar
              progress={slideProgress}
              isCompleted={currentSlide?.status === "completed"}
              onMenuClick={() => setIsSidebarOpen(true)}
            />

            {/* Sync HUD Layer */}
            <div className="absolute top-20 right-6 z-50 pointer-events-auto">
              <SyncStatusHUD />
            </div>

            {/* Mobile Menu Sheet (Triggered by LessonContent header) */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetContent side="left" className="w-80 p-0 border-r-0">
                {renderSidebarContent()}
              </SheetContent>
            </Sheet>

            {/* Actual Slide Content */}
            <div className="flex-1 relative overflow-hidden">
              {/* Lesson Body/Viewer */}
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
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-slate-950">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <span className="text-emerald-500 font-black uppercase tracking-widest text-[10px]">
                      Materializing Directive
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