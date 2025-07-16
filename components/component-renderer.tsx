"use client"

import dynamic from "next/dynamic"
import { createElement } from "react"
import React from 'react'
import { cn } from "@/lib/utils"
import type { Component, ComponentType } from "@/types/lesson"

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

  // Interactive Components
  quiz: dynamic(() => import("@/components/renderers/quiz-renderer").then((mod) => mod.QuizRenderer)),
  matchingPairs: dynamic(() =>
    import("@/components/renderers/matching-pairs-renderer").then((mod) => mod.MatchingPairsRenderer),
  ),
  dragDrop: dynamic(() => import("@/components/renderers/drag-drop-renderer").then((mod) => mod.DragDropRenderer)),

  // Gamified Components
  scoreBoard: dynamic(() =>
    import("@/components/renderers/score-board-renderer").then((mod) => mod.ScoreBoardRenderer),
  ),

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

  // Structure Components
  slideTitle: dynamic(() => import("@/components/renderers/heading-renderer").then((mod) => mod.HeadingRenderer)),

  // Fallback renderer for unimplemented components
  fallback: dynamic(() => import("@/components/renderers/fallback-renderer").then((mod) => mod.FallbackRenderer)),
}

interface ComponentRendererProps {
  component: Component;
  scoreContext?: any;
  savedState?: any;
  setComponentState?: (state: any) => void;
}

const gamifiedTypes: ComponentType[] = [
  'quiz',
  'dragDrop',
  'matchingPairs',
  'scoreBoard',
  'badgeReveal',
  'miniGame',
  'progressBar'
];

const interactiveTypes: ComponentType[] = [
  'quiz',
  'poll',
  'dragDrop',
  'matchingPairs',
  'fillInTheBlank',
  'flashcards',
  'codeEditor',
  'clickableImage',
  'hotspot'
];

// Wrapper component for disabled state
const DisabledWrapper = ({ isDisabled, children }: { isDisabled: boolean, children: React.ReactNode }) => {
  if (!isDisabled) return <>{children}</>;
  
  return (
    <div className="relative group">
      {children}
      <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] pointer-events-auto cursor-not-allowed">
        {/* Visual overlay for disabled state */}
        <div className="absolute inset-0 opacity-10 bg-muted"></div>
      </div>
    </div>
  );
};

const ComponentRendererBase = function ComponentRenderer({ component, scoreContext, savedState, setComponentState }: ComponentRendererProps) {
  const Renderer: React.ComponentType<any> = componentRenderers[component.type] || componentRenderers.fallback;
  const isDisabled = component.state === "disabled";

  const renderComponent = (props: any) => (
    <DisabledWrapper isDisabled={isDisabled}>
      <div className={cn(
        "transition-opacity",
        isDisabled && "opacity-75"
      )}>
        <Renderer {...props} />
      </div>
    </DisabledWrapper>
  );

  if (gamifiedTypes.includes(component.type)) {
    return renderComponent({
      ...component.props,
      mode: component.mode || "practice",
      scoreContext,
      savedState,
      setComponentState: isDisabled ? undefined : setComponentState,
      status: component.status,
      disabled: isDisabled
    });
  }

  if (interactiveTypes.includes(component.type)) {
    return renderComponent({
      ...component.props,
      savedState,
      setComponentState: isDisabled ? undefined : setComponentState,
      status: component.status,
      disabled: isDisabled
    });
  }

  return renderComponent({
    ...component.props,
    disabled: isDisabled
  });
}

ComponentRendererBase.displayName = "ComponentRenderer";

export const ComponentRenderer = React.memo(ComponentRendererBase);
