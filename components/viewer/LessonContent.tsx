"use client"

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ComponentRenderer } from '@/components/component-renderer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFeedback } from '@/hooks/use-feedback';
import type { Lesson, Component, ComponentType_Category } from '@/types/lesson';

interface LessonContentProps {
  lesson: Lesson;
  onScoreUpdate?: (score: number, total: number) => void;
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  initialComponentStates?: Record<string, any>;
  onSlidesUpdate?: (updatedSlides: Lesson['slides']) => void;
  savedScore?: number;
}

export interface LessonContentRef {
  setCurrentSlideIndex: (index: number) => void;
  getAllComponentStates: () => Record<string, any>;
}

export const LessonContent = forwardRef<LessonContentRef, LessonContentProps>(
  function LessonContent({ lesson, onScoreUpdate, currentSlideIndex, onSlideChange, initialComponentStates = {}, onSlidesUpdate, savedScore }, ref) {
    const { playFeedback } = useFeedback();
    const viewportRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(savedScore || 0);
    const [totalPossible, setTotalPossible] = useState(0);
    const currentSlide = lesson.slides[currentSlideIndex];
    const progress = ((currentSlideIndex + 1) / lesson.slides.length) * 100;
    const [triggerProgress, setTriggerProgress] = useState(0);

    // Persist state for each component by id with debug log
    const [componentStates, setComponentStates] = useState<Record<string, any>>(() => {
      console.log('Initializing component states with:', initialComponentStates);
      return initialComponentStates;
    });

    // Debug log when component states change
    useEffect(() => {
      console.group('Component States Update');
      console.log('Updated component states:', componentStates);
      console.log('Initial states reference:', initialComponentStates);
      console.groupEnd();
    }, [componentStates, initialComponentStates]);

    // Log slide details on change and preserve states
    useEffect(() => {
      if (!currentSlide) return;
      
      console.group('State Persistence Debug');
      console.log('Current Component States:', componentStates);
      console.log('Initial Component States:', initialComponentStates);
      console.groupEnd();

      // REMOVE state cleaning as it's causing loss of persistence
      // We want to keep all states across slides for persistence
      
      // Get interactive components for current slide only
      const interactiveComponents = currentSlide.components.filter(
        comp => comp.component_type === "interactive"
      );

      // Get components completion status
      const componentsStatus = interactiveComponents.map(comp => ({
        id: comp.id,
        type: comp.type,
        status: componentStates[comp.id]?.status || 'pending',
        isComplete: componentStates[comp.id]?.isComplete || false
      }));

      // Create detailed log
      console.group(`🎯 Slide Change - #${currentSlideIndex + 1}`);
      console.log('Slide Details:', {
        title: currentSlide.title,
        id: currentSlide.id,
        state: currentSlide.state,
        status: currentSlide.status,
        totalComponents: currentSlide.components.length,
        interactiveComponents: interactiveComponents.length,
      });
      console.log('Interactive Components:', interactiveComponents);
      console.log('Interactive Components Status:', componentsStatus);
      console.log('Component States:', componentStates);
      console.groupEnd();
      
    }, [currentSlide, currentSlideIndex, componentStates]);



    useImperativeHandle(ref, () => ({
      setCurrentSlideIndex: onSlideChange,
      getAllComponentStates: () => componentStates,
    }), [onSlideChange, componentStates]);

    // Process components to handle disabled state
    const processedComponents = currentSlide?.components.map(component => {
      if (currentSlide.state === "disabled" && 
          (component.component_type === "interactive")) {
        return { 
          ...component, 
          state: "disabled" as const
        };
      }
      return component;
    });

    // Check if all interactive components in a slide are completed
    const checkSlideCompletion = useCallback(() => {
      console.log('Checking slide completion for:', currentSlide?.title);
      if (!currentSlide) {
        console.log('No current slide to check completion for.');
        return;
      }

      // Get all component IDs for this slide that have state
      const interactiveComponents = currentSlide.components.filter(
        comp => comp.component_type === "interactive"
      );

      // Get components completion status
      const slideComponentStates = interactiveComponents.map(comp => ({
        id: comp.id,
        type: comp.type,
        status: componentStates[comp.id]?.status || 'pending',
        isComplete: componentStates[comp.id]?.isComplete || false
      }));

      console.log('Slide Component States:', slideComponentStates);
      
      if (slideComponentStates.length === 0) {
        console.log('No interactive components with state to check.');
        return;
      }

      // Check if all interactive components that have state are completed
      /*const allCompleted = slideComponentStates.every((state) => 
        state.status === "completed"
      );*/
      const allCompleted = slideComponentStates.filter((state) => state.status === "completed").length === slideComponentStates.length;

      console.log('Component Completion Status:', {
        total: slideComponentStates.length,
        completed: slideComponentStates.filter((state) => state.status === "completed").length,
        allCompleted
      });

      if (allCompleted && currentSlide.status !== "completed") {
        // Update the slide status in lesson data
        console.log(`All interactive components completed for slide: ${currentSlide.title}`);
        const updatedSlides = [...lesson.slides];
        updatedSlides[currentSlideIndex] = {
          ...currentSlide,
          status: "completed"
        };
        
        // Play level-up feedback when slide is completed
        playFeedback('levelUp');
        
        // Check if there's a next slide and set its state to active
        if (currentSlideIndex < lesson.slides.length - 1) {
          updatedSlides[currentSlideIndex + 1] = {
            ...lesson.slides[currentSlideIndex + 1],
            state: "active"
          };
          console.log('Activated next slide:', updatedSlides[currentSlideIndex + 1].title);
        }
        
        // Update lesson slides and notify parent component
        lesson.slides = updatedSlides;
        onSlidesUpdate?.(updatedSlides);
        console.log('Updated lesson slides:', updatedSlides);
      }

      console.log('Slide completion check completed for:', currentSlide.title);
    }, [currentSlide, componentStates, currentSlideIndex, lesson.slides, onSlidesUpdate, playFeedback]);

    // Handle component state updates with persistence
    const handleComponentStateChange = (componentId: string, newState: any) => {
      if (currentSlide?.state === "disabled") return; // Prevent state changes for disabled slides
      
      console.group('Component State Update');
      console.log('Updating state for component:', componentId);
      console.log('Previous states:', componentStates);
      console.log('New state:', newState);

      // First, update component state
      const updatedStates = {
        ...componentStates,
        [componentId]: {
          ...componentStates[componentId],
          ...newState,
          lastUpdated: Date.now()
        }
      };

      // Then check completion with the new state
      if (newState?.status === "completed") {
        // Get all interactive components
        const interactiveComponents = currentSlide.components.filter(
          comp => comp.component_type === "interactive"
        );

        // Get completion status with the updated state
        const slideComponentStates = interactiveComponents.map(comp => ({
          id: comp.id,
          type: comp.type,
          status: comp.id === componentId ? "completed" : (updatedStates[comp.id]?.status || 'pending'),
          isComplete: comp.id === componentId ? true : (updatedStates[comp.id]?.isComplete || false)
        }));

        console.log('Checking completion with states:', slideComponentStates);

        // Check if all are completed
        const allCompleted = slideComponentStates.every(state => state.status === "completed");
        console.log('All completed?', allCompleted);

          if (allCompleted && currentSlide.status !== "completed") {
            console.log('All components completed, preparing slide update');
            const updatedSlides = [...lesson.slides];
            updatedSlides[currentSlideIndex] = {
              ...currentSlide,
              status: "completed"
            };
            
            // Play level-up feedback when slide is completed
            playFeedback('levelUp');

            if (currentSlideIndex < lesson.slides.length - 1) {
              updatedSlides[currentSlideIndex + 1] = {
                ...lesson.slides[currentSlideIndex + 1],
                state: "active"
              };
            }          // Schedule the slides update after the state update
          Promise.resolve().then(() => {
            console.log('Updating slides status');
            onSlidesUpdate?.(updatedSlides);
          });
        }
      }

      // Finally set the component states
      setComponentStates(updatedStates);
      console.groupEnd();
    };

    useEffect(() => {
      onScoreUpdate?.(score, totalPossible);
    }, [score, totalPossible, onScoreUpdate]);

    // Log quiz component props when slide changes
    useEffect(() => {
      if (currentSlide) {
        const quizComponents = currentSlide.components.filter(comp => comp.type === 'quiz');
        if (quizComponents.length > 0) {
          console.log('Quiz components in current slide:', quizComponents.map(comp => ({
            id: comp.id,
            props: comp.props
          })));
        }
      }
    }, [currentSlideIndex, currentSlide]);

    // Sum points for all gamified components in all slides, considering number of items
    useEffect(() => {
      let total = 0;
      for (const slide of lesson.slides) {
        for (const component of slide.components) {
          // Skip practice mode components
          if (component.props?.mode === 'practice') continue;

          // Get points per item based on component type
          const points = component.props?.points;
          if (typeof points !== 'number') continue;

          // Calculate total possible points based on number of items
          if (component.type === 'quiz' && Array.isArray(component.props?.questions)) {
            total += points * component.props.questions.length;
          }
          else if (component.type === 'fillInTheBlank' && Array.isArray(component.props?.blanks)) {
            total += points * component.props.blanks.length;
          }
          else if (component.type === 'matchingPairs' && Array.isArray(component.props?.pairs)) {
            total += points * component.props.pairs.length;
          }
          else if (component.type === 'dragDrop' && Array.isArray(component.props?.items)) {
            total += points * component.props.items.length;
          }
        }
      }
      console.log('Total Points Calculation:', {
        total,
        components: lesson.slides.flatMap(slide => 
          slide.components.filter(comp => 
            ['quiz', 'dragDrop', 'matchingPairs', 'fillInTheBlank'].includes(comp.type)
          ).map(comp => ({
            type: comp.type,
            points: comp.props?.points,
            itemCount: comp.type === 'quiz' ? comp.props?.questions?.length :
                      comp.type === 'fillInTheBlank' ? comp.props?.blanks?.length :
                      comp.type === 'matchingPairs' ? comp.props?.pairs?.length :
                      comp.type === 'dragDrop' ? comp.props?.items?.length : 0,
            mode: comp.props?.mode,
            included: comp.props?.mode !== 'practice',
            totalPoints: comp.props?.mode !== 'practice' ? 
              (comp.props?.points || 0) * (
                comp.type === 'quiz' ? comp.props?.questions?.length :
                comp.type === 'fillInTheBlank' ? comp.props?.blanks?.length :
                comp.type === 'matchingPairs' ? comp.props?.pairs?.length :
                comp.type === 'dragDrop' ? comp.props?.items?.length : 0
              ) : 0
          }))
        )
      });
      setTotalPossible(total);
    }, [lesson]);

    return (
      <div className="flex flex-col h-full relative">
        <ScrollArea className="flex-1 px-4 md:px-8 py-6" viewportRef={viewportRef}>
          <div className="max-w-4xl mx-auto space-y-8 px-2 py-6">
            {currentSlide && processedComponents?.map((component) => (
              <ComponentRenderer
                key={component.id}
                component={component}
                scoreContext={{
                  score,
                  totalPossible,
                  addPoints: (points: number) => setScore((s) => s + points),
                }}
                savedState={componentStates[component.id]}
                setComponentState={(state) => handleComponentStateChange(component.id, state)}
                onCheckSlideCompletion={checkSlideCompletion}
              />
            ))}
          </div>
        </ScrollArea>
        
        <div className="sticky bottom-0 w-full bg-background border-t">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => {
                playFeedback('click');
                onSlideChange(currentSlideIndex - 1);
                if (viewportRef.current) {
                  viewportRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Progress value={progress} className="flex-1" />
            <Button
              variant="outline"
              onClick={() => {
                playFeedback('click');
                onSlideChange(currentSlideIndex + 1);
                if (viewportRef.current) {
                  viewportRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
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