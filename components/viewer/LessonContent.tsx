"use client"

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, LogOut } from 'lucide-react';
import { ComponentRenderer } from '@/components/component-renderer';
import { useScoring } from '@/context/scoring-context';
import { useFeedback } from '@/hooks/use-feedback';
import type { Lesson } from '@/types/lesson';
import { getComponentCategory, formatSlideTitle } from '@/lib/lesson-utils';
import isEqual from 'lodash.isequal';
import { cn } from '@/lib/utils';
import { useNavigationLock } from '@/context/navigation-lock-context';
import { useReadAloud } from '@/context/read-aloud-context';
import { SlideTransitionOverlay } from '@/components/viewer/SlideTransitionOverlay';
import { LessonCompletionOverlay } from '@/components/viewer/LessonCompletionOverlay';
import { IncompleteLessonModal } from '@/components/viewer/IncompleteLessonModal';
import { getSlideTheme } from '@/lib/slide-themes';

interface LessonContentProps {
  lesson: Lesson;
  onScoreUpdate?: (score: number, total: number) => void;
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  initialComponentStates?: Record<string, any>;
  onSlidesUpdate?: (updatedSlides: Lesson['slides']) => void;
  onProgressUpdate?: (progress: number) => void;
  savedScore?: number;
  onEndLesson?: () => void;
}

