'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

const TARGET = ['S', 'T', 'A', 'R']

function shuffle<T>(items: T[]) {
    const next = [...items]
    for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[next[i], next[j]] = [next[j], next[i]]
    }
    return next
}

export function FirstWin({ onWon, accent }: { onWon: () => void; accent: string }) {
    const reduceMotion = useReducedMotion()
    const tiles = useMemo(() => {
        let pool = shuffle(TARGET.map((letter, index) => ({ letter, id: `${letter}-${index}` })))
        if (pool.map((tile) => tile.letter).join('') === 'STAR') pool = shuffle(pool)
        return pool
    }, [])
    const [picked, setPicked] = useState<string[]>([])
    const [wrong, setWrong] = useState(false)

    const nextLetter = TARGET[picked.length]
    const done = picked.length === TARGET.length

    const tap = (letter: string, id: string) => {
        if (done || picked.includes(id)) return
        if (letter !== nextLetter) {
            setWrong(true)
            window.setTimeout(() => setWrong(false), 280)
            return
        }
        const next = [...picked, id]
        setPicked(next)
        if (next.length === TARGET.length) {
            window.setTimeout(onWon, 400)
        }
    }

    return (
        <div className="space-y-5">
            <div>
                <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: accent }}>First win</p>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Spell STAR</h2>
                <p className="text-sm font-semibold text-slate-500 mt-1">Tap the letters in order. That is what you earn when you finish a live block.</p>
            </div>
            <div className="flex justify-center gap-2">
                {TARGET.map((letter, index) => (
                    <div
                        key={`${letter}-${index}`}
                        className="h-14 w-12 rounded-xl border-2 border-slate-200 bg-white flex items-center justify-center text-2xl font-black"
                        style={picked.length > index ? { color: accent, borderColor: accent, backgroundColor: `${accent}15` } : undefined}
                    >
                        {picked.length > index ? letter : ''}
                    </div>
                ))}
            </div>
            <motion.div
                animate={wrong && !reduceMotion ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
                className="flex justify-center gap-2 flex-wrap"
            >
                {tiles.map((tile) => {
                    const used = picked.includes(tile.id)
                    return (
                        <button
                            key={tile.id}
                            type="button"
                            disabled={used || done}
                            onClick={() => tap(tile.letter, tile.id)}
                            className="h-14 w-14 rounded-2xl font-black text-xl text-white border-b-4 active:border-b-0 active:translate-y-[2px] disabled:opacity-30"
                            style={{ backgroundColor: accent, borderColor: '#0090CC' }}
                        >
                            {tile.letter}
                        </button>
                    )
                })}
            </motion.div>
        </div>
    )
}
