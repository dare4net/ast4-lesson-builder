"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
    Plus,
    Monitor,
    Search,
    Filter,
    ArrowUpRight,
    Folder,
    Layers,
    Loader2,
    Sparkles
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Program {
    _id: string;
    program_name?: string;
    name?: string;
    description: string;
    modules: any[];
    created_at: string;
    updated_at: string;
}

export default function TutorProgramsPage() {
    const router = useRouter()
    const [programs, setPrograms] = useState<Program[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchPrograms()
    }, [])

    const fetchPrograms = async () => {
        try {
            const data = await apiClient.studio.getPrograms()
            setPrograms(data)
        } catch (err) {
            console.error("Failed to load programs", err)
        } finally {
            setLoading(false)
        }
    }

    const filteredPrograms = programs.filter(p =>
        (p.program_name || p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Accessing Repository...</p>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 w-fit">
                        <Monitor className="w-3 h-3 text-indigo-400" />
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Deployment Hub</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        PROGRAM <span className="text-indigo-500">REPOSITORY</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="SEARCH PROJECTS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-indigo-500/50 transition-all"
                        />
                    </div>
                    <Button
                        onClick={() => router.push('/studio/programs/new')}
                        className="h-11 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black uppercase tracking-widest px-6 rounded-xl shadow-lg shadow-indigo-500/20 shrink-0"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        INITIALIZE
                    </Button>
                </div>
            </div>

            {/* Program Grid */}
            {filteredPrograms.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-[2.5rem] bg-slate-900/20">
                    <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
                        <Folder className="w-10 h-10 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">No Directives Found</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-xs text-center font-medium">
                        Your deployment repository is currently empty. Initialize a new program to begin.
                    </p>
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/studio/programs/new')}
                        className="mt-8 text-indigo-500 font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500/5"
                    >
                        CREATE NEW PROJECT
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPrograms.map((prog, i) => (
                        <motion.div
                            key={prog._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => router.push(`/studio/programs/${prog._id}`)}
                            className="group relative cursor-pointer"
                        >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-500 blur-xl" />

                            <div className="relative p-8 rounded-[2rem] bg-slate-900/40 border border-slate-800 backdrop-blur-xl group-hover:border-indigo-500/50 transition-all duration-500">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all duration-500">
                                        <Folder className="w-7 h-7 text-slate-500 group-hover:text-indigo-400" />
                                    </div>
                                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-600 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-none">
                                        {prog.program_name || prog.name}
                                    </h3>
                                    <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
                                        {prog.description || "Experimental curriculum module without active description protocols."}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950 border border-slate-800">
                                            <Layers className="w-3 h-3 text-indigo-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {prog.modules?.length || 0} SECTORS
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                        PROJECT-{(prog._id).slice(-4).toUpperCase()}
                                    </span>
                                </div>

                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Sparkles className="w-4 h-4 text-indigo-500/50" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
