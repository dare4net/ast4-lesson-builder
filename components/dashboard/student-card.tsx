"use client"

import Link from "next/link"
import type { MouseEventHandler, ReactNode } from "react"
import { OptimizedImage } from "@/components/ui/optimized-image"

export function StudentCard({
    href,
    onClick,
    imageUrl,
    imageAlt,
    badge,
    overlay,
    title,
    subtitle,
    footer,
}: {
    href: string
    onClick?: MouseEventHandler<HTMLAnchorElement>
    imageUrl: string
    imageAlt: string
    badge?: ReactNode
    overlay?: ReactNode
    title: string
    subtitle?: ReactNode
    footer?: ReactNode
}) {
    return (
        <Link href={href} onClick={onClick} className="group relative h-full block">
            <div className="relative h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-200 hover:border-[#1CB0F6]/50 hover:-translate-y-0.5 hover:shadow-md shadow-sm flex flex-col justify-between">
                <div>
                    <div className="h-32 sm:h-36 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/80">
                        <OptimizedImage
                            src={imageUrl}
                            alt={imageAlt}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {badge ? (
                            <div className="absolute top-2.5 right-2.5 flex items-center justify-end pointer-events-none">
                                {badge}
                            </div>
                        ) : null}
                        {overlay ? (
                            <div className="absolute bottom-2 left-2.5">{overlay}</div>
                        ) : null}
                    </div>
                    <div className="p-4 sm:p-5 space-y-2">
                        <h3 className="text-base font-extrabold text-slate-800 dark:text-white group-hover:text-[#1CB0F6] transition-colors line-clamp-2 leading-snug">{title}</h3>
                        {subtitle}
                    </div>
                </div>
                {footer ? <div className="px-4 sm:px-5 pb-4 sm:pb-5">{footer}</div> : null}
            </div>
        </Link>
    )
}
