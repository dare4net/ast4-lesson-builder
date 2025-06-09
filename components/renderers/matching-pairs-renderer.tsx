"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"

interface MatchingPair {
  id: string
  left: string
  right: string
}

interface MatchingPairsRendererProps {
  title?: string
  pairs: MatchingPair[]
  shuffled?: boolean
  points?: number
  isEditing?: boolean
  scoreContext?: {
    score: number
    totalPossible: number
    addPoints: (points: number) => void
  }
}

export function MatchingPairsRenderer({
  title = "Match the items",
  pairs = [],
  shuffled = true,
  points = 15,
  isEditing = false,
  scoreContext,
}: MatchingPairsRendererProps) {
  const [leftItems, setLeftItems] = useState<(MatchingPair & { selected: boolean })[]>([])
  const [rightItems, setRightItems] = useState<(MatchingPair & { selected: boolean })[]>([])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, string>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  // Initialize the game
  useEffect(() => {
    if (isEditing) {
      // In editing mode, just show the pairs in order
      setLeftItems(pairs.map((pair) => ({ ...pair, selected: false })))
      setRightItems(pairs.map((pair) => ({ ...pair, selected: false })))
      return
    }

    // Create left and right arrays
    const leftArray = pairs.map((pair) => ({ ...pair, selected: false }))
    let rightArray = pairs.map((pair) => ({ ...pair, selected: false }))

    // Shuffle the right array if needed
    if (shuffled) {
      rightArray = [...rightArray].sort(() => Math.random() - 0.5)
    }

    setLeftItems(leftArray)
    setRightItems(rightArray)
    setMatches({})
    setIsComplete(false)
    setIsCorrect(false)
  }, [pairs, shuffled, isEditing])

  const handleLeftClick = (id: string) => {
    if (isComplete || Object.keys(matches).includes(id)) return

    // If there was a previously selected left item, deselect it
    if (selectedLeft) {
      setSelectedLeft(null)
    }

    setSelectedLeft(id)

    // If right is already selected, check for a match
    if (selectedRight) {
      const leftPair = pairs.find((pair) => pair.id === id)
      const rightPair = pairs.find((pair) => pair.id === selectedRight)

      if (leftPair && rightPair && leftPair.id === rightPair.id) {
        // Match found
        setMatches((prev) => ({ ...prev, [id]: selectedRight }))
        // Reset selections after a match
        setSelectedLeft(null)
        setSelectedRight(null)
      } else {
        // No match, keep left selected but clear right
        setSelectedRight(null)
      }
    }
  }

  const handleRightClick = (id: string) => {
    if (isComplete || Object.values(matches).includes(id)) return

    // If there was a previously selected right item, deselect it
    if (selectedRight) {
      setSelectedRight(null)
    }

    setSelectedRight(id)

    // If left is already selected, check for a match
    if (selectedLeft) {
      const leftPair = pairs.find((pair) => pair.id === selectedLeft)
      const rightPair = pairs.find((pair) => pair.id === id)

      if (leftPair && rightPair && leftPair.id === rightPair.id) {
        // Match found
        setMatches((prev) => ({ ...prev, [selectedLeft]: id }))
        // Reset selections after a match
        setSelectedLeft(null)
        setSelectedRight(null)
      } else {
        // No match, keep right selected but clear left
        setSelectedLeft(null)
      }
    }
  }

  // Check if all pairs are matched
  useEffect(() => {
    if (Object.keys(matches).length === pairs.length) {
      setIsComplete(true)

      // Check if all matches are correct
      const allCorrect = Object.entries(matches).every(([leftId, rightId]) => {
        const leftPair = pairs.find((pair) => pair.id === leftId)
        const rightPair = pairs.find((pair) => pair.id === rightId)
        return leftPair && rightPair && leftPair.id === rightPair.id
      })

      setIsCorrect(allCorrect)

      // Add points if all correct and scoreContext is available
      if (allCorrect && scoreContext) {
        scoreContext.addPoints(points)
      }
    }
  }, [matches, pairs, points, scoreContext])

  const resetGame = () => {
    // Reinitialize the game
    const leftArray = pairs.map((pair) => ({ ...pair, selected: false }))
    let rightArray = pairs.map((pair) => ({ ...pair, selected: false }))

    if (shuffled) {
      rightArray = [...rightArray].sort(() => Math.random() - 0.5)
    }

    setLeftItems(leftArray)
    setRightItems(rightArray)
    setSelectedLeft(null)
    setSelectedRight(null)
    setMatches({})
    setIsComplete(false)
    setIsCorrect(false)
  }

  // In editing mode, show a simplified version
  if (isEditing) {
    return (
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {pairs.map((pair) => (
              <div key={`left-${pair.id}`} className="p-2 bg-muted rounded">
                {pair.left}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {pairs.map((pair) => (
              <div key={`right-${pair.id}`} className="p-2 bg-muted rounded">
                {pair.right}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            {leftItems.map((item) => {
              const isMatched = Object.keys(matches).includes(item.id)
              const isSelected = selectedLeft === item.id

              return (
                <div
                  key={`left-${item.id}`}
                  className={`p-3 rounded border transition-colors cursor-pointer ${
                    isMatched
                      ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                      : isSelected
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                        : "hover:bg-muted"
                  }`}
                  onClick={() => handleLeftClick(item.id)}
                >
                  {item.left}
                </div>
              )
            })}
          </div>

          <div className="space-y-2">
            {rightItems.map((item) => {
              const isMatched = Object.values(matches).includes(item.id)
              const isSelected = selectedRight === item.id

              return (
                <div
                  key={`right-${item.id}`}
                  className={`p-3 rounded border transition-colors cursor-pointer ${
                    isMatched
                      ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                      : isSelected
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                        : "hover:bg-muted"
                  }`}
                  onClick={() => handleRightClick(item.id)}
                >
                  {item.right}
                </div>
              )
            })}
          </div>
        </div>

        {isComplete && (
          <div
            className={`mt-4 p-3 rounded flex items-center ${
              isCorrect
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span>Great job! All matches are correct.</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 mr-2" />
                <span>Some matches are incorrect. Try again!</span>
              </>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={resetGame} variant={isComplete ? "default" : "outline"}>
          Reset
        </Button>

        {points > 0 && <div className="ml-auto text-sm text-muted-foreground">Points: {points}</div>}
      </CardFooter>
    </Card>
  )
}
