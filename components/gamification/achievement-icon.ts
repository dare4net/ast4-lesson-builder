import {
    Award,
    Brain,
    Flame,
    Rocket,
    Star,
    Target,
    Trophy,
    Zap,
    type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
    brain: Brain,
    star: Star,
    zap: Zap,
    award: Award,
    trophy: Trophy,
    target: Target,
    rocket: Rocket,
    flame: Flame,
}

export function achievementIcon(name?: string): LucideIcon {
    return ICONS[name || ''] || Award
}
