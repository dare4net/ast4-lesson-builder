"use client"

import { FolderOpen, MoreVertical, Edit2, Trash2, Layers, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Module {
    _id: string;
    name: string;
    description: string;
    lessons: any[];
    order: number;
}

interface ModuleCardProps {
    module: Module;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
}

export function ModuleCard({ module, onClick, onDelete }: ModuleCardProps) {
    return (
        <div
            onClick={onClick}
            className="group relative h-full cursor-pointer"
        >
            {/* Tech Border Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-500 blur" />

            {/* Card Surface */}
            <div className="relative h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300 group-hover:border-emerald-500/30 group-hover:bg-slate-900/90 group-hover:translate-y-[-2px]">
                {/* Tech Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-50" />

                <div className="p-5 flex flex-col h-full">
                    {/* Header: Icon & ID */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 group-hover:border-emerald-500/30 group-hover:text-emerald-400 text-slate-500 transition-colors">
                            <FolderOpen className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-600 bg-slate-950 px-2 py-1 rounded border border-slate-800/50">
                                MOD-{module.order.toString().padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2 mb-4">
                        <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                            {module.name}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 group-hover:text-slate-400">
                            {module.description || "No description provided."}
                        </p>
                    </div>

                    {/* Footer: Stats & Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-1.5 group-hover:text-emerald-400/70 transition-colors">
                                <Layers className="w-3.5 h-3.5" />
                                <span>{module.lessons?.length || 0} Lessons</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                onClick={onDelete}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
