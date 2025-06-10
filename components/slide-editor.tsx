"use client"

import React, { useRef, useCallback, useEffect } from "react"
import { useState } from "react"
import { useDrop, useDrag, DropTargetMonitor, ConnectDragSource, ConnectDropTarget } from "react-dnd"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, GripVertical, Settings } from "lucide-react"
import type { Slide, Component } from "@/types/lesson"
import { ComponentRenderer } from "@/components/component-renderer"
import { ComponentEditor } from "@/components/component-editor"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { XYCoord } from 'react-dnd'
import dynamic from "next/dynamic"
import { useFeedback } from "@/lib/feedback-context"

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
  className?: string;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

// Helper function to generate stable IDs
const generateStableId = (prefix: string, index: number) => `${prefix}-${index}`;

export function SlideEditor({ slide, updateSlide, deleteSlide, slideIndex, className }: SlideEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);
  const [isComponentEditorOpen, setIsComponentEditorOpen] = useState(false);
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

  const handleComponentClick = useCallback(async (componentId: string) => {
    setEditingComponentId(componentId);
    setIsComponentEditorOpen(true);
    await playFeedback('click', { animation: false });
  }, [playFeedback]);

  const handleComponentUpdate = useCallback(async (props: Record<string, any>) => {
    if (!editingComponentId) return;
    
    const newComponents = slide.components.map(c =>
      c.id === editingComponentId ? { ...c, props } : c
    );
    await updateSlide({ ...slide, components: newComponents });
    await playFeedback('click', { animation: false });
  }, [editingComponentId, slide, updateSlide, playFeedback]);

  const handleEditorClose = useCallback(async () => {
    setEditingComponentId(null);
    setIsComponentEditorOpen(false);
    await playFeedback('click', { animation: false });
  }, [playFeedback]);

  const editingComponent = editingComponentId 
    ? slide.components.find(c => c.id === editingComponentId)
    : null;

  if (!mounted) {
    return null; // Return null on server-side and first render
  }

    return (
    <div className={cn("flex flex-1 overflow-hidden", className)}>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Enter slide title..."
              value={slide.title}
              onChange={handleTitleChange}
              className="text-lg font-semibold flex-1"
            />
            <Button 
              variant="ghost"
              size="icon"
              className="hover:bg-destructive/90 hover:text-destructive-foreground"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {slide.components.map((component, index) => (
                    <DraggableComponent
                      key={component.id}
                      component={component}
                      index={index}
                      moveComponent={moveComponent}
              onDelete={() => deleteComponent(component.id)}
              onClick={() => handleComponentClick(component.id)}
              id={component.id}
                    />
                  ))}
                </div>
            </ScrollArea>

      {editingComponent && (
        <Sheet 
          open={isComponentEditorOpen} 
          onOpenChange={setIsComponentEditorOpen}
        >
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Edit Component</SheetTitle>
            </SheetHeader>
              <ComponentEditor
              component={editingComponent}
              updateComponent={handleComponentUpdate}
              onClose={handleEditorClose}
              />
            </SheetContent>
          </Sheet>
        )}
      </div>
  );
}
