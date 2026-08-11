"use client"

import dynamic from "next/dynamic"
import * as React from 'react'
import { createElement } from "react"
import { cn } from "@/lib/utils"
import type { Component, ComponentType } from "@/types/lesson"
import type { PollVotesMap } from "@/hooks/use-poll-store"

type ComponentRenderers = Record<string, React.ComponentType<any>>;

// Dynamically import all component renderers
const componentRenderers: ComponentRenderers = {
  // Content Components
  paragraph: dynamic(() => import("@/components/renderers/paragraph-renderer").then((mod) => mod.ParagraphRenderer)),
  heading: dynamic(() => import("@/components/renderers/heading-renderer").then((mod) => mod.HeadingRenderer)),
  bulletList: dynamic(() =>
    import("@/components/renderers/bullet-list-renderer").then((mod) => mod.BulletListRenderer),
  ),
  image: dynamic(() => import("@/components/renderers/image-renderer").then((mod) => mod.ImageRenderer)),
  table: dynamic(() => import("@/components/renderers/table-renderer").then((mod) => mod.TableRenderer)),
  video: dynamic(() => import("@/components/renderers/video-renderer").then((mod) => mod.VideoRenderer)),
  codeBlock: dynamic(() => import("@/components/renderers/code-block-renderer").then((mod) => mod.CodeBlockRenderer)),
  quote: dynamic(() => import("@/components/renderers/quote-renderer").then((mod) => mod.QuoteRenderer)),
  callout: dynamic(() => import("@/components/renderers/callout-renderer").then((mod) => mod.CalloutRenderer)),
  accordion: dynamic(() => import("@/components/renderers/accordion-renderer").then((mod) => mod.AccordionRenderer)),

  // Interactive Components
  quiz: dynamic(() => import("@/components/renderers/quiz-renderer").then((mod) => mod.QuizRenderer)),
  trueFalse: dynamic(() => import("@/components/renderers/true-false-renderer").then((mod) => mod.TrueFalseRenderer)),
  annotateImage: dynamic(() => import("@/components/renderers/annotate-image-renderer").then((mod) => mod.AnnotateImageRenderer)),
  categorise: dynamic(() => import("@/components/renderers/categorise-renderer").then((mod) => mod.CategoriseRenderer)),
  timeline: dynamic(() => import("@/components/renderers/timeline-renderer").then((mod) => mod.TimelineRenderer)),
  matchingPairs: dynamic(() =>
    import("@/components/renderers/matching-pairs-renderer").then((mod) => mod.MatchingPairsRenderer),
  ),
  dragDrop: dynamic(() => import("@/components/renderers/drag-drop-renderer").then((mod) => mod.DragDropRenderer)),

  // Additional Interactive Components
  flashcards: dynamic(() => import("@/components/renderers/flashcards-renderer").then((mod) => mod.FlashcardsRenderer)),
  hotspot: dynamic(() => import("@/components/renderers/hotspot-renderer").then((mod) => mod.HotspotRenderer)),

  // New Interactive Components
  fillInTheBlank: dynamic(() =>
    import("@/components/renderers/fill-in-the-blank-renderer").then((mod) => mod.FillInTheBlankRenderer),
  ),
  codeEditor: dynamic(() =>
    import("@/components/renderers/code-editor-renderer").then((mod) => mod.CodeEditorRenderer),
  ),
  poll: dynamic(() => import("@/components/renderers/poll-renderer").then((mod) => mod.PollRenderer)),
  flashcardQuiz: dynamic(() =>
    import("@/components/renderers/flashcard-quiz-renderer").then((mod) => mod.FlashcardQuizRenderer),
  ),
  multiSelectQuiz: dynamic(() =>
    import("@/components/renderers/multi-select-quiz-renderer").then((mod) => mod.MultiSelectQuizRenderer),
  ),

  // Gamified Components
  wordScramble: dynamic(() => import("@/components/renderers/word-scramble-renderer").then((mod) => mod.WordScrambleRenderer)),
  memoryGrid: dynamic(() => import("@/components/renderers/memory-grid-renderer").then((mod) => mod.MemoryGridRenderer)),
  spinTheWheel: dynamic(() => import("@/components/renderers/spin-the-wheel-renderer").then((mod) => mod.SpinTheWheelRenderer)),

  // Structure Components
  slideTitle: dynamic(() => import("@/components/renderers/heading-renderer").then((mod) => mod.HeadingRenderer)),

  // Fallback renderer for unimplemented components
  fallback: dynamic(() => import("@/components/renderers/fallback-renderer").then((mod) => mod.FallbackRenderer)),
}

export function isSupportedRenderer(type: string): boolean {
  return !!type && type in componentRenderers && type !== 'fallback';
}

interface ComponentRendererProps {
  component: Component;
  savedState?: any;
  setComponentState?: (state: any) => void;
  isLastSlideChild?: boolean;
  onCheckSlideCompletion?: () => void;
  isEditing?: boolean;
  onClick?: () => void;
  pollStore?: {
    pollData: PollVotesMap;
    isLoaded: boolean;
    submitVote: (componentId: string, optionId: string) => Promise<void>;
  };
}

const gamifiedTypes: ComponentType[] = [
  'quiz',
  'trueFalse',
  'annotateImage',
  'categorise',
  'timeline',
  'dragDrop',
  'matchingPairs',
  'fillInTheBlank',
  'codeEditor',
  'wordScramble',
  'memoryGrid',
  'spinTheWheel',
];

