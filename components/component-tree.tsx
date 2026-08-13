"use client";

import React, { useRef, useState } from "react";
import { useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import type { XYCoord } from "react-dnd";
import { Button } from "@/components/ui/button";
import {
    GripVertical,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Heading,
    AlignLeft,
    List,
    Image as ImageIcon,
    Table as TableIcon,
    Video,
    HelpCircle,
    Layers,
    Move,
    FileQuestion,
    Sparkles,
    Code,
    PieChart,
    Grid
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Component, ComponentType } from "@/types/lesson";
import { resolveHotspotComponentProps } from "@/lib/hotspot-utils";
import { validateSingleComponent } from "@/lib/validation/registry";
import { ComponentValidationResult } from "@/lib/validation/types";
import { VerificationModal } from "@/components/builder/verification-modal";

interface TreeDragItem {
    index: number;
    id: string;
    type: string;
}

interface ComponentTreeProps {
    components: Component[];
    selectedComponentId: string | null;
    onSelectComponent: (id: string) => void;
    moveComponent: (dragIndex: number, hoverIndex: number) => void;
    onDeleteComponent: (id: string) => void;
}

// Icon helper for component types
function getComponentIcon(type: ComponentType) {
    switch (type) {
        case "heading":
            return <Heading className="w-4 h-4 text-emerald-400" />;
        case "paragraph":
            return <AlignLeft className="w-4 h-4 text-slate-400" />;
        case "bulletList":
            return <List className="w-4 h-4 text-emerald-400" />;
        case "image":
            return <ImageIcon className="w-4 h-4 text-sky-400" />;
        case "table":
            return <TableIcon className="w-4 h-4 text-slate-400" />;
        case "video":
            return <Video className="w-4 h-4 text-rose-400" />;
        case "quiz":
            return <HelpCircle className="w-4 h-4 text-amber-400" />;
        case "matchingPairs":
            return <Layers className="w-4 h-4 text-purple-400" />;
        case "dragDrop":
            return <Move className="w-4 h-4 text-emerald-400" />;
        case "flashcards":
            return <Grid className="w-4 h-4 text-sky-400" />;
        case "hotspot":
            return <Sparkles className="w-4 h-4 text-amber-400" />;
        case "fillInTheBlank":
            return <FileQuestion className="w-4 h-4 text-indigo-400" />;
        case "codeEditor":
            return <Code className="w-4 h-4 text-emerald-400" />;
        case "poll":
            return <PieChart className="w-4 h-4 text-pink-400" />;
        default:
            return <Sparkles className="w-4 h-4 text-slate-400" />;
    }
}

// Helper to get descriptive label for a component
function getComponentLabel(component: Component): string {
    const props = component.type === "hotspot"
        ? resolveHotspotComponentProps(component)
        : (component.props || {});
    if (props.title) return props.title;
    if (props.content && typeof props.content === "string") {
        const clean = props.content.replace(/<[^>]*>?/gm, "").trim();
        if (clean) return clean.length > 25 ? clean.substring(0, 25) + "..." : clean;
    }
    if (props.question) return props.question;
    if (props.items && Array.isArray(props.items)) return `${component.type} (${props.items.length} items)`;
    if (props.questions && Array.isArray(props.questions)) return `${component.type} (${props.questions.length} questions)`;

    return component.type.replace(/([A-Z])/g, " $1").trim();
}

interface TreeItemProps {
    component: Component;
    index: number;
    isSelected: boolean;
    onSelect: () => void;
    moveComponent: (dragIndex: number, hoverIndex: number) => void;
    onDelete: () => void;
}

function TreeItem({
    component,
    index,
    isSelected,
    onSelect,
    moveComponent,
    onDelete
}: TreeItemProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Validation status
    const validationResult: ComponentValidationResult = validateSingleComponent(component as any);
    const errors = validationResult.errors || [];
    const warnings = validationResult.warnings || [];
    const isValid = validationResult.isValid;

    const [{ handlerId }, drop] = useDrop<TreeDragItem, void, { handlerId: string | symbol | null }>({
        accept: "TREE_COMPONENT",
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item: TreeDragItem, monitor: DropTargetMonitor<TreeDragItem>) {
            if (!ref.current) return;

            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;

            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

            moveComponent(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag<TreeDragItem, void, { isDragging: boolean }>({
        type: "TREE_COMPONENT",
        item: () => ({ id: component.id, index, type: "TREE_COMPONENT" }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    return (
        <>
            <div
                ref={ref}
                onClick={onSelect}
                data-handler-id={handlerId}
                className={cn(
                    "group flex items-center justify-between gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer select-none",
                    isSelected
                        ? "bg-emerald-500/10 border-emerald-500/50 text-white shadow-sm ring-1 ring-emerald-500/30"
                        : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900",
                    isDragging && "opacity-40 scale-95 border-dashed border-emerald-500"
                )}
            >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Drag Handle */}
                    <div
                        className="cursor-grab active:cursor-grabbing text-slate-600 group-hover:text-slate-400 p-0.5 hover:bg-slate-800 rounded transition-colors"
                        title="Drag to re-order"
                    >
                        <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Component Icon */}
                    <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60 flex-shrink-0">
                        {getComponentIcon(component.type)}
                    </div>

                    {/* Title / Label */}
                    <div className="truncate min-w-0 flex-1">
                        <span className="font-semibold text-slate-200 capitalize block truncate">
                            {getComponentLabel(component)}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                            {component.type}
                        </span>
                    </div>
                </div>

                {/* Status Badge & Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Verification Badge */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsModalOpen(true);
                        }}
                        className={cn(
                            "px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border transition-transform hover:scale-105",
                            isValid
                                ? warnings.length === 0
                                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                                    : "bg-amber-950/40 text-amber-400 border-amber-800/50"
                                : "bg-rose-950/40 text-rose-400 border-rose-800/50"
                        )}
                        title="Click to view verification report"
                    >
                        {isValid ? (
                            warnings.length === 0 ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                                <>
                                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                                    <span>{warnings.length}</span>
                                </>
                            )
                        ) : (
                            <>
                                <XCircle className="w-3 h-3 text-rose-400 animate-pulse" />
                                <span>{errors.length}</span>
                            </>
                        )}
                    </button>

                    {/* 1-Click Delete Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="h-6 w-6 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                        title="Delete component"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            <VerificationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Component Audit: ${component.type} (${component.id})`}
                result={validationResult}
            />
        </>
    );
}

export function ComponentTree({
    components,
    selectedComponentId,
    onSelectComponent,
    moveComponent,
    onDeleteComponent
}: ComponentTreeProps) {
    if (!components || components.length === 0) {
        return (
            <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                No components on this slide.
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1 pb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Slide Components ({components.length})
                </span>
                <span className="text-[10px] text-slate-600 italic">Drag handles to re-order</span>
            </div>
            {components.map((component, index) => (
                <TreeItem
                    key={component.id}
                    component={component}
                    index={index}
                    isSelected={selectedComponentId === component.id}
                    onSelect={() => onSelectComponent(component.id)}
                    moveComponent={moveComponent}
                    onDelete={() => onDeleteComponent(component.id)}
                />
            ))}
        </div>
    );
}
