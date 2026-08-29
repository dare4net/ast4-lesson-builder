"use client"

import { useEffect, useMemo, useState, useCallback, type ReactNode } from "react"
import { useDrag } from "react-dnd"
import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { componentDefinitions } from "@/lib/component-definitions"
import type { ComponentDefinition } from "@/types/lesson"
import { cn } from "@/lib/utils"
import { useFeedback } from "@/lib/feedback-context"
import {
  LIBRARY_FILTERS,
  LIBRARY_GROUPS,
  type LibraryFilterId,
} from "@/lib/component-library-groups"

interface ComponentLibraryProps {
  addComponent: (type: string, defaultProps: Record<string, any>) => Promise<void>;
  headerAction?: ReactNode;
}

const definitionByType = new Map(componentDefinitions.map((definition) => [definition.type as string, definition]))

export function ComponentLibrary({ addComponent, headerAction }: ComponentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<LibraryFilterId>("all")
  const [openGroups, setOpenGroups] = useState<string[]>(LIBRARY_GROUPS.map((group) => group.id))
  const { playFeedback } = useFeedback()

  const grouped = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return LIBRARY_GROUPS.map((group) => {
      const items = group.types
        .map((type) => definitionByType.get(type))
        .filter((definition): definition is ComponentDefinition => {
          if (!definition) return false
          if (activeFilter !== "all" && group.filter !== activeFilter) return false
          if (!query) return true
          return (
            definition.label.toLowerCase().includes(query) ||
            definition.description.toLowerCase().includes(query) ||
            definition.type.toLowerCase().includes(query) ||
            group.label.toLowerCase().includes(query)
          )
        })

      return { ...group, items }
    }).filter((group) => group.items.length > 0)
  }, [activeFilter, searchTerm])

  useEffect(() => {
    setOpenGroups(grouped.map((group) => group.id))
  }, [grouped])

  const handleFilter = useCallback(async (filter: LibraryFilterId) => {
    setActiveFilter(filter)
    await playFeedback("click", { animation: false })
  }, [playFeedback])

  const total = grouped.reduce((sum, group) => sum + group.items.length, 0)

  return (
    <div className="flex flex-col h-full w-full min-w-0 max-w-full overflow-x-hidden bg-[#0B1220]">
      <div className="p-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">Library</h2>
          {headerAction}
        </div>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <Input
            placeholder="Find a block..."
            className="pl-9 w-full bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-500 focus-visible:ring-[#58CC02]/40 h-9 text-sm"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {LIBRARY_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => void handleFilter(filter.id)}
              className={cn(
                "h-7 px-2.5 rounded-full text-[11px] font-semibold border transition-colors",
                activeFilter === filter.id
                  ? "bg-[#58CC02] border-[#58CC02] text-white"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 w-full min-w-0 overflow-x-hidden">
        {total === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">No blocks match that search.</p>
        ) : (
          <Accordion
            type="multiple"
            value={openGroups}
            onValueChange={setOpenGroups}
            className="px-2 py-2 w-full min-w-0 overflow-x-hidden"
          >
            {grouped.map((group) => (
              <AccordionItem
                key={group.id}
                value={group.id}
                className="border-white/10 w-full min-w-0 overflow-x-hidden"
              >
                <AccordionTrigger className="px-2 py-2.5 hover:no-underline text-left w-full min-w-0 gap-2 overflow-x-hidden whitespace-normal">
                  <div className="min-w-0 flex-1 overflow-x-hidden pr-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-semibold text-slate-200 break-words">{group.label}</span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white/5 rounded-full px-1.5 py-0.5 shrink-0">
                        {group.items.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5 break-words [overflow-wrap:anywhere]">
                      {group.description}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-2 pt-0 w-full min-w-0 overflow-x-hidden">
                  <div className="space-y-1 w-full min-w-0 overflow-x-hidden">
                    {group.items.map((component) => (
                      <DraggableComponent
                        key={component.type}
                        component={component}
                        addComponent={addComponent}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </ScrollArea>
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
        "cursor-grab active:cursor-grabbing group w-full min-w-0 max-w-full overflow-x-hidden",
        isDragging && "opacity-50"
      )}
      onClick={handleClick}
    >
      <div className="w-full min-w-0 max-w-full px-2 py-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors flex items-start gap-2 overflow-x-hidden">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-base shrink-0">
          {component.icon}
        </div>
        <div className="min-w-0 flex-1 overflow-x-hidden">
          <h4 className="text-sm font-medium text-slate-200 break-words [overflow-wrap:anywhere]">
            {component.label}
          </h4>
          <p className="text-[11px] leading-snug text-slate-500 break-words [overflow-wrap:anywhere]">
            {component.description}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full shrink-0 text-[#58CC02] hover:bg-[#58CC02]/15 hover:text-[#58CC02]"
          title={`Add ${component.label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
