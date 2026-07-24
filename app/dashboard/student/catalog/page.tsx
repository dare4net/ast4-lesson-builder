"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, Sparkles, Rocket, Info, ChevronRight, ArrowLeft, Zap, Play, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function CatalogPage() {
    const { token, user } = useAuth()
    const router = useRouter()

    const [view, setView] = useState<'list' | 'details'>('list')
    const [loading, setLoading] = useState(true)
    const [registering, setRegistering] = useState<string | null>(null)
    const [availablePrograms, setAvailablePrograms] = useState<any[]>([])
    const [registeredProgramIds, setRegisteredProgramIds] = useState<Set<string>>(new Set())
    const [selectedProgram, setSelectedProgram] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (token) {
            fetchData()
        }
    }, [token])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [allPrograms, myPrograms] = await Promise.all([
                apiClient.programs.list(),
                apiClient.programs.getMyPrograms()
            ])
            setAvailablePrograms(allPrograms)
            setRegisteredProgramIds(new Set(myPrograms.map((p: any) => p._id)))
        } catch (err) {
            console.error("Failed to fetch catalog data", err)
        } finally {
            setLoading(false)
        }
    }

    const handleProgramClick = async (program: any) => {
        setLoading(true)
        try {
            const details = await apiClient.programs.getDetails(program._id)
            setSelectedProgram(details)
            setView('details')
        } catch (err) {
            console.error("Failed to fetch program details", err)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (programId: string) => {
        setRegistering(programId)
        try {
            await apiClient.programs.register(programId)
            await fetchData()
            router.push('/dashboard/student/programs')
        } catch (err: any) {
            console.error("Registration failed", err)
        } finally {
            setRegistering(null)
        }
    }

    const filteredPrograms = availablePrograms.filter(p =>
        (p.program_name || p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-10">
            {/* Header section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        {view === 'details' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setView('list')}
                                className="rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-blue-500/10 hover:border-blue-500/30 text-slate-400 hover:text-blue-500 transition-all"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        )}
                        <h1 className="text-4xl font-black text-white uppercase tracking-tight">
                            {view === 'list' ? "Deployment Catalog" : "Deployment Specs"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            NETWORK ACTIVE
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            {availablePrograms.length} DIRECTIVES SYNCED
                        </div>
                    </div>
                </div>

                {view === 'list' && (
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <Input
                            type="text"
                            placeholder="SEARCH BY DIRECTIVE NAME OR ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 text-xs font-black uppercase tracking-widest text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-xl"
                        />
                    </div>
                )}
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Scanning Network...</span>
                </div>
            ) : (
                <div className="grid">
                    <AnimatePresence mode="wait">
                        {view === 'list' ? (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filteredPrograms.map((prog, idx) => {
                                    const isRegistered = registeredProgramIds.has(prog._id)
                                    return (
                                        <motion.div
                                            key={prog._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <Card
                                                onClick={() => handleProgramClick(prog)}
                                                className="flex flex-col h-full rounded-[2.5rem] bg-slate-900/40 border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer group relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors" />

                                                <div className="p-8 space-y-6 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start">
                                                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                                            <Rocket className="w-7 h-7 text-blue-500" />
                                                        </div>
                                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-800">
                                                            <div className={cn("w-1.5 h-1.5 rounded-full", isRegistered ? "bg-emerald-500" : "bg-blue-500")} />
                                                            <span className="text-[8px] font-black text-white uppercase tracking-widest">
                                                                {isRegistered ? "ENROLLED" : "AVAILABLE"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 flex-1">
                                                        <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                                                            {prog.program_name || prog.title}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 line-clamp-3 uppercase tracking-wider font-bold leading-relaxed">
                                                            {prog.description || "Experimental curriculum deployment for authorized personnel only."}
                                                        </p>
                                                    </div>

                                                    <div className="pt-6 border-t border-slate-800/50 flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Modules</span>
                                                            <span className="text-xs font-black text-white tracking-widest">{prog.modules?.length || 0}</span>
                                                        </div>
                                                        {isRegistered ? (
                                                            <Button
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    router.push('/dashboard/student/programs')
                                                                }}
                                                                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl font-black text-[10px] tracking-widest px-6 h-10"
                                                            >
                                                                RESUME
                                                                <Play className="w-3 h-3 ml-2" />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                disabled={registering === prog._id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleProgramClick(prog)
                                                                }}
                                                                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[10px] tracking-widest px-6 shadow-lg shadow-blue-500/20 active:scale-95 transition-all group/btn h-10"
                                                            >
                                                                {registering === prog._id ? <Loader2 className="w-3 h-3 animate-spin" /> : "DEPLOY"}
                                                                <ChevronRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    )
                                })}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-6xl grid lg:grid-cols-3 gap-10"
                            >
                                <div className="lg:col-span-2 space-y-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-1 w-12 bg-blue-500 rounded-full" />
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em]">Sector Specs</span>
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                                            {selectedProgram?.program_name || selectedProgram?.title}
                                        </h2>
                                        <p className="text-slate-400 font-bold uppercase tracking-wider text-sm leading-relaxed max-w-2xl">
                                            {selectedProgram?.description || "A comprehensive training directive focused on advanced technical skills and operational excellence."}
                                        </p>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                            <h4 className="text-[12px] font-black text-white uppercase tracking-[0.4em]">Curriculum Pipeline</h4>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedProgram?.modules?.length || 0} SECTORS</span>
                                        </div>
                                        <div className="grid gap-4">
                                            {selectedProgram?.modules?.map((mod: any, idx: number) => (
                                                <div key={mod._id} className="p-6 rounded-[1.5rem] bg-slate-900/60 border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-all hover:bg-slate-900/80">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-black text-slate-500 font-mono">
                                                            {(idx + 1).toString().padStart(2, '0')}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-sm font-black text-white uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                                                                {mod.title || mod.module_name}
                                                            </span>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest line-clamp-1">
                                                                {mod.description || "Core Training Directive"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="px-4 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                                        {mod.milestones?.length || mod.lessons?.length || 0} STEPS
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <Card className="p-8 rounded-[2.5rem] bg-slate-900/60 border-blue-500/20 backdrop-blur-xl flex flex-col gap-10 sticky top-24">
                                        <div className="space-y-10">
                                            <div className="space-y-4">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-center">Identity Rank Requirement</span>
                                                <div className="flex items-center justify-center gap-3">
                                                    <Star className="w-6 h-6 text-amber-500 fill-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
                                                    <span className="text-4xl font-black text-white tracking-widest">L-1</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4 border-y border-slate-800 py-8">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-slate-500 italic">Sync Duration</span>
                                                    <span className="text-white">Est. 12H</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-slate-500 italic">Complexity</span>
                                                    <span className="text-blue-500">Tier 3</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-slate-500 italic">Potential XP</span>
                                                    <span className="text-emerald-500">+1,200</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {registeredProgramIds.has(selectedProgram?._id) ? (
                                                <Button
                                                    onClick={() => router.push('/dashboard/student/programs')}
                                                    className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-black rounded-2xl h-16 uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-emerald-500/5 transition-all"
                                                >
                                                    ALREADY IN REGISTRY
                                                </Button>
                                            ) : (
                                                <Button
                                                    disabled={registering === selectedProgram?._id}
                                                    onClick={() => handleRegister(selectedProgram?._id)}
                                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl h-16 uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                                >
                                                    {registering === selectedProgram?._id ? "CORE SYNCING..." : "INITIALIZE DEPLOYMENT"}
                                                </Button>
                                            )}

                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                                                <p className="text-[9px] font-black text-slate-600 text-center uppercase tracking-widest leading-relaxed px-4">
                                                    Authorization required for all personnel. Data integrity verified by Emerald Hub v4.0.
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
