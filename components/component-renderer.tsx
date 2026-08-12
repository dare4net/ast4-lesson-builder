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
  shortAnswer: dynamic(() =>
    import("@/components/renderers/short-answer-renderer").then((mod) => mod.ShortAnswerRenderer),
  ),
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
  wordCloud: dynamic(() =>
    import("@/components/renderers/word-cloud-renderer").then((mod) => mod.WordCloudRenderer),
  ),
  scaleSlider: dynamic(() =>
    import("@/components/renderers/scale-slider-renderer").then((mod) => mod.ScaleSliderRenderer),
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
  isTutorView?: boolean;
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
  'shortAnswer',
  'annotateImage',
  'categorise',
  'timeline',
  'dragDrop',
  'matchingPairs',
  'fillInTheBlank',
  'codeEditor',
  'wordScramble',
  'memoryGrid',
  'wordCloud',
  'scaleSlider',
  'poll',
  'spinTheWheel'
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
  'crossword',
  'audioRecording',
  'wordCloud',
  'scaleSlider',
  'drawingCanvas',
  'poll',
  'spinTheWheel'
];

// Wrapper component for decrypt/discovery mode (handles password encryption, timers, hints)
const DiscoveryWrapper = ({
  component,
  savedState,
  setComponentState,
  children
}: {
  component: Component;
  savedState?: any;
  setComponentState?: (state: any) => void;
  children: React.ReactNode;
}) => {
  const compAny = component as any;
  const isEncrypted = compAny.discoveryMode === "decrypt" && compAny.encryptionPassword;
  const isLive = compAny.discoveryMode === "live" && compAny.liveDurationSeconds;
  const [passwordInput, setPasswordInput] = React.useState("");
  const [unlocked, setUnlocked] = React.useState(savedState?.unlocked || false);
  const [timeLeft, setTimeLeft] = React.useState<number | null>(compAny.liveDurationSeconds || null);

  React.useEffect(() => {
    if (!isLive || !timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLive, timeLeft]);

  if (isEncrypted && !unlocked) {
    return (
      <div className="relative flex-1 flex flex-col items-center justify-center p-8 bg-slate-900 border-2 border-dashed border-slate-700 rounded-3xl text-center shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto border border-amber-500/30 text-amber-400">
            🔒
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Encrypted Data Stream</h4>
            <p className="text-xs text-slate-400 mt-1">Enter decryption protocol key to reveal payload.</p>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Enter Access Key..."
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => {
                if (passwordInput === component.encryptionPassword) {
                  setUnlocked(true);
                  if (setComponentState) setComponentState({ ...savedState, unlocked: true });
                }
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              Decrypt
            </button>
          </div>
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
const DisabledWrapper = ({ isDisabled, isTutorView, children }: { isDisabled: boolean, isTutorView?: boolean, children: React.ReactNode }) => {
  if (!isDisabled || isTutorView) return <div className="flex-1 flex flex-col w-full">{children}</div>;

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
  isTutorView = false,
  pollStore
}: ComponentRendererProps) {
  const Renderer: React.ComponentType<any> = componentRenderers[component.type] || componentRenderers.fallback;
  const isDisabled = component.state === "disabled";

  const renderComponent = (props: any) => (
    <DisabledWrapper isDisabled={isDisabled} isTutorView={isTutorView}>
      <DiscoveryWrapper
        component={component}
        savedState={savedState}
        setComponentState={setComponentState}
      >
        <div className={cn(
          "flex-1 flex flex-col w-full transition-opacity",
          isDisabled && !isTutorView && "opacity-75"
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
      isTutorView,
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
      isTutorView,
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
    isTutorView,
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
