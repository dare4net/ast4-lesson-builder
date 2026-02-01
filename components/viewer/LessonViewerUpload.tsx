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

export function LessonViewer({ initialLesson, initialInteraction, userId }: { initialLesson?: Lesson, initialInteraction?: any, userId?: string }) {
  const [lessonData, setLessonData] = useState<Lesson | null>(initialLesson || null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState<boolean>(false); // Only set to true during actual file upload
  const lessonContentRef = useRef<any>(null);

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
    if (initialLesson) {
      // First, apply any saved states
      const initializedSlides = initialLesson.slides.map(slide => {
        const savedSlide = initialInteraction?.lessonState?.slides.find((s: { id: string }) => s.id === slide.id);
        // Only use original state if there's no saved state at all
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

      // Then, process slides to auto-complete non-interactive ones
      const processedSlides = initializedSlides.map((slide, index) => {
        // Skip if slide is already completed
        if (slide.status === "completed") return slide;

        // Check if slide has any interactive components
        const hasInteractiveComponents = slide.components.some(
          comp => getComponentCategory(comp.type) === "interactive"
        );

        if (!hasInteractiveComponents) {
          // Mark this slide as completed
          const updatedSlide = {
            ...slide,
            status: "completed" as const
          };

          // If there's a next slide and it's not the last slide, activate it
          if (index < initializedSlides.length - 1) {
            initializedSlides[index + 1] = {
              ...initializedSlides[index + 1],
              state: "active" as const
            };
          }

          return updatedSlide;
        }

        return slide;
      });

      const initializedLesson = {
        ...initialLesson,
        slides: processedSlides
      };

      setLessonData(initializedLesson);
    }
  }, [initialLesson, initialInteraction]);

  // Set initial scores from saved interaction
  /*useEffect(() => {
    if (initialInteraction?.lessonState) {
      setCurrentScore(initialInteraction.lessonState.currentScore || 0);
      setTotalPossible(initialInteraction.lessonState.totalPossible || 0);
    }
  }, [initialInteraction]);*/

  // Set initial slide index from saved interaction
  useEffect(() => {
    if (initialInteraction?.lessonState?.currentSlideIndex !== undefined) {
      setCurrentSlideIndex(initialInteraction.lessonState.currentSlideIndex);
    }
  }, [initialInteraction]);

  // Auto-skip disabled slides on initial load
  useEffect(() => {
    if (lessonData && !isSlideAccessible(currentSlideIndex)) {
      const nextIndex = findNextAccessibleSlide(currentSlideIndex, 1);
      if (nextIndex !== -1) {
        setCurrentSlideIndex(nextIndex);
      }
    }
  }, [lessonData, currentSlideIndex, isSlideAccessible, findNextAccessibleSlide]);

  // Save gamified state every 30s
  /*useEffect(() => {
    if (!userId || !lessonData) return;
    console.log('[LessonViewer] Setting up periodic save for userId:', userId, 'lessonId:', lessonData.id);
    const interval = setInterval(() => {
      const componentsState = lessonContentRef.current?.getAllComponentStates?.();
      const interactionData = {
        componentsState,
        lessonState: {
          slides: lessonData.slides.map(slide => ({
            id: slide.id,
            state: slide.state,
            status: slide.status
          })),
          currentSlideIndex,
          currentScore,
          totalPossible,
          lessonTitle: lessonData.title,
          lessonDescription: lessonData.description
        }
      };
      console.log('[LessonViewer] Periodic saveUserInteraction', { userId, lessonId: lessonData.id, interactionData });
      if (componentsState) {
        import('@/lib/user-interactions').then(({ saveUserInteraction }) => {
          saveUserInteraction(userId, lessonData.id, interactionData).then((ok) => {
            console.log('[LessonViewer] Periodic saveUserInteraction result:', ok);
          });
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [userId, lessonData, currentSlideIndex]);*/

  // Save interaction helper
  const saveInteraction = useCallback((updatedSlides?: any[]) => {
    if (!userId || !lessonData) return;

    const componentsState = lessonContentRef.current?.getAllComponentStates?.() || {};
    const slides = (updatedSlides || lessonData.slides).map(slide => ({
      id: slide.id,
      state: slide.state,
      status: slide.status
    }));

    const interactionData = {
      componentsState,
      lessonState: {
        slides,
        currentSlideIndex,
        lessonTitle: lessonData.title,
        lessonDescription: lessonData.description
      }
    };

    import('@/lib/user-interactions').then(({ saveUserInteraction }) => {
      saveUserInteraction(userId, lessonData.id, interactionData);
    });
  }, [userId, lessonData, currentSlideIndex]);

  // Save an initial interaction if none exists
  useEffect(() => {
    if (userId && lessonData) {
      saveInteraction();
    }
  }, [userId, lessonData, saveInteraction]);

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

  // Memoized slides update handler
  const handleSlidesUpdate = useCallback((updatedSlides: any[]) => {
    console.log('Updating slides with new states:', updatedSlides.map(s => ({
      id: s.id,
      state: s.state,
      status: s.status
    })));

    setLessonData(prevData => {
      if (!prevData) return null;
      const newSlides = prevData.slides.map(slide => {
        const updatedSlide = updatedSlides.find(s => s.id === slide.id);
        if (!updatedSlide) return slide;
        const newSlide = { ...slide };
        if ('state' in updatedSlide) newSlide.state = updatedSlide.state;
        if ('status' in updatedSlide) newSlide.status = updatedSlide.status;
        return newSlide;
      });

      const newlyCompletedSlide = updatedSlides.find(s => s.status === 'completed');
      if (newlyCompletedSlide && userId) {
        saveInteraction(newSlides);
      }

      return { ...prevData, slides: newSlides };
    });
  }, [userId, saveInteraction]);

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
            window.open('https://app.after-school.tech/dashboard/student', '_blank');
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

            {/* Mobile Menu Sheet (Triggered by LessonContent header) */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetContent side="left" className="w-80 p-0 border-r-0">
                {renderSidebarContent()}
              </SheetContent>
            </Sheet>

            {/* Actual Slide Content */}
            <div className="flex-1 relative overflow-hidden">
              <LessonContent
                ref={lessonContentRef}
                lesson={lessonData!}
                currentSlideIndex={currentSlideIndex}
                onSlideChange={setCurrentSlideIndex}
                initialComponentStates={initialInteraction?.componentsState || {}}
                onSlidesUpdate={handleSlidesUpdate}
                onProgressUpdate={handleProgressUpdate}
              />
            </div>
          </div>
        </div>
      </NavigationLockProvider>
    </ScoringProvider>
  );
}