"use client"

import { Layers, Calendar } from "lucide-react"

interface Program {
    _id: string;
    name: string;
    description: string;
    image_url?: string;
    cover_image?: string;
    modules: any[];
    is_published?: boolean;
    created_at: string;
}

interface ProjectFolderProps {
    program: Program;
    onClick: () => void;
}

// Deterministic color assignment based on program ID
const PALETTE = [
    { accent: '#1CB0F6', bg: '#EAF6FE', border: '#BAE3FB' },
    { accent: '#58CC02', bg: '#EDF9E0', border: '#C3EEA0' },
    { accent: '#FF9600', bg: '#FFF4E0', border: '#FFD99A' },
    { accent: '#CE82FF', bg: '#F5EEFF', border: '#DFC4FF' },
    { accent: '#FF4B4B', bg: '#FFF0F0', border: '#FFC4C4' },
];

function getColor(id: string) {
    const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return PALETTE[sum % PALETTE.length];
}

export function ProjectFolder({ program, onClick }: ProjectFolderProps) {
    const imageUrl = program.image_url || program.cover_image;
    const color = getColor(program._id);
    const isPublished = program.is_published !== false;

    return (
        <div
            onClick={onClick}
            className="group relative cursor-pointer rounded-2xl overflow-hidden bg-white border-2 border-slate-100 hover:border-slate-200 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col"
        >
            {/* Thumbnail cover */}
            <div className="relative h-28 overflow-hidden" style={{ backgroundColor: color.bg }}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={program.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: color.accent + '30', color: color.accent }}>
                            <Layers className="w-6 h-6" />
                        </div>
                    </div>
                )}
                {/* Status badge */}
                <div className="absolute top-2.5 right-2.5">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${isPublished ? 'bg-[#EDF9E0] border-[#C3EEA0] text-[#58CC02]' : 'bg-[#FFF4E0] border-[#FFD99A] text-[#FF9600]'}`}>
                        {isPublished ? 'Live' : 'Draft'}
                    </span>
                </div>
            </div>

            {/* Card body */}
            <div className="p-4 flex flex-col flex-1">
                {/* Color accent line */}
                <div className="h-0.5 w-8 rounded-full mb-3" style={{ backgroundColor: color.accent }} />

                <h3 className="text-sm font-black text-slate-800 line-clamp-1 mb-1 group-hover:text-slate-900 transition-colors">
                    {program.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed flex-1">
                    {program.description || 'No description provided.'}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[10px] font-black" style={{ color: color.accent }}>
                        <Layers className="w-3.5 h-3.5" />
                        <span>{program.modules?.length || 0} Modules</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                        <Calendar className="w-3 h-3" />
                        {new Date(program.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                </div>
            </div>
        </div>
    )
}
