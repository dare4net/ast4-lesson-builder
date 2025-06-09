"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, ArrowRight } from "lucide-react"

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
        <Label>Matching Pairs</Label>
        <Button size="sm" variant="outline" onClick={addPair}>
          <Plus className="h-4 w-4 mr-1" />
          Add Pair
        </Button>
      </div>

      <div className="space-y-2">
        {pairs.map((pair, index) => (
          <div key={pair.id} className="flex items-center gap-2">
            <Input
              value={pair.left}
              onChange={(e) => updatePair(index, "left", e.target.value)}
              placeholder="Left item"
              className="flex-1"
            />

            <ArrowRight className="h-4 w-4 text-muted-foreground" />

            <Input
              value={pair.right}
              onChange={(e) => updatePair(index, "right", e.target.value)}
              placeholder="Right match"
              className="flex-1"
            />

            <Button variant="ghost" size="icon" onClick={() => deletePair(index)} disabled={pairs.length <= 2}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
