"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Layers, Plus, Trash2, Tag, FolderPlus, ArrowUp, ArrowDown, Shuffle } from "lucide-react"

export interface Category {
    id: string
    title: string
}

export interface CategoriseItem {
    id: string
    text: string
    categoryId: string
}

export interface CategoriseEditorProps {
    title?: string
    onTitleChange?: (val: string) => void
    categories?: Category[]
    onCategoriesChange?: (categories: Category[]) => void
    items?: CategoriseItem[]
    onItemsChange?: (items: CategoriseItem[]) => void
}

export function CategoriseEditor({
    title = "Categorise the Items",
    onTitleChange,
    categories = [
        { id: "cat-1", title: "Category A" },
        { id: "cat-2", title: "Category B" },
    ],
    onCategoriesChange,
    items = [],
    onItemsChange,
}: CategoriseEditorProps) {
    // Category management
    const handleAddCategory = () => {
        const newCat: Category = {
            id: `cat-${Date.now()}`,
            title: `Category ${categories.length + 1}`,
        }
        if (onCategoriesChange) {
            onCategoriesChange([...categories, newCat])
        }
    }

    const handleUpdateCategoryTitle = (catId: string, newTitle: string) => {
        const nextCats = categories.map((c) => (c.id === catId ? { ...c, title: newTitle } : c))
        if (onCategoriesChange) {
            onCategoriesChange(nextCats)
        }
    }

    const handleDeleteCategory = (catId: string) => {
        if (categories.length <= 1) return
        const nextCats = categories.filter((c) => c.id !== catId)
        if (onCategoriesChange) {
            onCategoriesChange(nextCats)
        }
        // Re-assign items belonging to deleted category to first available category
        const remainingCatId = nextCats[0]?.id || ""
        const nextItems = items.map((it) => (it.categoryId === catId ? { ...it, categoryId: remainingCatId } : it))
        if (onItemsChange) {
            onItemsChange(nextItems)
        }
    }

    // Items management
    const handleAddItem = () => {
        const defaultCatId = categories[0]?.id || "cat-1"
        const newItem: CategoriseItem = {
            id: `item-${Date.now()}`,
            text: "New Item Tag",
            categoryId: defaultCatId,
        }
        if (onItemsChange) {
            onItemsChange([...items, newItem])
        }
    }

    const handleUpdateItemText = (itemId: string, text: string) => {
        const nextItems = items.map((it) => (it.id === itemId ? { ...it, text } : it))
        if (onItemsChange) {
            onItemsChange(nextItems)
        }
    }

    const handleUpdateItemCategory = (itemId: string, categoryId: string) => {
        const nextItems = items.map((it) => (it.id === itemId ? { ...it, categoryId } : it))
        if (onItemsChange) {
            onItemsChange(nextItems)
        }
    }

    const handleDeleteItem = (itemId: string) => {
        const nextItems = items.filter((it) => it.id !== itemId)
        if (onItemsChange) {
            onItemsChange(nextItems)
        }
    }

    const handleMoveItem = (index: number, direction: 'up' | 'down') => {
        const targetIdx = direction === 'up' ? index - 1 : index + 1
        if (targetIdx < 0 || targetIdx >= items.length) return
        const nextItems = [...items]
        const temp = nextItems[index]
        nextItems[index] = nextItems[targetIdx]
        nextItems[targetIdx] = temp
        if (onItemsChange) {
            onItemsChange(nextItems)
        }
    }

    const handleShuffleItems = () => {
        if (items.length <= 1) return
        const shuffled = [...items].sort(() => Math.random() - 0.5)
        if (onItemsChange) {
            onItemsChange(shuffled)
        }
    }

    return (
        <div className="space-y-6 w-full min-w-0 overflow-x-hidden">
            {/* Title Header */}
            <div className="space-y-2 w-full min-w-0">
                <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                    Categorisation Header Title
                </Label>
                <Input
                    value={title}
                    onChange={(e) => onTitleChange && onTitleChange(e.target.value)}
                    placeholder="e.g. Sort Solids, Liquids, and Gases"
                    className="bg-slate-950/60 border-slate-800 focus-visible:ring-purple-500/50 h-11 text-sm font-bold placeholder:text-slate-700 rounded-xl w-full min-w-0"
                />
            </div>

            {/* Categories Buckets Section */}
            <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3 w-full min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5 shrink-0">
                        <FolderPlus className="w-4 h-4 text-purple-400 shrink-0" />
                        Buckets ({categories.length})
                    </Label>
                    <Button
                        type="button"
                        onClick={handleAddCategory}
                        className="bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs h-8 px-2.5 rounded-xl shadow-sm shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Bucket
                    </Button>
                </div>

                <div className="space-y-2 w-full min-w-0">
                    {categories.map((cat, idx) => (
                        <div
                            key={cat.id || idx}
                            className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-xl w-full min-w-0"
                        >
                            <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 font-black text-[10px] flex items-center justify-center shrink-0">
                                {idx + 1}
                            </span>
                            <Input
                                value={cat.title}
                                onChange={(e) => handleUpdateCategoryTitle(cat.id, e.target.value)}
                                placeholder="Category Bucket Name"
                                className="bg-slate-950 border-slate-800 h-8 text-xs font-bold text-white flex-1 min-w-0"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={categories.length <= 1}
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="h-8 w-8 text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0 disabled:opacity-30"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Classifiable Items Section */}
            <div className="space-y-3 w-full min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5 shrink-0">
                        <Tag className="w-4 h-4 text-purple-400 shrink-0" />
                        Classifiable Items ({items.length})
                    </Label>
                    <div className="flex items-center gap-2">
                        {items.length > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleShuffleItems}
                                className="border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs font-bold h-8 px-2.5 rounded-xl shrink-0"
                            >
                                <Shuffle className="w-3.5 h-3.5 mr-1" />
                                Shuffle
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={handleAddItem}
                            className="bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs h-8 px-2.5 rounded-xl shadow-sm shrink-0"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add Item
                        </Button>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="p-6 text-center bg-slate-950/40 rounded-2xl border-2 border-dashed border-slate-800 space-y-3 w-full min-w-0">
                        <Tag className="w-6 h-6 text-slate-700 mx-auto" />
                        <p className="text-xs font-bold text-slate-500">No items added to categorise.</p>
                        <Button
                            type="button"
                            onClick={handleAddItem}
                            className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold h-8 px-3 rounded-xl"
                        >
                            Add First Item
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3 w-full min-w-0">
                        {items.map((it, idx) => (
                            <div
                                key={it.id || idx}
                                className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2.5 w-full min-w-0"
                            >
                                {/* Header row: badge + move controls + delete */}
                                <div className="flex items-center justify-between w-full min-w-0">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-400 font-black text-[10px] flex items-center justify-center shrink-0">
                                            #{idx + 1}
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-400 truncate">
                                            Item Tag #{idx + 1}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={idx === 0}
                                            onClick={() => handleMoveItem(idx, 'up')}
                                            className="h-7 w-7 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg shrink-0 disabled:opacity-30"
                                            title="Move Item Up"
                                        >
                                            <ArrowUp className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={idx === items.length - 1}
                                            onClick={() => handleMoveItem(idx, 'down')}
                                            className="h-7 w-7 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg shrink-0 disabled:opacity-30"
                                            title="Move Item Down"
                                        >
                                            <ArrowDown className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteItem(it.id)}
                                            className="h-7 w-7 text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0"
                                            title="Delete Item"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Item text input */}
                                <div className="space-y-1 w-full min-w-0">
                                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                        Tag Label Text
                                    </Label>
                                    <Input
                                        value={it.text}
                                        onChange={(e) => handleUpdateItemText(it.id, e.target.value)}
                                        placeholder="e.g. Oxygen or Water"
                                        className="bg-slate-900 border-slate-800 h-9 text-xs font-bold text-white w-full min-w-0"
                                    />
                                </div>

                                {/* Category select */}
                                <div className="space-y-1 w-full min-w-0">
                                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                        Correct Target Bucket
                                    </Label>
                                    <Select
                                        value={it.categoryId}
                                        onValueChange={(val) => handleUpdateItemCategory(it.id, val)}
                                    >
                                        <SelectTrigger className="w-full min-w-0 bg-slate-900 border-slate-800 h-9 text-xs font-bold text-purple-300">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 font-bold text-xs">
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={c.id} className="focus:bg-purple-500 focus:text-white">
                                                    {c.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
