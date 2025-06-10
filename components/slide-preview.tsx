"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ComponentRenderer } from "@/components/component-renderer"
import type { Slide } from "@/types/lesson"

interface SlidePreviewProps {
  slide: Slide
  onNext: () => void
  onPrev: () => void
  isFirst: boolean
  isLast: boolean
}

export function SlidePreview({ slide, onNext, onPrev, isFirst, isLast }: SlidePreviewProps) {
  const [score, setScore] = useState(0)
  const [totalPossible, setTotalPossible] = useState(0)

  // Calculate total possible score for the slide
  useEffect(() => {
    let total = 0

    slide.components.forEach((component) => {
      // Quiz points
      if (component.type === "quiz" && component.props.points) {
        const questionCount = component.props.questions?.length || 0
        total += component.props.points * questionCount
      }

      // Matching pairs points
      if (component.type === "matchingPairs" && component.props.points) {
        total += component.props.points
      }

      // Drag and drop points
      if (component.type === "dragDrop" && component.props.points) {
        total += component.props.points
      }

      // Fill in the blank points
      if (component.type === "fillInTheBlank" && component.props.points) {
        total += component.props.points
      }

      // Code editor points
      if (component.type === "codeEditor" && component.props.points) {
        total += component.props.points
      }
    })

    setTotalPossible(total)
  }, [slide])

  const addPoints = (points: number) => {
    setScore((prevScore) => prevScore + points)
  }

  const scoreContext = {
    score,
    totalPossible,
    addPoints,
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/30 overflow-auto">
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardContent className="p-6 max-h-[calc(100vh-200px)] overflow-auto">
            {slide.components.map((component) => (
              <div key={component.id} className="mb-6">
                <ComponentRenderer component={component} scoreContext={scoreContext} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="p-4 border-t flex items-center justify-between bg-background">
        <div className="text-sm">
          {/* Slide number is now managed by parent */}
          <span className="text-muted-foreground">Current Score:</span>{" "}
          {score} / {totalPossible}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onPrev} disabled={isFirst}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            disabled={isLast}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
