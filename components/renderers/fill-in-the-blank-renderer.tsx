"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, XCircle } from "lucide-react"

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
}

export function FillInTheBlankRenderer({
  title = "Fill in the blanks",
  text = "",
  blanks = [],
  caseSensitive = false,
  points = 10,
  isEditing = false,
  scoreContext,
}: FillInTheBlankRendererProps) {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, boolean>>({})
  const [score, setScore] = useState(0)

  // Initialize user answers
  useEffect(() => {
    const initialAnswers: Record<string, string> = {}
    blanks.forEach((blank) => {
      initialAnswers[blank.id] = ""
    })
    setUserAnswers(initialAnswers)
    setIsSubmitted(false)
    setCorrectAnswers({})
    setScore(0)
  }, [blanks])

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
    const results: Record<string, boolean> = {}
    let correctCount = 0

    blanks.forEach((blank) => {
      const isCorrect = checkAnswer(blank, userAnswers[blank.id])
      results[blank.id] = isCorrect
      if (isCorrect) correctCount++
    })

    setCorrectAnswers(results)
    setIsSubmitted(true)

    // Calculate score based on correct answers
    const earnedPoints = Math.round((correctCount / blanks.length) * points)
    setScore(earnedPoints)

    // Add points to global score if available
    if (scoreContext && earnedPoints > 0) {
      scoreContext.addPoints(earnedPoints)
    }
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
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : ""
                  }`}
                />
                {isSubmitted && (
                  <span className="inline-block ml-2">
                    {correctAnswers[blanks[index].id] ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 inline" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500 inline mr-1" />
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {renderText()}

          {isSubmitted && (
            <div
              className={`mt-4 p-3 rounded flex items-center ${
                score === points
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                  : score > 0
                    ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
              }`}
            >
              {score === points ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  <span>Perfect! All answers are correct.</span>
                </>
              ) : score > 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  <span>Good job! Some answers are correct.</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 mr-2" />
                  <span>Try again! None of the answers are correct.</span>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {!isSubmitted ? (
          <Button onClick={handleSubmit}>Check Answers</Button>
        ) : (
          <Button onClick={handleReset} variant="outline">
            Try Again
          </Button>
        )}

        {points > 0 && (
          <div className="ml-auto text-sm text-muted-foreground">
            {isSubmitted ? `Score: ${score}/${points}` : `Points: ${points}`}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
