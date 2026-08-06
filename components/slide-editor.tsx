"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Settings,
  LayoutGrid,
  ListTree,
  CheckCircle2,
  AlertTriangle,
  XCircle
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
        onClick={onSelect}
        className={cn(
          "relative group border rounded-2xl p-6 transition-all duration-200 bg-white/70 backdrop-blur-sm shadow-sm cursor-pointer",
          isSelected
            ? "ring-4 ring-emerald-500 ring-offset-4 ring-offset-white scale-[1.01] shadow-2xl z-10 border-emerald-400"
            : "hover:scale-[1.005] hover:border-emerald-300 border-slate-200",
          !isValid && "border-rose-400 bg-rose-50/10"
        )}
      >
        {/* Header Badges & 1-Click Delete */}
        <div className="absolute right-4 top-4 flex items-center gap-2 z-20">
          {/* Status Badge */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsVerificationModalOpen(true);
            }}
            className={cn(
              "h-7 px-2.5 rounded-lg font-medium text-[11px] flex items-center gap-1.5 transition-all border shadow-xs",
              isValid
                ? warnings.length === 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
            )}
            title="View Verification Senate Details"
          >
            {isValid ? (
              warnings.length === 0 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Valid</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{warnings.length} Warn</span>
                </>
              )
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span>{errors.length} Error{errors.length > 1 ? "s" : ""}</span>
              </>
            )}
          </Button>

          {/* 1-Click Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
            title="Delete Component"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <ComponentRenderer component={component} isEditing={true} onClick={onSelect} />
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
  className
}: SlideEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [isSlideEditOpen, setIsSlideEditOpen] = useState(false);
  const [isTreeModalOpen, setIsTreeModalOpen] = useState(false);
  const { playFeedback } = useFeedback();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTitleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updateSlide({ ...slide, title: e.target.value });
    await playFeedback("click", { animation: false });
  }, [slide, updateSlide, playFeedback]);

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
    <div className={cn("flex flex-1 overflow-hidden bg-white shadow-2xl relative", className)}>
      <ScrollArea className="flex-1">
        <div className="p-10 space-y-8 max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center gap-6 border-b border-slate-100 pb-6 group/header">
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.15em]">Slide Title</span>
              <Input
                placeholder="Enter slide title..."
                value={slide.title || ""}
                onChange={handleTitleChange}
                className="text-3xl font-bold bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto placeholder:text-slate-300 text-slate-900 tracking-tight"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTreeModalOpen(true)}
                className="h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all shadow-2xs"
                title="Open Component Re-ordering Modal"
              >
                <ListTree className="w-4 h-4 text-emerald-600" />
                <span>Re-order Components</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleSlideEdit}
                className="h-9 w-9 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all"
                title="Slide Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                onClick={handleDeleteClick}
                title="Delete Slide"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Components Stage Area */}
          <div className="space-y-6">
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
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 group/empty hover:border-emerald-100 transition-colors">
              <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center mb-6 group-hover/empty:scale-110 transition-transform">
                <LayoutGrid className="h-8 w-8 text-slate-200 group-hover/empty:text-emerald-400 transition-colors" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Empty Slide</p>
              <p className="text-slate-400 text-xs mt-2 font-medium">Add components from the Component Library to build your lesson slide.</p>
            </div>
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
