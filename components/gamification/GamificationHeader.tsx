"use client"

import React from 'react'
import { Star, Rocket, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GamificationHeaderProps {
    starBalance: number
    level: number
    onOpenHub: () => void
}

export function GamificationHeader({ starBalance = 0, level = 1, onOpenHub }: GamificationHeaderProps) {
    return (
        <>
            <button
                type="button"
                onClick={onOpenHub}
                className="md:hidden flex items-center gap-1 min-h-11 px-2.5 rounded-xl bg-amber-50 border-2 border-amber-200 hover:border-[#FF9600] cursor-pointer transition-all"
                title="View stars, level, and missions"
                aria-label={`Open rewards hub, ${starBalance} stars, level ${level}`}
            >
                <Star className="w-3.5 h-3.5 text-[#FF9600] fill-[#FF9600]" />
                <span className="text-[11px] font-black tracking-wider text-amber-700 tabular-nums">{starBalance}</span>
            </button>

            <div className="hidden md:flex items-center gap-2">
                <button
                    type="button"
                    onClick={onOpenHub}
                    className="flex items-center gap-1.5 min-h-11 px-3 rounded-xl bg-[#1CB0F6]/10 border-2 border-[#1CB0F6]/25 hover:border-[#1CB0F6] cursor-pointer transition-all group"
                    title="View Level & Missions"
                >
                    <Rocket className="w-3.5 h-3.5 text-[#1CB0F6] group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#1899D6]">Lvl {level}</span>
                </button>

                <button
                    type="button"
                    onClick={onOpenHub}
                    className="flex items-center gap-1.5 min-h-11 px-3 rounded-xl bg-amber-50 border-2 border-amber-200 hover:border-[#FF9600] cursor-pointer transition-all group"
                    title="View Star Wallet & Rewards"
                >
                    <Star className="w-3.5 h-3.5 text-[#FF9600] fill-[#FF9600] group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black tracking-wider text-amber-700 tabular-nums">{starBalance}</span>
                </button>

                <Button
                    onClick={onOpenHub}
                    variant="outline"
                    className="min-h-11 h-11 border-2 border-[#58CC02]/30 hover:bg-[#58CC02] hover:text-white text-[#3B8C00] gap-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-[#58CC02]/10"
                >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Hub</span>
                </Button>
            </div>
        </>
    )
}
