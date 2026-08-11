"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { ArrayItemEditor } from "./base/ArrayItemEditor"

interface Hotspot {
  id: string
  x: number
  y: number
  label: string
  content: string
}

interface HotspotEditorProps {
  image: string
  hotspots: Hotspot[]
  onChange: (hotspots: Hotspot[]) => void
}

export function HotspotEditor({ image, hotspots, onChange }: HotspotEditorProps) {
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
    }
    onChange([...hotspots, newHotspot])
    setIsAddingHotspot(false)
  }

  const updateHotspot = (index: number, field: keyof Hotspot, value: any) => {
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
            const isSelected = index === activeHotspotIndex;

            const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
              e.stopPropagation();
              e.preventDefault();
              setActiveHotspotIndex(index);

              const targetPin = e.currentTarget;
              targetPin.setPointerCapture(e.pointerId);

              let rafId: number | null = null;
              let latestX = hotspot.x;
              let latestY = hotspot.y;

              const onPointerMove = (moveEvent: PointerEvent) => {
                if (!imageRef.current) return;
                const rect = imageRef.current.getBoundingClientRect();
                latestX = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                latestY = Math.max(0, Math.min(1, (moveEvent.clientY - rect.top) / rect.height));

                if (rafId === null) {
                  rafId = requestAnimationFrame(() => {
                    const updated = [...hotspots];
                    updated[index] = { ...updated[index], x: latestX, y: latestY };
                    onChange(updated);
                    rafId = null;
                  });
                }
              };

              const onPointerUp = (upEvent: PointerEvent) => {
                if (rafId !== null) cancelAnimationFrame(rafId);
                targetPin.releasePointerCapture(upEvent.pointerId);
                targetPin.removeEventListener("pointermove", onPointerMove);
                targetPin.removeEventListener("pointerup", onPointerUp);

                // Final position commit
                if (!imageRef.current) return;
                const rect = imageRef.current.getBoundingClientRect();
                const finalX = Math.max(0, Math.min(1, (upEvent.clientX - rect.left) / rect.width));
                const finalY = Math.max(0, Math.min(1, (upEvent.clientY - rect.top) / rect.height));
                const updated = [...hotspots];
                updated[index] = { ...updated[index], x: finalX, y: finalY };
                onChange(updated);
              };

              targetPin.addEventListener("pointermove", onPointerMove);
              targetPin.addEventListener("pointerup", onPointerUp);
            };

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
                    ? "bg-emerald-500 border-white text-slate-950 scale-125 z-20 shadow-emerald-500/50 ring-4 ring-emerald-500/30"
                    : "bg-slate-950/80 border-emerald-500/50 text-emerald-500 hover:scale-110 z-10"
                )}
              >
                {index + 1}
                {isSelected && (
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-20" />
                )}
              </div>
            );
          })}
        </div>
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
  );
}

