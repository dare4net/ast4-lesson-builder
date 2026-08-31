'use client'

import { Label } from '@/components/ui/label'
import type { ReferenceOption } from '@/lib/reference'

export function ReferencePicker({
    value,
    onChange,
    options,
    selfId,
    label = 'Tutor reference',
}: {
    value?: string
    onChange: (id: string) => void
    options?: ReferenceOption[]
    selfId?: string
    label?: string
}) {
    const choices = (options || []).filter((option) => option.id && option.id !== selfId)
    return (
        <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</Label>
            <select
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-full px-3 rounded-xl border border-slate-800 bg-slate-950/50 text-xs font-bold text-slate-200"
            >
                <option value="">No reference</option>
                {choices.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.title} · {option.type}
                    </option>
                ))}
            </select>
            <p className="text-[10px] font-medium text-slate-500">
                {value
                    ? 'Look in live preview for Open reference — it pops this other block. Practice is free. Live costs a credit or 3 stars.'
                    : 'Pick another block students can open as a pointer. The button appears on the activity in preview. Practice is free. Live costs a credit or 3 stars.'}
            </p>
        </div>
    )
}
