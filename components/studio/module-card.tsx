"use client"

import { FolderOpen, Trash2, Layers, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Module {
    _id: string;
    name: string;
    description: string;
    image_url?: string;
    cover_image?: string;
    program_image_url?: string;
    lessons: any[];
    order: number;
}

interface ModuleCardProps {
    module: Module;
    parentProgramImage?: string;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
}

export function ModuleCard({ module, parentProgramImage, onClick, onDelete }: ModuleCardProps) {
    const imageUrl = module.image_url || module.cover_image || module.program_image_url || parentProgramImage;

    return (
        <div
            onClick={onClick}
            className="group relative h-full cursor-pointer"
        >
            <div className="relative h-full bg-white border-2 border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 hover:border-[#58CC02]/40 hover:-translate-y-0.5 hover:shadow-md shadow-sm flex flex-col">
                {/* Header Thumbnail Banner */}
                {imageUrl ? (
                    <div className="h-28 w-full relative overflow-hidden bg-slate-100 border-b-2 border-slate-100">
                        <img
                            src={imageUrl}
                            alt={module.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <div className="absolute top-2 right-2 text-[10px] font-bold text-slate-800 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
                            MOD-{module.order.toString().padStart(2, '0')}
                        </div>
                    </div>
                ) : (
                    <div className="h-1.5 w-full bg-slate-100 group-hover:bg-[#58CC02] transition-all duration-300" />
                )}

                <div className="p-5 flex flex-col flex-1">
                    {/* Header Icon if no image */}
                    {!imageUrl && (
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 bg-[#58CC02]/10 rounded-xl border border-[#58CC02]/20 group-hover:bg-[#58CC02]/15 transition-colors">
                                <FolderOpen className="w-5 h-5 text-[#58CC02]" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                                MOD-{module.order.toString().padStart(2, '0')}
                            </span>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 space-y-1.5 mb-4">
                        <h3 className="text-base font-extrabold text-slate-800 group-hover:text-[#58CC02] transition-colors line-clamp-1">
                            {module.name}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                            {module.description || "No description provided."}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 group-hover:text-[#58CC02] transition-colors">
                            <Layers className="w-3.5 h-3.5" />
                            <span>{module.lessons?.length || 0} Lessons</span>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                onClick={onDelete}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[#58CC02] hover:bg-[#58CC02]/10 rounded-lg"
                            >
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
