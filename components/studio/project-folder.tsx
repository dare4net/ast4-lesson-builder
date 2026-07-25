"use client"

import { Folder, Layers } from "lucide-react"

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
            <div className="relative h-full bg-white border-2 border-slate-200 rounded-3xl overflow-hidden transition-all duration-200 hover:border-[#58CC02]/40 hover:-translate-y-0.5 hover:shadow-md shadow-sm">
                {/* Top accent bar */}
                <div className="h-1 w-full bg-slate-100 group-hover:bg-[#58CC02] transition-all duration-300" />

                <div className="p-6 flex flex-col h-full">
                    {/* Header Icon */}
                    <div className="flex justify-between items-start mb-5">
                        <div className="p-3 bg-[#58CC02]/10 rounded-2xl border border-[#58CC02]/20 group-hover:bg-[#58CC02]/15 transition-colors">
                            <Folder className="w-6 h-6 text-[#58CC02]" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 border border-slate-200 px-2 py-1 rounded-full">
                            {(program._id).slice(-4).toUpperCase()}
                        </span>
                    </div>

                    {/* Title & Desc */}
                    <div className="flex-1 space-y-1.5 mb-5">
                        <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-[#58CC02] transition-colors line-clamp-1">
                            {program.name}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                            {program.description || "No description provided."}
                        </p>
                    </div>

                    {/* Footer Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 group-hover:text-[#58CC02] transition-colors">
                            <Layers className="w-4 h-4" />
                            <span>{program.modules?.length || 0} Modules</span>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400">
                            {new Date(program.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
