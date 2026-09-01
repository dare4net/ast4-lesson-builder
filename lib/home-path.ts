/** Default post-login home by JWT / account role. */
export function homePathForRole(role?: string | null): string {
    const normalized = String(role || '').toLowerCase()
    if (normalized === 'organization' || normalized === 'org') return '/dashboard/org'
    if (normalized === 'tutor' || normalized === 'teacher' || normalized === 'admin') {
        return '/dashboard/tutor'
    }
    return '/dashboard/student'
}
