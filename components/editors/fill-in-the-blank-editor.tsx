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
        <Label>Text with Blanks</Label>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm text-muted-foreground">
            Use &#123;&#123;blank&#125;&#125; where you want an input field to appear
          </p>
          <Button size="sm" variant="outline" onClick={addBlank}>
            <Plus className="h-3 w-3 mr-1" />
            Add Blank
          </Button>
        </div>
        <Textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Enter text with {{blank}} placeholders"
          rows={4}
        />
      </div>

      <div className="border rounded-md p-3 bg-muted/20">
        <Label className="mb-1 block">Preview</Label>
        <p>{previewText}</p>
      </div>

      {blanks.length > 0 && (
        <div className="space-y-2">
          <Label>Answers</Label>
          <ScrollArea className="h-[250px] border rounded-md p-2">
            <Tabs
              value={activeBlankIndex.toString()}
              onValueChange={(value) => setActiveBlankIndex(Number.parseInt(value))}
            >
              <TabsList className="h-9 overflow-x-auto w-auto">
                {blanks.map((blank, index) => (
                  <TabsTrigger key={blank.id} value={index.toString()} className="px-3 h-8">
                    Blank {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>

              {blanks.map((blank, index) => (
                <TabsContent key={blank.id} value={index.toString()} className="m-0 space-y-4">
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Correct Answer</Label>
                        <Input
                          value={blank.answer}
                          onChange={(e) => updateBlank(index, "answer", e.target.value)}
                          placeholder="Correct answer"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Alternative Answers (Optional)</Label>
                          <Button size="sm" variant="outline" onClick={() => addAlternative(index)}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>

                        {blank.alternatives && blank.alternatives.length > 0 ? (
                          <div className="space-y-2">
                            {blank.alternatives.map((alt, altIndex) => (
                              <div key={altIndex} className="flex items-center gap-2">
                                <Input
                                  value={alt}
                                  onChange={(e) => updateAlternative(index, altIndex, e.target.value)}
                                  placeholder={`Alternative ${altIndex + 1}`}
                                  className="flex-1"
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeAlternative(index, altIndex)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No alternative answers added yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
