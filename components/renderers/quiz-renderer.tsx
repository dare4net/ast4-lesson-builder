"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react"

interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
}

interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
  explanation?: string
}

interface QuizRendererProps {
  questions?: QuizQuestion[]
  question?: string
  options?: QuizOption[]
  explanation?: string
  showExplanation?: boolean
  shuffleOptions?: boolean
  points?: number
  isEditing?: boolean
  scoreContext?: {
    score: number
    totalPossible: number
    addPoints: (points: number) => void
  }
}

export function QuizRenderer({
  questions = [],
  question = "",
  options = [],
  explanation = "",
  showExplanation = true,
  shuffleOptions = false,
  points = 10,
  isEditing = false,
  scoreContext,
}: QuizRendererProps) {
  // Convert legacy format to new format if needed
  const allQuestions = questions.length > 0 ? questions : [{ id: "q1", question, options, explanation }]

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | null>>({})
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({})
  const [displayedOptions, setDisplayedOptions] = useState<Record<string, QuizOption[]>>({})
  const [score, setScore] = useState(0)
  const [totalPoints, setTotalPoints] = useState(points * allQuestions.length)

  const currentQuestion = allQuestions[currentQuestionIndex]

  // Initialize displayed options
  useEffect(() => {
    const newDisplayedOptions: Record<string, QuizOption[]> = {}

    allQuestions.forEach((q) => {
      if (shuffleOptions && !isEditing) {
        newDisplayedOptions[q.id] = [...q.options].sort(() => Math.random() - 0.5)
      } else {
        newDisplayedOptions[q.id] = [...q.options]
      }
    })

    setDisplayedOptions(newDisplayedOptions)
    setTotalPoints(points * allQuestions.length)
  }, [allQuestions, shuffleOptions, isEditing, points])

  const handleOptionSelect = (questionId: string, optionId: string) => {
    if (submittedQuestions[questionId]) return

    setSelectedOptions({
      ...selectedOptions,
      [questionId]: optionId,
    })
  }

  const handleSubmit = (questionId: string) => {
    if (!selectedOptions[questionId] || submittedQuestions[questionId]) return

    const question = allQuestions.find((q) => q.id === questionId)
    if (!question) return

    const selectedOption = question.options.find((o) => o.id === selectedOptions[questionId])
    const isCorrect = selectedOption?.isCorrect || false

    setSubmittedQuestions({
      ...submittedQuestions,
      [questionId]: true,
    })

    if (isCorrect) {
      setScore((prevScore) => prevScore + points)

      // Add points to global score if correct and scoreContext is available
      if (scoreContext) {
        scoreContext.addPoints(points)
      }
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleReset = () => {
    setSelectedOptions({})
    setSubmittedQuestions({})
    setScore(0)
    setCurrentQuestionIndex(0)
  }

  // In editing mode, just show a simplified version
  if (isEditing) {
    return (
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-2">
          Quiz ({allQuestions.length} question{allQuestions.length !== 1 ? "s" : ""})
        </h3>
        <div className="space-y-4">
          {allQuestions.map((q, index) => (
            <div key={q.id} className="border-t pt-2">
              <p className="font-medium">
                Q{index + 1}: {q.question}
              </p>
              <ul className="mt-1 space-y-1 pl-5">
                {q.options.map((option) => (
                  <li key={option.id} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border inline-block"></span>
                    <span>{option.text}</span>
                    {option.isCorrect && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </li>
                ))}
              </ul>
              {q.explanation && <p className="mt-1 text-sm text-muted-foreground">Explanation: {q.explanation}</p>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const isSubmitted = submittedQuestions[currentQuestion.id]
  const selectedOption = selectedOptions[currentQuestion.id]
  const currentOptions = displayedOptions[currentQuestion.id] || currentQuestion.options

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{currentQuestion.question}</CardTitle>
        <div className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {allQuestions.length}
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedOption || ""}
          onValueChange={(value) => handleOptionSelect(currentQuestion.id, value)}
          disabled={isSubmitted}
        >
          {currentOptions.map((option) => (
            <div
              key={option.id}
              className={`flex items-center space-x-2 p-2 rounded ${
                isSubmitted && option.id === selectedOption
                  ? option.isCorrect
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "bg-red-50 dark:bg-red-900/20"
                  : ""
              }`}
            >
              <RadioGroupItem value={option.id} id={`${currentQuestion.id}-${option.id}`} disabled={isSubmitted} />
              <Label
                htmlFor={`${currentQuestion.id}-${option.id}`}
                className={`flex-1 ${isSubmitted ? "cursor-default" : "cursor-pointer"}`}
              >
                {option.text}
              </Label>
              {isSubmitted &&
                option.id === selectedOption &&
                (option.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                ))}
              {isSubmitted && option.id !== selectedOption && option.isCorrect && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
          ))}
        </RadioGroup>

        {isSubmitted && showExplanation && currentQuestion.explanation && (
          <Alert className="mt-4">
            <AlertDescription>{currentQuestion.explanation}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          {!isSubmitted ? (
            <Button onClick={() => handleSubmit(currentQuestion.id)} disabled={!selectedOption}>
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleReset} variant="outline">
              Reset Quiz
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentQuestionIndex === allQuestions.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Score: {score}/{totalPoints}
        </div>
      </CardFooter>
    </Card>
  )
}
