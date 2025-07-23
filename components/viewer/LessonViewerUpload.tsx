"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
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

export function LessonViewer({ initialLesson, initialInteraction, userId }: { initialLesson?: Lesson, initialInteraction?: any, userId?: string }) {
  const [lessonData, setLessonData] = useState<Lesson | null>(initialLesson || null);
  const [error, setError] = useState<string | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
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
          comp => comp.component_type === "interactive"
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
  useEffect(() => {
    if (initialInteraction?.lessonState) {
      setCurrentScore(initialInteraction.lessonState.currentScore || 0);
      setTotalPossible(initialInteraction.lessonState.totalPossible || 0);
    }
  }, [initialInteraction]);

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

  // Save an initial interaction if none exists
  useEffect(() => {
    if (!userId || !lessonData) return;
    const componentsState = lessonContentRef.current?.getAllComponentStates?.() || {};
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
    console.log('[LessonViewer] Initial saveUserInteraction', { userId, lessonId: lessonData.id, interactionData });
    import('@/lib/user-interactions').then(({ saveUserInteraction }) => {
      saveUserInteraction(userId, lessonData.id, interactionData).then((ok) => {
        console.log('[LessonViewer] Initial saveUserInteraction result:', ok);
      });
    });
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
    setCurrentScore(0);
    setTotalPossible(0);
    setCurrentSlideIndex(0);
  };

  const handleScoreUpdate = (score: number, total: number) => {
    setCurrentScore(score);
    setTotalPossible(total);

    // Save interaction state when score updates
    if (userId && lessonData) {
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
          currentScore: score,
          totalPossible: total,
          lessonTitle: lessonData.title,
          lessonDescription: lessonData.description
        }
      };
      import('@/lib/user-interactions').then(({ saveUserInteraction }) => {
        saveUserInteraction(userId, lessonData.id, interactionData);
      });
    }
  };

  const handleJumpToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    lessonContentRef.current?.setCurrentSlideIndex(index);
    setIsSidebarOpen(false);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Lesson Title */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">{lessonData?.title}</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Slides Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">SLIDES</h3>
            <div className="space-y-1">
              {lessonData?.slides.map((slide, index) => (
                <Button
                  key={slide.id}
                  variant={index === currentSlideIndex ? "secondary" : "ghost"}
                  className={`w-full justify-start text-left h-auto py-2 px-3 ${
                    index === currentSlideIndex ? 'bg-secondary' : ''
                  }`}
                  onClick={() => handleJumpToSlide(index)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-start gap-2">
                      <span className="text-xs opacity-50 mt-0.5">#{index + 1}</span>
                      <span className="text-sm">{slide.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {slide.status === "completed" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      {slide.state === "disabled" ? (
                        <Lock className="h-3.5 w-3.5 text-destructive" />
                      ) : (
                        <Unlock className="h-3.5 w-3.5 text-success" />
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Score Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              SCORE
            </h3>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <Progress value={(currentScore / totalPossible) * 100} />
              <p className="text-sm text-muted-foreground">
                {currentScore} / {totalPossible} points
              </p>
            </div>
          </div>

          {/* Lesson Info Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                AUTHOR
              </h3>
              <p className="text-sm">{lessonData?.author}</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                DURATION
              </h3>
              <p className="text-sm">{lessonData?.duration} minutes</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">DESCRIPTION</h3>
              <p className="text-sm text-muted-foreground">{lessonData?.description}</p>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* End Lesson Button */}
      <div className="p-4 border-t mt-auto">
        <Button variant="destructive" className="w-full" onClick={() => {
          window.open('https://app.after-school.tech/dashboard/student', '_blank');
        }}>
          End Lesson
        </Button>
      </div>
    </div>
  );

  // NEW: Show loading spinner until lessonData is fully loaded
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-4">
        <Card className="p-6 w-full max-w-lg text-center">
          <h2 className="mb-4 text-xl font-semibold">Loading lesson...</h2>
        </Card>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-4">
        <Card className="p-6 w-full max-w-lg">
          <div className="text-center">
            <h2 className="mb-4 text-xl font-semibold">Upload Lesson File</h2>
            <p className="mb-6 text-muted-foreground">
              Upload an After School Tech lesson file (.json) to start learning
            </p>
            <FileUploader onFileUpload={handleFileUpload} />
            {error && (
              <div className="mt-4 rounded-lg bg-destructive/10 p-4 text-destructive">
                {error}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Get current slide's interactive components progress
  const currentSlide = lessonData?.slides[currentSlideIndex];
  const interactiveComponents = currentSlide?.components.filter(
    comp => comp.component_type === "interactive"
  ) || [];
  
  // Get completion status for current slide's components
  const componentStates = lessonContentRef.current?.getAllComponentStates?.() || {};
  const completedComponents = interactiveComponents.filter(
    comp => componentStates[comp.id]?.status === "completed"
  ).length;
  
  const slideProgress = interactiveComponents.length > 0 
    ? (completedComponents / interactiveComponents.length) * 100 
    : 100; // If no interactive components, slide is complete

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Top Progress Bar */}
      <TopProgressBar 
        progress={slideProgress}
        isCompleted={currentSlide?.status === "completed"}
      />

      {/* Desktop/Tablet Sidebar */}
      <div className="hidden md:block w-80 border-r bg-muted/40">
        {renderSidebarContent()}
      </div>

      {/* Mobile Menu Button and Sheet */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <SheetContent side="left" className="w-80 p-0">
            {renderSidebarContent()}
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <LessonContent 
          ref={lessonContentRef}
          lesson={lessonData}
          onScoreUpdate={handleScoreUpdate}
          currentSlideIndex={currentSlideIndex}
          onSlideChange={setCurrentSlideIndex}
          initialComponentStates={initialInteraction?.componentsState || {}}
          onSlidesUpdate={(updatedSlides) => {
            console.log('Updating slides with new states:', updatedSlides.map(s => ({
              id: s.id,
              state: s.state,
              status: s.status
            })));
            
            // Update lesson data preserving the latest state/status for each slide
            setLessonData(prevData => {
              const newSlides = prevData!.slides.map(slide => {
                // Find the updated version of this slide
                const updatedSlide = updatedSlides.find(s => s.id === slide.id);
                if (!updatedSlide) return slide;

                // Only update state/status if they are explicitly defined
                const newSlide = { ...slide };
                if ('state' in updatedSlide) {
                  newSlide.state = updatedSlide.state;
                }
                if ('status' in updatedSlide) {
                  newSlide.status = updatedSlide.status;
                }
                return newSlide;
              });

              // Check if any slide was marked as completed and save interaction
              const newlyCompletedSlide = updatedSlides.find(s => s.status === 'completed');
              if (newlyCompletedSlide && userId && prevData) {
                const componentsState = lessonContentRef.current?.getAllComponentStates?.();
                const interactionData = {
                  componentsState,
                  lessonState: {
                    slides: newSlides.map(s => ({
                      id: s.id,
                      state: s.state,
                      status: s.status
                    })),
                    currentSlideIndex,
                    currentScore,
                    totalPossible,
                    lessonTitle: prevData.title,
                    lessonDescription: prevData.description
                  }
                };
                import('@/lib/user-interactions').then(({ saveUserInteraction }) => {
                  saveUserInteraction(userId, prevData.id, interactionData);
                });
              }

              console.log('Updated lesson data slides:', newSlides.map(s => ({
                id: s.id,
                state: s.state,
                status: s.status,
                hasExplicitState: s.state !== undefined,
                hasExplicitStatus: s.status !== undefined
              })));

              return {
                ...prevData!,
                slides: newSlides
              };
            });
          }}
          savedScore={initialInteraction?.lessonState?.currentScore || 0}
        />
      </div>
    </div>
  );
}