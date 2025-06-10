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
        <Label className="text-[#2E7D32]">Hotspots</Label>
        <Button
          size="sm"
          variant={isAddingHotspot ? "default" : "outline"}
          onClick={() => setIsAddingHotspot(!isAddingHotspot)}
          className={isAddingHotspot 
            ? "bg-[#4CAF50] text-white hover:bg-[#43A047]"
            : "border-[#4CAF50] text-[#2E7D32] hover:bg-[#E8F5E9] hover:text-[#2E7D32] hover:border-[#4CAF50]"}
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
        <div className="border border-[#4CAF50] rounded-md p-2 bg-[#E8F5E9]">
          <p className="text-sm mb-2 text-[#2E7D32]">Click on the image to place a hotspot</p>
        </div>
      )}

      <div className="relative">
        <img
          ref={imageRef}
          src={image}
          alt="Hotspot image"
          className={`w-full h-auto border border-[#4CAF50] rounded-md ${isAddingHotspot ? 'cursor-crosshair' : ''}`}
          onClick={handleImageClick}
        />
        {hotspots.map((hotspot, index) => (
          <div
            key={hotspot.id}
            style={{
              position: "absolute",
              left: `${hotspot.x * 100}%`,
              top: `${hotspot.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer border-2 text-sm ${
              index === activeHotspotIndex
                ? "bg-[#4CAF50] border-[#2E7D32] text-white"
                : "bg-white border-[#4CAF50] text-[#2E7D32] hover:bg-[#E8F5E9]"
            }`}
            onClick={() => setActiveHotspotIndex(index)}
          >
            {index + 1}
          </div>
        ))}
      </div>

      {hotspots.length > 0 && (
        <Card className="border-[#4CAF50]">
          <CardContent className="p-4">
            <Tabs 
              value={activeHotspotIndex.toString()} 
              onValueChange={(value) => setActiveHotspotIndex(Number.parseInt(value))}
            >
              <TabsList className="w-full h-auto flex-wrap bg-[#E8F5E9] mb-4">
                {hotspots.map((hotspot, index) => (
                  <TabsTrigger
                    key={hotspot.id}
                    value={index.toString()}
                    className="flex-1 h-8 data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white text-[#2E7D32] hover:text-[#2E7D32] hover:bg-[#E8F5E9]/80"
                  >
                    Hotspot {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>

              {hotspots.map((hotspot, index) => (
                <TabsContent key={hotspot.id} value={index.toString()} className="m-0 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-[#2E7D32]">Hotspot {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteHotspot(index)}
                      className="text-[#4CAF50] hover:bg-[#E8F5E9] hover:text-[#2E7D32]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#2E7D32]">Label</Label>
                    <Input
                      value={hotspot.label}
                      onChange={(e) => updateHotspot(index, "label", e.target.value)}
                      placeholder="Hotspot label"
                      className="border-[#4CAF50] focus:ring-[#4CAF50] focus:border-[#4CAF50] text-[#2E7D32] placeholder-[#4CAF50]/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#2E7D32]">Content</Label>
                    <Textarea
                      value={hotspot.content}
                      onChange={(e) => updateHotspot(index, "content", e.target.value)}
                      placeholder="Hotspot content"
                      rows={3}
                      className="border-[#4CAF50] focus:ring-[#4CAF50] focus:border-[#4CAF50] text-[#2E7D32] placeholder-[#4CAF50]/50"
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
