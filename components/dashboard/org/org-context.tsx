'use client'

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import { apiClient } from '@/lib/api-client'

export type StaffOrg = {
    org: {
        id: string
        name: string
        slug: string
        status: string
        seatCap: number
        seatsUsed: number
        seatsRemaining: number
        settings?: {
            allowPublicOptIn?: boolean
            vanityEnabled?: boolean
            accentColor?: string | null
            logoUrl?: string | null
            bannerUrl?: string | null
            welcomeMessage?: string | null
            prideScope?: 'cohort' | 'org'
            brandingTier?: 'standard' | 'branded' | 'white_label'
            joinLayout?: 'standard' | 'hero'
        }
    }
    membership: {
        role: string
        status: string
    }
}

export type MemberRow = {
    id: string
    userId: string
    role: string
    status: string
    inviteEmail?: string | null
    inviteToken?: string | null
}

export type CohortRow = {
    id: string
    name: string
    joinCode: string
    status: string
    memberCount: number
    programIds?: string[]
}

export type OrgProgramRow = {
    _id: string
    name: string
    is_published?: boolean
}

type OrgDashboardContextValue = {
    staffOrgs: StaffOrg[]
    selectedId: string | null
    selected: StaffOrg | null
    setSelectedId: (id: string) => void
    members: MemberRow[]
    cohorts: CohortRow[]
    orgPrograms: OrgProgramRow[]
    membershipRole: string
    isOwner: boolean
    loading: boolean
    busy: boolean
    setBusy: (busy: boolean) => void
    error: string
    setError: (message: string) => void
    programsLoading: boolean
    programsError: string
    refreshAll: () => Promise<void>
    refreshOrg: () => Promise<void>
    refreshPrograms: () => Promise<void>
    refreshStaff: () => Promise<void>
}

const OrgDashboardContext = createContext<OrgDashboardContextValue | null>(null)

const SELECTED_ORG_KEY = 'ast_org_dashboard_selected'

function readSavedOrgId(): string | null {
    if (typeof window === 'undefined') return null
    try {
        const value = window.localStorage.getItem(SELECTED_ORG_KEY)
        return value && value.trim() ? value.trim() : null
    } catch {
        return null
    }
}

function writeSavedOrgId(id: string | null) {
    if (typeof window === 'undefined') return
    try {
        if (!id) window.localStorage.removeItem(SELECTED_ORG_KEY)
        else window.localStorage.setItem(SELECTED_ORG_KEY, id)
    } catch {
        // ignore
    }
}

export function OrgDashboardProvider({ children }: { children: ReactNode }) {
    const [staffOrgs, setStaffOrgs] = useState<StaffOrg[]>([])
    const [selectedId, setSelectedIdState] = useState<string | null>(null)
    const [members, setMembers] = useState<MemberRow[]>([])
    const [cohorts, setCohorts] = useState<CohortRow[]>([])
    const [orgPrograms, setOrgPrograms] = useState<OrgProgramRow[]>([])
    const [membershipRole, setMembershipRole] = useState('tutor')
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [programsLoading, setProgramsLoading] = useState(false)
    const [programsError, setProgramsError] = useState('')

    const selected = useMemo(
        () => staffOrgs.find((row) => row.org.id === selectedId) || null,
        [staffOrgs, selectedId],
    )
    const isOwner = membershipRole === 'owner'

    const setSelectedId = useCallback((id: string) => {
        setSelectedIdState(id)
        writeSavedOrgId(id)
    }, [])

    const refreshStaff = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const data = await apiClient.orgs.mine()
            const rows: StaffOrg[] = Array.isArray(data?.staffOrgs) ? data.staffOrgs : []
            setStaffOrgs(rows)
            setSelectedIdState((current) => {
                const saved = readSavedOrgId()
                if (saved && rows.some((row) => row.org.id === saved)) return saved
                if (current && rows.some((row) => row.org.id === current)) return current
                const next = rows[0]?.org?.id || null
                if (next) writeSavedOrgId(next)
                return next
            })
        } catch {
            setError('Could not load your clubs.')
            setStaffOrgs([])
        } finally {
            setLoading(false)
        }
    }, [])

    const refreshOrg = useCallback(async () => {
        if (!selectedId) return
        setError('')
        try {
            const data = await apiClient.orgs.get(selectedId)
            setMembers(Array.isArray(data?.members) ? data.members : [])
            setCohorts(Array.isArray(data?.cohorts) ? data.cohorts : [])
            setMembershipRole(data?.membership?.role || 'tutor')
            if (data?.org) {
                setStaffOrgs((current) =>
                    current.map((row) =>
                        row.org.id === selectedId
                            ? { ...row, org: { ...row.org, ...data.org } }
                            : row,
                    ),
                )
            }
        } catch {
            setError('You do not have staff access to this club.')
            setMembers([])
            setCohorts([])
        }
    }, [selectedId])

    const refreshPrograms = useCallback(async () => {
        if (!selectedId) return
        setProgramsLoading(true)
        setProgramsError('')
        try {
            const data = await apiClient.orgs.getPrograms(selectedId)
            const rows = Array.isArray(data?.programs) ? data.programs : []
            setOrgPrograms(rows)
        } catch {
            setOrgPrograms([])
            setProgramsError('Could not load club programs.')
        } finally {
            setProgramsLoading(false)
        }
    }, [selectedId])

    const refreshAll = useCallback(async () => {
        await refreshStaff()
        await Promise.all([refreshOrg(), refreshPrograms()])
    }, [refreshStaff, refreshOrg, refreshPrograms])

    useEffect(() => {
        void refreshStaff()
    }, [refreshStaff])

    useEffect(() => {
        if (!selectedId) return
        void refreshOrg()
        void refreshPrograms()
    }, [selectedId, refreshOrg, refreshPrograms])

    const value = useMemo<OrgDashboardContextValue>(
        () => ({
            staffOrgs,
            selectedId,
            selected,
            setSelectedId,
            members,
            cohorts,
            orgPrograms,
            membershipRole,
            isOwner,
            loading,
            busy,
            setBusy,
            error,
            setError,
            programsLoading,
            programsError,
            refreshAll,
            refreshOrg,
            refreshPrograms,
            refreshStaff,
        }),
        [
            staffOrgs,
            selectedId,
            selected,
            setSelectedId,
            members,
            cohorts,
            orgPrograms,
            membershipRole,
            isOwner,
            loading,
            busy,
            error,
            programsLoading,
            programsError,
            refreshAll,
            refreshOrg,
            refreshPrograms,
            refreshStaff,
        ],
    )

    return <OrgDashboardContext.Provider value={value}>{children}</OrgDashboardContext.Provider>
}

export function useOrgDashboard() {
    const ctx = useContext(OrgDashboardContext)
    if (!ctx) {
        throw new Error('useOrgDashboard must be used within OrgDashboardProvider')
    }
    return ctx
}
