'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Search, Sparkles, UserRound, X } from 'lucide-react'
import { FollowChip, CrownTier } from '@/components/pride/student-name'
import { usePrideSearch } from '@/hooks/use-pride'
import { resolveAccentColor } from '@/lib/pride-format'
import { prideBoardPath, publicProfilePath } from '@/lib/pride-paths'
import { cn } from '@/lib/utils'

export function PrideSearch() {
    const router = useRouter()
    const inputId = useId()
    const rootRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [debounced, setDebounced] = useState('')
    const [active, setActive] = useState(0)

    useEffect(() => {
        const wait = query.trim() ? 180 : 0
        const handle = window.setTimeout(() => setDebounced(query.trim()), wait)
        return () => window.clearTimeout(handle)
    }, [query])

    const { data, isFetching, isError } = usePrideSearch(debounced, open)
    const error = isError ? 'Could not search right now.' : ''
    const loading = isFetching && !data

    useEffect(() => {
        setActive(0)
    }, [data])

    useEffect(() => {
        const onPointer = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
        }
        const onKey = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault()
                setOpen(true)
                inputRef.current?.focus()
            }
        }
        document.addEventListener('mousedown', onPointer)
        window.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onPointer)
            window.removeEventListener('keydown', onKey)
        }
    }, [])

    const popular = !query.trim()

    const items = useMemo(() => {
        const peopleItems = popular
            ? []
            : (data?.people || []).map((person) => ({
                id: `person:${person.handle}`,
                href: publicProfilePath(person.handle),
            }))
        const boardItems = (data?.boards || []).map((board) => ({
            id: `board:${board.key}`,
            href: prideBoardPath(board.key),
        }))
        return [...peopleItems, ...boardItems]
    }, [data, popular])

    const go = (href: string) => {
        setOpen(false)
        setQuery('')
        router.push(href)
    }

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            setOpen(false)
            inputRef.current?.blur()
            return
        }
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActive((value) => Math.min(value + 1, Math.max(items.length - 1, 0)))
            return
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActive((value) => Math.max(value - 1, 0))
            return
        }
        if (event.key === 'Enter' && items[active]) {
            event.preventDefault()
            go(items[active].href)
        }
    }

    const people = data?.people || []
    const boards = data?.boards || []

    return (
        <div ref={rootRef} className="relative w-full max-w-xl">
            <label htmlFor={inputId} className="sr-only">Search people and pride boards</label>
            <div className={cn(
                'flex items-center gap-2 h-10 px-3 rounded-2xl border-2 bg-slate-50 dark:bg-slate-950 transition-colors',
                open ? 'border-[#FF9600] bg-white dark:bg-slate-900' : 'border-slate-200 dark:border-slate-800'
            )}>
                <Search className="w-4 h-4 text-[#FF9600] shrink-0" />
                <input
                    id={inputId}
                    ref={inputRef}
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value)
                        setOpen(true)
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                    placeholder="Search people and boards"
                    autoComplete="off"
                    aria-expanded={open}
                    aria-controls={`${inputId}-results`}
                    className="flex-1 min-w-0 bg-transparent text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 outline-none"
                />
                <kbd className="hidden sm:inline-flex h-5 px-1.5 items-center rounded-md border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-400">
                    ⌘K
                </kbd>
                {query && (
                    <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {open && (
                <div
                    id={`${inputId}-results`}
                    role="listbox"
                    className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
                >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#FF9600]">
                            {popular ? 'Podium and gold boards' : 'Matches'}
                        </p>
                        {loading && <span className="text-[10px] font-bold text-slate-400">Searching…</span>}
                    </div>

                    {error && <p className="px-4 py-3 text-xs font-bold text-red-600">{error}</p>}

                    {popular && people.length > 0 && (
                        <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Popular now</p>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {people.map((person) => {
                                    const color = resolveAccentColor(person.handle, person.accentColor)
                                    return (
                                    <div key={person.handle} className="shrink-0 w-[4.5rem] flex flex-col items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => go(publicProfilePath(person.handle))}
                                            className="flex flex-col items-center gap-1 w-full"
                                        >
                                            <span
                                                className="h-10 w-10 rounded-full text-sm font-black flex items-center justify-center border-2 relative"
                                                style={{ color, backgroundColor: `${color}22`, borderColor: `${color}55` }}
                                            >
                                                {(person.displayName || person.handle)[0]?.toUpperCase()}
                                                <span className="absolute -bottom-1 -right-1">
                                                    <CrownTier crown={person.bestCrown} />
                                                </span>
                                            </span>
                                            <span className="text-[10px] font-extrabold truncate w-full text-center" style={{ color }}>
                                                @{person.handle}
                                            </span>
                                        </button>
                                        <FollowChip handle={person.handle} accentColor={color} following={person.following} />
                                    </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className="max-h-[min(70vh,420px)] overflow-y-auto">
                        {!popular && people.length > 0 && (
                            <SectionLabel icon={UserRound} label="People" />
                        )}
                        {!popular && people.map((person, index) => {
                            const color = resolveAccentColor(person.handle, person.accentColor)
                            return (
                            <div
                                key={`person:${person.handle}`}
                                role="option"
                                aria-selected={active === index}
                                onMouseEnter={() => setActive(index)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                                    active === index ? 'bg-[#FF9600]/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                )}
                            >
                                <button type="button" onClick={() => go(publicProfilePath(person.handle))} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                                    <span
                                        className="h-8 w-8 rounded-full text-xs font-black flex items-center justify-center"
                                        style={{ color, backgroundColor: `${color}22` }}
                                    >
                                        {(person.displayName || person.handle)[0]?.toUpperCase()}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="flex items-center gap-1.5">
                                            <span className="block text-sm font-extrabold truncate" style={{ color }}>{person.displayName}</span>
                                            <CrownTier crown={person.bestCrown} />
                                        </span>
                                        <span className="block text-[11px] font-bold truncate" style={{ color }}>@{person.handle}</span>
                                    </span>
                                </button>
                                <FollowChip handle={person.handle} accentColor={color} following={person.following} />
                            </div>
                            )
                        })}

                        {boards.length > 0 && (
                            <SectionLabel icon={Crown} label={popular ? 'Gold boards' : 'Pride boards'} />
                        )}
                        {boards.map((board, index) => {
                            const itemIndex = (popular ? 0 : people.length) + index
                            return (
                                <div
                                    key={`board:${board.key}`}
                                    role="option"
                                    aria-selected={active === itemIndex}
                                    onMouseEnter={() => setActive(itemIndex)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                                        active === itemIndex ? 'bg-[#FF9600]/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                    )}
                                >
                                    <button type="button" onClick={() => go(prideBoardPath(board.key))} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                                        <Crown className="w-4 h-4 text-[#FF9600] shrink-0" />
                                        <span className="min-w-0 text-sm font-bold text-slate-800 dark:text-white truncate">
                                            {board.gold ? (
                                                <>
                                                    <span className="font-black" style={{ color: resolveAccentColor(board.gold.handle, board.gold.accentColor) }}>
                                                        {board.gold.displayName}
                                                    </span>
                                                    <span className="text-slate-400"> · </span>
                                                </>
                                            ) : null}
                                            {board.label}
                                        </span>
                                    </button>
                                    {board.gold?.handle && (
                                        <span className="flex items-center gap-1.5 shrink-0">
                                            <CrownTier crown={board.gold.bestCrown || 'gold'} />
                                            <FollowChip handle={board.gold.handle} accentColor={board.gold.accentColor} following={board.gold.following} />
                                        </span>
                                    )}
                                </div>
                            )
                        })}

                        {!loading && !error && items.length === 0 && (
                            <div className="px-4 py-8 text-center space-y-1">
                                <Sparkles className="w-5 h-5 text-[#FF9600] mx-auto" />
                                <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
                                    {popular ? 'Boards are empty for now' : 'No public matches'}
                                </p>
                                <p className="text-xs font-medium text-slate-500">
                                    {popular ? 'Completions from here on count. Gold holders will show up first.' : 'Try a handle, a name, or a board like quizzes.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function SectionLabel({ icon: Icon, label }: { icon: typeof Crown; label: string }) {
    return (
        <p className="px-3 pt-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Icon className="w-3 h-3" />
            {label}
        </p>
    )
}

