"use client"

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { FeedbackSettingsButton } from '@/components/ui/feedback-settings';
import { ChevronLeft, ChevronRight, LogOut, Loader2 } from 'lucide-react';
import { ComponentRenderer } from '@/components/component-renderer';
import { useScoring } from '@/context/scoring-context';
import { useFeedback } from '@/hooks/use-feedback';
import type { Lesson } from '@/types/lesson';
import { getComponentCategory, formatSlideTitle, isInteractiveComponent } from '@/lib/lesson-utils';
import { isComponentCompleted } from '@/domain/component-status';
import isEqual from 'lodash.isequal';
import { cn } from '@/lib/utils';
import { useNavigationLock } from '@/context/navigation-lock-context';
import { SlideTransitionOverlay } from '@/components/viewer/SlideTransitionOverlay';
import { LessonIntroCueOverlay } from '@/components/viewer/LessonIntroCueOverlay';
import { LessonCompletionOverlay } from '@/components/viewer/LessonCompletionOverlay';
import { IncompleteLessonModal } from '@/components/viewer/IncompleteLessonModal';
import { getSlideTheme, getLessonPattern } from '@/lib/slide-themes';
import { GraphicBackground } from '@/components/viewer/cue-overlay-shell';
import { usePollStore } from '@/hooks/use-poll-store';
import { useLessonPreloader } from '@/hooks/use-lesson-preloader';

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
  nextLesson?: { id: string; title: string } | null;
  onNextLesson?: (nextLessonId: string) => void;
  /** Skip lesson intro + slide transition overlays (builder preview, tutor view) */
  suppressCues?: boolean;
  /** Builder preview: exit label + direct exit without completion modals */
  previewMode?: boolean;
  hideChromeHeader?: boolean;
}

