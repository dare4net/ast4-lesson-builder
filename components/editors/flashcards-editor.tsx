"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrayItemEditor } from "./base/ArrayItemEditor"

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
  const addCard = () => {
    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      front: "Front side",
      back: "Back side",
    }
    onChange([...cards, newCard])
  }

  const updateCard = (index: number, field: keyof Flashcard, value: string) => {
    const updatedCards = [...cards]
    updatedCards[index] = {
      ...updatedCards[index],
      [field]: value,
    }
    onChange(updatedCards)
  }

  return (
    <ArrayItemEditor<Flashcard>
      items={cards}
      onChange={onChange}
      onAddItem={addCard}
      getItemLabel={(_, index) => `Card ${index + 1}`}
      addButtonLabel="Add Card"
      renderItem={(card, index) => (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#2E7D32]">Front Side</Label>
            <Textarea
              value={card.front}
              onChange={(e) => updateCard(index, "front", e.target.value)}
              placeholder="Front side content"
              rows={3}
              className="border-[#4CAF50]/30 focus-visible:ring-[#4CAF50] text-[#2E7D32] bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#2E7D32]">Back Side</Label>
            <Textarea
              value={card.back}
              onChange={(e) => updateCard(index, "back", e.target.value)}
              placeholder="Back side content"
              rows={3}
              className="border-[#4CAF50]/30 focus-visible:ring-[#4CAF50] text-[#2E7D32] bg-white"
            />
          </div>
        </div>
      )}
    />
  )
}
