'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Loader2, Save } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'

export type OrgProgramOption = {
    _id: string
    name: string
    is_published?: boolean
}

type CohortProgramsEditorProps = {
    orgId: string
    cohortId: string
    cohortName: string
    programIds: string[]
    programs: OrgProgramOption[]
    disabled?: boolean
    onSaved?: () => void
    /** Override save (e.g. superadmin API). Defaults to org staff route. */
    onSavePrograms?: (programIds: string[]) => Promise<void>
}

export function CohortProgramsEditor({
    orgId,
    cohortId,
    cohortName,
    programIds,
    programs,
    disabled = false,
    onSaved,
    onSavePrograms,
}: CohortProgramsEditorProps) {
    const [selected, setSelected] = useState<string[]>(programIds)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        setSelected(programIds)
        setSaved(false)
        setError('')
    }, [cohortId, programIds.join(',')])

    const toggle = (programId: string) => {
        setSelected((current) =>
            current.includes(programId)
                ? current.filter((id) => id !== programId)
                : [...current, programId],
        )
        setSaved(false)
    }

    const dirty =
        selected.length !== programIds.length ||
        selected.some((id) => !programIds.includes(id))

    const save = async () => {
        setSaving(true)
        setError('')
        try {
            if (onSavePrograms) {
                await onSavePrograms(selected)
            } else {
                await apiClient.orgs.updateCohort(orgId, cohortId, { programIds: selected })
            }
            setSaved(true)
            onSaved?.()
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
            setError(message || 'Could not save course assignment.')
        } finally {
            setSaving(false)
        }
    }

    if (programs.length === 0) {
        return (
            <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5">
                <p className="text-[11px] font-medium text-slate-500">
                    No club programs yet. Create courses in the studio with this club selected, then assign them here.
                </p>
            </div>
        )
    }

    return (
        <div className="mt-2 space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Courses for {cohortName}
                </p>
                {saved && !dirty && (
                    <span className="text-[10px] font-bold text-emerald-600">Saved</span>
                )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
                Students who join this cohort are auto-enrolled in the selected programs.
            </p>
            <ul className="space-y-1.5 max-h-40 overflow-auto">
                {programs.map((program) => {
                    const id = String(program._id)
                    const checked = selected.includes(id)
                    return (
                        <li key={id}>
                            <label
                                className={cn(
                                    'flex items-center gap-2 rounded-lg border px-2.5 py-2 cursor-pointer transition-colors',
                                    checked
                                        ? 'border-sky-200 bg-sky-50/80'
                                        : 'border-slate-200 bg-white hover:border-slate-300',
                                    disabled && 'opacity-60 cursor-not-allowed',
                                )}
                            >
                                <input
                                    type="checkbox"
                                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                    checked={checked}
                                    disabled={disabled || saving}
                                    onChange={() => toggle(id)}
                                />
                                <span className="text-[11px] font-bold text-slate-800 flex-1 min-w-0 truncate">
                                    {program.name}
                                </span>
                                {program.is_published === false && (
                                    <span className="text-[9px] font-bold uppercase text-amber-600 shrink-0">
                                        Draft
                                    </span>
                                )}
                            </label>
                        </li>
                    )
                })}
            </ul>
            {error && (
                <p className="text-[10px] font-bold text-red-600">{error}</p>
            )}
            <button
                type="button"
                disabled={disabled || saving || !dirty}
                onClick={() => void save()}
                className="h-8 px-3 rounded-lg bg-sky-600 text-white text-[11px] font-bold disabled:opacity-50 inline-flex items-center gap-1.5"
            >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save courses
            </button>
        </div>
    )
}
