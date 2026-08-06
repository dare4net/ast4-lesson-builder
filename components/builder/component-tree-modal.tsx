"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ListTree, Sparkles } from "lucide-react";
import type { Component } from "@/types/lesson";
import { ComponentTree } from "@/components/component-tree";

interface ComponentTreeModalProps {
    isOpen: boolean;
    onClose: () => void;
    slideTitle?: string;
    components: Component[];
    selectedComponentId: string | null;
    onSelectComponent: (id: string) => void;
    moveComponent: (dragIndex: number, hoverIndex: number) => void;
    onDeleteComponent: (id: string) => void;
}

export function ComponentTreeModal({
    isOpen,
    onClose,
    slideTitle = "Current Slide",
    components,
    selectedComponentId,
    onSelectComponent,
    moveComponent,
    onDeleteComponent
}: ComponentTreeModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl bg-slate-900 border-slate-800 text-slate-100 shadow-2xl rounded-2xl p-6">
                <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                            <ListTree className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                <span>Slide Component Tree</span>
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-400">
                                Drag handles to re-order components on <span className="text-emerald-300 font-semibold">"{slideTitle}"</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="my-4 max-h-[60vh] overflow-y-auto pr-1">
                    <ComponentTree
                        components={components}
                        selectedComponentId={selectedComponentId}
                        onSelectComponent={(id) => {
                            onSelectComponent(id);
                            onClose(); // Automatically open inspector & close modal
                        }}
                        moveComponent={moveComponent}
                        onDeleteComponent={onDeleteComponent}
                    />
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                    <Button
                        onClick={onClose}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs px-6"
                    >
                        Done Reordering
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
