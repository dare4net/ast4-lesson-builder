"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, MousePointer2 } from "lucide-react"
import type { Slide } from "@/types/lesson"

interface SlideEditModalProps {
  slide: Slide
  isOpen: boolean
  onClose: () => void
  onSave: (updatedSlide: Slide) => void
}

export function SlideEditModal({ slide, isOpen, onClose, onSave }: SlideEditModalProps) {
  const [title, setTitle] = useState(slide.title)
  const [isDisabled, setIsDisabled] = useState(slide.state === "disabled")

  const handleSave = () => {
    onSave({
      ...slide,
      title,
      state: isDisabled ? "disabled" : "active"
    })
    onClose()
  }

  const interactiveCount = slide.categorizedComponents?.interactive?.length ?? 0
  const gamifiedCount = slide.categorizedComponents?.gamified?.length ?? 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Slide</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Slide Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter slide title"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="disabled">Disable Slide</Label>
            <Switch
              id="disabled"
              checked={isDisabled}
              onCheckedChange={setIsDisabled}
            />
          </div>

          <div className="space-y-2 pt-2">
            <Label>Components Summary</Label>
            <div className="flex gap-3">
              <Badge variant="outline" className="flex items-center gap-2">
                <MousePointer2 className="h-3 w-3" />
                {interactiveCount} Interactive
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Gamepad2 className="h-3 w-3" />
                {gamifiedCount} Gamified
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
