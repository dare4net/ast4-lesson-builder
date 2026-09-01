import {
    Building2,
    LayoutDashboard,
    PlayCircle,
    Target,
    Trophy,
    type LucideIcon,
} from 'lucide-react'

export const SUPERADMIN_ROOT = '/superadmin'

export type SuperadminNavItem = {
    href: string
    label: string
    description?: string
    icon: LucideIcon
}

export const SUPERADMIN_NAV_ITEMS: SuperadminNavItem[] = [
    {
        href: SUPERADMIN_ROOT,
        label: 'Overview',
        description: 'Platform snapshot',
        icon: LayoutDashboard,
    },
    {
        href: `${SUPERADMIN_ROOT}/missions`,
        label: 'Missions',
        description: 'Levels & star quests',
        icon: Target,
    },
    {
        href: `${SUPERADMIN_ROOT}/achievements`,
        label: 'Achievements',
        description: 'Badges & rules',
        icon: Trophy,
    },
    {
        href: `${SUPERADMIN_ROOT}/jobs`,
        label: 'Jobs',
        description: 'Push reminders',
        icon: PlayCircle,
    },
    {
        href: `${SUPERADMIN_ROOT}/orgs`,
        label: 'Organisations',
        description: 'Clubs & cohorts',
        icon: Building2,
    },
]
