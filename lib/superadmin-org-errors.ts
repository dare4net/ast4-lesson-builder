type OrgApiErrorBody = {
    error?: string
    code?: string
}

export function mapSuperadminOrgError(err: unknown, fallback: string): string {
    const data = (err as { response?: { data?: OrgApiErrorBody } })?.response?.data
    if (!data) return fallback

    const { error, code } = data
    switch (code) {
        case 'seat_cap':
            return 'Student seat cap reached. Raise the cap under Org settings or free a seat.'
        case 'org_suspended':
            return 'This organisation is suspended. Set status to Active before joins or new student seats.'
        case 'slug_taken':
            return 'That slug is already in use. Pick another slug for this club.'
        case 'role_conflict_student':
            return 'That email belongs to a student account. Tutors and owners need a non-student login.'
        case 'staff_invite_pending':
            return 'This person already has a pending staff invite for this club.'
        case 'invite_already_completed':
            return 'That invite was already accepted.'
        case 'account_exists':
            return error || 'An account conflict blocked this invite.'
        case 'org_not_found':
            return 'Organisation not found — refresh the list.'
        default:
            return error || fallback
    }
}

export const ORG_STATUS_OPTIONS = [
    { value: 'active', label: 'Active', hint: 'Join codes and invites work normally.' },
    { value: 'trial', label: 'Trial', hint: 'Pilot club — same as active for now.' },
    { value: 'suspended', label: 'Suspended', hint: 'Blocks new joins; use for non-payment or abuse.' },
] as const

export type OrgStatus = (typeof ORG_STATUS_OPTIONS)[number]['value']

export function orgStatusTone(status: string): string {
    if (status === 'suspended') return 'bg-red-50 text-red-700 border-red-100'
    if (status === 'trial') return 'bg-sky-50 text-sky-700 border-sky-100'
    return 'bg-emerald-50 text-emerald-700 border-emerald-100'
}
