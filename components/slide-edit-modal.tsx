"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, MousePointer2 } from "lucide-react"
import type { Slide } from "@/types/lesson"
import { getCategorizedComponents } from "@/lib/lesson-utils"

interface SlideEditModalProps {
  slide: Slide
  isOpen: boolean
  onClose: () => void
  onSave: (updatedSlide: Slide) => void
}

export function SlideEditModal({ slide, isOpen, onClose, onSave }: SlideEditModalProps) {
  const [title, setTitle] = useState(slide.title || "")
  const [isDisabled, setIsDisabled] = useState(slide.state === "disabled")

  // Keep modal state in sync whenever modal opens or slide prop changes
  useEffect(() => {
    if (isOpen) {
      setTitle(slide.title || "")
      setIsDisabled(slide.state === "disabled")
    }
  }, [isOpen, slide.title, slide.state])

  const handleSave = () => {
    onSave({
      ...slide,
      title,
      state: isDisabled ? "disabled" : "active"
    })
    onClose()
  }

  const categorized = getCategorizedComponents(slide.components)
  const interactiveCount = categorized.interactive.length
  const gamifiedCount = categorized.gamified.length

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-[#0F172A] border-slate-800 text-slate-200">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
            <DialogTitle className="text-xl font-bold text-white tracking-tight uppercase">Slide Settings</DialogTitle>
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider pl-4.5">Configure title and visibility for this slide</p>
        </DialogHeader>

        <div className="grid gap-8 py-8 px-2">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Slide Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter slide title..."
              className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 text-slate-200 placeholder:text-slate-700 h-12 rounded-xl text-lg font-bold"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-slate-800">
            <div className="space-y-0.5">
              <Label htmlFor="disabled" className="text-sm font-black text-slate-200 uppercase tracking-tight">Active State</Label>
              <p className="text-[10px] text-slate-500 font-bold">Toggle visibility within the final lesson stream</p>
            </div>
            <Switch
              id="disabled"
              checked={!isDisabled}
              onCheckedChange={(checked: boolean) => setIsDisabled(!checked)}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Composition Analytics</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 bg-slate-950/40 border border-slate-800 p-3 rounded-xl transition-all hover:border-emerald-500/30 group">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <MousePointer2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xl font-black text-white">{interactiveCount}</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Lab Interaction</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-950/40 border border-slate-800 p-3 rounded-xl transition-all hover:border-blue-500/30 group">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Gamepad2 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-xl font-black text-white">{gamifiedCount}</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Play Mechanics</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose} className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800 font-bold px-6">
            Cancel
          </Button>
          <Button onClick={handleSave} className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 shadow-lg shadow-emerald-500/10">
            Save Slide Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
