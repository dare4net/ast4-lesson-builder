"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { useDrop } from "react-dnd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Settings,
  ListTree,
  AlertTriangle,
  XCircle,
  Pencil
} from "lucide-react";
import type { Slide, Component } from "@/types/lesson";
import { ComponentRenderer } from "@/components/component-renderer";
import { cn } from "@/lib/utils";
import { useFeedback } from "@/lib/feedback-context";
import { SlideEditModal } from "./slide-edit-modal";
import { ComponentTreeModal } from "@/components/builder/component-tree-modal";
import { validateSingleComponent } from "@/lib/validation/registry";
import { ComponentValidationResult } from "@/lib/validation/types";
import { VerificationModal } from "@/components/builder/verification-modal";

interface SlideEditorProps {
  slide: Slide;
  updateSlide: (slide: Slide) => Promise<void>;
  deleteSlide: (index: number) => Promise<void>;
  slideIndex: number;
  onSelectComponent: (componentId: string) => void;
  selectedComponentId: string | null;
  className?: string;
  onOpenLibrary?: () => void;
  onAddLibraryComponent?: (type: string, defaultProps: Record<string, any>) => Promise<void>;
}

// Lightweight Stage Component Card (No DnD handles on stage canvas!)
function StageComponentCard({
  component,
  isSelected,
  onSelect,
  onDelete
}: {
  component: Component;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // Validation audit
  const validationResult: ComponentValidationResult = validateSingleComponent(component as any);
  const errors = validationResult.errors || [];
  const warnings = validationResult.warnings || [];
  const isValid = validationResult.isValid;

  return (
    <>
      <div
        id={component.id}
        className={cn(
          "relative group rounded-2xl px-1 sm:px-2 py-2 transition-colors duration-200",
          isSelected
            ? "bg-emerald-50/70 ring-1 ring-[#58CC02]/40"
            : "hover:bg-slate-50",
          !isValid && "ring-1 ring-rose-300 bg-rose-50/40"
        )}
      >
        <div className="flex items-center justify-end mb-1">
          <div className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-white p-0.5 shadow-sm">
          {(!isValid || warnings.length > 0) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsVerificationModalOpen(true);
            }}
            className={cn(
              "h-8 w-8 rounded-full",
              isValid ? "text-amber-600 hover:bg-amber-50" : "text-rose-600 hover:bg-rose-50"
            )}
            title="View verification details"
          >
            {isValid ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
          </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="h-8 w-8 rounded-full text-slate-500 hover:text-[#58CC02] hover:bg-emerald-50"
            title="Edit component"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-8 w-8 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50"
            title="Delete Component"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          </div>
        </div>

        <ComponentRenderer component={component} isEditing={true} />
      </div>

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        title={`Component Audit: ${component.type} (${component.id})`}
        result={validationResult}
      />
    </>
  );
}

export function SlideEditor({
  slide,
  updateSlide,
  deleteSlide,
  slideIndex,
  onSelectComponent,
  selectedComponentId,
  className,
  onOpenLibrary,
  onAddLibraryComponent,
}: SlideEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [isSlideEditOpen, setIsSlideEditOpen] = useState(false);
  const [isTreeModalOpen, setIsTreeModalOpen] = useState(false);
  const { playFeedback } = useFeedback();

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "COMPONENT",
    drop: (item: { type: string; defaultProps?: Record<string, any> }) => {
      void onAddLibraryComponent?.(item.type, item.defaultProps || {});
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [onAddLibraryComponent]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTitleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updateSlide({ ...slide, title: e.target.value });
  }, [slide, updateSlide]);

  const handleDeleteClick = useCallback(async () => {
    await deleteSlide(slideIndex);
    await playFeedback("click");
  }, [deleteSlide, slideIndex, playFeedback]);

  const moveComponent = useCallback(
    async (dragIndex: number, hoverIndex: number) => {
      const newComponents = [...slide.components];
      const dragComponent = newComponents[dragIndex];
      newComponents.splice(dragIndex, 1);
      newComponents.splice(hoverIndex, 0, dragComponent);
      await updateSlide({ ...slide, components: newComponents });
      await playFeedback("click");
    },
    [slide, updateSlide, playFeedback]
  );

  const deleteComponent = useCallback(
    async (id: string) => {
      const newComponents = slide.components.filter(c => c.id !== id);
      await updateSlide({ ...slide, components: newComponents });
      await playFeedback("click");
    },
    [slide, updateSlide, playFeedback]
  );

  const handleSlideEdit = useCallback(async () => {
    setIsSlideEditOpen(true);
    await playFeedback("click", { animation: false });
  }, [playFeedback]);

  const handleSlideEditSave = useCallback(async (updatedSlide: Slide) => {
    await updateSlide(updatedSlide);
    setIsSlideEditOpen(false);
    await playFeedback("click");
  }, [updateSlide, playFeedback]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      ref={dropRef as unknown as React.RefObject<HTMLDivElement>}
      className={cn(
        "flex flex-1 overflow-hidden bg-white shadow-2xl relative transition-colors duration-200",
        isOver && "ring-4 ring-emerald-400/60 ring-inset bg-emerald-50/40",
        className
      )}
    >
      <ScrollArea className="flex-1 max-w-full overflow-x-hidden">
        <div className="px-4 sm:px-8 py-5 sm:py-8 space-y-8 w-full">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-1 min-w-0">
              <Input
                placeholder="Untitled slide"
                value={slide.title || ""}
                onChange={handleTitleChange}
                className="text-2xl sm:text-3xl font-semibold bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto placeholder:text-slate-300 text-slate-900 tracking-tight min-w-0 w-full"
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsTreeModalOpen(true)}
                className="h-9 w-9 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                title="Reorder blocks"
              >
                <ListTree className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleSlideEdit}
                className="h-9 w-9 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                title="Slide settings"
              >
                <Settings className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                onClick={handleDeleteClick}
                title="Delete slide"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {slide.components.map((component) => (
              <StageComponentCard
                key={component.id}
                component={component}
                isSelected={selectedComponentId === component.id}
                onSelect={() => onSelectComponent(component.id)}
                onDelete={() => deleteComponent(component.id)}
              />
            ))}
          </div>

          {/* Empty State */}
          {slide.components.length === 0 && (
            <button
              type="button"
              onClick={() => onOpenLibrary?.()}
              className="w-full flex flex-col items-center justify-center py-20 sm:py-28 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 hover:border-[#58CC02]/40 hover:bg-emerald-50/40 transition-colors"
            >
              <p className="text-sm font-medium text-slate-500">This slide is empty</p>
              <p className="text-sm text-slate-400 mt-1">Open the library to add a block</p>
            </button>
          )}
        </div>
      </ScrollArea>

      {/* Component Tree Reordering Modal */}
      <ComponentTreeModal
        isOpen={isTreeModalOpen}
        onClose={() => setIsTreeModalOpen(false)}
        slideTitle={slide.title || "Current Slide"}
        components={slide.components}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
        moveComponent={moveComponent}
        onDeleteComponent={deleteComponent}
      />

      <SlideEditModal
        slide={slide}
        isOpen={isSlideEditOpen}
        onClose={() => setIsSlideEditOpen(false)}
        onSave={handleSlideEditSave}
      />
    </div>
  );
}
