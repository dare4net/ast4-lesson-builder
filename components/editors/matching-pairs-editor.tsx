"use client"

import { Input } from "@/components/ui/input"
import { WYSIWYGInput } from "@/components/ui/wysiwyg-editor"
import { ArrowRight } from "lucide-react"
import { ArrayItemEditor } from "./base/ArrayItemEditor"

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

  return (
    <div className="space-y-4">
      <div className="pb-4 mb-4 border-b border-slate-800/50">
        <div className="space-y-2">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Configuration</div>
          <div className="flex items-center gap-4">
            <div className="space-y-1 flex-1">
              <label className="text-xs font-bold text-slate-400">Time Limit (Seconds)</label>
              <Input
                type="number"
                min="5"
                value={(pairs as any).timeLimit || 10}
                disabled
                placeholder="Coming soon"
                className="bg-slate-950/50 border-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      <ArrayItemEditor<MatchingPair>
        items={pairs}
        onChange={onChange}
        onAddItem={addPair}
        getItemLabel={(_, index) => `Pair ${index + 1}`}
        layout="list"
        title="Matching Pairs"
        addButtonLabel="Add Pair"
        minItems={2}
        renderItem={(pair, index) => (
          <div className="flex items-center gap-3">
            <WYSIWYGInput
              value={pair.left}
              onChange={(val) => updatePair(index, "left", val)}
              placeholder="Origin point"
            />

            <div className="flex flex-col items-center justify-center h-10 px-2 shrink-0">
              <ArrowRight className="h-4 w-4 text-emerald-500/50" />
            </div>

            <WYSIWYGInput
              value={pair.right}
              onChange={(val) => updatePair(index, "right", val)}
              placeholder="Terminal point"
            />
          </div>
        )}
      />
    </div>
  )
}
