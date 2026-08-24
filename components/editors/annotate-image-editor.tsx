"use client"

import React, { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, MapPin, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageUploader } from "@/components/renderers/image-uploader"

export interface AnnotationLabel {
    id: string
    text: string
    x: number  // 0.0 to 1.0 decimal
    y: number  // 0.0 to 1.0 decimal
}

export interface AnnotateImageEditorProps {
    title?: string
    onTitleChange?: (val: string) => void
    image?: string
    onImageChange?: (val: string) => void
    labels?: AnnotationLabel[]
    onLabelsChange?: (labels: AnnotationLabel[]) => void
    lessonId?: string
    componentId?: string
}

export function AnnotateImageEditor({
    title = "Label the Diagram",
    onTitleChange,
    image = "",
    onImageChange,
    labels = [],
    onLabelsChange,
    lessonId,
    componentId,
}: AnnotateImageEditorProps) {
    const imageRef = useRef<HTMLImageElement>(null)
    const [isPlacingPin, setIsPlacingPin] = useState(false)
    const [activeId, setActiveId] = useState<string | null>(null)

    // ── Click on image to place new pin ──
    const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
        if (!isPlacingPin || !imageRef.current) return
        const rect = imageRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        const newLabel: AnnotationLabel = {
            id: `label-${Date.now()}`,
            text: `Label ${labels.length + 1}`,
            x: Math.max(0, Math.min(1, x)),
            y: Math.max(0, Math.min(1, y)),
        }
        onLabelsChange?.([...labels, newLabel])
        setActiveId(newLabel.id)
        setIsPlacingPin(false)
    }

    // ── Drag pin to reposition ──
    const handlePinPointerDown = (
        e: React.PointerEvent<HTMLDivElement>,
        labelId: string
    ) => {
        e.stopPropagation()
        e.preventDefault()
        setActiveId(labelId)

        const target = e.currentTarget
        target.setPointerCapture(e.pointerId)

        let rafId: number | null = null
        let latestX = 0
        let latestY = 0

        const onMove = (moveEvent: PointerEvent) => {
            if (!imageRef.current) return
            const rect = imageRef.current.getBoundingClientRect()
            latestX = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width))
            latestY = Math.max(0, Math.min(1, (moveEvent.clientY - rect.top) / rect.height))

            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    onLabelsChange?.(
                        labels.map(l => l.id === labelId ? { ...l, x: latestX, y: latestY } : l)
                    )
                    rafId = null
                })
            }
        }

        const onUp = (upEvent: PointerEvent) => {
            if (rafId !== null) cancelAnimationFrame(rafId)
            target.releasePointerCapture(upEvent.pointerId)
            target.removeEventListener("pointermove", onMove)
            target.removeEventListener("pointerup", onUp)

            if (!imageRef.current) return
            const rect = imageRef.current.getBoundingClientRect()
            const finalX = Math.max(0, Math.min(1, (upEvent.clientX - rect.left) / rect.width))
            const finalY = Math.max(0, Math.min(1, (upEvent.clientY - rect.top) / rect.height))
            onLabelsChange?.(
                labels.map(l => l.id === labelId ? { ...l, x: finalX, y: finalY } : l)
            )
        }

        target.addEventListener("pointermove", onMove)
        target.addEventListener("pointerup", onUp)
    }

    const handleUpdateText = (id: string, text: string) => {
        onLabelsChange?.(labels.map(l => l.id === id ? { ...l, text } : l))
    }

    const handleDelete = (id: string) => {
        onLabelsChange?.(labels.filter(l => l.id !== id))
        if (activeId === id) setActiveId(null)
    }

    return (
        <div className="space-y-6 w-full min-w-0">
            {/* Title */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-teal-400 shrink-0" />
                    Activity Title
                </Label>
                <Input
                    value={title}
                    onChange={e => onTitleChange?.(e.target.value)}
                    placeholder="e.g. Label the Parts of a Cell"
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-teal-500/50 h-11 text-sm font-bold placeholder:text-slate-700 rounded-xl w-full"
                />
            </div>

            {/* Image URL & File Upload */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide">Diagram Image</Label>
                <ImageUploader
                    value={image}
                    onChange={(val) => onImageChange?.(val)}
                    lessonId={lessonId}
                    componentId={componentId}
                />
            </div>

            {/* Interactive Pin Placement Canvas */}
            {image ? (
                <div className="space-y-3">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-2 px-1">
                        <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                            Annotation Pins ({labels.length})
                        </Label>
                        <Button
                            type="button"
                            onClick={() => setIsPlacingPin(prev => !prev)}
                            className={cn(
                                "h-8 px-3 rounded-xl font-black text-xs uppercase tracking-wide transition-all border-2 border-b-4 active:border-b-2 active:translate-y-[2px]",
                                isPlacingPin
                                    ? "bg-rose-500 text-white border-rose-500 border-b-rose-700 hover:bg-rose-400"
                                    : "bg-teal-500 text-white border-teal-500 border-b-teal-700 hover:bg-teal-400"
                            )}
                        >
                            {isPlacingPin ? (
                                "Cancel Placement"
                            ) : (
                                <><Plus className="w-3.5 h-3.5 mr-1 inline" />Place Pin</>
                            )}
                        </Button>
                    </div>

                    {/* Instruction banner when in placement mode */}
                    {isPlacingPin && (
                        <div className="px-4 py-2.5 bg-teal-500/10 border border-dashed border-teal-500/40 rounded-xl animate-in fade-in slide-in-from-top-1">
                            <p className="text-[11px] font-black text-teal-400 uppercase tracking-wider text-center">
                                Click anywhere on the image to place a pin
                            </p>
                        </div>
                    )}

                    {/* Image canvas with pins */}
                    <div className="relative border-2 border-slate-800 border-b-4 rounded-2xl overflow-hidden bg-slate-950 shadow-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            ref={imageRef}
                            src={image}
                            alt="Annotation diagram"
                            className={cn(
                                "w-full h-auto block transition-all duration-300",
                                isPlacingPin ? "cursor-crosshair opacity-60 grayscale-[0.3]" : "opacity-100"
                            )}
                            onClick={handleImageClick}
                            draggable={false}
                        />

                        {/* Pins */}
                        {labels.map((lbl, idx) => {
                            const isActive = activeId === lbl.id
                            return (
                                <div
                                    key={lbl.id}
                                    style={{
                                        position: "absolute",
                                        left: `${lbl.x * 100}%`,
                                        top: `${lbl.y * 100}%`,
                                        transform: "translate(-50%, -100%)",
                                    }}
                                    onPointerDown={e => handlePinPointerDown(e, lbl.id)}
                                    onClick={e => { e.stopPropagation(); setActiveId(lbl.id) }}
                                    className={cn(
                                        "flex flex-col items-center select-none touch-none cursor-grab active:cursor-grabbing z-10 group",
                                        isActive && "z-20"
                                    )}
                                >
                                    {/* Label bubble */}
                                    <div className={cn(
                                        "px-2 py-0.5 rounded-lg text-[10px] font-black whitespace-nowrap shadow-lg border mb-0.5 transition-all",
                                        isActive
                                            ? "bg-teal-500 text-white border-teal-400"
                                            : "bg-slate-950/90 text-teal-300 border-teal-500/40"
                                    )}>
                                        {lbl.text || `Label ${idx + 1}`}
                                    </div>
                                    {/* Pin body */}
                                    <div className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 shadow-lg transition-all",
                                        isActive
                                            ? "bg-teal-500 border-white text-white scale-125 ring-4 ring-teal-500/30"
                                            : "bg-slate-950/80 border-teal-400 text-teal-300 hover:scale-110"
                                    )}>
                                        {idx + 1}
                                        {isActive && (
                                            <div className="absolute inset-0 rounded-full border-4 border-teal-400 animate-ping opacity-20" />
                                        )}
                                    </div>
                                    {/* Pin stem */}
                                    <div className={cn(
                                        "w-0.5 h-3 rounded-full",
                                        isActive ? "bg-teal-400" : "bg-teal-600"
                                    )} />
                                </div>
                            )
                        })}
                    </div>

                    {/* Label text list below */}
                    {labels.length > 0 && (
                        <div className="space-y-2 pt-1">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1 block">
                                Edit Label Text — pin positions set visually above
                            </Label>
                            {labels.map((lbl, idx) => (
                                <div
                                    key={lbl.id}
                                    onClick={() => setActiveId(lbl.id)}
                                    className={cn(
                                        "flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer",
                                        activeId === lbl.id
                                            ? "bg-teal-500/10 border-teal-500/40"
                                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                                    )}
                                >
                                    <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 font-black text-[10px] flex items-center justify-center shrink-0">
                                        {idx + 1}
                                    </span>
                                    <Input
                                        value={lbl.text}
                                        onChange={e => handleUpdateText(lbl.id, e.target.value)}
                                        placeholder={`Pin ${idx + 1} label`}
                                        onClick={e => e.stopPropagation()}
                                        className="bg-slate-900 border-slate-800 h-8 text-xs font-bold text-white flex-1 min-w-0"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={e => { e.stopPropagation(); handleDelete(lbl.id) }}
                                        className="h-7 w-7 text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {labels.length === 0 && !isPlacingPin && (
                        <div className="p-5 text-center bg-slate-950/40 rounded-xl border-2 border-dashed border-slate-800 space-y-2">
                            <MapPin className="w-5 h-5 text-slate-700 mx-auto" />
                            <p className="text-xs font-bold text-slate-500">Click "Place Pin" then click the image to add labels.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-6 text-center bg-slate-950/40 rounded-2xl border-2 border-dashed border-slate-800 space-y-2">
                    <ImageIcon className="w-6 h-6 text-slate-700 mx-auto" />
                    <p className="text-xs font-bold text-slate-500">Paste an image URL above to start placing annotation pins.</p>
                </div>
            )}
        </div>
    )
}
