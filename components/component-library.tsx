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
    <div className="flex flex-col h-full bg-[#1e293b]/10 backdrop-blur-sm">
      <div className="p-4 border-b border-slate-800 flex-shrink-0 bg-slate-900/40">
        <h2 className="font-semibold mb-4 text-emerald-400 uppercase tracking-wider text-xs">Components</h2>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search assets..."
            className="pl-10 w-full bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-emerald-500/50 h-10"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeCategory} onValueChange={handleTabChange} className="flex flex-col h-full">
          <TabsList className="flex h-auto p-1 mx-4 mt-4 bg-slate-950/50 border border-slate-800 rounded-lg">
            <TabsTrigger
              value="all"
              className="flex-1 text-[10px] uppercase font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="flex-1 text-[10px] uppercase font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              Docs
            </TabsTrigger>
            <TabsTrigger
              value="interactive"
              className="flex-1 text-[10px] uppercase font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              Labs
            </TabsTrigger>
            <TabsTrigger
              value="gamified"
              className="flex-1 text-[10px] uppercase font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              Play
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden mt-2">
            <TabsContent value="all" className="h-full p-0 m-0 data-[state=active]:flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-4 grid grid-cols-1 gap-3">
                  {renderComponents(filteredComponents)}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="content" className="h-full p-0 m-0 data-[state=active]:flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-4 grid grid-cols-1 gap-3">
                  {renderComponents(filteredComponents.filter(c => c.category === "content"))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="interactive" className="h-full p-0 m-0 data-[state=active]:flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-4 grid grid-cols-1 gap-3">
                  {renderComponents(filteredComponents.filter(c => c.category === "interactive"))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="gamified" className="h-full p-0 m-0 data-[state=active]:flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-4 grid grid-cols-1 gap-3">
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
        "cursor-grab active:cursor-grabbing group",
        isDragging && "opacity-50"
      )}
      onClick={handleClick}
    >
      <div className="w-full p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-200 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xl text-emerald-500 group-hover:scale-110 transition-transform duration-200">
            {component.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-200 truncate">{component.label}</h4>
            <p className="text-[10px] text-slate-500 truncate">{component.description}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
