"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

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

    const updatedHotspots = [...hotspots, newHotspot]
    onChange(updatedHotspots)
    setActiveHotspotIndex(updatedHotspots.length - 1)
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

  const deleteHotspot = (index: number) => {
    const updatedHotspots = [...hotspots]
    updatedHotspots.splice(index, 1)
    onChange(updatedHotspots)

    if (activeHotspotIndex >= index && activeHotspotIndex > 0) {
      setActiveHotspotIndex(activeHotspotIndex - 1)
    }
  }

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isAddingHotspot || !imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    addHotspot(x, y)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Hotspots</Label>
        <Button
          size="sm"
          variant={isAddingHotspot ? "default" : "outline"}
          onClick={() => setIsAddingHotspot(!isAddingHotspot)}
        >
          {isAddingHotspot ? (
            "Cancel"
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Add Hotspot
            </>
          )}
        </Button>
      </div>

      {isAddingHotspot && (
        <div className="border rounded-md p-2 bg-muted/20">
          <p className="text-sm mb-2">Click on the image to place a hotspot</p>
        </div>
      )}

      <div className="border rounded-md overflow-auto" style={{ maxHeight: "250px" }}>
        <div className="relative">
          <img
            ref={imageRef}
            src={image || "/placeholder.svg?height=300&width=400"}
            alt="Hotspot image"
            className={`w-full h-auto ${isAddingHotspot ? "cursor-crosshair" : ""}`}
            onClick={handleImageClick}
          />

          {hotspots.map((hotspot, index) => (
            <div
              key={hotspot.id}
              className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                index === activeHotspotIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/50 text-primary-foreground"
              }`}
              style={{
                left: `${hotspot.x * 100}%`,
                top: `${hotspot.y * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
              onClick={() => setActiveHotspotIndex(index)}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {hotspots.length > 0 && (
        <div className="overflow-auto" style={{ maxHeight: "250px" }}>
          <Tabs
            value={activeHotspotIndex.toString()}
            onValueChange={(value) => setActiveHotspotIndex(Number.parseInt(value))}
          >
            <TabsList className="h-9 overflow-x-auto w-auto">
              {hotspots.map((hotspot, index) => (
                <TabsTrigger key={hotspot.id} value={index.toString()} className="px-3 h-8">
                  {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            {hotspots.map((hotspot, index) => (
              <TabsContent key={hotspot.id} value={index.toString()} className="m-0 space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Hotspot {index + 1}</h4>
                      <Button variant="ghost" size="icon" onClick={() => deleteHotspot(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input
                        value={hotspot.label}
                        onChange={(e) => updateHotspot(index, "label", e.target.value)}
                        placeholder="Hotspot label"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea
                        value={hotspot.content}
                        onChange={(e) => updateHotspot(index, "content", e.target.value)}
                        placeholder="Hotspot content"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>X Position</Label>
                        <Input
                          type="number"
                          value={hotspot.x}
                          onChange={(e) => updateHotspot(index, "x", Number.parseFloat(e.target.value))}
                          min={0}
                          max={1}
                          step={0.01}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Y Position</Label>
                        <Input
                          type="number"
                          value={hotspot.y}
                          onChange={(e) => updateHotspot(index, "y", Number.parseFloat(e.target.value))}
                          min={0}
                          max={1}
                          step={0.01}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  )
}
