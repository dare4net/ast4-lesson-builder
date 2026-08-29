"use client"

import { Clock, Edit2, Trash2, Settings, MoreVertical, BookOpen } from "lucide-react"
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
    is_published?: boolean;
}

interface LessonTimelineItemProps {
    lesson: Lesson;
    index: number;
    isLast: boolean;
    onEdit: () => void;
    onEditSettings?: () => void;
    onDelete: () => void;
}

const LEVEL_STYLE: Record<string, { bg: string; text: string; border: string }> = {
    Beginner: { bg: '#EDF9E0', text: '#58CC02', border: '#C3EEA0' },
    Intermediate: { bg: '#EAF6FE', text: '#1CB0F6', border: '#BAE3FB' },
    Advanced: { bg: '#F5EEFF', text: '#CE82FF', border: '#DFC4FF' },
};

export function LessonTimelineItem({ lesson, index, isLast, onEdit, onEditSettings, onDelete }: LessonTimelineItemProps) {
    const levelStyle = lesson.level ? (LEVEL_STYLE[lesson.level] ?? LEVEL_STYLE['Intermediate']) : null;

    return (
        <div className="group relative flex gap-3">
            {/* Vertical rail */}
            {!isLast && (
                <div className="absolute left-[17px] top-[42px] bottom-[-12px] w-0.5 bg-slate-100 group-hover:bg-[#1CB0F6]/30 transition-colors" />
            )}

            {/* Node bubble */}
            <div className="relative z-10 flex-none mt-1">
                <div className="w-9 h-9 rounded-xl border-2 border-slate-200 bg-white group-hover:border-[#1CB0F6]/60 group-hover:bg-[#EAF6FE] transition-all flex items-center justify-center shadow-sm">
                    <span className="text-xs font-black text-slate-400 group-hover:text-[#1CB0F6] transition-colors">
                        {(index + 1).toString().padStart(2, '0')}
                    </span>
                </div>
            </div>

            {/* Lesson card */}
            <div className="flex-1 min-w-0 bg-white border-2 border-slate-100 group-hover:border-slate-200 rounded-2xl px-3 sm:px-4 py-3 transition-all duration-150 hover:shadow-sm">
                {/* Top row: title + actions */}
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        {/* Title + level badge */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-sm font-black text-slate-800 leading-snug group-hover:text-[#1CB0F6] transition-colors truncate">
                                {lesson.title}
                            </h3>
                            {levelStyle && (
                                <span
                                    className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0"
                                    style={{ backgroundColor: levelStyle.bg, color: levelStyle.text, borderColor: levelStyle.border }}
                                >
                                    {lesson.level}
                                </span>
                            )}
                            <span
                                className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0"
                                style={
                                    lesson.is_published === false
                                        ? { backgroundColor: '#FFF4E0', color: '#FF9600', borderColor: '#FFD199' }
                                        : { backgroundColor: '#EDF9E0', color: '#58CC02', borderColor: '#C3EEA0' }
                                }
                            >
                                {lesson.is_published === false ? 'Draft' : 'Live'}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-1 mb-2">
                            {lesson.description || 'No description.'}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-3">
                            {lesson.duration ? (
                                <span className="flex items-center gap-1 text-[10px] font-black" style={{ color: '#FF9600' }}>
                                    <Clock className="w-3 h-3" />
                                    {lesson.duration}m
                                </span>
                            ) : null}
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-300">
                                <BookOpen className="w-3 h-3" />
                                #{lesson._id.slice(-5).toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Actions — always an icon menu on all screens; "Open Studio" only on md+ */}
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                        <button
                            onClick={onEdit}
                            className="hidden sm:flex h-8 px-3 rounded-xl text-[11px] font-extrabold text-white items-center gap-1.5 border-b-[3px] transition-all duration-100 active:border-b-0 active:translate-y-px opacity-0 group-hover:opacity-100"
                            style={{ backgroundColor: '#1CB0F6', borderColor: '#0E86C0' }}
                        >
                            <Edit2 className="w-3 h-3" />
                            <span className="hidden md:inline">Open Studio</span>
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl opacity-60 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-2 border-slate-200 rounded-xl shadow-lg text-xs min-w-[140px]">
                                <DropdownMenuItem onClick={onEdit} className="font-bold cursor-pointer gap-2">
                                    <Edit2 className="w-3.5 h-3.5 text-[#1CB0F6]" />
                                    Open Studio
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onEditSettings} className="font-bold cursor-pointer gap-2 text-slate-700 hover:text-[#1CB0F6]">
                                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                                    Edit Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500 focus:bg-red-50 font-bold cursor-pointer gap-2">
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    )
}
