import type { ReactNode } from "react"

export function PageHero({
    title,
    description,
    back,
    badge,
}: {
    title: ReactNode
    description?: string
    back?: ReactNode
    badge?: ReactNode
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                {back}
                <div>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">{title}</h1>
                    {description ? (
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{description}</p>
                    ) : null}
                </div>
            </div>
            {badge}
        </div>
    )
}
