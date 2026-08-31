'use client'

import { X } from 'lucide-react'
import { ComponentRenderer } from '@/components/component-renderer'
import { useReference } from '@/context/reference-context'

export function ReferencePopup() {
    const reference = useReference()
    if (!reference) return null
    const { openComponent, openId, componentStates, setComponentState, close, error, lesson, contained } = reference
    if (!openId && !error) return null

    return (
        <div className={`${contained ? 'absolute' : 'fixed'} inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-950/50 p-3`}>
            <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-2xl flex flex-col">
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#1CB0F6]">Tutor reference</p>
                        <p className="text-sm font-extrabold text-slate-800">
                            {openComponent?.props?.title || openComponent?.type || 'Pointer'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-slate-200"
                        aria-label="Close reference"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                {error ? <p className="px-4 py-2 text-xs font-bold text-red-600">{error}</p> : null}
                {openComponent ? (
                    <div className="min-h-0 flex-1 overflow-y-auto p-3">
                        <ComponentRenderer
                            component={openComponent}
                            savedState={componentStates[openComponent.id]}
                            setComponentState={(state: any) => setComponentState(openComponent.id, state)}
                            lessonId={lesson?.id}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    )
}
