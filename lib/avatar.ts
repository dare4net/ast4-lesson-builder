export const AVATAR_IDS = [
    'nova', 'pixel', 'comet', 'mango', 'kiwi', 'blaze',
    'frost', 'luna', 'orbit', 'zest', 'coral', 'mint',
    'rocket', 'wave', 'spark', 'ember', 'sage', 'sunny',
    'jazz', 'pebble',
] as const

export type AvatarId = (typeof AVATAR_IDS)[number]

export function isAvatarId(value?: string | null): value is AvatarId {
    return AVATAR_IDS.includes(String(value || '') as AvatarId)
}

export function defaultAvatarId(seed?: string | null): AvatarId {
    const text = String(seed || 'student')
    let n = 0
    for (let i = 0; i < text.length; i += 1) {
        n = (n + text.charCodeAt(i) * (i + 1)) % AVATAR_IDS.length
    }
    return AVATAR_IDS[n]
}

export function resolveAvatarId(seed?: string | null, chosen?: string | null): AvatarId {
    if (isAvatarId(chosen)) return chosen
    return defaultAvatarId(seed)
}

export function avatarUrl(seed?: string | null, chosen?: string | null) {
    const id = resolveAvatarId(seed, chosen)
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(id)}`
}
