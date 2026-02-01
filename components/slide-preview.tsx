"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Lock, CheckCircle } from "lucide-react"
import { ComponentRenderer } from "@/components/component-renderer"
import { Badge } from "@/components/ui/badge"
import type { Slide } from "@/types/lesson"
import { getInteractiveAndGamifiedComponents } from "@/lib/lesson-utils"

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
    const gamifiedAndInteractive = getInteractiveAndGamifiedComponents(slide.components)

    gamifiedAndInteractive.forEach((component) => {
      if (component.props.points) {
        if (component.type === "quiz") {
          const questionCount = component.props.questions?.length || 0
          total += component.props.points * questionCount
        } else {
          total += component.props.points
        }
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

  // Don't render if slide is disabled
  if (slide.state === "disabled") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">This slide is currently disabled</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">{slide.title}</h2>
          <Badge variant={slide.status === "completed" ? "default" : "secondary"}>
            {slide.status === "completed" ? (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>Completed</span>
              </div>
            ) : (
              "Uncompleted"
            )}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {totalPossible > 0 && (
            <Badge variant="outline" className="ml-auto">
              Score: {score}/{totalPossible}
            </Badge>
          )}
        </div>
      </div>

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

      <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <Button variant="ghost" onClick={onPrev} disabled={isFirst}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={onNext}
            disabled={isLast || (slide.status !== "completed" && getInteractiveAndGamifiedComponents(slide.components).length > 0)}
          >
            {isLast ? "Complete" : "Next"}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
