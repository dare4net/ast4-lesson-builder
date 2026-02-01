"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Check, X, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ArrayItemEditor } from "./base/ArrayItemEditor"

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
    onChange([...questions, newQuestion])
  }

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    }
    onChange(updatedQuestions)
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
    if (questions[questionIndex].options.length <= 2) return
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options.splice(optionIndex, 1)
    onChange(updatedQuestions)
  }

  const setCorrectOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options.forEach((opt, idx) => {
      opt.isCorrect = idx === optionIndex
    })
    onChange(updatedQuestions)
  }

  return (
    <ArrayItemEditor<QuizQuestion>
      items={questions}
      onChange={onChange}
      onAddItem={addQuestion}
      getItemLabel={(_, index) => `Question ${index + 1}`}
      addButtonLabel="Add Question"
      renderItem={(question, qIndex) => (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Inquiry Definition</Label>
            <Input
              value={question.question}
              onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
              placeholder="What is the prompt for this sector?"
              className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 h-12 text-sm font-bold placeholder:text-slate-700 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Time Limit (Seconds)</Label>
            <Input
              type="number"
              min="5"
              value={(question as any).timeLimit || 10}
              onChange={(e) => updateQuestion(qIndex, "timeLimit", parseInt(e.target.value) || 10)}
              className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 h-10 w-32 text-sm font-bold placeholder:text-slate-700 rounded-xl"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Response Manifest</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => addOption(qIndex)}
                className="h-8 rounded-full border border-slate-800 bg-slate-900/50 hover:bg-emerald-500 hover:text-slate-950 transition-all text-[10px] font-black uppercase tracking-widest px-4"
              >
                <Plus className="h-3.5 w-3.5 mr-2" />
                Initialize Option
              </Button>
            </div>

            <div className="space-y-3">
              {question.options.map((option, oIndex) => (
                <div key={option.id} className="flex items-center gap-3 group/option">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-10 w-10 shrink-0 rounded-xl border transition-all duration-300",
                      option.isCorrect
                        ? "bg-emerald-500 border-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 rotate-0"
                        : "bg-slate-950/50 border-slate-800 text-slate-600 hover:border-emerald-500/30 hover:text-emerald-500"
                    )}
                    onClick={() => setCorrectOption(qIndex, oIndex)}
                  >
                    {option.isCorrect ? (
                      <Check className="h-5 w-5 stroke-[3]" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </Button>

                  <Input
                    value={option.text}
                    onChange={(e) => updateOption(qIndex, oIndex, "text", e.target.value)}
                    placeholder={`Descriptor ${oIndex + 1}`}
                    className={cn(
                      "flex-1 w-full min-w-0 bg-slate-950/20 border-slate-800/50 h-10 text-sm font-bold transition-all rounded-xl",
                      option.isCorrect ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "focus:bg-slate-950/50"
                    )}
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteOption(qIndex, oIndex)}
                    disabled={question.options.length <= 2}
                    className="h-10 w-10 rounded-xl text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover/option:opacity-100 transition-all disabled:hidden"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Logic Feedback (Optional)</Label>
            <Textarea
              value={question.explanation || ""}
              onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
              placeholder="Why is the chosen data stream correct?"
              rows={3}
              className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 text-sm font-medium placeholder:text-slate-700 rounded-2xl resize-none p-4"
            />
          </div>
        </div>
      )}
    />
  )
}
