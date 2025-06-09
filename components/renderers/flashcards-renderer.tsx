"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react"

interface Flashcard {
  id: string
  front: string
  back: string
}

interface FlashcardsRendererProps {
  title?: string
  cards?: Flashcard[]
  isEditing?: boolean
}

export function FlashcardsRenderer({ title = "Flashcards", cards = [], isEditing = false }: FlashcardsRendererProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const currentCard = cards[currentCardIndex]

  const goToNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
    }
  }

  const goToPreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setIsFlipped(false)
    }
  }

  const flipCard = () => {
    setIsFlipped(!isFlipped)
  }

  // In editing mode, show a simplified version
  if (isEditing) {
    return (
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Front</p>
            {cards.map((card) => (
              <div key={`front-${card.id}`} className="p-2 bg-muted rounded">
                {card.front}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Back</p>
            {cards.map((card) => (
              <div key={`back-${card.id}`} className="p-2 bg-muted rounded">
                {card.back}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>No flashcards available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative perspective-1000">
          <div
            className={`relative w-full h-64 cursor-pointer transition-transform duration-500 transform-style-preserve-3d ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            onClick={flipCard}
          >
            <div
              className={`absolute w-full h-full backface-hidden flex items-center justify-center p-6 border rounded-md ${
                isFlipped ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-medium">{currentCard.front}</div>
                <div className="mt-4 text-sm text-muted-foreground">Click to flip</div>
              </div>
            </div>
            <div
              className={`absolute w-full h-full backface-hidden flex items-center justify-center p-6 border rounded-md rotate-y-180 ${
                isFlipped ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="text-center">
                <div className="text-lg">{currentCard.back}</div>
                <div className="mt-4 text-sm text-muted-foreground">Click to flip back</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousCard} disabled={currentCardIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={flipCard}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextCard} disabled={currentCardIndex === cards.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Card {currentCardIndex + 1} of {cards.length}
        </div>
      </CardFooter>
    </Card>
  )
}
