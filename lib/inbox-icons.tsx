import type { LucideIcon } from 'lucide-react'
import {
    Award,
    BarChart2,
    Bell,
    BookOpen,
    Cloud,
    Crown,
    Flame,
    Layers,
    MessageSquare,
    PenLine,
    Rocket,
    SlidersHorizontal,
    Star,
    Target,
    Unlock,
    UserPlus,
} from 'lucide-react'

const ICONS: Record<string, { icon: LucideIcon; className: string }> = {
    ACHIEVEMENT_EARNED: { icon: Award, className: 'bg-[#CE82FF]/15 text-[#CE82FF]' },
    MISSION_CLAIMED: { icon: Target, className: 'bg-[#58CC02]/15 text-[#58CC02]' },
    LEVEL_UP: { icon: Rocket, className: 'bg-[#1CB0F6]/15 text-[#1CB0F6]' },
    FOLLOWED_YOU: { icon: UserPlus, className: 'bg-[#1CB0F6]/15 text-[#1CB0F6]' },
    CROWN_GOLD: { icon: Crown, className: 'bg-[#FF9600]/15 text-[#FF9600]' },
    PROGRAM_LESSON_PUBLISHED: { icon: BookOpen, className: 'bg-[#58CC02]/15 text-[#58CC02]' },
    PROGRAM_MODULE_PUBLISHED: { icon: Layers, className: 'bg-[#58CC02]/15 text-[#58CC02]' },
    TUTOR_MARKED: { icon: PenLine, className: 'bg-[#1CB0F6]/15 text-[#1CB0F6]' },
    NEXT_LESSON_UNLOCKED: { icon: Unlock, className: 'bg-[#58CC02]/15 text-[#58CC02]' },
    CLASS_POLL_LIVE: { icon: BarChart2, className: 'bg-[#1CB0F6]/15 text-[#1CB0F6]' },
    CLASS_CLOUD_LIVE: { icon: Cloud, className: 'bg-[#CE82FF]/15 text-[#CE82FF]' },
    CLASS_SCALE_LIVE: { icon: SlidersHorizontal, className: 'bg-[#FF9600]/15 text-[#FF9600]' },
    CLASS_ACTIVITY: { icon: MessageSquare, className: 'bg-[#FF9600]/15 text-[#FF9600]' },
    LOGIN_STREAK: { icon: Flame, className: 'bg-[#FF9600]/15 text-[#FF9600]' },
    STARS_SPENT: { icon: Star, className: 'bg-[#FF9600]/15 text-[#FF9600]' },
}

export function InboxTypeIcon({ type }: { type?: string }) {
    const spec = (type && ICONS[type]) || { icon: Bell, className: 'bg-slate-100 text-slate-500' }
    const Icon = spec.icon
    return (
        <span className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${spec.className}`}>
            <Icon className="w-4 h-4" />
        </span>
    )
}