export interface LessonContentRef {
  setCurrentSlideIndex: (index: number) => void;
  getAllComponentStates: () => Record<string, any>;
}

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
    onEndLesson,
  }, ref) {
    const { playFeedback } = useFeedback();
    const { currentScore: score, totalScore: totalPossible } = useScoring();

    const currentSlide = useMemo(() => lesson.slides[currentSlideIndex], [lesson.slides, currentSlideIndex]);
    const progress = useMemo(() => {
      const completedCount = lesson.slides.filter(s => s.status === "completed").length;
      return (completedCount / lesson.slides.length) * 100;
    }, [lesson.slides]);

    const onSlidesUpdateRef = useLatestRef(onSlidesUpdate);
    const onProgressUpdateRef = useLatestRef(onProgressUpdate);
    const onScoreUpdateRef = useLatestRef(onScoreUpdate);
    const lessonRef = useLatestRef(lesson);

    const lastReportedProgressRef = useRef<number>(-1);
    const lastCompletedSlideIdRef = useRef<string | null>(null);

    const [componentStates, setComponentStates] = useState<Record<string, any>>(initialComponentStates);
    const [innerStepIndex, setInnerStepIndex] = useState(0);
    const [showOverlay, setShowOverlay] = useState(false);
    const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
    const [showIncompleteModal, setShowIncompleteModal] = useState(false);
    const hasShownCompletionOverlayRef = useRef(false);
    const prevSlideIndexRef = useRef<number>(-1);

    const completedSlidesCount = useMemo(() => {
      return lesson.slides.filter(s => s.status === "completed").length;
    }, [lesson.slides]);

    const allSlidesCompleted = completedSlidesCount === lesson.slides.length;

    const handleEndLessonTrigger = useCallback(() => {
      if (allSlidesCompleted) {
        setShowCompletionOverlay(true);
      } else {
        setShowIncompleteModal(true);
      }
    }, [allSlidesCompleted]);

    useEffect(() => {
      setInnerStepIndex(0);
      // Show overlay whenever we actually change slides (skip first load where prev === current)
      if (prevSlideIndexRef.current !== -1 && prevSlideIndexRef.current !== currentSlideIndex) {
        setShowOverlay(true);
      }
      prevSlideIndexRef.current = currentSlideIndex;
    }, [currentSlideIndex]);

    useImperativeHandle(ref, () => ({
      setCurrentSlideIndex: onSlideChange,
      getAllComponentStates: () => componentStates,
      triggerEndLesson: handleEndLessonTrigger,
    }), [onSlideChange, componentStates, handleEndLessonTrigger]);

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
    const { isEnabled, toggleReadAloud } = useReadAloud();

    const canGoNext = !isLocked && (innerStepIndex < (processedComponents.length - 1) || currentSlideIndex < (lesson.slides.length - 1));
    const canGoPrev = !isLocked && (innerStepIndex > 0 || currentSlideIndex > 0);

    const handleAdvance = () => {
      playFeedback('uiClick');
      if (innerStepIndex < processedComponents.length - 1) {
        setInnerStepIndex(prev => prev + 1);
      } else if (currentSlideIndex < lesson.slides.length - 1) {
        onSlideChange(currentSlideIndex + 1);
        // overlay is triggered via the useEffect watching currentSlideIndex
      }
    };

    const handleRecall = () => {
      playFeedback('uiClick');
      if (innerStepIndex > 0) {
        setInnerStepIndex(prev => prev - 1);
      } else if (currentSlideIndex > 0) {
        onSlideChange(currentSlideIndex - 1);
      }
    };

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

    const performCompletionCheck = useCallback(() => {
      const slide = lessonRef.current.slides[currentSlideIndex];
      if (!slide || slide.status === "completed") return;

      const interactiveComponents = (slide.components || []).filter(
        comp => getComponentCategory(comp.type) === "interactive"
      );

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
      <div className="flex flex-col h-full relative bg-white dark:bg-slate-950 overflow-hidden font-sans">
        {/* Header */}
        <header className="shrink-0 w-full bg-slate-900 border-b border-slate-800 px-5 py-3 z-30 flex items-center justify-between gap-6 shadow-sm">
          {/* Progress Bar */}
          <div className="flex-1 flex flex-col gap-1 max-w-sm">
            <div className="flex justify-between items-center px-0.5">
              <span className="text-xs font-medium text-slate-300">Lesson Progress</span>
              <span className="text-xs font-bold text-white tabular-nums">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Slide Title Badge */}
          {currentSlide?.title && (
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[220px]">
                {formatSlideTitle(currentSlide.title, 20)}
              </span>
            </div>
          )}

          {/* Metrics & Controls */}
          <div className="flex gap-4 shrink-0 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleReadAloud}
              className={cn(
                "h-8 px-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all border",
                isEnabled
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
              )}
              title={isEnabled ? "Disable Read Aloud" : "Enable Read Aloud"}
            >
              {isEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider">{isEnabled ? "Voice On" : "Voice Off"}</span>
            </Button>

            <div className="flex flex-col items-end justify-center">
              <span className="text-[10px] font-medium text-slate-400">Score</span>
              <span className="text-sm font-bold text-white tabular-nums">{score}</span>
            </div>
            <div className="flex flex-col items-end justify-center border-l border-slate-800 pl-4 h-6">
              <span className="text-[10px] font-medium text-slate-400">Slide</span>
              <span className="text-sm font-bold text-white tabular-nums">
                {currentSlideIndex + 1} <span className="text-slate-600">/</span> {lesson.slides.length}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 relative overflow-y-auto bg-slate-50 dark:bg-slate-950 z-10 flex flex-col">
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

        {/* Slide Transition Overlay */}
        <SlideTransitionOverlay
          isVisible={showOverlay}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          slideIndex={currentSlideIndex}
          slideTitle={lesson.slides[currentSlideIndex]?.title || `Slide ${currentSlideIndex + 1}`}
          titleAudioUrl={lesson.slides[currentSlideIndex]?.titleAudioUrl}
          totalSlides={lesson.slides.length}
          onBegin={() => setShowOverlay(false)}
        />

        {/* Footer Navigation */}
        <footer className="shrink-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30 py-3.5 px-6 shadow-sm">
          <div className="max-w-md mx-auto flex items-center justify-center gap-3">
            <Button
              variant="outline"
              className="h-10 px-5 w-full rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs flex items-center justify-center"
              onClick={handleRecall}
              disabled={!canGoPrev}
            >
              <ChevronLeft className="h-4 w-4 mr-1.5" />
              Previous
            </Button>

            {currentSlideIndex === lesson.slides.length - 1 && innerStepIndex >= (processedComponents.length - 1) ? (
              <Button
                variant="default"
                className="h-10 px-5 w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] tracking-wider shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-all"
                onClick={() => {
                  playFeedback('uiClick');
                  handleEndLessonTrigger();
                }}
              >
                End Lesson
                <LogOut className="h-3.5 w-3.5 ml-1" />
              </Button>
            ) : (() => {
              // Detect if we are on the last component of the current slide (not the last slide)
              const isLastComponentOfSlide =
                innerStepIndex >= processedComponents.length - 1 &&
                currentSlideIndex < lesson.slides.length - 1;
              const nextSlideTheme = isLastComponentOfSlide
                ? getSlideTheme(currentSlideIndex + 1)
                : null;
              return (
                <Button
                  variant="default"
                  className={cn(
                    "h-10 px-5 w-full rounded-xl font-semibold text-xs shadow-sm disabled:opacity-40 flex items-center justify-center transition-all duration-200",
                    !isLastComponentOfSlide && "bg-green-600 hover:bg-green-500 text-white"
                  )}
                  style={isLastComponentOfSlide && nextSlideTheme ? {
                    backgroundColor: nextSlideTheme.btnBgHex,
                    color: nextSlideTheme.btnTextHex,
                  } : undefined}
                  onClick={handleAdvance}
                  disabled={!canGoNext}
                >
                  {isLastComponentOfSlide ? "Next Slide" : "Next"}
                  <ChevronRight className="h-4 w-4 ml-1.5" />
                </Button>
              );
            })()}
          </div>
        </footer>

        {/* Lesson Completion Celebration Overlay */}
        <LessonCompletionOverlay
          isVisible={showCompletionOverlay}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          completedSlidesCount={completedSlidesCount}
          totalSlidesCount={lesson.slides.length}
          score={score}
          totalPossibleScore={totalPossible}
          onReview={() => setShowCompletionOverlay(false)}
          onEndLesson={() => {
            setShowCompletionOverlay(false);
            if (onEndLesson) onEndLesson();
          }}
        />

        {/* Incomplete Lesson Warning Modal */}
        <IncompleteLessonModal
          isOpen={showIncompleteModal}
          completedSlidesCount={completedSlidesCount}
          totalSlidesCount={lesson.slides.length}
          onKeepLearning={() => setShowIncompleteModal(false)}
          onEndAnyway={() => {
            setShowIncompleteModal(false);
            if (onEndLesson) onEndLesson();
          }}
        />
      </div>
    );
  }
);
