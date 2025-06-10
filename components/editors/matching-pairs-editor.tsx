"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface MatchingPair {
  id: string
  left: string
  right: string
}

interface MatchingPairsEditorProps {
  pairs: MatchingPair[]
  onChange: (pairs: MatchingPair[]) => void
}

export function MatchingPairsEditor({ pairs, onChange }: MatchingPairsEditorProps) {
  const addPair = () => {
    const newPair: MatchingPair = {
      id: `pair-${Date.now()}`,
      left: "New Item",
      right: "New Match",
    }
    onChange([...pairs, newPair])
  }

  const updatePair = (index: number, field: keyof MatchingPair, value: string) => {
    const updatedPairs = [...pairs]
    updatedPairs[index] = {
      ...updatedPairs[index],
      [field]: value,
    }
    onChange(updatedPairs)
  }

  const deletePair = (index: number) => {
    if (pairs.length <= 2) {
      return // Don't delete if only 2 pairs left
    }
    const updatedPairs = [...pairs]
    updatedPairs.splice(index, 1)
    onChange(updatedPairs)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Matching Pairs</Label>
        <Button
          size="sm"
          variant="outline"
          onClick={addPair}
          className="hover:bg-[#E8F5E9] hover:text-[#2E7D32] hover:border-[#4CAF50]"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Pair
        </Button>
      </div>

      <div className="space-y-2">
        {pairs.map((pair, index) => (
          <div
            key={pair.id}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg",
              "transition-colors hover:bg-muted/50"
            )}
          >
            <Input
              value={pair.left}
              onChange={(e) => updatePair(index, "left", e.target.value)}
              placeholder="Left item"
              className="flex-1 focus-visible:ring-[#4CAF50]"
            />

            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

            <Input
              value={pair.right}
              onChange={(e) => updatePair(index, "right", e.target.value)}
              placeholder="Right match"
              className="flex-1 focus-visible:ring-[#4CAF50]"
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => deletePair(index)}
              disabled={pairs.length <= 2}
              className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {pairs.length < 2 && (
        <p className="text-sm text-muted-foreground">
          Add at least two pairs to create a matching exercise.
        </p>
      )}
    </div>
  )
}
