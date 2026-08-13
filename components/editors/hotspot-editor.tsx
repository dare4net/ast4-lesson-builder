"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { ArrayItemEditor } from "./base/ArrayItemEditor"
import { normalizeHotspotBehavior, type HotspotBehavior } from "@/lib/hotspot-utils"

interface Hotspot {
  id: string
  x: number
  y: number
  label: string
  content: string
  isCorrect?: boolean
}

interface HotspotEditorProps {
  image: string
  hotspots: Hotspot[]
  onChange: (hotspots: Hotspot[]) => void
  behavior?: HotspotBehavior | "discovery" | "quiz"
}

export function HotspotEditor({ image, hotspots, onChange, behavior: rawBehavior }: HotspotEditorProps) {
  const behavior = normalizeHotspotBehavior(rawBehavior ?? "explore")
  const isDiscover = behavior === "discover"

  const [activeHotspotIndex, setActiveHotspotIndex] = useState(0)
  const [isAddingHotspot, setIsAddingHotspot] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  const addHotspot = (x: number, y: number) => {
    const newHotspot: Hotspot = {
      id: `hotspot-${Date.now()}`,
      x,
      y,
      label: `Hotspot ${hotspots.length + 1}`,
      content: "Description goes here",
      isCorrect: true,
    }
    onChange([...hotspots, newHotspot])
    setIsAddingHotspot(false)
  }

  const updateHotspot = (index: number, field: keyof Hotspot, value: unknown) => {
    const updatedHotspots = [...hotspots]
    updatedHotspots[index] = {
      ...updatedHotspots[index],
      [field]: value,
    }
    onChange(updatedHotspots)
  }

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isAddingHotspot || !imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    addHotspot(x, y)
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="flex items-center justify-between mb-3 px-1">
          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Spatial Mapping</Label>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAddingHotspot(!isAddingHotspot)}
            className={cn(
              "h-8 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest px-4",
              isAddingHotspot
                ? "bg-rose-500 border-rose-500 text-white hover:bg-rose-600"
                : "border-slate-800 bg-slate-900/50 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500"
            )}
          >
            {isAddingHotspot ? "Terminate Entry" : <><Plus className="h-3.5 w-3.5 mr-2" /> Initialize Node</>}
          </Button>
        </div>

        {isAddingHotspot && (
          <div className="border border-emerald-500/30 rounded-2xl p-4 bg-emerald-500/5 mb-4 animate-in fade-in slide-in-from-top-2 border-dashed">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest text-center">Protocol: Click workspace to deploy sensor</p>
          </div>
        )}

        <div className="relative border border-slate-800 rounded-[2rem] overflow-hidden bg-slate-950/40 shadow-2xl group/stage">
          <img
            ref={imageRef}
            src={image}
            alt="Hotspot base"
            className={cn(
              "w-full h-auto transition-all duration-700",
              isAddingHotspot ? 'cursor-crosshair opacity-40 grayscale-[0.5]' : 'group-hover/stage:opacity-90'
            )}
            onClick={handleImageClick}
          />
          {hotspots.map((hotspot, index) => {
            const isSelected = index === activeHotspotIndex
            const isDecoy = isDiscover && hotspot.isCorrect === false

            const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
              e.stopPropagation()
              e.preventDefault()
              setActiveHotspotIndex(index)

              const targetPin = e.currentTarget
              targetPin.setPointerCapture(e.pointerId)

              let rafId: number | null = null
              let latestX = hotspot.x
              let latestY = hotspot.y

              const onPointerMove = (moveEvent: PointerEvent) => {
                if (!imageRef.current) return
                const rect = imageRef.current.getBoundingClientRect()
                latestX = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width))
                latestY = Math.max(0, Math.min(1, (moveEvent.clientY - rect.top) / rect.height))

                if (rafId === null) {
                  rafId = requestAnimationFrame(() => {
                    const updated = [...hotspots]
                    updated[index] = { ...updated[index], x: latestX, y: latestY }
                    onChange(updated)
                    rafId = null
                  })
                }
              }

              const onPointerUp = (upEvent: PointerEvent) => {
                if (rafId !== null) cancelAnimationFrame(rafId)
                targetPin.releasePointerCapture(upEvent.pointerId)
                targetPin.removeEventListener("pointermove", onPointerMove)
                targetPin.removeEventListener("pointerup", onPointerUp)

                if (!imageRef.current) return
                const rect = imageRef.current.getBoundingClientRect()
                const finalX = Math.max(0, Math.min(1, (upEvent.clientX - rect.left) / rect.width))
                const finalY = Math.max(0, Math.min(1, (upEvent.clientY - rect.top) / rect.height))
                const updated = [...hotspots]
                updated[index] = { ...updated[index], x: finalX, y: finalY }
                onChange(updated)
              }

              targetPin.addEventListener("pointermove", onPointerMove)
              targetPin.addEventListener("pointerup", onPointerUp)
            }

            return (
              <div
                key={hotspot.id}
                style={{
                  position: "absolute",
                  left: `${hotspot.x * 100}%`,
                  top: `${hotspot.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                  transition: "transform 150ms ease, box-shadow 150ms ease",
                }}
                onPointerDown={handlePointerDown}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing border-2 text-[10px] font-black shadow-2xl select-none touch-none",
                  isSelected
                    ? isDecoy
                      ? "bg-rose-500 border-white text-white scale-125 z-20 shadow-rose-500/50 ring-4 ring-rose-500/30"
                      : "bg-emerald-500 border-white text-slate-950 scale-125 z-20 shadow-emerald-500/50 ring-4 ring-emerald-500/30"
                    : isDecoy
                      ? "bg-slate-950/80 border-rose-500/50 text-rose-400 hover:scale-110 z-10"
                      : "bg-slate-950/80 border-emerald-500/50 text-emerald-500 hover:scale-110 z-10"
                )}
              >
                {index + 1}
                {isSelected && (
                  <div className={cn(
                    "absolute inset-0 rounded-full border-4 animate-ping opacity-20",
                    isDecoy ? "border-rose-500" : "border-emerald-500"
                  )} />
                )}
              </div>
            )
          })}
        </div>

        {isDiscover && (
          <p className="text-[10px] font-bold text-slate-500 mt-2 px-1">
            Discover mode: emerald pins are correct targets, rose pins are decoys (waste a click, no point deduction).
          </p>
        )}
      </div>

      <ArrayItemEditor<Hotspot>
        items={hotspots}
        onChange={onChange}
        onAddItem={() => setIsAddingHotspot(true)}
        getItemLabel={(_, index) => `Sensor Node ${index + 1}`}
        addButtonLabel="Deploy Node"
        maxItems={10}
        renderItem={(hotspot, index) => (
          <div className="space-y-6">
            {isDiscover && (
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                <div className="space-y-0.5">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Correct Target</Label>
                  <p className="text-xs text-slate-400">Turn off to mark this node as a decoy</p>
                </div>
                <Switch
                  checked={hotspot.isCorrect !== false}
                  onCheckedChange={(checked) => updateHotspot(index, "isCorrect", checked)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Node Identifier</Label>
              <Input
                value={hotspot.label}
                onChange={(e) => updateHotspot(index, "label", e.target.value)}
                placeholder="Tag this sensor"
                className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 h-11 text-sm font-bold rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payload Content</Label>
              <Textarea
                value={hotspot.content}
                onChange={(e) => updateHotspot(index, "content", e.target.value)}
                placeholder="What data does this sensor emit?"
                rows={3}
                className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 text-sm font-medium placeholder:text-slate-700 rounded-2xl resize-none p-4"
              />
            </div>
          </div>
        )}
      />
    </div>
  )
}
