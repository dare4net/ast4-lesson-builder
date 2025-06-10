"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  const [activeBlankIndex, setActiveBlankIndex] = useState(0)
  const [previewText, setPreviewText] = useState("")

  // Update preview text when text or blanks change
  useEffect(() => {
    const updatedText = text
    const blankPlaceholder = "{{blank}}"

    // Make sure we have enough blanks in the text
    const blankCount = (text.match(/{{blank}}/g) || []).length

    // Add or remove blanks from the array to match the text
    if (blankCount > blanks.length) {
      // Add more blanks
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
      // Remove excess blanks
      onBlanksChange(blanks.slice(0, blankCount))
    }

    // Create preview text with answers
    let previewWithAnswers = text
    blanks.forEach((blank, index) => {
      const regex = /{{blank}}/
      previewWithAnswers = previewWithAnswers.replace(regex, `[${blank.answer}]`)
    })

    setPreviewText(previewWithAnswers)
  }, [text, blanks, onBlanksChange])

  const handleTextChange = (newText: string) => {
    onTextChange(newText)
  }

  const updateBlank = (index: number, field: keyof Blank, value: any) => {
    const updatedBlanks = [...blanks]
    updatedBlanks[index] = {
      ...updatedBlanks[index],
      [field]: value,
    }
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

    updatedBlanks[blankIndex] = {
      ...blank,
      alternatives,
    }

    onBlanksChange(updatedBlanks)
  }

  const removeAlternative = (blankIndex: number, altIndex: number) => {
    const updatedBlanks = [...blanks]
    const blank = updatedBlanks[blankIndex]
    const alternatives = [...(blank.alternatives || [])]

    alternatives.splice(altIndex, 1)

    updatedBlanks[blankIndex] = {
      ...blank,
      alternatives,
    }

    onBlanksChange(updatedBlanks)
  }

  const addBlank = () => {
    const updatedText = text + " {{blank}}"
    onTextChange(updatedText)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-[#2E7D32]">Text Content</Label>
        <div className="space-y-1">
          <p className="text-sm text-[#2E7D32]">Use {'{{'} blank {'}}' } to mark blank spaces</p>
          <Textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter text with {{blank}} placeholders..."
            rows={5}
            className="border-[#4CAF50] focus:ring-[#4CAF50] focus:border-[#4CAF50] text-[#2E7D32] placeholder-[#4CAF50]/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[#2E7D32]">Preview</Label>
        <div className="p-4 rounded-md border border-[#4CAF50] bg-[#E8F5E9]">
          <p className="text-[#2E7D32] whitespace-pre-wrap">{previewText}</p>
        </div>
      </div>

      {blanks.length > 0 && (
        <Card className="border-[#4CAF50]">
          <CardContent className="p-4">
            <Tabs 
              value={activeBlankIndex.toString()} 
              onValueChange={(value) => setActiveBlankIndex(Number.parseInt(value))}
            >
              <ScrollArea className="h-[60px] w-full mb-4">
                <TabsList className="w-full h-auto flex-wrap bg-[#E8F5E9]">
                  {blanks.map((blank, index) => (
                    <TabsTrigger
                      key={blank.id}
                      value={index.toString()}
                      className="h-8 data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white text-[#2E7D32] hover:text-[#2E7D32] hover:bg-[#E8F5E9]/80"
                    >
                      Blank {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>

              {blanks.map((blank, blankIndex) => (
                <TabsContent key={blank.id} value={blankIndex.toString()} className="m-0 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[#2E7D32]">Correct Answer</Label>
                    <Input
                      value={blank.answer}
                      onChange={(e) => updateBlank(blankIndex, "answer", e.target.value)}
                      placeholder="Enter correct answer"
                      className="border-[#4CAF50] focus:ring-[#4CAF50] focus:border-[#4CAF50] text-[#2E7D32] placeholder-[#4CAF50]/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[#2E7D32]">Alternative Answers</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addAlternative(blankIndex)}
                        className="border-[#4CAF50] text-[#2E7D32] hover:bg-[#E8F5E9] hover:text-[#2E7D32] hover:border-[#4CAF50]"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Alternative
                      </Button>
                    </div>

                    {blank.alternatives?.map((alt, altIndex) => (
                      <div key={altIndex} className="flex items-center gap-2">
                        <Input
                          value={alt}
                          onChange={(e) => updateAlternative(blankIndex, altIndex, e.target.value)}
                          placeholder={`Alternative ${altIndex + 1}`}
                          className="border-[#4CAF50] focus:ring-[#4CAF50] focus:border-[#4CAF50] text-[#2E7D32] placeholder-[#4CAF50]/50"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAlternative(blankIndex, altIndex)}
                          className="text-[#4CAF50] hover:bg-[#E8F5E9] hover:text-[#2E7D32]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {(!blank.alternatives || blank.alternatives.length === 0) && (
                      <p className="text-sm text-[#2E7D32]/70 italic">No alternative answers</p>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
