"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

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
  points?: number
  scoreContext?: {
    score: number
    totalPossible: number
    addPoints: (points: number) => void
  }
  mode?: 'practice' | 'live'
  state?: 'active' | 'disabled'
  disabled?: boolean
  savedState?: {
    discoveredHotspots: string[]
    status?: 'active' | 'completed'
  }
  setComponentState?: (state: any) => void
}

export function HotspotRenderer({
  title = "Interactive Image",
  image,
  hotspots = [],
  isEditing = false,
  points = 10,
  scoreContext,
  mode = 'practice',
  state = 'active',
  disabled = false,
  savedState,
  setComponentState,
}: HotspotRendererProps) {
  const [mounted, setMounted] = useState(false)
  const [discoveredHotspots, setDiscoveredHotspots] = useState<string[]>(() => 
    savedState?.discoveredHotspots ?? []
  )
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const isDisabled = disabled || state === 'disabled'
  const isLiveMode = mode === 'live'

  // Debug logs
  useEffect(() => {
    console.log('Hotspot Mode:', mode);
    console.log('Is Live Mode:', isLiveMode);
    console.log('Saved State:', savedState);
  }, [mode, isLiveMode, savedState]);

  // Initialize state on mount
  useEffect(() => {
    setMounted(true)
    if (!savedState && setComponentState) {
      // Persist initial state
      setComponentState({
        discoveredHotspots: [],
        status: 'active'
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist state changes
  useEffect(() => {
    if (!mounted) return
    if (setComponentState) {
      const allDiscovered = discoveredHotspots.length === hotspots.length
      setComponentState({
        discoveredHotspots,
        status: isLiveMode || allDiscovered ? 'completed' : 'active'
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discoveredHotspots])

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
    if (isDisabled || discoveredHotspots.includes(hotspotId)) return

    const newDiscovered = [...discoveredHotspots, hotspotId]
    setDiscoveredHotspots(newDiscovered)

    const allDiscovered = newDiscovered.length === hotspots.length
    
    // Award points in live mode when all hotspots are discovered
    if (allDiscovered && isLiveMode && scoreContext) {
      scoreContext.addPoints(points)
    }
  }

  const resetDiscovery = () => {
    if (isDisabled || (isLiveMode && discoveredHotspots.length === hotspots.length)) return
    
    setDiscoveredHotspots([])
    setComponentState?.({
      discoveredHotspots: [],
      status: 'active'
    })
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
    <Card className={cn(
      isDisabled && "opacity-75",
      isLiveMode && "border-blue-500"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {isLiveMode && (
            <div className="flex items-center gap-2 text-sm text-blue-500">
              <span>Live Mode</span>
            </div>
          )}
        </div>
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
                          ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#4CAF50]"
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

        <div className="mt-4 space-y-4">
          {/* Status display */}
          {discoveredHotspots.length === hotspots.length ? (
            <div className="p-4 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" />
              <p className="font-medium">You Rock! 🎉 All hotspots discovered!</p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm">
                Discovered: {discoveredHotspots.length} of {hotspots.length} hotspots
              </p>
              {isDisabled && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Locked</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={resetDiscovery}
          disabled={isDisabled || (isLiveMode && discoveredHotspots.length === hotspots.length)}
        >
          Reset
        </Button>
        {points > 0 && (
          <div className={cn(
            "text-sm",
            isLiveMode ? "text-blue-500" : "text-muted-foreground"
          )}>
            Points: {points}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
