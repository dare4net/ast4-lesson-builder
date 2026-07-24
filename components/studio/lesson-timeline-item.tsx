"use client"

import { Clock, MoreVertical, Edit2, Play, Trash2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Lesson {
    _id: string;
    title: string;
    description: string;
    order: number;
    duration?: number;
    level?: string;
}

interface LessonTimelineItemProps {
    lesson: Lesson;
    index: number;
    isLast: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export function LessonTimelineItem({ lesson, index, isLast, onEdit, onDelete }: LessonTimelineItemProps) {
    return (
        <div className="group relative flex gap-8">
            {/* Timeline Line */}
            {!isLast && (
                <div className="absolute left-[27px] top-12 bottom-[-48px] w-0.5 bg-slate-800 group-hover:bg-emerald-500/30 transition-colors delay-100" />
            )}

            {/* Node Connector */}
            <div className="relative z-10 flex-none">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 group-hover:border-emerald-500/50 group-hover:bg-slate-900/80 group-hover:shadow-[0_0_30px_-5px_var(--tw-shadow-color)] group-hover:shadow-emerald-500/20 transition-all duration-300">
                    <span className="text-xl font-mono font-bold text-slate-500 group-hover:text-emerald-500 transition-colors">
                        {(index + 1).toString().padStart(2, '0')}
                    </span>
                </div>
            </div>

            {/* Content Card */}
            <div
                className="flex-1 rounded-2xl border border-slate-800/50 bg-slate-900/50 p-6 transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-900 hover:translate-x-1"
            >
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-slate-200 group-hover:text-white transition-colors">
                                {lesson.title}
                            </h3>
                            {lesson.level && (
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border",
                                    lesson.level === 'Beginner' ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/10" :
                                        lesson.level === 'Intermediate' ? "border-blue-500/20 text-blue-500 bg-blue-500/10" :
                                            "border-purple-500/20 text-purple-500 bg-purple-500/10"
                                )}>
                                    {lesson.level}
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 max-w-2xl line-clamp-2 group-hover:text-slate-400 transition-colors">
                            {lesson.description || "No description provided."}
                        </p>

                        <div className="flex items-center gap-4 pt-2 text-xs font-medium text-slate-600">
                            {lesson.duration && (
                                <div className="flex items-center gap-1.5 group-hover:text-emerald-500/70 transition-colors">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{lesson.duration} mins</span>
                                </div>
                            )}
                            <div className="font-mono text-slate-700">ID: {lesson._id.slice(-6)}</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                            onClick={onEdit}
                            size="sm"
                            className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 font-bold border border-emerald-500/20"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Open Studio
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                                <DropdownMenuItem onClick={onEdit}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-800" />
                                <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400 focus:bg-red-950/30">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Lesson
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    )
}
