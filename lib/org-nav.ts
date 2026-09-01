import {
    BookOpen,
    Building2,
    LayoutDashboard,
    Settings,
    UserPlus,
    Users,
    type LucideIcon,
} from 'lucide-react'

export const ORG_DASHBOARD_ROOT = '/dashboard/org'

export type OrgNavItem = {
    label: string
    href: string
    icon: LucideIcon
    description?: string
}

export const ORG_NAV_ITEMS: OrgNavItem[] = [
    {
        label: 'Overview',
        href: ORG_DASHBOARD_ROOT,
        icon: LayoutDashboard,
        description: 'Club snapshot and quick actions',
    },
    {
        label: 'Programs',
        href: `${ORG_DASHBOARD_ROOT}/programs`,
        icon: BookOpen,
        description: 'Courses created for this club',
    },
    {
        label: 'Cohorts',
        href: `${ORG_DASHBOARD_ROOT}/cohorts`,
        icon: Users,
        description: 'Classes, join codes, and auto-enrolment',
    },
    {
        label: 'People',
        href: `${ORG_DASHBOARD_ROOT}/people`,
        icon: UserPlus,
        description: 'Staff, tutors, and student invites',
    },
    {
        label: 'Settings',
        href: `${ORG_DASHBOARD_ROOT}/settings`,
        icon: Settings,
        description: 'Club preferences and billing',
    },
]

export const ORG_BRAND = {
    title: 'After-school.tech',
    subtitle: 'Club dashboard',
    icon: Building2,
}
