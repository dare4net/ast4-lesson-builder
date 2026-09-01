'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { isNavActive } from '@/lib/nav-active'
import { ORG_DASHBOARD_ROOT, ORG_NAV_ITEMS } from '@/lib/org-nav'

const MOBILE_NAV = [
    ...ORG_NAV_ITEMS.filter((item) => item.label !== 'Settings'),
    ORG_NAV_ITEMS.find((item) => item.label === 'Settings')!,
]

export function OrgMobileNav() {
    const pathname = usePathname()

    return (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200">
            <div className="flex items-stretch justify-around px-0.5 h-16 max-w-lg mx-auto">
                {MOBILE_NAV.map((item) => {
                    const active = isNavActive(pathname, item.href, ORG_DASHBOARD_ROOT)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1 min-w-0"
                        >
                            <div
                                className={cn(
                                    'p-1.5 rounded-xl transition-colors',
                                    active ? 'bg-sky-50 text-sky-700' : 'text-slate-400',
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span
                                className={cn(
                                    'text-[9px] font-bold truncate max-w-full px-0.5',
                                    active ? 'text-sky-700' : 'text-slate-500',
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
