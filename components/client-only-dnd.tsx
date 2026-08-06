"use client";

import { useRef, useState, useEffect } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import type { XYCoord } from 'react-dnd';
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComponentRenderer } from "@/components/component-renderer";
import type { Component } from "@/types/lesson";
import { DragDropContext, DragDropContextProps } from '@hello-pangea/dnd';
import { validateSingleComponent } from '@/lib/validation/registry';
import { ComponentValidationResult } from '@/lib/validation/types';
import { VerificationModal } from '@/components/builder/verification-modal';

interface DragItem {
  index: number;
  id: string;
  type: string;
}

interface DraggableComponentProps {
  component: Component;
  index: number;
  moveComponent: (dragIndex: number, hoverIndex: number) => void;
  onDelete: () => void;
  onClick: () => void;
  id: string;
}

export function DraggableComponent({
  component,
  index,
  moveComponent,
  onDelete,
  onClick,
  id
}: DraggableComponentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // Compute validation status for component
  const validationResult: ComponentValidationResult = validateSingleComponent(component as any);
  const errors = validationResult.errors || [];
  const warnings = validationResult.warnings || [];
  const isValid = validationResult.isValid;

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: 'COMPONENT',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor<DragItem>) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveComponent(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: 'COMPONENT',
    item: () => ({ id, index, type: 'COMPONENT' }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Initialize drag and drop
  drag(drop(ref));

  return (
    <>
      <div
        ref={ref}
        id={id}
        className={cn(
          "relative group border rounded-xl p-4 transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm",
          isValid
            ? warnings.length > 0
              ? "hover:border-amber-400/80 border-slate-200"
              : "hover:border-emerald-400/80 border-slate-200"
            : "border-rose-400/80 hover:border-rose-500",
          isDragging && "opacity-50 cursor-move"
        )}
        onClick={onClick}
        data-handler-id={handlerId}
      >
        {/* Header Action Buttons (1-Click Delete & Verification Status Badge) */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 z-20">
          {/* Verification Badge */}
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
            title="Click to view Verification Senate Details"
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

          {/* 1-Click Accessible Delete Button */}
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

        <ComponentRenderer component={component} isEditing={true} onClick={onClick} />
      </div>

      {/* Component Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        title={`Component Audit: ${component.type} (${component.id})`}
        result={validationResult}
      />
    </>
  );
}

export function ClientOnlyDragDropContext(props: DragDropContextProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <DragDropContext {...props} />;
}