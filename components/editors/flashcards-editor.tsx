"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { WYSIWYGTextArea } from "@/components/ui/wysiwyg-editor"
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
            <WYSIWYGTextArea
              value={card.front}
              onChange={(val) => updateCard(index, "front", val)}
              placeholder="Front side content"
              rows={3}
              showPreviewToggle={false}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#2E7D32]">Back Side</Label>
            <WYSIWYGTextArea
              value={card.back}
              onChange={(val) => updateCard(index, "back", val)}
              placeholder="Back side content"
              rows={3}
              showPreviewToggle={false}
            />
          </div>
        </div>
      )}
    />
  )
}
