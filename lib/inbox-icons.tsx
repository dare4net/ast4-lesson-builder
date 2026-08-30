import type { LucideIcon } from 'lucide-react'
import {
    Award,
    Bell,
    BookOpen,
    Crown,
    Flame,
    Layers,
    Rocket,
    Star,
    Target,
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
