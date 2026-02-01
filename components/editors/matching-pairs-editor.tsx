"use client"

import { Input } from "@/components/ui/input"
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
          <Input
            value={pair.left}
            onChange={(e) => updatePair(index, "left", e.target.value)}
            placeholder="Origin point"
            className="flex-1 w-full min-w-0 bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 h-10 text-xs font-bold transition-all rounded-xl"
          />

          <div className="flex flex-col items-center justify-center h-10 px-2 shrink-0">
            <ArrowRight className="h-4 w-4 text-emerald-500/50" />
          </div>

          <Input
            value={pair.right}
            onChange={(e) => updatePair(index, "right", e.target.value)}
            placeholder="Terminal point"
            className="flex-1 w-full min-w-0 bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 h-10 text-xs font-bold transition-all rounded-xl"
          />
        </div>
      )}
      renderHeader={() => (
        <div className="pb-4 mb-4 border-b border-slate-800/50">
          <div className="space-y-2">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Configuration</div>
            <div className="flex items-center gap-4">
              <div className="space-y-1 flex-1">
                <label className="text-xs font-bold text-slate-400">Time Limit (Seconds)</label>
                <Input
                  type="number"
                  min="5"
                  // We need to store timeLimit on the parent props, but ArrayItemEditor assumes 'items'. 
                  // The editor props are { pairs, onChange }. 
                  // We might need to change the signature of MatchingPairsEditor to accept extra props or attach it to the first pair? (Hack)
                  // No, the Component Editor typically passes 'props' object. 
                  // MatchingPairsEditorProps is { pairs, onChange }. It doesn't receive the full component props.
                  // I need to check how standard editors handle non-array props.
                  // For now I will assume I can't easily add it HERE without changing the interface. 
                  // Wait, 'onChange' updates the pairs array.
                  // If I want to update a top-level prop 'timeLimit', I need the parent to pass it.
                  // Checking usage... usually 'props={component.props} onChange={updateProps}'
                  // So I can add 'timeLimit' to MatchingPairsEditorProps.
                  value={(pairs as any).timeLimit || 10}
                  onChange={(e) => {
                    // This is tricky. ComponentEditor usually expects 'onChange' to take the whole props object?
                    // No, looking at MatchingPairsEditor signature: `export function MatchingPairsEditor({ pairs, onChange }: MatchingPairsEditorProps)`
                    // It extracts `pairs` from props.
                    // I should change the signature to accept `timeLimit` and call `onChange` with updated props?
                    // Actually, I'll return to this after checking ComponentEditor.
                    // For now, let's assume I can't modify the signature easily without breaking things.
                    // But wait, `p` in ComponentEditor is `props`. 
                    // <EditorComponent {...component.props} onChange={handlePropsChange} />
                    // If `component.props` has `timeLimit`, it splits into `pairs` and `timeLimit`?
                    // TypeScript interface `MatchingPairsEditorProps` only defines `pairs`. 
                    // I will add `timeLimit` to the interface first.
                  }}
                  disabled
                  placeholder="Coming soon"
                  className="bg-slate-950/50 border-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    />
  )
}
