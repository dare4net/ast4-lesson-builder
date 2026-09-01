'use client'

import { SuperadminPageHeader } from '@/components/superadmin/superadmin-page-header'
import { OrgsPanel } from '@/components/superadmin/orgs-panel'

export default function SuperadminOrgsPage() {
    return (
        <div className="space-y-6">
            <SuperadminPageHeader
                title="Organisations"
                description="Create clubs, copy owner invites, manage cohorts, programs, vanity subdomains, and branding plans."
            />
            <OrgsPanel />
        </div>
    )
}
