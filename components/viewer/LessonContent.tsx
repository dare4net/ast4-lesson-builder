"use client"

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ComponentRenderer } from '@/components/component-renderer';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Lesson } from '@/types/lesson';

interface LessonContentProps {
  lesson: Lesson;
  onScoreUpdate?: (score: number, total: number) => void;
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  initialComponentStates?: Record<string, any>;
}

export interface LessonContentRef {
  setCurrentSlideIndex: (index: number) => void;
  getAllComponentStates: () => Record<string, any>;
}

export const LessonContent = forwardRef<LessonContentRef, LessonContentProps>(
  function LessonContent({ lesson, onScoreUpdate, currentSlideIndex, onSlideChange, initialComponentStates = {} }, ref) {
    const [score, setScore] = useState(0);
    const [totalPossible, setTotalPossible] = useState(0);
    const currentSlide = lesson.slides[currentSlideIndex];
    const progress = ((currentSlideIndex + 1) / lesson.slides.length) * 100;

    // Persist state for each component by id
    const [componentStates, setComponentStates] = useState<Record<string, any>>(initialComponentStates);

    useImperativeHandle(ref, () => ({
      setCurrentSlideIndex: onSlideChange,
      getAllComponentStates: () => componentStates,
    }), [onSlideChange, componentStates]);

    useEffect(() => {
      onScoreUpdate?.(score, totalPossible);
    }, [score, totalPossible, onScoreUpdate]);

    useEffect(() => {
      // Sum points for all gamified components in all slides
      let total = 0;
      for (const slide of lesson.slides) {
        for (const component of slide.components) {
          // List all gamified types here
          if (
            [
              'quiz',
              'drag-drop',
              'matching-pairs',
              // add other gamified types as needed
            ].includes(component.type) &&
            typeof component.props?.points === 'number'
          ) {
            total += component.props.points;
          }
        }
      }
      setTotalPossible(total);
    }, [lesson]);

    const goToNextSlide = () => {
      if (currentSlideIndex < lesson.slides.length - 1) {
        onSlideChange(currentSlideIndex + 1);
      }
    };

    const goToPreviousSlide = () => {
      if (currentSlideIndex > 0) {
        onSlideChange(currentSlideIndex - 1);
      }
    };

    const addPoints = useCallback((points: number) => {
      setScore((prevScore) => prevScore + points);
    }, []);

    const setComponentState = useCallback((id: string, state: any) => {
      setComponentStates(prev => ({ ...prev, [id]: state }));
    }, []);

    const scoreContext = {
      score,
      totalPossible,
      addPoints,
    };

    return (
      <div className="h-full flex flex-col">
        {/* Fixed Header */}
        <div className="shrink-0">
          <Progress value={progress} className="w-full" />
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="min-h-full w-full flex items-start justify-center">
              <div className="w-full h-full flex items-start justify-center py-8">
                <div className="w-full max-w-[90%] space-y-6">
                  {currentSlide.components.map((component) => (
                    <div key={component.id} className="w-full">
                      <ComponentRenderer 
                        component={component} 
                        scoreContext={scoreContext}
                        savedState={componentStates[component.id]}
                        setComponentState={(state: any) => setComponentState(component.id, state)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 border-t bg-background">
          <div className="w-full px-4 md:px-8">
            <div className="py-4 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-muted-foreground">Slide {currentSlideIndex + 1} of {lesson.slides.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousSlide}
                  disabled={currentSlideIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextSlide}
                  disabled={currentSlideIndex === lesson.slides.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);