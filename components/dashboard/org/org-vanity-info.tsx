'use client'

import { ExternalLink, Globe } from 'lucide-react'
import { useOrgDashboard } from '@/components/dashboard/org/org-context'
import { vanityHostForSlug } from '@/lib/vanity-host'

export function OrgVanityInfo() {
    const { selected } = useOrgDashboard()
    if (!selected?.org.slug) return null

    const enabled = selected.org.settings?.vanityEnabled === true
    if (!enabled) return null

    const host = vanityHostForSlug(selected.org.slug)
    const url = `https://${host}`

    return (
        <section className="rounded-2xl border-2 border-slate-100 bg-white p-5 space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-sm font-black text-slate-800">Vanity subdomain</h2>
                    <p className="text-xs text-slate-500 font-medium">
                        Students can open your join links on your branded host
                    </p>
                </div>
            </div>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-800 hover:bg-sky-100"
            >
                {host}
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            <p className="text-[11px] text-slate-500 font-medium">
                Share cohort codes at <span className="font-mono">{host}/join/YOUR-CODE</span>. DNS must point
                the subdomain to this app (configured by After-school.tech).
            </p>
        </section>
    )
}
