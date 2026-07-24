"use client"

import { BookOpen, Folder, MoreVertical, Clock, Layers } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Program {
    _id: string;
    name: string;
    description: string;
    modules: any[];
    created_at: string;
}

interface ProjectFolderProps {
    program: Program;
    onClick: () => void;
}

export function ProjectFolder({ program, onClick }: ProjectFolderProps) {
    return (
        <div
            onClick={onClick}
            className="group relative h-full cursor-pointer"
        >
            {/* Cyber Border Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur" />

            {/* Card Content */}
            <div className="relative h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-emerald-500/50 group-hover:bg-slate-900/80 group-hover:shadow-2xl group-hover:shadow-emerald-900/20">
                {/* Decorative Top Bar */}
                <div className="h-1 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 group-hover:from-emerald-500 group-hover:via-emerald-400 group-hover:to-teal-500 transition-all duration-500" />

                <div className="p-6 flex flex-col h-full">
                    {/* Header Icon Area */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 group-hover:border-emerald-500/30 group-hover:bg-emerald-950/20 transition-colors">
                            <Folder className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border border-slate-800 px-2 py-1 rounded bg-slate-950">
                            PROJ-{(program._id).slice(-4).toUpperCase()}
                        </span>
                    </div>

                    {/* Title & Desc */}
                    <div className="flex-1 space-y-2 mb-6">
                        <h3 className="text-xl font-bold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                            {program.name}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 group-hover:text-slate-400">
                            {program.description || "No description provided."}
                        </p>
                    </div>

                    {/* Footer Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-1.5 group-hover:text-emerald-400/80 transition-colors">
                                <Layers className="w-4 h-4" />
                                <span>{program.modules?.length || 0} Modules</span>
                            </div>
                        </div>
                        <div className="text-[10px] text-slate-600 font-mono">
                            {new Date(program.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Corner Accent */}
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-slate-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    )
}
