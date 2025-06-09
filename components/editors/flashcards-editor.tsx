"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Flashcard {
  id: string
  front: string
  back: string
}

interface FlashcardsEditorProps {
  cards: Flashcard[]
  onChange: (cards: Flashcard[]) => void
}

export function FlashcardsEditor({ cards, onChange }: FlashcardsEditorProps) {
  const [activeCardIndex, setActiveCardIndex] = useState(0)

  const addCard = () => {
    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      front: "Front side",
      back: "Back side",
    }
    const updatedCards = [...cards, newCard]
    onChange(updatedCards)
    setActiveCardIndex(updatedCards.length - 1)
  }

  const updateCard = (index: number, field: keyof Flashcard, value: string) => {
    const updatedCards = [...cards]
    updatedCards[index] = {
      ...updatedCards[index],
      [field]: value,
    }
    onChange(updatedCards)
  }

  const deleteCard = (index: number) => {
    if (cards.length <= 1) {
      return // Don't delete the last card
    }

    const updatedCards = [...cards]
    updatedCards.splice(index, 1)
    onChange(updatedCards)

    if (activeCardIndex >= index && activeCardIndex > 0) {
      setActiveCardIndex(activeCardIndex - 1)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeCardIndex.toString()} onValueChange={(value) => setActiveCardIndex(Number.parseInt(value))}>
        <div className="flex items-center justify-between mb-2">
          <TabsList className="h-9 overflow-x-auto w-auto">
            {cards.map((card, index) => (
              <TabsTrigger key={card.id} value={index.toString()} className="px-3 h-8">
                Card {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button size="sm" variant="outline" onClick={addCard}>
            <Plus className="h-4 w-4 mr-1" />
            Add Card
          </Button>
        </div>

        {cards.map((card, index) => (
          <TabsContent key={card.id} value={index.toString()} className="m-0 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Card {index + 1}</h4>
              <Button variant="ghost" size="icon" onClick={() => deleteCard(index)} disabled={cards.length <= 1}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Front Side</Label>
              <Textarea
                value={card.front}
                onChange={(e) => updateCard(index, "front", e.target.value)}
                placeholder="Front side content"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Back Side</Label>
              <Textarea
                value={card.back}
                onChange={(e) => updateCard(index, "back", e.target.value)}
                placeholder="Back side content"
                rows={3}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
