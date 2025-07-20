"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, XCircle, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFeedback } from "@/hooks/use-feedback"

interface Blank {
  id: string
  answer: string
  alternatives?: string[]
}

interface FillInTheBlankRendererProps {
  title?: string
  text: string
  blanks: Blank[]
  caseSensitive?: boolean
  points?: number
  isEditing?: boolean
  scoreContext?: {
    score: number
    totalPossible: number
    addPoints: (points: number) => void
  }
  mode?: 'practice' | 'live'
  state?: 'active' | 'disabled'
  disabled?: boolean
  savedState?: any
  setComponentState?: (state: any) => void
}

export function FillInTheBlankRenderer({
  title = "Fill in the blanks",
  text = "",
  blanks = [],
  caseSensitive = false,
  points = 10,
  isEditing = false,
  scoreContext,
  mode = 'practice',
  state = 'active',
  disabled = false,
  savedState,
  setComponentState,
}: FillInTheBlankRendererProps) {
  const { playFeedback } = useFeedback();
  const [mounted, setMounted] = useState(false);
  const isDisabled = disabled || state === 'disabled';
  const isLiveMode = mode === 'live';

  // Debug logs
  useEffect(() => {
    console.log('Fill in the Blank Mode:', mode);
    console.log('Is Live Mode:', isLiveMode);
    console.log('Saved State:', savedState);
  }, [mode, isLiveMode, savedState]);

  const [userAnswers, setUserAnswers] = useState<Record<string, string>>(() => savedState?.userAnswers ?? {})
  const [isSubmitted, setIsSubmitted] = useState(() => savedState?.isSubmitted ?? false)
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, boolean>>(() => savedState?.correctAnswers ?? {})
  const [score, setScore] = useState(() => savedState?.score ?? 0)

  // Initialize user answers and handle mounting
  useEffect(() => {
    setMounted(true);
    if (!savedState) {
      const initialAnswers: Record<string, string> = {}
      blanks.forEach((blank) => {
        initialAnswers[blank.id] = ""
      })
      setUserAnswers(initialAnswers)
      setIsSubmitted(false)
      setCorrectAnswers({})
      setScore(0)
      
      // Persist initial state
      setComponentState?.({
        userAnswers: initialAnswers,
        isSubmitted: false,
        correctAnswers: {},
        score: 0,
        status: 'active'
      })
    }
  }, [blanks, savedState, setComponentState])

  const handleAnswerChange = (blankId: string, value: string) => {
    if (isSubmitted) return

    setUserAnswers((prev) => ({
      ...prev,
      [blankId]: value,
    }))
  }

  const checkAnswer = (blank: Blank, userAnswer: string): boolean => {
    if (!userAnswer) return false

    const checkAgainst = (answer: string) => {
      return caseSensitive ? userAnswer === answer : userAnswer.toLowerCase() === answer.toLowerCase()
    }

    // Check main answer
    if (checkAgainst(blank.answer)) return true

    // Check alternatives
    if (blank.alternatives && blank.alternatives.length > 0) {
      return blank.alternatives.some((alt) => checkAgainst(alt))
    }

    return false
  }

  const handleSubmit = () => {
    if (isDisabled) return;
    
    const results: Record<string, boolean> = {}
    let correctCount = 0

    blanks.forEach((blank) => {
      const isCorrect = checkAnswer(blank, userAnswers[blank.id])
      results[blank.id] = isCorrect
      if (isCorrect) correctCount++
    })

    // Calculate points per blank
    //const pointsPerBlank = Math.round(points / blanks.length);
    const earnedPoints = correctCount * points;
    const allCorrect = correctCount === blanks.length;

    setCorrectAnswers(results)
    setIsSubmitted(true)
    setScore(earnedPoints)

    // Play appropriate feedback sound
    if (allCorrect) {
      playFeedback('correct');
    } else if (correctCount > 0) {
      playFeedback('complete');
    } else {
      playFeedback('incorrect');
    }

    // Award points for each correct answer in live mode
    if (isLiveMode && scoreContext && correctCount > 0) {
      scoreContext.addPoints(earnedPoints)
    }

    // Persist state after submission
    setComponentState?.({
      userAnswers,
      isSubmitted: true,
      correctAnswers: results,
      score: earnedPoints,
      status: 'completed'  // Mark as completed after submission
    })
  }

  const handleReset = () => {
    const initialAnswers: Record<string, string> = {}
    blanks.forEach((blank) => {
      initialAnswers[blank.id] = ""
    })
    setUserAnswers(initialAnswers)
    setIsSubmitted(false)
    setCorrectAnswers({})
    setScore(0)
  }

  // In editing mode, show a simplified version
  if (isEditing) {
    return (
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="text-sm">
          {text.split("{{blank}}").map((part, index) => (
            <React.Fragment key={index}>
              {part}
              {index < blanks.length && (
                <span className="inline-block bg-muted px-2 py-0.5 rounded mx-1">{blanks[index].answer}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  // Replace {{blank}} placeholders with input fields
  const renderText = () => {
    const parts = text.split("{{blank}}")

    return (
      <div>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < blanks.length && (
              <span className="inline-block mx-1" style={{ minWidth: "100px" }}>
                <Input
                  value={userAnswers[blanks[index].id] || ""}
                  onChange={(e) => handleAnswerChange(blanks[index].id, e.target.value)}
                  disabled={isSubmitted}
                  className={`w-full inline-block ${
                    isSubmitted
                      ? correctAnswers[blanks[index].id]
                        ? "border-[#4CAF50] bg-[#E8F5E9] text-[#2E7D32]"
                        : "border-destructive bg-destructive/20 text-destructive"
                      : ""
                  }`}
                />
                {isSubmitted && (
                  <span className="inline-block ml-2">
                    {correctAnswers[blanks[index].id] ? (
                      <CheckCircle2 className="h-4 w-4 text-[#4CAF50] inline" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-destructive inline mr-1" />
                        <span className="text-sm text-muted-foreground">{blanks[index].answer}</span>
                      </>
                    )}
                  </span>
                )}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <Card className={cn(
      isDisabled && "opacity-75",
      isLiveMode && "border-blue-500"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {isDisabled && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Locked</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {renderText()}

          {isSubmitted && (
            <div
              className={`mt-4 p-3 rounded flex items-center ${
                score === points * blanks.length
                  ? "bg-[#E8F5E9] text-[#2E7D32]"
                  : score > 0
                    ? "bg-[#FFF3E0] text-[#E65100]"
                    : "bg-destructive/10 text-destructive"
              }`}
            >
              {score === points * blanks.length ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2 text-[#4CAF50]" />
                  <span>You Rock! 🎉 All answers are correct!</span>
                </>
              ) : score > 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2 text-[#FB8C00]" />
                  <span>Good job! Keep trying to get them all correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 mr-2" />
                  <span>Try again! You can do better!</span>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="space-x-2">
          {!isSubmitted ? (
            <Button 
              onClick={handleSubmit}
              disabled={isDisabled}
            >
              Check Answers
            </Button>
          ) : (
            <>
              {/* Live Mode: Always show disabled Complete button */}
              {isLiveMode && (
                <Button
                  className={score === points ? "bg-success text-success-foreground" : ""}
                  disabled
                >
                  Complete
                </Button>
              )}
              
              {/* Practice Mode: Show Complete when all correct, Try Again when not */}
              {!isLiveMode && (
                <>
                  {score === points * blanks.length ? (
                    <Button
                      className="bg-success text-success-foreground"
                      disabled
                    >
                      Complete
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleReset} 
                      variant="outline"
                      disabled={isDisabled}
                    >
                      Try Again
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isLiveMode && (
            <div className="text-sm text-blue-500">Live Mode</div>
          )}
          {points > 0 && (
            <div className="text-sm text-muted-foreground">
              {isSubmitted ? `Score: ${score}/${points *blanks.length}` : `Points: ${points * blanks.length}`}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