export interface LessonContentRef {
  setCurrentSlideIndex: (index: number) => void;
  getAllComponentStates: () => Record<string, any>;
  triggerEndLesson: () => void;
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
    nextLesson,
    onNextLesson,
    suppressCues = false,
    previewMode = false,
    hideChromeHeader = false,
  }, ref) {
    const { playFeedback } = useFeedback();
    const { currentScore: score, totalScore: totalPossible } = useScoring();
    // Pre-fetch poll votes and preload all lesson media for the full session
    const pollStore = usePollStore(lesson);
    useLessonPreloader({ lessonData: lesson, enabled: !!lesson?.id });

    const currentSlide = useMemo(() => lesson.slides[currentSlideIndex], [lesson.slides, currentSlideIndex]);
    const onSlidesUpdateRef = useLatestRef(onSlidesUpdate);
    const onProgressUpdateRef = useLatestRef(onProgressUpdate);
    const onScoreUpdateRef = useLatestRef(onScoreUpdate);
    const lessonRef = useLatestRef(lesson);

    const lastReportedProgressRef = useRef<number>(-1);
    const lastCompletedSlideIdRef = useRef<string | null>(null);

    const [componentStates, setComponentStates] = useState<Record<string, any>>(initialComponentStates);
    const [innerStepIndex, setInnerStepIndex] = useState(0);
    const [showIntroCue, setShowIntroCue] = useState(!suppressCues);
    const [showOverlay, setShowOverlay] = useState(false);
    const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
    const [showIncompleteModal, setShowIncompleteModal] = useState(false);
    const hasShownCompletionOverlayRef = useRef(false);
    const prevSlideIndexRef = useRef<number>(-1);

    const currentSlideProgress = useMemo(() => {
      if (!currentSlide) return 100;
      const interactiveComponents = currentSlide.components.filter(
        (comp: any) => isInteractiveComponent(comp.type)
      );
      if (interactiveComponents.length === 0) return 100;
      const completedCount = interactiveComponents.filter(
        (comp: any) => isComponentCompleted(componentStates[comp.id])
      ).length;
      return (completedCount / interactiveComponents.length) * 100;
    }, [currentSlide, componentStates]);

    const completedSlidesCount = useMemo(() => {
      return lesson.slides.filter(s => s.status === "completed").length;
    }, [lesson.slides]);

    const allSlidesCompleted = completedSlidesCount === lesson.slides.length;

    const handleEndLessonTrigger = useCallback(() => {
      if (previewMode) {
        onEndLesson?.();
        return;
      }
      if (allSlidesCompleted) {
        setShowCompletionOverlay(true);
      } else {
        setShowIncompleteModal(true);
      }
    }, [allSlidesCompleted, previewMode, onEndLesson]);

    useEffect(() => {
      setInnerStepIndex(0);
      if (suppressCues) {
        prevSlideIndexRef.current = currentSlideIndex;
        return;
      }
      // Show overlay whenever we actually change slides (skip first load where prev === current)
      if (prevSlideIndexRef.current !== -1 && prevSlideIndexRef.current !== currentSlideIndex) {
        setShowOverlay(true);
      }
      prevSlideIndexRef.current = currentSlideIndex;
    }, [currentSlideIndex, suppressCues]);

    useImperativeHandle(ref, () => ({
      setCurrentSlideIndex: onSlideChange,
      getAllComponentStates: () => componentStates,
      triggerEndLesson: handleEndLessonTrigger,
    }), [onSlideChange, componentStates, handleEndLessonTrigger]);

    const processedComponents = useMemo(() => {
      if (!currentSlide) return [];
      return currentSlide.components.map(component => {
        if (currentSlide.state === "disabled" &&
          isInteractiveComponent(component.type)) {
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

    const isCurrentComponentCompleted = useMemo(() => {
      if (!activeComponent) return true;
      if (isInteractiveComponent(activeComponent.type)) {
        const isLiveMode =
          activeComponent.mode === 'live' ||
          (activeComponent.props as any)?.mode === 'live' ||
          Boolean((activeComponent.props as any)?.timeLimit && Number((activeComponent.props as any).timeLimit) > 0);

        if (isLiveMode) {
          // Live mode components allow skipping before the timer starts.
          // Once the timer starts, the component registers a navigation lock (isLocked = true) which disables Next.
          return true;
        }

        return isComponentCompleted(componentStates[activeComponent.id]) || isComponentCompleted(activeComponent);
      }
      return true;
    }, [activeComponent, componentStates]);

    const canGoNext =
      !isLocked &&
      isCurrentComponentCompleted &&
      (innerStepIndex < (processedComponents.length - 1) || currentSlideIndex < (lesson.slides.length - 1));
    const canGoPrev = !isLocked && (innerStepIndex > 0 || currentSlideIndex > 0);

    const [isNavigating, setIsNavigating] = useState(false);

    const handleAdvance = () => {
      if (isNavigating) return;
      setIsNavigating(true);
      playFeedback('uiClick');
      if (innerStepIndex < processedComponents.length - 1) {
        setInnerStepIndex(prev => prev + 1);
      } else if (currentSlideIndex < lesson.slides.length - 1) {
        onSlideChange(currentSlideIndex + 1);
      }
      setTimeout(() => setIsNavigating(false), 500);
    };

    const handleRecall = () => {
      if (isNavigating) return;
      setIsNavigating(true);
      playFeedback('uiClick');
      if (innerStepIndex > 0) {
        setInnerStepIndex(prev => prev - 1);
      } else if (currentSlideIndex > 0) {
        onSlideChange(currentSlideIndex - 1);
      }
      setTimeout(() => setIsNavigating(false), 500);
    };

    useEffect(() => {
      if (!currentSlide) return;

      const interactiveComponents = currentSlide.components.filter(
        (comp: any) => isInteractiveComponent(comp.type)
      );

      let slideProgress = 100;
      if (interactiveComponents.length > 0) {
        const completedCount = interactiveComponents.filter(
          (comp: any) => isComponentCompleted(componentStates[comp.id])
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
        (comp: any) => isInteractiveComponent(comp.type)
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
        comp => isComponentCompleted(componentStates[comp.id])
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

    const [isContentReadingDelayActive, setIsContentReadingDelayActive] = useState(false);

    useEffect(() => {
      if (!activeComponent) return;
      const isInteractive = isInteractiveComponent(activeComponent.type);
      if (!isInteractive && !previewMode) {
        setIsContentReadingDelayActive(true);
        const timer = setTimeout(() => {
          setIsContentReadingDelayActive(false);
        }, 1200);
        return () => clearTimeout(timer);
      } else {
        setIsContentReadingDelayActive(false);
      }
    }, [currentSlideIndex, innerStepIndex, activeComponent, previewMode]);

    return (
      <div className="flex flex-col h-full relative bg-white overflow-hidden font-sans">
        <span className="sr-only" aria-live="polite">{score}</span>
        {!hideChromeHeader && (
        <header className="relative shrink-0 w-full bg-white px-4 sm:px-5 py-3 z-30 flex items-center justify-between gap-4 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.18)]">
          <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <div className="flex-1 flex flex-col gap-1 max-w-sm min-w-0">
            <div className="flex justify-between items-center px-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1CB0F6]">This slide</span>
              <span className="text-xs font-extrabold text-[#58CC02] tabular-nums">{Math.round(currentSlideProgress)}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-[#58CC02] to-[#1CB0F6] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${currentSlideProgress}%` }}
              />
            </div>
          </div>

          {currentSlide?.title && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#CE82FF]/10 border-2 border-[#CE82FF]/30">
              <span className="w-2 h-2 rounded-full bg-[#CE82FF] shrink-0" />
              <span className="text-xs font-extrabold text-slate-700 truncate max-w-[220px]">
                {formatSlideTitle(currentSlide.title, 20)}
              </span>
            </div>
          )}

          <div className="flex gap-3 shrink-0 items-center">
            <div className="flex flex-col items-end justify-center">
              <span className="text-[10px] font-bold text-[#FF9600] uppercase tracking-wider">Score</span>
              <span className="text-sm font-extrabold text-slate-800 tabular-nums">{score}</span>
            </div>
            <div className="flex flex-col items-end justify-center border-l-2 border-slate-100 pl-3">
              <span className="text-[10px] font-bold text-[#1CB0F6] uppercase tracking-wider">Slide</span>
              <span className="text-sm font-extrabold text-slate-800 tabular-nums">
                {currentSlideIndex + 1} <span className="text-slate-400">/</span> {lesson.slides.length}
              </span>
            </div>
            <FeedbackSettingsButton />
          </div>
        </header>
        )}

        {/* Content Area */}
        <main className="flex-1 min-h-0 relative overflow-y-auto z-10 flex flex-col bg-white">
          <div className="absolute inset-0 pointer-events-none">
            <GraphicBackground
              pattern={getLessonPattern(lesson.id)}
              theme={getSlideTheme(currentSlideIndex)}
              idPrefix="lesson-bg"
              intensity="whisper"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/88 to-white/80" />
          </div>
          <div className="relative z-10 w-full flex-1 flex flex-col pb-24 pt-4 px-1 sm:px-2 md:pt-6">
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
                  pollStore={pollStore}
                />
              </div>
            )}
          </div>
          {!suppressCues && (
            <LessonIntroCueOverlay
              isVisible={showIntroCue}
              lessonData={lesson}
              moduleTitle={(lesson as any).moduleTitle || "Course Module"}
              lessonNumber={(lesson as any).lessonNumber || 1}
              onBegin={() => setShowIntroCue(false)}
            />
          )}
          {!suppressCues && (
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
          )}
        </main>

        {/* Footer Navigation */}
        {(() => {
          const isInteractive = activeComponent && isInteractiveComponent(activeComponent.type);
          const shouldHideFooter =
            showIntroCue ||
            showOverlay ||
            (isInteractive && !isCurrentComponentCompleted) ||
            (!isInteractive && isContentReadingDelayActive);

          return (
            <footer className={cn(
              "absolute bottom-0 left-0 right-0 w-full bg-white z-30 py-3 px-4 sm:px-6 transition-all duration-500 shadow-[0_-8px_20px_-14px_rgba(15,23,42,0.18)]",
              shouldHideFooter ? "motion-nav-hidden" : "motion-nav-visible"
            )}>
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <div className="max-w-lg mx-auto flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  className="min-h-11 h-11 px-5 w-full rounded-xl border-2 border-[#1CB0F6]/30 text-[#1CB0F6] hover:bg-[#1CB0F6]/10 font-extrabold text-xs"
                  onClick={handleRecall}
                  disabled={!canGoPrev || isNavigating}
                >
                  {isNavigating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <ChevronLeft className="h-4 w-4 mr-1.5" />}
                  Previous
                </Button>

                {currentSlideIndex === lesson.slides.length - 1 && innerStepIndex >= (processedComponents.length - 1) ? (
                  <Button
                    variant="duo"
                    className="min-h-11 w-full bg-slate-800 hover:bg-slate-900 border-slate-800 border-b-black text-white"
                    onClick={() => {
                      playFeedback('uiClick');
                      handleEndLessonTrigger();
                    }}
                    disabled={isNavigating || (!previewMode && !isCurrentComponentCompleted)}
                  >
                    {isNavigating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                    {previewMode ? "Back to Editor" : "End Lesson"}
                  </Button>
                ) : (() => {
                  const isLastComponentOfSlide =
                    innerStepIndex >= processedComponents.length - 1 &&
                    currentSlideIndex < lesson.slides.length - 1;
                  const nextSlideTheme = isLastComponentOfSlide
                    ? getSlideTheme(currentSlideIndex + 1)
                    : null;
                  return (
                    <Button
                      variant="duo"
                      className={cn(
                        "min-h-11 w-full",
                        !isLastComponentOfSlide && "bg-[#58CC02] hover:bg-[#46a302] border-[#58CC02] border-b-[#3B8C00] text-white"
                      )}
                      style={isLastComponentOfSlide && nextSlideTheme ? {
                        backgroundColor: nextSlideTheme.btnBgHex,
                        color: nextSlideTheme.btnTextHex,
                        borderColor: nextSlideTheme.btnBgHex,
                      } : undefined}
                      onClick={handleAdvance}
                      disabled={!canGoNext || isNavigating}
                    >
                      {isLastComponentOfSlide ? "Next Slide" : "Next"}
                      {isNavigating ? <Loader2 className="h-4 w-4 ml-1.5 animate-spin" /> : <ChevronRight className="h-4 w-4 ml-1.5" />}
                    </Button>
                  );
                })()}
              </div>
            </footer>
          );
        })()}

        {/* Lesson Completion Celebration Overlay */}
        {!previewMode && (
          <>
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
                if (onEndLesson) onEndLesson();
              }}
              nextLesson={nextLesson}
              onNextLesson={onNextLesson ? () => {
                const id = nextLesson?.id;
                if (id) onNextLesson(id);
              } : undefined}
            />

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
          </>
        )}
      </div>
    );
  }
);
