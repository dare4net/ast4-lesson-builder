"use client"

import dynamic from "next/dynamic"
import type { Component, ComponentType } from "@/types/lesson"
import { createElement } from "react"

type ComponentRenderers = {
  [K in ComponentType | 'fallback']?: React.ComponentType<any>;
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
  component: Component
  isEditing?: boolean
  onClick?: () => void
  scoreContext?: {
    score: number
    totalPossible: number
    addPoints: (points: number) => void
  }
}

interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation?: string;
}

interface QuizProps {
  title?: string;
  questions: QuizQuestion[];
  isEditing?: boolean;
  onScoreUpdate?: (score: number) => void;
}

export function ComponentRenderer({ component, isEditing = false, onClick, scoreContext }: ComponentRendererProps) {
  // Get the appropriate renderer or use fallback
  const Renderer = componentRenderers[component.type] || componentRenderers.fallback
  if (!Renderer) return null;

  return (
    <div className={isEditing ? "cursor-pointer" : ""} onClick={isEditing ? onClick : undefined}>
      {createElement(Renderer, { ...component.props, isEditing, scoreContext })}
    </div>
  )
}
