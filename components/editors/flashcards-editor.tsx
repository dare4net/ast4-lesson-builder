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
          <TabsList className="h-9 overflow-x-auto w-auto bg-[#E8F5E9]">
            {cards.map((card, index) => (
              <TabsTrigger 
                key={card.id} 
                value={index.toString()} 
                className="px-3 h-8 data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white text-[#2E7D32] hover:text-[#2E7D32] hover:bg-[#E8F5E9]/80"
              >
                Card {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={addCard}             
            className="border-[#4CAF50] text-[#2E7D32] hover:bg-[#E8F5E9] hover:text-[#2E7D32] hover:border-[#4CAF50]"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Card
          </Button>
        </div>

        {cards.map((card, index) => (
          <TabsContent key={card.id} value={index.toString()} className="m-0 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-[#2E7D32]">Card {index + 1}</h4>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => deleteCard(index)} 
                disabled={cards.length <= 1}
                className="text-[#4CAF50] hover:bg-[#E8F5E9] hover:text-[#2E7D32]"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-[#2E7D32]">Front Side</Label>
              <Textarea
                value={card.front}
                onChange={(e) => updateCard(index, "front", e.target.value)}
                placeholder="Front side content"
                rows={3}
                className="border-[#4CAF50] focus:ring-[#4CAF50] focus:border-[#4CAF50] text-[#2E7D32] placeholder-[#4CAF50]/50 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2E7D32]">Back Side</Label>
              <Textarea
                value={card.back}
                onChange={(e) => updateCard(index, "back", e.target.value)}
                placeholder="Back side content"
                rows={3}
                className="border-[#4CAF50] focus:ring-[#4CAF50] focus:border-[#4CAF50] text-[#2E7D32] placeholder-[#4CAF50]/50 bg-white"
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
