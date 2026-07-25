"use client"

import { Clock, Edit2, Trash2, Settings, MoreVertical } from "lucide-react"
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
        <div className="group relative flex gap-6">
            {/* Timeline connector line */}
            {!isLast && (
                <div className="absolute left-[27px] top-14 bottom-[-24px] w-0.5 bg-slate-200 group-hover:bg-[#58CC02]/40 transition-colors" />
            )}

            {/* Node number bubble */}
            <div className="relative z-10 flex-none">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white group-hover:border-[#58CC02]/50 group-hover:bg-[#58CC02]/5 transition-all duration-200 shadow-sm">
                    <span className="text-lg font-extrabold text-slate-400 group-hover:text-[#58CC02] transition-colors">
                        {(index + 1).toString().padStart(2, '0')}
                    </span>
                </div>
            </div>

            {/* Content Card */}
            <div className="flex-1 rounded-2xl border-2 border-slate-200 bg-white p-5 transition-all duration-200 hover:border-[#58CC02]/40 hover:shadow-sm hover:translate-x-0.5 shadow-sm">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-base font-extrabold text-slate-800 group-hover:text-[#58CC02] transition-colors">
                                {lesson.title}
                            </h3>
                            {lesson.level && (
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border",
                                    lesson.level === 'Beginner' ? "border-[#58CC02]/30 text-[#58CC02] bg-[#58CC02]/10" :
                                        lesson.level === 'Intermediate' ? "border-[#1CB0F6]/30 text-[#1CB0F6] bg-[#1CB0F6]/10" :
                                            "border-purple-400/30 text-purple-600 bg-purple-50"
                                )}>
                                    {lesson.level}
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-2xl line-clamp-2">
                            {lesson.description || "No description provided."}
                        </p>

                        <div className="flex items-center gap-4 pt-1 text-xs font-semibold text-slate-400">
                            {lesson.duration && (
                                <div className="flex items-center gap-1.5 group-hover:text-[#58CC02] transition-colors">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{lesson.duration} mins</span>
                                </div>
                            )}
                            <div className="text-slate-300">ID: {lesson._id.slice(-6)}</div>
                        </div>
                    </div>

                    {/* Actions — visible on hover */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                        <button
                            onClick={onEdit}
                            className="h-9 px-4 rounded-xl text-xs font-extrabold text-white flex items-center gap-1.5 border-b-4 transition-all duration-150 active:border-b-0 active:translate-y-[1px]"
                            style={{ backgroundColor: '#58CC02', borderColor: '#3B8C00' }}
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                            Open Studio
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-2 border-slate-200 text-slate-700 rounded-xl shadow-lg">
                                <DropdownMenuItem onClick={onEdit} className="font-semibold cursor-pointer">
                                    <Settings className="w-4 h-4 mr-2 text-slate-500" />
                                    Edit Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500 focus:bg-red-50 font-semibold cursor-pointer">
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
