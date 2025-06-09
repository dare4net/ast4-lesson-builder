"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Hotspot {
  id: string
  x: number
  y: number
  label: string
  content: string
}

interface HotspotRendererProps {
  title?: string
  image: string
  hotspots: Hotspot[]
  isEditing?: boolean
}

export function HotspotRenderer({
  title = "Interactive Image",
  image,
  hotspots = [],
  isEditing = false,
}: HotspotRendererProps) {
  const [discoveredHotspots, setDiscoveredHotspots] = useState<string[]>([])
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate image dimensions when it loads
  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      updateImageSize()
    }
  }, [image])

  const updateImageSize = () => {
    if (imageRef.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth
      const imgWidth = imageRef.current.naturalWidth
      const imgHeight = imageRef.current.naturalHeight

      // Calculate the scaled height based on the container width
      const scaledHeight = (containerWidth / imgWidth) * imgHeight

      setImageSize({
        width: containerWidth,
        height: scaledHeight,
      })
    }
  }

  const handleHotspotClick = (hotspotId: string) => {
    if (!discoveredHotspots.includes(hotspotId)) {
      setDiscoveredHotspots([...discoveredHotspots, hotspotId])
    }
  }

  const resetDiscovery = () => {
    setDiscoveredHotspots([])
  }

  // In editing mode, show a simplified version
  if (isEditing) {
    return (
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="relative">
          <img
            src={image || "/placeholder.svg?height=300&width=400"}
            alt={title}
            className="w-full h-auto rounded-md"
          />
          {hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className="absolute w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs"
              style={{
                left: `${hotspot.x * 100}%`,
                top: `${hotspot.y * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {hotspots.indexOf(hotspot) + 1}
            </div>
          ))}
        </div>
        {hotspots.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            {hotspots.length} hotspot{hotspots.length !== 1 ? "s" : ""} defined
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" ref={containerRef}>
          <img
            ref={imageRef}
            src={image || "/placeholder.svg?height=300&width=400"}
            alt={title}
            className="w-full h-auto rounded-md"
            onLoad={updateImageSize}
          />

          <TooltipProvider>
            {hotspots.map((hotspot) => {
              const isDiscovered = discoveredHotspots.includes(hotspot.id)

              return (
                <Tooltip key={hotspot.id}>
                  <TooltipTrigger asChild>
                    <button
                      className={`absolute w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isDiscovered
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/20 hover:bg-primary/40 text-primary"
                      }`}
                      style={{
                        left: `${hotspot.x * 100}%`,
                        top: `${hotspot.y * 100}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onClick={() => handleHotspotClick(hotspot.id)}
                    >
                      {hotspots.indexOf(hotspot) + 1}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="max-w-xs">
                      <p className="font-medium">{hotspot.label}</p>
                      <p className="text-sm">{hotspot.content}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </div>

        <div className="mt-4">
          <p className="text-sm">
            Discovered: {discoveredHotspots.length} of {hotspots.length} hotspots
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={resetDiscovery}>
          Reset
        </Button>
      </CardFooter>
    </Card>
  )
}
