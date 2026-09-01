'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/context/auth-context'

import { readVanityOrgSlug } from '@/lib/vanity-cookie'
import type { OrgBrandingSettings } from '@/lib/org-branding'
import { resolveOrgAccent } from '@/lib/org-branding'

const STUDENT_ORG_KEY = 'ast_student_active_org_id'
export const STUDENT_PERSONAL = 'personal'

export type StudentOrgOption = {
    id: string
    name: string
    slug?: string
    branding?: OrgBrandingSettings
    cohort?: {
        id: string
        name: string
        joinCode?: string
    }
}

export function useStudentClubContext() {
    const { isAuthenticated, token, loading: authLoading } = useAuth()
    const [activeOrgId, setActiveOrgIdState] = useState<string | null>(null)

    const query = useQuery({
        queryKey: ['student-orgs-mine'],
        queryFn: async () => apiClient.orgs.mine(),
        enabled: !authLoading && (isAuthenticated || Boolean(token)),
    })

    const studentOrgs: StudentOrgOption[] = (Array.isArray(query.data?.studentOrgs) ? query.data.studentOrgs : [])
        .map((row: {
            org?: {
                id?: string
                name?: string
                slug?: string
                settings?: OrgBrandingSettings
            }
            cohort?: { id?: string; name?: string; joinCode?: string }
        }) => {
            const slug = row?.org?.slug
            const settings = row?.org?.settings
            return {
                id: row?.org?.id || '',
                name: row?.org?.name || 'Club',
                slug,
                branding: settings
                    ? {
                          accentColor:
                              settings.accentColor || resolveOrgAccent(slug, null),
                          logoUrl: settings.logoUrl ?? null,
                          bannerUrl: settings.bannerUrl ?? null,
                          welcomeMessage: settings.welcomeMessage ?? null,
                          prideScope: settings.prideScope,
                          brandingTier: settings.brandingTier,
                          joinLayout: settings.joinLayout,
                          faviconUrl: settings.faviconUrl ?? null,
                          allowPublicOptIn: settings.allowPublicOptIn,
                          vanityEnabled: settings.vanityEnabled,
                      }
                    : { accentColor: resolveOrgAccent(slug, null) },
                cohort: row?.cohort?.id
                    ? {
                          id: row.cohort.id,
                          name: row.cohort.name || 'Class',
                          joinCode: row.cohort.joinCode,
                      }
                    : undefined,
            }
        })
        .filter((row: StudentOrgOption) => row.id)

    const activeStudentOrg =
        activeOrgId && activeOrgId !== STUDENT_PERSONAL
            ? studentOrgs.find((o) => o.id === activeOrgId) || null
            : null
    const activeCohort = activeStudentOrg?.cohort ?? null

    const clubMode = query.data?.clubMode === true || studentOrgs.length > 0
    const publicAccess = query.data?.publicAccess === true
    const hasPersonalPrograms = query.data?.hasPersonalPrograms === true
    const hybridMode = query.data?.hybridMode === true || (clubMode && hasPersonalPrograms)
    // Marketplace / Explore: club kids need public_access. Personal lens is separate.
    const marketplaceOpen = !clubMode || publicAccess
    // Hybrids (and multi-club / public-access) can leave the club lens.
    const canUsePersonal = !clubMode || hybridMode || hasPersonalPrograms || publicAccess || studentOrgs.length > 1

    const orgIdsKey = studentOrgs.map((o) => o.id).join(',')

    useEffect(() => {
        if (query.isLoading) return
        let saved: string | null = null
        try {
            saved = window.localStorage.getItem(STUDENT_ORG_KEY)
        } catch {
            saved = null
        }
        if (saved === STUDENT_PERSONAL && canUsePersonal) {
            setActiveOrgIdState(STUDENT_PERSONAL)
            return
        }
        if (saved && studentOrgs.some((o) => o.id === saved)) {
            setActiveOrgIdState(saved)
            return
        }
        const vanitySlug = readVanityOrgSlug()
        if (vanitySlug) {
            const match = studentOrgs.find(
                (o) => o.slug && o.slug.toLowerCase() === vanitySlug.toLowerCase(),
            )
            if (match) {
                setActiveOrgIdState(match.id)
                try {
                    window.localStorage.setItem(STUDENT_ORG_KEY, match.id)
                } catch {
                    // ignore
                }
                return
            }
        }
        if (studentOrgs[0]) {
            setActiveOrgIdState(studentOrgs[0].id)
            return
        }
        setActiveOrgIdState(STUDENT_PERSONAL)
    }, [query.isLoading, orgIdsKey, canUsePersonal])

    const setActiveOrgId = (orgId: string) => {
        setActiveOrgIdState(orgId)
        try {
            window.localStorage.setItem(STUDENT_ORG_KEY, orgId)
        } catch {
            // ignore
        }
    }

    return {
        ...query,
        studentOrgs,
        clubMode,
        publicAccess,
        hasPersonalPrograms,
        hybridMode,
        canUsePersonal,
        marketplaceOpen,
        activeOrgId,
        setActiveOrgId,
        orgQueryParam: activeOrgId,
        activeStudentOrg,
        activeCohort,
    }
}
