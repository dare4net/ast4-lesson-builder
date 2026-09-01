const ACTIVE_ORG_KEY = 'ast_active_org_id'
export const PERSONAL_ORG_ID = 'personal'
export const ACTIVE_ORG_EVENT = 'ast-active-org-change'

export type ActiveOrg = {
    id: string
    name: string
    slug?: string
}

/** Stored scope: real org id, or `personal` for indie library. */
export function getActiveOrgId(): string | null {
    if (typeof window === 'undefined') return null
    try {
        const value = window.localStorage.getItem(ACTIVE_ORG_KEY)
        return value && value.trim() ? value.trim() : null
    } catch {
        return null
    }
}

export function setActiveOrgId(orgId: string | null) {
    if (typeof window === 'undefined') return
    try {
        if (!orgId) window.localStorage.removeItem(ACTIVE_ORG_KEY)
        else window.localStorage.setItem(ACTIVE_ORG_KEY, orgId)
        window.dispatchEvent(new CustomEvent(ACTIVE_ORG_EVENT, { detail: { orgId } }))
    } catch {
        // ignore quota / private mode
    }
}

/** Value to pass to studio APIs (`personal` or org id). */
export function getStudioOrgQuery(orgId: string | null | undefined): string | null {
    if (!orgId || orgId === PERSONAL_ORG_ID) return PERSONAL_ORG_ID
    return orgId
}
