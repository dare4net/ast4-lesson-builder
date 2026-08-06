"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface ArrayItemEditorProps<T> {
    items: T[]
    onChange: (items: T[]) => void
    renderItem: (item: T, index: number) => React.ReactNode
    getItemLabel: (item: T, index: number) => string
    onAddItem: () => void
    onRemoveItem?: (index: number) => void
    layout?: "tabs" | "list"
    title?: string
    addButtonLabel?: string
    minItems?: number
    maxItems?: number
    className?: string
    headerActions?: React.ReactNode
    activeTabClassName?: string
}

export function ArrayItemEditor<T extends { id: string }>({
    items,
    onChange,
    renderItem,
    getItemLabel,
    onAddItem,
    onRemoveItem,
    layout = "tabs",
    title,
    addButtonLabel = "Add Item",
    minItems = 1,
    maxItems,
    className,
    headerActions,
    activeTabClassName = "data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950",
}: ArrayItemEditorProps<T>) {
    const [activeItemIndex, setActiveItemIndex] = useState(0)

    const handleRemove = (index: number) => {
        if (onRemoveItem) {
            onRemoveItem(index)
        } else {
            const updatedItems = [...items]
            updatedItems.splice(index, 1)
            onChange(updatedItems)
        }

        if (activeItemIndex >= index && activeItemIndex > 0) {
            setActiveItemIndex(activeItemIndex - 1)
        }
    }

    const handleAdd = () => {
        onAddItem()
        setActiveItemIndex(items.length)
    }

    if (layout === "list") {
        return (
            <div className={cn("space-y-4", className)}>
                {(title || headerActions) && (
                    <div className="flex items-center justify-between">
                        {title && <Label className="text-sm font-bold text-emerald-400 uppercase tracking-wider">{title}</Label>}
                        <div className="flex items-center gap-2">
                            {headerActions}
                            {(!maxItems || items.length < maxItems) && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleAdd}
                                    className="h-8 rounded-full border-slate-700 bg-slate-900/50 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 px-3 py-0 text-[10px] font-black"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    {addButtonLabel.toUpperCase()}
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/30 overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {getItemLabel(item, index)}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemove(index)}
                                    disabled={items.length <= minItems}
                                    className="h-7 w-7 rounded-full hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <div className="p-4">
                                {renderItem(item, index)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={cn("space-y-6", className)}>
            <Tabs
                value={activeItemIndex.toString()}
                onValueChange={(value) => setActiveItemIndex(Number.parseInt(value))}
            >
                {/* Add button and header actions - Always visible */}
                <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        {title || addButtonLabel}
                    </span>
                    <div className="flex items-center gap-2">
                        {headerActions}
                        {(!maxItems || items.length < maxItems) && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleAdd}
                                className="h-8 px-4 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all text-[10px] font-black uppercase tracking-widest"
                            >
                                <Plus className="h-3.5 w-3.5 mr-2" />
                                {addButtonLabel}
                            </Button>
                        )}
                    </div>
                </div>


                {/* Tabs - Horizontally scrollable */}
                {/* Tabs - Horizontally scrollable */}
                {/* Tabs - Horizontally scrollable */}
                <div className="grid grid-cols-[minmax(0,1fr)] bg-slate-950/40 p-1.5 rounded-xl border border-slate-800 mb-4 relative">
                    <ScrollArea className="w-full whitespace-nowrap rounded-lg" type="scroll">
                        <div className="flex w-max space-x-1 pb-2">
                            <TabsList className="h-9 bg-transparent p-0 flex gap-1">
                                {items.map((item, index) => (
                                    <TabsTrigger
                                        key={item.id}
                                        value={index.toString()}
                                        className={cn(
                                            "px-4 h-8 rounded-lg text-[10px] uppercase font-black transition-all duration-200 whitespace-nowrap flex-shrink-0",
                                            activeTabClassName
                                        )}
                                    >
                                        {getItemLabel(item, index)}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                        <ScrollBar orientation="horizontal" className="h-2.5 z-50" forceMount />
                    </ScrollArea>
                </div>


                {items.map((item, index) => (
                    <TabsContent key={item.id} value={index.toString()} className="m-0 focus-visible:outline-none focus-visible:ring-0">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xl overflow-hidden backdrop-blur-md">
                            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/30">
                                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {getItemLabel(item, index)}
                                </h4>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemove(index)}
                                    disabled={items.length <= minItems}
                                    className="h-8 w-8 rounded-full hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 transition-all border border-transparent hover:border-rose-500/30"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="p-6">
                                {renderItem(item, index)}
                            </div>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
