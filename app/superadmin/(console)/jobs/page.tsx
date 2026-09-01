'use client'

import { SuperadminPageHeader } from '@/components/superadmin/superadmin-page-header'
import { JobsPanel } from '@/components/superadmin/jobs-panel'

export default function SuperadminJobsPage() {
    return (
        <div className="space-y-6">
            <SuperadminPageHeader
                title="Manual jobs"
                description="Evening push reminders — preview builds the audience; run sends FCM and saves a snapshot."
            />
            <JobsPanel />
        </div>
    )
}
