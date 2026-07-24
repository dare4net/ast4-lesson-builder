"use client"

import * as React from "react"
import { useRef, useCallback, useEffect, useState } from "react"
import { useDrop, useDrag, DropTargetMonitor, ConnectDragSource, ConnectDropTarget } from "react-dnd"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, GripVertical, Settings, LayoutGrid } from "lucide-react"
import type { Slide, Component } from "@/types/lesson"
import { ComponentRenderer } from "@/components/component-renderer"
import { ComponentEditor } from "@/components/component-editor"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { XYCoord } from 'react-dnd'
import dynamic from "next/dynamic"
import { useFeedback } from "@/lib/feedback-context"
import { SlideEditModal } from "./slide-edit-modal"

// Import DraggableComponent dynamically to avoid SSR issues
const DraggableComponent = dynamic(
  () => import("@/components/client-only-dnd").then(mod => mod.DraggableComponent),
  { ssr: false }
)

interface SlideEditorProps {
  slide: Slide;
  updateSlide: (slide: Slide) => Promise<void>;
  deleteSlide: (index: number) => Promise<void>;
  slideIndex: number;
  onSelectComponent: (componentId: string) => void;
  selectedComponentId: string | null;
  className?: string;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

// Helper function to generate stable IDs
const generateStableId = (prefix: string, index: number) => `${prefix}-${index}`;

export function SlideEditor({
  slide,
  updateSlide,
  deleteSlide,
  slideIndex,
  onSelectComponent,
  selectedComponentId,
  className
}: SlideEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [isSlideEditOpen, setIsSlideEditOpen] = useState(false);
  const { playFeedback } = useFeedback();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTitleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updateSlide({ ...slide, title: e.target.value });
    await playFeedback('click', { animation: false });
  }, [slide, updateSlide, playFeedback]);

  const handleDeleteClick = useCallback(async () => {
    await deleteSlide(slideIndex);
    await playFeedback('click');
  }, [deleteSlide, slideIndex, playFeedback]);

  const moveComponent = useCallback(
    async (dragIndex: number, hoverIndex: number) => {
      const newComponents = [...slide.components];
      const dragComponent = newComponents[dragIndex];
      newComponents.splice(dragIndex, 1);
      newComponents.splice(hoverIndex, 0, dragComponent);
      await updateSlide({ ...slide, components: newComponents });
      await playFeedback('click');
    },
    [slide, updateSlide, playFeedback]
  );

  const deleteComponent = useCallback(
    async (id: string) => {
      const newComponents = slide.components.filter(c => c.id !== id);
      await updateSlide({ ...slide, components: newComponents });
      await playFeedback('click');
    },
    [slide, updateSlide, playFeedback]
  );

  const handleSlideEdit = useCallback(async () => {
    setIsSlideEditOpen(true);
    await playFeedback('click', { animation: false });
  }, [playFeedback]);

  const handleSlideEditSave = useCallback(async (updatedSlide: Slide) => {
    await updateSlide(updatedSlide);
    setIsSlideEditOpen(false);
    await playFeedback('click');
  }, [updateSlide, playFeedback]);

  if (!mounted) {
    return null; // Return null on server-side and first render
  }

  return (
    <div className={cn("flex flex-1 overflow-hidden bg-white shadow-2xl relative", className)}>
      <ScrollArea className="flex-1">
        <div className="p-12 space-y-8 max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center gap-6 border-b border-slate-100 pb-8 group/header">
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Scene Title</span>
              <Input
                placeholder="Enter scene title..."
                value={slide.title || ""}
                onChange={handleTitleChange}
                className="text-3xl font-black bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto placeholder:text-slate-200 text-slate-900 tracking-tight"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSlideEdit}
                className="h-10 w-10 rounded-full text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Components Area */}
          <div className="space-y-6">
            {slide.components.map((component, index) => (
              <div
                key={component.id}
                className={cn(
                  "transition-all duration-300 transform",
                  selectedComponentId === component.id ? "ring-4 ring-emerald-500 ring-offset-4 ring-offset-white rounded-2xl scale-[1.01] shadow-2xl z-10" : "hover:scale-[1.005]"
                )}
              >
                <DraggableComponent
                  component={component}
                  index={index}
                  moveComponent={moveComponent}
                  onDelete={() => deleteComponent(component.id)}
                  onClick={() => onSelectComponent(component.id)}
                  id={component.id}
                />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {slide.components.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 group/empty hover:border-emerald-100 transition-colors">
              <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center mb-6 group-hover/empty:scale-110 transition-transform">
                <LayoutGrid className="h-8 w-8 text-slate-200 group-hover/empty:text-emerald-400 transition-colors" />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Stage Empty</p>
              <p className="text-slate-300 text-[10px] mt-2 font-bold">Inject components from the Studio Library</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <SlideEditModal
        slide={slide}
        isOpen={isSlideEditOpen}
        onClose={() => setIsSlideEditOpen(false)}
        onSave={handleSlideEditSave}
      />
    </div>
  );
}
