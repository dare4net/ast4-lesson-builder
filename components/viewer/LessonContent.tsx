"use client"

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { ComponentRenderer } from '@/components/component-renderer';
import { useScoring } from '@/context/scoring-context';
import { useFeedback } from '@/hooks/use-feedback';
import type { Lesson, Component, ComponentType_Category } from '@/types/lesson';
import { getComponentCategory } from '@/lib/lesson-utils';
import isEqual from 'lodash.isequal';
import { useNavigationLock } from '@/context/navigation-lock-context';

interface LessonContentProps {
  lesson: Lesson;
  onScoreUpdate?: (score: number, total: number) => void;
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  initialComponentStates?: Record<string, any>;
  onSlidesUpdate?: (updatedSlides: Lesson['slides']) => void;
  onProgressUpdate?: (progress: number) => void;
  savedScore?: number;
}

export interface LessonContentRef {
  setCurrentSlideIndex: (index: number) => void;
  getAllComponentStates: () => Record<string, any>;
}

/**
 * Hook to sync a value to a ref
 */
function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

export const LessonContent = forwardRef<LessonContentRef, LessonContentProps>(
  function LessonContent({
    lesson,
    onScoreUpdate,
    currentSlideIndex,
    onSlideChange,
    initialComponentStates = {},
    onSlidesUpdate,
    onProgressUpdate,
    savedScore
  }, ref) {
    const { playFeedback } = useFeedback();
    const viewportRef = useRef<HTMLDivElement>(null);
    const { currentScore: score, totalScore: totalPossible, addPoints } = useScoring();

    // Memoized basic properties
    const currentSlide = useMemo(() => lesson.slides[currentSlideIndex], [lesson.slides, currentSlideIndex]);
    const progress = useMemo(() => {
      const completedCount = lesson.slides.filter(s => s.status === "completed").length;
      return (completedCount / lesson.slides.length) * 100;
    }, [lesson.slides]);

    // Stable refs for parent callbacks and complex objects
    const onSlidesUpdateRef = useLatestRef(onSlidesUpdate);
    const onProgressUpdateRef = useLatestRef(onProgressUpdate);
    const onScoreUpdateRef = useLatestRef(onScoreUpdate);
    const lessonRef = useLatestRef(lesson);

    // Guards to prevent infinite loops from redundant updates
    const lastReportedProgressRef = useRef<number>(-1);
    const lastCompletedSlideIdRef = useRef<string | null>(null);

    // Local state for component interactions
    const [componentStates, setComponentStates] = useState<Record<string, any>>(initialComponentStates);
    const [innerStepIndex, setInnerStepIndex] = useState(0);

    // Reset inner step when slide changes
    useEffect(() => {
      setInnerStepIndex(0);
    }, [currentSlideIndex]);

    useImperativeHandle(ref, () => ({
      setCurrentSlideIndex: onSlideChange,
      getAllComponentStates: () => componentStates,
    }), [onSlideChange, componentStates]);

    // Process components to handle disabled state - MEMOIZED
    const processedComponents = useMemo(() => {
      if (!currentSlide) return [];
      return currentSlide.components.map(component => {
        if (currentSlide.state === "disabled" &&
          (getComponentCategory(component.type) === "interactive")) {
          return {
            ...component,
            state: "disabled" as const
          };
        }
        return component;
      });
    }, [currentSlide]);

    const activeComponent = processedComponents[innerStepIndex];

    const { isLocked } = useNavigationLock();

    // Navigation Logic
    const canGoNext = !isLocked && (innerStepIndex < (processedComponents.length - 1) || currentSlideIndex < (lesson.slides.length - 1));
    const canGoPrev = !isLocked && (innerStepIndex > 0 || currentSlideIndex > 0);

    const handleAdvance = () => {
      playFeedback('uiClick');
      if (innerStepIndex < processedComponents.length - 1) {
        setInnerStepIndex(prev => prev + 1);
      } else if (currentSlideIndex < lesson.slides.length - 1) {
        onSlideChange(currentSlideIndex + 1);
      }
    };

    const handleRecall = () => {
      playFeedback('uiClick');
      if (innerStepIndex > 0) {
        setInnerStepIndex(prev => prev - 1);
      } else if (currentSlideIndex > 0) {
        onSlideChange(currentSlideIndex - 1);
        // Note: We might want a way to jump to the LAST component of the previous slide
        // but for now, simple jump is fine.
      }
    };

    // Update parent slide progress
    useEffect(() => {
      if (!currentSlide) return;

      const interactiveComponents = currentSlide.components.filter(
        comp => getComponentCategory(comp.type) === "interactive"
      );

      let slideProgress = 100;
      if (interactiveComponents.length > 0) {
        const completedCount = interactiveComponents.filter(
          comp => componentStates[comp.id]?.status === "completed"
        ).length;
        slideProgress = (completedCount / interactiveComponents.length) * 100;
      }

      if (slideProgress !== lastReportedProgressRef.current) {
        lastReportedProgressRef.current = slideProgress;
        onProgressUpdateRef.current?.(slideProgress);
      }
    }, [currentSlide, componentStates]);

    // Check if slide is completed and notify parent
    const performCompletionCheck = useCallback(() => {
      const slide = lessonRef.current.slides[currentSlideIndex];

      if (!slide || slide.status === "completed") return;

      const interactiveComponents = (slide.components || []).filter(
        comp => getComponentCategory(comp.type) === "interactive"
      );

      // If no interactive components, slide is completed if visited
      if (interactiveComponents.length === 0) {
        const completionKey = `${slide.id}-view-completed`;
        if (lastCompletedSlideIdRef.current !== completionKey) {
          lastCompletedSlideIdRef.current = completionKey;
          const updatedSlides = [...lessonRef.current.slides];
          updatedSlides[currentSlideIndex] = {
            ...slide,
            status: "completed"
          };

          if (currentSlideIndex < lessonRef.current.slides.length - 1) {
            updatedSlides[currentSlideIndex + 1] = {
              ...lessonRef.current.slides[currentSlideIndex + 1],
              state: "active" as const
            };
          }

          setTimeout(() => {
            onSlidesUpdateRef.current?.(updatedSlides);
          }, 0);
        }
        return;
      }

      const allCompleted = interactiveComponents.every(
        comp => componentStates[comp.id]?.status === "completed"
      );

      const completionKey = `${slide.id}-completed`;
      if (allCompleted && lastCompletedSlideIdRef.current !== completionKey) {
        lastCompletedSlideIdRef.current = completionKey;

        const updatedSlides = [...lessonRef.current.slides];
        updatedSlides[currentSlideIndex] = {
          ...slide,
          status: "completed"
        };

        playFeedback('levelUp');

        if (currentSlideIndex < lessonRef.current.slides.length - 1) {
          updatedSlides[currentSlideIndex + 1] = {
            ...lessonRef.current.slides[currentSlideIndex + 1],
            state: "active" as const
          };
        }

        setTimeout(() => {
          onSlidesUpdateRef.current?.(updatedSlides);
        }, 0);
      }
    }, [componentStates, currentSlideIndex, playFeedback, lessonRef, onSlidesUpdateRef]);

    useEffect(() => {
      performCompletionCheck();
    }, [componentStates, performCompletionCheck]);

    useEffect(() => {
      onScoreUpdateRef.current?.(score, totalPossible);
    }, [score, totalPossible]);

    const handleComponentStateChange = useCallback((componentId: string, newState: any) => {
      const slide = lessonRef.current.slides[currentSlideIndex];
      if (slide?.state === "disabled") return;

      setComponentStates(prev => {
        const currentState = prev[componentId];
        if (isEqual(currentState, newState)) {
          return prev;
        }

        return {
          ...prev,
          [componentId]: {
            ...currentState,
            ...newState
          }
        };
      });
    }, [currentSlideIndex, lessonRef]);

    return (
      <div className="flex flex-col h-full relative bg-white overflow-hidden font-sans uppercase">
        {/* Tier 1: Operational Header - Indicators & Status */}
        <header className="shrink-0 w-full bg-[#0F172A] border-b border-emerald-500/30 px-4 py-2.5 z-30 flex items-center justify-between gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          {/* Progress Cluster */}
          <div className="flex-1 flex flex-col gap-1 max-w-sm">
            <div className="flex justify-between items-center px-0.5">
              <span className="text-[7px] font-black text-emerald-400 tracking-[0.2em] leading-none">Module Progress</span>
              <span className="text-[7px] font-black text-white/30 tracking-widest leading-none">{Math.round(progress)}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Metrics Cluster */}
          <div className="flex gap-6 shrink-0 h-full items-center">
            <div className="flex flex-col items-end justify-center">
              <span className="text-[7px] font-black text-emerald-400/40 tracking-widest leading-none mb-0.5">Points</span>
              <span className="text-sm font-black text-white tracking-tighter leading-none tabular-nums">{score}</span>
            </div>
            <div className="flex flex-col items-end justify-center border-l border-white/10 pl-6 h-6">
              <span className="text-[7px] font-black text-emerald-400/40 tracking-widest leading-none mb-0.5">Slide</span>
              <span className="text-sm font-black text-white tracking-tighter leading-none tabular-nums">
                {currentSlideIndex + 1} <span className="text-white/20">/</span> {lesson.slides.length}
              </span>
            </div>
          </div>
        </header>

        {/* Tier 2: Active Stage - RAW CONTENT SURFACE */}
        <main className="flex-1 relative overflow-y-auto custom-scrollbar bg-white z-10 flex flex-col">
          <div className="w-full min-h-full flex-1 flex flex-col">
            {activeComponent && (
              <div
                key={`${currentSlideIndex}-${innerStepIndex}`}
                className="w-full flex-1 flex flex-col animate-in fade-in duration-300"
              >
                <ComponentRenderer
                  component={activeComponent}
                  savedState={componentStates[activeComponent.id]}
                  setComponentState={(state: any) => handleComponentStateChange(activeComponent.id, state)}
                  onCheckSlideCompletion={performCompletionCheck}
                />
              </div>
            )}
          </div>
        </main>

        {/* Tier 3: Command Footer - Horizontal Nav Group */}
        <footer className="shrink-0 w-full bg-slate-50 border-t border-slate-200 z-30 py-4 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <div className="max-w-md mx-auto flex items-center justify-center gap-3">
            <Button
              variant="outline"
              className="h-9 px-0 w-full rounded-lg border border-emerald-100 bg-white text-emerald-600 hover:bg-emerald-50 transition-all font-black text-[9px] tracking-widest disabled:opacity-20 flex items-center justify-center"
              onClick={handleRecall}
              disabled={!canGoPrev}
            >
              <ChevronLeft className="h-3 w-3 mr-2 stroke-[4]" />
              Previous
            </Button>

            <Button
              variant="default"
              className="h-9 px-0 w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all transform active:scale-95 font-black text-[9px] tracking-widest shadow-lg shadow-emerald-600/10 disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center"
              onClick={handleAdvance}
              disabled={!canGoNext}
            >
              Next
              <ChevronRight className="h-3 w-3 ml-2 stroke-[4]" />
            </Button>
          </div>
        </footer>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(16, 185, 129, 0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(16, 185, 129, 0.4);
          }
        `}</style>
      </div>
    );
  }
);