const interactiveTypes: ComponentType[] = [
  'quiz',
  'trueFalse',
  'annotateImage',
  'categorise',
  'timeline',
  'dragDrop',
  'matchingPairs',
  'fillInTheBlank',
  'flashcards',
  'codeEditor',
  'hotspot',
  'wordScramble',
  'memoryGrid',
  'spinTheWheel',
];

// Status-safe wrapper for component discovery and live timing
const DiscoveryWrapper = ({
  component,
  children,
  savedState,
  setComponentState
}: {
  component: Component,
  children: React.ReactNode,
  savedState?: any,
  setComponentState?: (state: any) => void
}) => {
  const timeLimit = component.props?.timeLimit || 0;
  const isLive = !!timeLimit;
  // Always start revealed — interactive components manage their own LiveStartScreen and LiveTimer internally.
  // The outer DiscoveryWrapper gate is not used for any registered component type.
  const [isRevealed, setIsRevealed] = React.useState(true);

  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleReveal = () => {
    setIsRevealed(true);
    if (setComponentState) {
      setComponentState({ revealed: true });
    }

    if (isLive) {
      setTimeLeft(timeLimit);
    }
  };

  React.useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
      }, 1000);
    } else if (timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      // Auto-submit or lock logic could go here
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft]);

  if (!isRevealed) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-50/50 transition-all duration-700">
        <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-500 px-6">
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center mb-8">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping" />
            <div className="relative w-14 h-14 bg-white border-2 border-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-black text-emerald-600">?</span>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Encrypted Fragment</h3>
            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.3em]">Initialize synchronization protocol</p>
          </div>

          <button
            onClick={handleReveal}
            className="group relative h-14 w-64 mx-auto rounded-xl bg-emerald-600 p-[2px] shadow-xl shadow-emerald-500/20 active:scale-95 transition-transform"
          >
            <div className="h-full w-full rounded-[10px] bg-emerald-600 flex items-center justify-center gap-3">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Decrypt Segment</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col w-full">
      {isLive && timeLeft !== null && (
        <div className="absolute -top-12 right-0 flex items-center gap-3 px-4 py-2 bg-rose-50 border-2 border-rose-500 rounded-full animate-in slide-in-from-right-4">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
            Terminating in: {timeLeft}s
          </span>
        </div>
      )}
      <div className={cn(
        "flex-1 flex flex-col w-full transition-all duration-500",
        timeLeft === 0 && "opacity-50 pointer-events-none grayscale"
      )}>
        {children}
      </div>

      {timeLeft === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl animate-bounce">
            Protocol Terminated
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper component for disabled state
const DisabledWrapper = ({ isDisabled, children }: { isDisabled: boolean, children: React.ReactNode }) => {
  if (!isDisabled) return <div className="flex-1 flex flex-col w-full">{children}</div>;

  return (
    <div className="relative group flex-1 flex flex-col w-full">
      {children}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] pointer-events-auto cursor-not-allowed">
        <div className="absolute inset-0 opacity-5 bg-slate-900"></div>
      </div>
    </div>
  );
};

const ComponentRendererBase = function ComponentRenderer({
  component,
  savedState,
  setComponentState,
  isLastSlideChild,
  onCheckSlideCompletion,
  isEditing = false,
  pollStore
}: ComponentRendererProps) {
  const Renderer: React.ComponentType<any> = componentRenderers[component.type] || componentRenderers.fallback;
  const isDisabled = component.state === "disabled";

  const renderComponent = (props: any) => (
    <DisabledWrapper isDisabled={isDisabled}>
      <DiscoveryWrapper
        component={component}
        savedState={savedState}
        setComponentState={setComponentState}
      >
        <div className={cn(
          "flex-1 flex flex-col w-full transition-opacity",
          isDisabled && "opacity-75"
        )}>
          <Renderer {...props} />
        </div>
      </DiscoveryWrapper>
    </DisabledWrapper>
  );

  if (gamifiedTypes.includes(component.type)) {
    return renderComponent({
      ...component.props,
      savedState,
      setComponentState: isDisabled ? undefined : setComponentState,
      status: component.status,
      disabled: isDisabled,
      isLastSlideChild,
      onCheckSlideCompletion: isLastSlideChild ? onCheckSlideCompletion : undefined
    });
  }

  if (interactiveTypes.includes(component.type)) {
    return renderComponent({
      ...component.props,
      savedState,
      setComponentState: isDisabled ? undefined : setComponentState,
      status: component.status,
      disabled: isDisabled,
      isLastSlideChild,
      onCheckSlideCompletion: isLastSlideChild ? onCheckSlideCompletion : undefined
    });
  }

  return renderComponent({
    ...component.props,
    id: component.id,
    lessonId: (component as any).lessonId,
    savedState,
    setComponentState: isDisabled ? undefined : setComponentState,
    status: component.status,
    disabled: isDisabled,
    isEditing,
    // Pass poll-specific store for real-time vote integration
    ...(component.type === 'poll' && pollStore ? {
      initialVotes: pollStore.pollData[component.id]?.votes || {},
      initialTotalVotes: pollStore.pollData[component.id]?.totalVotes || 0,
      onVote: (optionId: string) => pollStore.submitVote(component.id, optionId),
    } : {})
  });
}

ComponentRendererBase.displayName = "ComponentRenderer";

export const ComponentRenderer = React.memo(ComponentRendererBase);
