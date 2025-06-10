"use client"

import { useState, useCallback } from "react"
import { useDrag } from "react-dnd"
import { Search, X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { componentDefinitions } from "@/lib/component-definitions"
import type { ComponentCategory, ComponentDefinition } from "@/types/lesson"
import { cn } from "@/lib/utils"
import type { ConnectDragSource } from 'react-dnd'
import { useFeedback } from "@/lib/feedback-context"

interface ComponentLibraryProps {
  addComponent: (type: string, defaultProps: Record<string, any>) => Promise<void>;
}

export function ComponentLibrary({ addComponent }: ComponentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | "all">("all")
  const { playFeedback } = useFeedback()

  const handleTabChange = useCallback(async (value: string) => {
    setActiveCategory(value as ComponentCategory | "all")
    await playFeedback('click', { animation: false })
  }, [playFeedback])

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const filteredComponents = componentDefinitions.filter((component) => {
    const matchesSearch =
      component.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = activeCategory === "all" || component.category === activeCategory

    return matchesSearch && matchesCategory
  })

  const renderComponents = useCallback((components: typeof componentDefinitions) => {
    return components.map((component) => (
      <DraggableComponent
                          key={component.type}
                          component={component}
        addComponent={addComponent}
      />
    ))
  }, [addComponent])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex-shrink-0">
        <h2 className="font-semibold mb-2">Components</h2>
        <div className="relative w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8 w-full text-sm"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeCategory} onValueChange={handleTabChange} className="flex flex-col h-full">
          <TabsList className="grid grid-cols-4 h-auto p-1 mx-2 mt-2 flex-shrink-0">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="interactive">Interactive</TabsTrigger>
            <TabsTrigger value="gamified">Gamified</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="all" className="h-full p-0 m-0 data-[state=active]:flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-4 grid gap-2 max-w-[280px] mx-auto">
                  {renderComponents(filteredComponents)}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="content" className="h-full p-0 m-0 data-[state=active]:flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-4 grid gap-2 max-w-[280px] mx-auto">
                  {renderComponents(filteredComponents.filter(c => c.category === "content"))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="interactive" className="h-full p-0 m-0 data-[state=active]:flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-4 grid gap-2 max-w-[280px] mx-auto">
                  {renderComponents(filteredComponents.filter(c => c.category === "interactive"))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="gamified" className="h-full p-0 m-0 data-[state=active]:flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-4 grid gap-2 max-w-[280px] mx-auto">
                  {renderComponents(filteredComponents.filter(c => c.category === "gamified"))}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

interface ComponentProps {
  component: ComponentDefinition;
  addComponent: (type: string, defaultProps: Record<string, any>) => Promise<void>;
}

function DraggableComponent({ component, addComponent }: ComponentProps) {
  const { playFeedback } = useFeedback()
  
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "COMPONENT",
    item: { type: component.type, defaultProps: component.defaultProps },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [component]);

  const handleClick = async () => {
    await addComponent(component.type, component.defaultProps);
    await playFeedback('click');
  };

  return (
    <div
      ref={dragRef as unknown as React.RefObject<HTMLDivElement>}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
      onClick={handleClick}
    >
      <Button
        variant="outline"
        className="w-full justify-start flex-col items-start gap-1 h-auto py-2"
      >
        <div className="flex items-center gap-2 w-full">
          <span className="text-lg">{component.icon}</span>
          <span className="font-medium">{component.label}</span>
        </div>
        <p className="text-xs text-muted-foreground w-full line-clamp-1 text-left">
          {component.description}
        </p>
      </Button>
    </div>
  );
}
