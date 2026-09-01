/** Copy helpers for club-scoped pride / people surfaces */

export type PrideScopeType = 'global' | 'cohort' | 'org' | string | undefined

export function clubPrideEyebrow(scopeType?: PrideScopeType) {
    if (scopeType === 'cohort') return 'Class pride'
    if (scopeType === 'org') return 'Club pride'
    return 'Live pride'
}

export function clubPrideTitle(scopeType?: PrideScopeType) {
    if (scopeType === 'cohort') return 'Class crowns and boards'
    if (scopeType === 'org') return 'Club crowns and boards'
    return 'Crowns and boards'
}

export function clubPrideDescription(scopeType?: PrideScopeType) {
    if (scopeType === 'cohort') {
        return 'Ranks among your classmates in this class. Switch to Personal for public boards.'
    }
    if (scopeType === 'org') {
        return 'Ranks across everyone in your club. Switch to Personal for public boards.'
    }
    return 'Public ranks only. Gold, silver, and bronze are 1st, 2nd, and 3rd.'
}

export function clubPrideShowcaseDescription(scopeType?: PrideScopeType) {
    if (scopeType === 'cohort') {
        return 'Ranks among your classmates — not the public board.'
    }
    if (scopeType === 'org') {
        return 'Ranks across your whole club — not the public board.'
    }
    return 'Gold, silver, and bronze on boards that are moving right now.'
}

export function clubLensLabel(scopeType?: PrideScopeType) {
    if (scopeType === 'cohort') return 'Your class'
    if (scopeType === 'org') return 'Your club'
    return 'Your club'
}
