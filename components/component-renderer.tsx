"use client"

import dynamic from "next/dynamic"
import { createElement } from "react"
import React from 'react';

type ComponentType = 'quiz' | 'dragDrop' | 'matchingPairs' | 'fallback' | string;

type ComponentRenderers = {
  [key in ComponentType]: React.ComponentType<any>;
};

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

  // Structure Components (for backward compatibility)
  slideTitle: dynamic(() => import("@/components/renderers/heading-renderer").then((mod) => mod.HeadingRenderer)),

  // Fallback renderer for unimplemented components
  fallback: dynamic(() => import("@/components/renderers/fallback-renderer").then((mod) => mod.FallbackRenderer)),
}

interface ComponentRendererProps {
  component: any;
  scoreContext?: any;
  savedState?: any;
  setComponentState?: (state: any) => void;
}

const gamifiedTypes: ComponentType[] = [
  'quiz',
  'dragDrop',
  'matchingPairs',
  'score-board', // ensure scoreboard always gets scoreContext
  // add other gamified types as needed
];

const ComponentRendererBase = function ComponentRenderer({ component, scoreContext, savedState, setComponentState }: any) {
  const Renderer: React.ComponentType<any> = componentRenderers[component.type] || componentRenderers.fallback;
  if (gamifiedTypes.includes(component.type)) {
    return (
      <Renderer
        {...component.props}
        scoreContext={scoreContext}
        savedState={savedState}
        setComponentState={setComponentState}
      />
    );
  } else {
    return <Renderer {...component.props} scoreContext={scoreContext} />;
  }
};

export const ComponentRenderer = React.memo(ComponentRendererBase);
