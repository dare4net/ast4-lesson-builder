"use client"

import type { ReactNode } from "react"
import type { GraphicPatternStyle, SlideTheme } from "@/lib/slide-themes"
import { cn } from "@/lib/utils"

export function GraphicBackground({
    pattern,
    theme,
    idPrefix = "cue",
    intensity = "full",
}: {
    pattern: GraphicPatternStyle
    theme: SlideTheme
    idPrefix?: string
    intensity?: "full" | "whisper"
}) {
    const color = theme.shapeHex
    const patternId = `${idPrefix}-texture`
    const opacity = intensity === "whisper" ? "opacity-25" : "opacity-50"

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
                className="absolute -top-28 -left-24 h-80 w-80 rounded-full blur-3xl"
                style={{ backgroundColor: theme.shapeHex, opacity: intensity === "whisper" ? 0.35 : 0.8 }}
            />
            <div
                className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full blur-3xl"
                style={{ backgroundColor: theme.btnBgHex, opacity: intensity === "whisper" ? 0.12 : 0.22 }}
            />
            <div
                className="absolute top-1/3 right-1/4 h-48 w-48 rounded-full blur-3xl"
                style={{ backgroundColor: "#CE82FF", opacity: intensity === "whisper" ? 0.08 : 0.16 }}
            />

            {pattern === "polka-dots" && (
                <svg className={cn("absolute inset-0 w-full h-full", opacity)} xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id={patternId} x="0" y="0" width="72" height="72" patternUnits="userSpaceOnUse">
                            <circle cx="16" cy="16" r="6" fill={color} />
                            <circle cx="52" cy="48" r="9" fill={color} />
                            <circle cx="58" cy="14" r="4" fill={color} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${patternId})`} />
                </svg>
            )}

            {pattern === "waves" && (
                <div className={cn("absolute inset-0 overflow-hidden", opacity)}>
                    <svg className="absolute -top-8 left-0 w-full h-72" viewBox="0 0 1440 320" fill="none">
                        <path
                            fill={color}
                            d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,213.3C672,224,768,192,864,165.3C960,139,1056,117,1152,128C1248,139,1344,181,1392,202.7L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                        />
                    </svg>
                    <svg className="absolute -bottom-8 left-0 w-full h-72 rotate-180" viewBox="0 0 1440 320" fill="none">
                        <path
                            fill={color}
                            d="M0,96L48,128C96,160,192,224,288,224C384,224,480,160,576,149.3C672,139,768,181,864,192C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                        />
                    </svg>
                </div>
            )}

            {pattern === "polygons" && (
                <svg className={cn("absolute inset-0 w-full h-full", opacity)} xmlns="http://www.w3.org/2000/svg">
                    <polygon points="50,20 90,90 10,90" fill={color} transform="translate(80, 70) rotate(15)" />
                    <polygon points="50,10 90,80 10,80" fill={color} transform="translate(820, 380) rotate(-25)" />
                    <rect x="180" y="430" width="72" height="72" rx="18" fill={color} transform="rotate(24 216 466)" />
                    <rect x="980" y="140" width="96" height="96" rx="24" fill={color} transform="rotate(12 1028 188)" />
                </svg>
            )}

            {pattern === "squiggles" && (
                <svg className={cn("absolute inset-0 w-full h-full", opacity)} xmlns="http://www.w3.org/2000/svg">
                    <path d="M 40 160 Q 110 90 180 160 T 320 160" stroke={color} strokeWidth="16" fill="none" strokeLinecap="round" />
                    <path d="M 780 90 Q 850 30 920 90 T 1060 90" stroke={color} strokeWidth="18" fill="none" strokeLinecap="round" />
                    <circle cx="720" cy="460" r="36" fill={color} />
                    <circle cx="1080" cy="400" r="22" fill={color} />
                </svg>
            )}

            {pattern === "sunburst" && (
                <div className={cn("absolute inset-0 overflow-hidden", opacity)}>
                    <svg
                        className="absolute left-1/2 top-1/2 max-w-none w-[220vmax] h-[220vmax] -translate-x-1/2 -translate-y-1/2"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="xMidYMid slice"
                    >
                        {Array.from({ length: 12 }).map((_, i) => {
                            const start = (i * 30 * Math.PI) / 180
                            const end = ((i * 30 + 15) * Math.PI) / 180
                            const radius = 80
                            return (
                                <path
                                    key={i}
                                    d={`M 50 50 L ${50 + radius * Math.cos(start)} ${50 + radius * Math.sin(start)} L ${50 + radius * Math.cos(end)} ${50 + radius * Math.sin(end)} Z`}
                                    fill={color}
                                />
                            )
                        })}
                    </svg>
                </div>
            )}
        </div>
    )
}

export function CueOverlayShell({
    theme,
    pattern,
    idPrefix,
    className,
    children,
    variant = "patterned",
}: {
    theme: SlideTheme
    pattern: GraphicPatternStyle
    idPrefix?: string
    className?: string
    children: ReactNode
    variant?: "patterned" | "simple"
}) {
    return (
        <div
            className={cn(
                "absolute inset-0 z-20 flex items-center justify-center animate-in fade-in duration-200 select-none overflow-hidden",
                className
            )}
            style={{
                background: variant === "simple"
                    ? theme.solidBgHex
                    : `linear-gradient(165deg, ${theme.solidBgHex} 0%, #ffffff 58%, ${theme.shapeHex} 130%)`,
            }}
        >
            {variant === "patterned" ? (
                <GraphicBackground pattern={pattern} theme={theme} idPrefix={idPrefix} />
            ) : (
                <div
                    className="absolute inset-0 pointer-events-none opacity-40"
                    style={{
                        backgroundImage: `radial-gradient(${theme.shapeHex} 1.4px, transparent 1.4px)`,
                        backgroundSize: "22px 22px",
                    }}
                />
            )}
            {children}
        </div>
    )
}
