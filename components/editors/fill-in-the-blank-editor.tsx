"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { ArrayItemEditor } from "./base/ArrayItemEditor"

interface Blank {
  id: string
  answer: string
  alternatives?: string[]
}

interface FillInTheBlankEditorProps {
  text: string
  blanks: Blank[]
  onTextChange: (text: string) => void
  onBlanksChange: (blanks: Blank[]) => void
}

export function FillInTheBlankEditor({ text, blanks, onTextChange, onBlanksChange }: FillInTheBlankEditorProps) {
  const [previewText, setPreviewText] = useState("")

  useEffect(() => {
    const blankCount = (text.match(/{{blank}}/g) || []).length

    if (blankCount > blanks.length) {
      const newBlanks = [...blanks]
      for (let i = blanks.length; i < blankCount; i++) {
        newBlanks.push({
          id: `blank-${Date.now()}-${i}`,
          answer: "Answer",
          alternatives: [],
        })
      }
      onBlanksChange(newBlanks)
    } else if (blankCount < blanks.length) {
      onBlanksChange(blanks.slice(0, blankCount))
    }

    let previewWithAnswers = text
    blanks.forEach((blank) => {
      previewWithAnswers = previewWithAnswers.replace(/{{blank}}/, `[${blank.answer}]`)
    })
    setPreviewText(previewWithAnswers)
  }, [text, blanks, onBlanksChange])

  const updateBlank = (index: number, field: keyof Blank, value: any) => {
    const updatedBlanks = [...blanks]
    updatedBlanks[index] = { ...updatedBlanks[index], [field]: value }
    onBlanksChange(updatedBlanks)
  }

  const addAlternative = (blankIndex: number) => {
    const updatedBlanks = [...blanks]
    const blank = updatedBlanks[blankIndex]
    updatedBlanks[blankIndex] = {
      ...blank,
      alternatives: [...(blank.alternatives || []), ""],
    }
    onBlanksChange(updatedBlanks)
  }

  const updateAlternative = (blankIndex: number, altIndex: number, value: string) => {
    const updatedBlanks = [...blanks]
    const blank = updatedBlanks[blankIndex]
    const alternatives = [...(blank.alternatives || [])]
    alternatives[altIndex] = value
    updatedBlanks[blankIndex] = { ...blank, alternatives }
    onBlanksChange(updatedBlanks)
  }

  const removeAlternative = (blankIndex: number, altIndex: number) => {
    const updatedBlanks = [...blanks]
    const blank = updatedBlanks[blankIndex]
    const alternatives = [...(blank.alternatives || [])]
    alternatives.splice(altIndex, 1)
    updatedBlanks[blankIndex] = { ...blank, alternatives }
    onBlanksChange(updatedBlanks)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Composition Stream</Label>
        <p className="text-[10px] font-bold text-slate-800 mb-2 uppercase tracking-tight">Use <span className="text-emerald-500">{'{{'} blank {'}}'}</span> to inject delta points</p>
        <Textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Enter text with {{blank}} placeholders..."
          rows={5}
          className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 text-slate-200 text-sm font-medium placeholder:text-slate-700 rounded-2xl resize-none p-4"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Render Output</Label>
        <div className="p-6 rounded-[2rem] border border-slate-800 bg-slate-950/20 shadow-inner">
          <p className="text-slate-400 text-sm font-medium whitespace-pre-wrap leading-relaxed">{previewText}</p>
        </div>
      </div>

      {blanks.length > 0 && (
        <ArrayItemEditor<Blank>
          items={blanks}
          onChange={onBlanksChange}
          onAddItem={() => onTextChange(text + " {{blank}}")}
          getItemLabel={(_, index) => `Delta Node ${index + 1}`}
          title="Blank Details"
          addButtonLabel="Initialize New Delta"
          renderItem={(blank, blankIndex) => (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Dominant Value</Label>
                <Input
                  value={blank.answer}
                  onChange={(e) => updateBlank(blankIndex, "answer", e.target.value)}
                  placeholder="Enter specific answer"
                  className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 h-11 text-sm font-bold rounded-xl"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alternative Logic</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addAlternative(blankIndex)}
                    className="h-8 rounded-full border border-slate-800 bg-slate-900/50 hover:bg-emerald-500 hover:text-slate-950 transition-all text-[10px] font-black uppercase tracking-widest px-4"
                  >
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Expand Variants
                  </Button>
                </div>

                <div className="space-y-3">
                  {blank.alternatives?.map((alt, altIndex) => (
                    <div key={altIndex} className="flex items-center gap-2 group/alt">
                      <Input
                        value={alt}
                        onChange={(e) => updateAlternative(blankIndex, altIndex, e.target.value)}
                        placeholder={`Variant ${altIndex + 1}`}
                        className="flex-1 bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 h-10 text-xs font-bold rounded-xl"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAlternative(blankIndex, altIndex)}
                        className="h-10 w-10 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {(!blank.alternatives || blank.alternatives.length === 0) && (
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest text-center py-4 border border-dashed border-slate-800/50 rounded-2xl">Void Variant Array</p>
                  )}
                </div>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
