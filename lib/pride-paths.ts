export const PRIDE_INDEX_PATH = '/dashboard/student/pride'

export function prideBoardPath(statKey: string) {
    return `${PRIDE_INDEX_PATH}/${encodeURIComponent(statKey)}`
}

export function publicProfilePath(handle: string) {
    return `/dashboard/student/u/${encodeURIComponent(String(handle || '').trim().toLowerCase())}`
}
