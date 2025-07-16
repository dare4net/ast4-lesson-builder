"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ComponentRenderer } from '@/components/component-renderer';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Lesson, Component, ComponentType_Category } from '@/types/lesson';

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

    // Process components to handle disabled state
    const processedComponents = currentSlide?.components.map(component => {
      if (currentSlide.state === "disabled" && 
          (component.component_type === "interactive" || component.component_type === "gamified")) {
        return { 
          ...component, 
          state: "disabled" as const
        };
      }
      return component;
    });

    // Handle component state updates
    const handleComponentStateChange = (componentId: string, newState: any) => {
      if (currentSlide?.state === "disabled") return; // Prevent state changes for disabled slides
      setComponentStates(prev => ({
        ...prev,
        [componentId]: newState
      }));
    };

    useEffect(() => {
      onScoreUpdate?.(score, totalPossible);
    }, [score, totalPossible, onScoreUpdate]);

    // Sum points for all gamified components in all slides
    useEffect(() => {
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

    return (
      <div className="flex flex-col h-full relative">
        <ScrollArea className="flex-1 px-4 md:px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {currentSlide && processedComponents?.map((component) => (
              <ComponentRenderer
                key={component.id}
                component={component}
                scoreContext={{
                  addToScore: (points: number) => setScore((s) => s + points),
                  setTotalPossible: (total: number) =>
                    setTotalPossible((t) => t + total),
                }}
                savedState={componentStates[component.id]}
                setComponentState={(state) => handleComponentStateChange(component.id, state)}
              />
            ))}
          </div>
        </ScrollArea>
        
        <div className="sticky bottom-0 w-full bg-background border-t">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => onSlideChange(currentSlideIndex - 1)}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Progress value={progress} className="flex-1" />
            <Button
              variant="outline"
              onClick={() => onSlideChange(currentSlideIndex + 1)}
              disabled={currentSlideIndex === lesson.slides.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);