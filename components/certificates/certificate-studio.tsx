'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, Loader2, Star } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { SoundEffects } from '@/lib/sound-effects'
import {
    CERTIFICATE_PRINT_COST,
    CERT_HEIGHT,
    CERT_WIDTH,
    downloadCertificatePdf,
    downloadCertificatePng,
    renderCertificate,
    type CertificatePayload,
} from '@/lib/certificates'
import { useGamification } from '@/context/gamification-context'
import { cn } from '@/lib/utils'

type WithoutPrintStamp<T> = T extends CertificatePayload ? Omit<T, 'printedAt'> : never

export type CertificateStudioPayload = WithoutPrintStamp<CertificatePayload> & {
    lessonId?: string
    statKey?: string
}

export function CertificateStudio({
    open,
    onOpenChange,
    payload,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    payload: CertificateStudioPayload | null
}) {
    const queryClient = useQueryClient()
    const { starBalance } = useGamification()
    const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null)
    const [printedAt, setPrintedAt] = useState<string | null>(null)
    const [previewStamp, setPreviewStamp] = useState<string | null>(null)
    const [drawing, setDrawing] = useState(false)
    const [error, setError] = useState('')
    const [busy, setBusy] = useState<'png' | 'pdf' | null>(null)

    const stamp = printedAt || previewStamp
    const draft: CertificatePayload | null = payload && stamp
        ? ({ ...payload, printedAt: stamp } as CertificatePayload)
        : null

    useEffect(() => {
        if (!open) {
            setPrintedAt(null)
            setPreviewStamp(null)
            setError('')
            setBusy(null)
            setDrawing(false)
            return
        }
        setPreviewStamp((current) => current || new Date().toISOString())
    }, [open])

    useEffect(() => {
        if (!open || !draft || !canvasEl) return
        let cancelled = false
        setDrawing(true)
        void renderCertificate(draft)
            .then((source) => {
                if (cancelled) return
                const ctx = canvasEl.getContext('2d')
                if (!ctx) throw new Error('Could not draw certificate')
                ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
                ctx.drawImage(source, 0, 0)
                setDrawing(false)
            })
            .catch(() => {
                if (cancelled) return
                setDrawing(false)
                setError('Could not draw that preview.')
            })
        return () => {
            cancelled = true
        }
    }, [
        open,
        canvasEl,
        stamp,
        draft?.kind,
        payload?.kind === 'pride' ? payload.statKey : undefined,
        payload?.kind === 'pride' ? payload.boardLabel : undefined,
        payload?.kind === 'pride' ? payload.valueLabel : undefined,
        payload?.kind === 'pride' ? payload.rank : undefined,
        payload?.kind === 'pride' ? payload.crown : undefined,
        payload?.kind === 'lesson' ? payload.lessonTitle : undefined,
        payload?.kind === 'lesson' ? payload.score : undefined,
        payload?.studentName,
    ])

    const print = useMutation({
        mutationFn: async () => {
            if (!payload) throw new Error('Nothing to print')
            return apiClient.store.printCertificate({
                kind: payload.kind,
                lessonId: payload.kind === 'lesson' ? payload.lessonId : undefined,
                statKey: payload.kind === 'pride' ? payload.statKey : undefined,
            })
        },
        onSuccess: async (data) => {
            setPrintedAt(data.printedAt)
            if (typeof data.starBalance === 'number') {
                queryClient.setQueryData(queryKeys.wallet, (prev: { starBalance?: number } | undefined) => ({
                    ...(prev || {}),
                    starBalance: data.starBalance,
                }))
            }
            void queryClient.invalidateQueries({ queryKey: queryKeys.wallet })
            void SoundEffects.play('starsSpent')
        },
        onError: (err: { response?: { data?: { error?: string } } }) => {
            setError(err.response?.data?.error || 'Could not print that. Need more stars?')
        },
    })

    const paid = Boolean(printedAt)

    const handlePrint = async () => {
        setError('')
        try {
            await print.mutateAsync()
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
            setError(message || 'Could not print that certificate.')
        }
    }

    const handleDownload = async (format: 'png' | 'pdf') => {
        if (!draft || !printedAt) return
        setError('')
        setBusy(format)
        try {
            if (format === 'png') await downloadCertificatePng(draft)
            else await downloadCertificatePdf(draft)
        } catch {
            setError('Could not download that certificate.')
        } finally {
            setBusy(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl rounded-3xl bg-white border-2 border-slate-200 p-5 sm:p-6">
                <DialogHeader className="text-left space-y-1">
                    <DialogTitle className="text-xl font-extrabold text-slate-800">
                        {payload?.kind === 'pride' ? 'Pride share card' : 'Lesson certificate'}
                    </DialogTitle>
                    <DialogDescription className="text-xs font-medium text-slate-500">
                        {paid
                            ? `Stamped and ready. Save as image or PDF. Another print is ${CERTIFICATE_PRINT_COST} stars and a new date.`
                            : `Preview of what you get. Print for ${CERTIFICATE_PRINT_COST} stars to stamp today's date and download.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="relative rounded-2xl border-2 border-slate-200 bg-slate-50 overflow-hidden min-h-[12rem]">
                    <canvas
                        ref={setCanvasEl}
                        width={CERT_WIDTH}
                        height={CERT_HEIGHT}
                        className="block w-full h-auto"
                    />
                    {drawing ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                            <Loader2 className="w-7 h-7 animate-spin text-[#58CC02]" />
                            <span className="sr-only">Drawing preview</span>
                        </div>
                    ) : null}
                    {!paid && !drawing ? (
                        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                            Preview
                        </div>
                    ) : null}
                </div>

                {error ? <p className="text-xs font-bold text-red-600">{error}</p> : null}

                {!paid ? (
                    <button
                        type="button"
                        disabled={print.isPending || drawing || starBalance < CERTIFICATE_PRINT_COST}
                        onClick={() => void handlePrint()}
                        className={cn(
                            'w-full h-12 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 border-b-4 active:border-b-0 active:translate-y-[2px]',
                            'bg-[#58CC02] hover:bg-[#46A302] border-[#3B8C00] text-white disabled:opacity-60'
                        )}
                    >
                        {print.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4 fill-white" />}
                        Print this card for {CERTIFICATE_PRINT_COST} stars
                    </button>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            type="button"
                            disabled={busy === 'png'}
                            onClick={() => void handleDownload('png')}
                            className="flex-1 h-12 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 border-b-4 border-[#3B8C00] bg-[#58CC02] hover:bg-[#46A302] text-white active:border-b-0 active:translate-y-[2px] disabled:opacity-60"
                        >
                            {busy === 'png' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            Download image
                        </button>
                        <button
                            type="button"
                            disabled={busy === 'pdf'}
                            onClick={() => void handleDownload('pdf')}
                            className="flex-1 h-12 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 border-b-4 border-[#0a7cb3] bg-[#1CB0F6] hover:bg-[#0d9de0] text-white active:border-b-0 active:translate-y-[2px] disabled:opacity-60"
                        >
                            {busy === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            Download PDF
                        </button>
                    </div>
                )}
                <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    Wallet {starBalance} · every new print is another {CERTIFICATE_PRINT_COST} stars and a new date
                </p>
            </DialogContent>
        </Dialog>
    )
}
