"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

interface ScoreBoardRendererProps {
  title?: string
  showTotal?: boolean
  showPercentage?: boolean
  animation?: boolean
  isEditing?: boolean
  scoreContext?: {
    score: number
    totalPossible: number
    addPoints: (points: number) => void
  }
}

export function ScoreBoardRenderer({
  title = "Your Score",
  showTotal = true,
  showPercentage = true,
  animation = true,
  isEditing = false,
  scoreContext,
}: ScoreBoardRendererProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const [percentage, setPercentage] = useState(0)

  const score = scoreContext?.score || 0
  const totalPossible = scoreContext?.totalPossible || 100

  // For animation effect
  useEffect(() => {
    if (!animation) {
      setDisplayScore(score)
      setPercentage(totalPossible > 0 ? (score / totalPossible) * 100 : 0)
      return
    }

    // Animate score counting up
    let start = displayScore
    const end = score
    const duration = 500
    const increment = Math.ceil((end - start) / (duration / 16))

    if (start === end) return

    const timer = setInterval(() => {
      start = Math.min(start + increment, end)
      setDisplayScore(start)

      if (start >= end) {
        clearInterval(timer)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [score, displayScore, animation, totalPossible])

  // Update percentage when display score changes
  useEffect(() => {
    setPercentage(totalPossible > 0 ? (displayScore / totalPossible) * 100 : 0)
  }, [displayScore, totalPossible])

  // In editing mode, show sample data
  const editingScore = 75
  const editingTotal = 100
  const editingPercentage = 75

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className={cn(
              "text-3xl font-bold",
              !isEditing && percentage === 100 && "text-[#2E7D32]"
            )}>
              {isEditing ? editingScore : displayScore}
            </span>

            <div className="text-right">
              {showTotal && (
                <div className={cn(
                  !isEditing && percentage === 100 && "text-[#2E7D32]"
                )}>
                  out of {isEditing ? editingTotal : totalPossible}
                </div>
              )}

              {showPercentage && (
                <div className={cn(
                  "text-muted-foreground",
                  !isEditing && percentage === 100 && "text-[#4CAF50]"
                )}>
                  {isEditing ? editingPercentage : Math.round(percentage)}%
                </div>
              )}
            </div>
          </div>

          <Progress 
            value={isEditing ? editingPercentage : percentage} 
            className={cn(
              !isEditing && percentage === 100 && "bg-[#E8F5E9]",
              "[&>div]:bg-[#4CAF50]"
            )}
          />

          {!isEditing && scoreContext && (
            <div className="flex items-center justify-center gap-2 text-sm mt-2">
              {percentage === 100 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" />
                  <span className="text-[#2E7D32] font-medium">You Rock! 🎉 Perfect score!</span>
                </>
              ) : (
                <span className="text-muted-foreground">
                  This score represents your progress across all interactive components in this lesson.
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
