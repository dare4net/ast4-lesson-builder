export const BLOCK_RESET_STORE_COST = 10
export const BLOCK_RESET_ON_DEMAND_COST = 15
/** Stars charged if you reset a live block with no store charge left. */
export const BLOCK_RESET_COST = BLOCK_RESET_ON_DEMAND_COST

export const REFERENCE_STORE_COST = 10
export const REFERENCE_ON_DEMAND_COST = 15
/** Stars charged if you open a live reference with no store credit left. */
export const REFERENCE_LIVE_COST = REFERENCE_ON_DEMAND_COST

/** Stars to skip the 50% previous-lesson gate. */
export const LESSON_EARLY_UNLOCK_COST = 20
export const LESSON_UNLOCK_PROGRESS = 50

export const PREMIUM_ACCENT_COLORS = ['#14B8A6', '#F472B6', '#0EA5E9'] as const

export const CONSUMABLE_SKUS = ['hint_pack', 'live_block_reset', 'reference_credit'] as const
export const COSMETIC_SKUS = ['avatar_frame', 'nameplate', 'accent_pack', 'pride_pin'] as const
