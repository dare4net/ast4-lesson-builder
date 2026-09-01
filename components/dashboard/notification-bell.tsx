"use client"

import { useEffect, useRef, useState } from "react"
import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { InboxTypeIcon } from "@/lib/inbox-icons"
import { useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/context/auth-context"
import { useNotificationsInbox } from "@/hooks/use-notifications"
import { apiClient } from "@/lib/api-client"
import { appEventBus } from "@/lib/event-bus"
import { shouldToastInboxItem } from "@/lib/inbox"
import { CURRICULUM_INBOX_TYPES } from "@/lib/program-progress"
import { queryKeys } from "@/lib/query-keys"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type NotificationRow = {
    id: string
    type?: string
    actorId?: string | null
    title?: string
    body?: string
    href?: string | null
    read?: boolean
    createdAt?: string
}

export function NotificationBell() {
    const { user } = useAuth()
    const router = useRouter()
    const queryClient = useQueryClient()
    const { notifications, unreadCount, refetchInbox, refetchUnread } = useNotificationsInbox()
    const [open, setOpen] = useState(false)
    const primed = useRef(false)
    const seenIds = useRef(new Set<string>())

    useEffect(() => {
        if (!notifications.length && !primed.current) return
        if (!primed.current) {
            notifications.forEach((item: NotificationRow) => {
                if (item.id) seenIds.current.add(item.id)
            })
            primed.current = true
            return
        }
        for (const item of notifications as NotificationRow[]) {
            if (!item.id || seenIds.current.has(item.id)) continue
            seenIds.current.add(item.id)
            if (shouldToastInboxItem(item, user?.user_id)) {
                appEventBus.emit("INBOX_NOTICE", {
                    title: item.title || "New notification",
                    body: item.body || "",
                })
            }
            if (item.type && CURRICULUM_INBOX_TYPES.has(item.type)) {
                queryClient.invalidateQueries({ queryKey: ['programs', 'mine'] })
            }
        }
    }, [notifications, user?.user_id, queryClient])

    const refresh = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
            queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnread }),
            refetchInbox(),
            refetchUnread(),
        ])
    }

    const markAllRead = async () => {
        if (!unreadCount) return
        await apiClient.notifications.markRead({ all: true })
        await refresh()
    }

    const openItem = async (item: NotificationRow) => {
        if (!item.read) {
            await apiClient.notifications.markRead({ ids: [item.id] })
            await refresh()
        }
        setOpen(false)
        if (item.href) router.push(item.href)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
                    className="relative h-11 w-11 rounded-xl hover:bg-slate-100"
                >
                    <Bell className="w-6 h-6 text-slate-700" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-[#FF4B4B] text-white text-[9px] font-black leading-4 text-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-80 p-0 bg-white border-2 border-slate-100 rounded-2xl shadow-lg overflow-hidden"
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-extrabold text-slate-800">Inbox</p>
                    <button
                        type="button"
                        onClick={markAllRead}
                        disabled={!unreadCount}
                        className="text-[11px] font-bold text-[#1CB0F6] disabled:text-slate-300"
                    >
                        Mark all read
                    </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <p className="px-4 py-8 text-center text-xs font-medium text-slate-400">
                            You&apos;re all caught up.
                        </p>
                    ) : (
                        notifications.map((item: NotificationRow) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => openItem(item)}
                                className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                                    item.read ? "opacity-70" : "bg-[#1CB0F6]/5"
                                }`}
                            >
                                <InboxTypeIcon type={item.type} />
                                <span className="min-w-0 flex-1">
                                    <p className="text-xs font-extrabold text-slate-800">{item.title}</p>
                                    {item.body ? (
                                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{item.body}</p>
                                    ) : null}
                                    {item.createdAt ? (
                                        <p className="text-[10px] font-semibold text-slate-400 mt-1">
                                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                        </p>
                                    ) : null}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
