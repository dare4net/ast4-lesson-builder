"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Check, X } from "lucide-react"

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

interface QuizEditorProps {
  questions: QuizQuestion[]
  onChange: (questions: QuizQuestion[]) => void
}

export function QuizEditor({ questions, onChange }: QuizEditorProps) {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q${Date.now()}`,
      question: "New Question",
      options: [
        { id: `opt-${Date.now()}-1`, text: "Option 1", isCorrect: false },
        { id: `opt-${Date.now()}-2`, text: "Option 2", isCorrect: true },
      ],
      explanation: "",
    }

    const updatedQuestions = [...questions, newQuestion]
    onChange(updatedQuestions)
    setActiveQuestionIndex(updatedQuestions.length - 1)
  }

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    }
    onChange(updatedQuestions)
  }

  const deleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      return // Don't delete the last question
    }

    const updatedQuestions = [...questions]
    updatedQuestions.splice(index, 1)
    onChange(updatedQuestions)

    if (activeQuestionIndex >= index && activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1)
    }
  }

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions]
    const newOption: QuizOption = {
      id: `opt-${Date.now()}`,
      text: "New Option",
      isCorrect: false,
    }
    updatedQuestions[questionIndex].options.push(newOption)
    onChange(updatedQuestions)
  }

  const updateOption = (questionIndex: number, optionIndex: number, field: keyof QuizOption, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value,
    }
    onChange(updatedQuestions)
  }

  const deleteOption = (questionIndex: number, optionIndex: number) => {
    if (questions[questionIndex].options.length <= 2) {
      return // Don't delete if only 2 options left
    }

    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options.splice(optionIndex, 1)
    onChange(updatedQuestions)
  }

  const setCorrectOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions]

    // Set all options to not correct
    updatedQuestions[questionIndex].options.forEach((opt, idx) => {
      opt.isCorrect = idx === optionIndex
    })

    onChange(updatedQuestions)
  }

  const activeQuestion = questions[activeQuestionIndex]

  return (
    <div className="space-y-4">
      <Tabs
        value={activeQuestionIndex.toString()}
        onValueChange={(value) => setActiveQuestionIndex(Number.parseInt(value))}
      >
        <div className="flex items-center justify-between mb-2">
          <TabsList className="h-9 overflow-x-auto w-auto">
            {questions.map((q, index) => (
              <TabsTrigger key={q.id} value={index.toString()} className="px-3 h-8">
                Q{index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button size="sm" variant="outline" onClick={addQuestion}>
            <Plus className="h-4 w-4 mr-1" />
            Add Question
          </Button>
        </div>

        {questions.map((question, qIndex) => (
          <TabsContent key={question.id} value={qIndex.toString()} className="m-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-2">
                <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteQuestion(qIndex)}
                  disabled={questions.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Input
                    value={question.question}
                    onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                    placeholder="Enter your question"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Answer Options</Label>
                    <Button size="sm" variant="outline" onClick={() => addOption(qIndex)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Option
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <Button
                          variant={option.isCorrect ? "default" : "outline"}
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => setCorrectOption(qIndex, oIndex)}
                          title={option.isCorrect ? "Correct Answer" : "Mark as Correct"}
                        >
                          {option.isCorrect ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2" />
                          )}
                        </Button>

                        <Input
                          value={option.text}
                          onChange={(e) => updateOption(qIndex, oIndex, "text", e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-1"
                        />

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteOption(qIndex, oIndex)}
                          disabled={question.options.length <= 2}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Explanation (Optional)</Label>
                  <Textarea
                    value={question.explanation || ""}
                    onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                    placeholder="Explain the correct answer"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
