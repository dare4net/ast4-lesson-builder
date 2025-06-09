"use client"

import { useState } from "react"
import { useDrag } from "react-dnd"
import { Search, X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { componentDefinitions } from "@/lib/component-definitions"
import type { ComponentCategory } from "@/types/lesson"

interface ComponentLibraryProps {
  isMobile?: boolean
  onAddComponent?: (type: string, defaultProps: Record<string, any>) => void
}

export function ComponentLibrary({ isMobile = false, onAddComponent }: ComponentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | "all">("all")

  const filteredComponents = componentDefinitions.filter((component) => {
    const matchesSearch =
      component.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = activeCategory === "all" || component.category === activeCategory

    return matchesSearch && matchesCategory
  })

  // Mobile UI
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Components</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              document.querySelector('[data-state="open"]')?.dispatchEvent(new Event("close", { bubbles: true }))
            }
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="all" className="h-full flex flex-col">
            <TabsList className="grid grid-cols-4 h-auto p-1 mx-2 mt-2">
              <TabsTrigger value="all" onClick={() => setActiveCategory("all")}>
                All
              </TabsTrigger>
              <TabsTrigger value="content" onClick={() => setActiveCategory("content")}>
                Content
              </TabsTrigger>
              <TabsTrigger value="interactive" onClick={() => setActiveCategory("interactive")}>
                Interactive
              </TabsTrigger>
              <TabsTrigger value="gamified" onClick={() => setActiveCategory("gamified")}>
                Gamified
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="all" className="h-full p-0 m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 grid gap-2">
                    {filteredComponents.map((component) => (
                      <ClickableComponent key={component.type} component={component} onAddComponent={onAddComponent} />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="content" className="h-full p-0 m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 grid gap-2">
                    {filteredComponents
                      .filter((c) => c.category === "content")
                      .map((component) => (
                        <ClickableComponent
                          key={component.type}
                          component={component}
                          onAddComponent={onAddComponent}
                        />
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="interactive" className="h-full p-0 m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 grid gap-2">
                    {filteredComponents
                      .filter((c) => c.category === "interactive")
                      .map((component) => (
                        <ClickableComponent
                          key={component.type}
                          component={component}
                          onAddComponent={onAddComponent}
                        />
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="gamified" className="h-full p-0 m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 grid gap-2">
                    {filteredComponents
                      .filter((c) => c.category === "gamified")
                      .map((component) => (
                        <ClickableComponent
                          key={component.type}
                          component={component}
                          onAddComponent={onAddComponent}
                        />
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    )
  }

  // Desktop UI
  return (
    <div className="w-64 border-r bg-background flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold mb-2">Components</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="all" className="h-full flex flex-col">
          <TabsList className="grid grid-cols-4 h-auto p-1 mx-2 mt-2">
            <TabsTrigger value="all" onClick={() => setActiveCategory("all")}>
              All
            </TabsTrigger>
            <TabsTrigger value="content" onClick={() => setActiveCategory("content")}>
              Content
            </TabsTrigger>
            <TabsTrigger value="interactive" onClick={() => setActiveCategory("interactive")}>
              Interactive
            </TabsTrigger>
            <TabsTrigger value="gamified" onClick={() => setActiveCategory("gamified")}>
              Gamified
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="all" className="h-full p-0 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 grid gap-2">
                  {filteredComponents.map((component) => (
                    <DraggableComponent key={component.type} component={component} onAddComponent={onAddComponent} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="content" className="h-full p-0 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 grid gap-2">
                  {filteredComponents
                    .filter((c) => c.category === "content")
                    .map((component) => (
                      <DraggableComponent key={component.type} component={component} onAddComponent={onAddComponent} />
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="interactive" className="h-full p-0 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 grid gap-2">
                  {filteredComponents
                    .filter((c) => c.category === "interactive")
                    .map((component) => (
                      <DraggableComponent key={component.type} component={component} onAddComponent={onAddComponent} />
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="gamified" className="h-full p-0 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 grid gap-2">
                  {filteredComponents
                    .filter((c) => c.category === "gamified")
                    .map((component) => (
                      <DraggableComponent key={component.type} component={component} onAddComponent={onAddComponent} />
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

// Clickable component for mobile
function ClickableComponent({ component, onAddComponent }) {
  const handleAddClick = () => {
    if (onAddComponent) {
      onAddComponent(component.type, component.defaultProps)
    }
  }

  return (
    <div className="p-3 border rounded-md bg-card hover:border-primary transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{component.icon}</span>
          <div>
            <h3 className="text-sm font-medium">{component.label}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{component.description}</p>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={handleAddClick} className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Draggable component for desktop
function DraggableComponent({ component, onAddComponent }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "COMPONENT",
    item: {
      type: component.type,
      defaultProps: component.defaultProps,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult()
      if (item && dropResult) {
        console.log(`Dropped ${component.type} onto ${dropResult.addedTo}`)
      }
    },
  }))

  const handleClick = () => {
    if (onAddComponent) {
      onAddComponent(component.type, component.defaultProps)
    }
  }

  return (
    <div
      ref={drag}
      className={`p-3 border rounded-md cursor-pointer bg-card hover:border-primary transition-colors group ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{component.icon}</span>
          <div>
            <h3 className="text-sm font-medium">{component.label}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{component.description}</p>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        Click to add or drag to place
      </div>
    </div>
  )
}
