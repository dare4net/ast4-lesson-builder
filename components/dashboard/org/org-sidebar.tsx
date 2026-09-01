'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink, LogOut } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { isNavActive } from '@/lib/nav-active'
import { ORG_DASHBOARD_ROOT, ORG_NAV_ITEMS } from '@/lib/org-nav'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { useOrgDashboard } from '@/components/dashboard/org/org-context'
import { setActiveOrgId } from '@/lib/active-org'

export function OrgSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()
    const { logout } = useAuth()
    const { staffOrgs, selectedId, selected, setSelectedId } = useOrgDashboard()

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 260 }}
            className={cn(
                'hidden md:flex flex-col fixed left-0 top-0 h-screen z-40 border-r border-slate-200 bg-white/95 backdrop-blur-xl',
                isCollapsed ? 'items-center' : 'items-stretch',
            )}
        >
            <div
                className={cn(
                    'h-16 flex items-center border-b border-slate-100 shrink-0',
                    isCollapsed ? 'justify-center px-0' : 'justify-between px-4',
                )}
            >
                {!isCollapsed ? (
                    <Link href={ORG_DASHBOARD_ROOT} className="flex items-center gap-2.5 min-w-0">
                        <Image
                            src="/icons/icon-192x192.png"
                            alt="After-school.tech"
                            width={32}
                            height={32}
                            className="rounded-lg shrink-0"
                        />
                        <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate">After-school.tech</p>
                            <p className="text-[10px] font-bold text-sky-600">Club dashboard</p>
                        </div>
                    </Link>
                ) : (
                    <Image
                        src="/icons/icon-192x192.png"
                        alt="After-school.tech"
                        width={32}
                        height={32}
                        className="rounded-lg"
                    />
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-7 w-7 text-slate-400 hover:text-slate-600 absolute -right-3.5 top-5 bg-white border border-slate-200 rounded-full z-10 shadow-sm"
                >
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </Button>
            </div>

            {!isCollapsed && staffOrgs.length > 0 && (
                <div className="px-3 pt-3 pb-1">
                    {staffOrgs.length === 1 ? (
                        <div className="rounded-xl bg-sky-50 border border-sky-100 px-3 py-2">
                            <p className="text-[9px] font-black uppercase tracking-wide text-sky-600">Active club</p>
                            <p className="text-xs font-black text-slate-800 truncate">{selected?.org.name}</p>
                        </div>
                    ) : (
                        <label className="block space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-wide text-slate-400 px-1">
                                Active club
                            </span>
                            <select
                                value={selectedId || ''}
                                onChange={(e) => setSelectedId(e.target.value)}
                                className="w-full h-9 rounded-xl border-2 border-sky-100 bg-sky-50 text-xs font-bold text-sky-900 px-2"
                            >
                                {staffOrgs.map((row) => (
                                    <option key={row.org.id} value={row.org.id}>
                                        {row.org.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                </div>
            )}

            <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
                {ORG_NAV_ITEMS.map((item) => {
                    const active = isNavActive(pathname, item.href, ORG_DASHBOARD_ROOT)
                    return (
                        <Link key={item.href} href={item.href} title={isCollapsed ? item.label : undefined}>
                            <div
                                className={cn(
                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                                    active
                                        ? 'bg-sky-50 text-sky-800 border border-sky-100'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                                    isCollapsed && 'justify-center px-2',
                                )}
                            >
                                <item.icon className={cn('w-4 h-4 shrink-0', active && 'text-sky-600')} />
                                {!isCollapsed && (
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold">{item.label}</p>
                                        {item.description && (
                                            <p className="text-[10px] text-slate-400 font-medium truncate">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            <div className={cn('border-t border-slate-100 p-2 space-y-1', isCollapsed && 'flex flex-col items-center')}>
                <Link
                    href="/studio"
                    onClick={() => selectedId && setActiveOrgId(selectedId)}
                    className={cn(
                        'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition-colors',
                        isCollapsed && 'px-2 justify-center',
                    )}
                >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    {!isCollapsed && 'Creator Studio'}
                </Link>
                <button
                    type="button"
                    onClick={() => logout()}
                    className={cn(
                        'w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors',
                        isCollapsed && 'px-2 justify-center w-auto',
                    )}
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    {!isCollapsed && 'Log out'}
                </button>
            </div>
        </motion.aside>
    )
}
