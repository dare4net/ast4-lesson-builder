export type InboxItem = {
    id: string
    type?: string
    actorId?: string | null
    title?: string
    body?: string
    href?: string | null
}

/** Toast garnish only for mail from someone else — never for your own claims/badges. */
export function shouldToastInboxItem(item: InboxItem, myUserId?: string | null) {
    if (!item?.id) return false
    const actorId = item.actorId || null
    if (!actorId || !myUserId) return false
    return actorId !== myUserId
}
