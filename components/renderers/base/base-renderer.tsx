"use client"

import React from "react"
import { cn } from "@/lib/utils"
import type { Component } from "@/types/lesson"

export interface BaseRendererProps {
    component: Component
    isEditing?: boolean
    disabled?: boolean
    className?: string
    children: React.ReactNode
}

/**
 * BaseComponentRenderer
 * 
 * Standard wrapper for all lesson components. Handles:
 * - Disabled state visual styling and pointer events
 * - Editing mode container
 * - Common transitions
 */
export function BaseComponentRenderer({
    component,
    isEditing = false,
    disabled = false,
    className,
    children
}: BaseRendererProps) {
    const isDisabled = disabled || component.state === "disabled"

    if (isEditing) {
        return (
            <div className={cn("relative w-full", className)}>
                {children}
            </div>
        )
    }

    return (
        <div
            className={cn(
                "relative w-full h-full flex-1 flex flex-col transition-all duration-200",
                isDisabled && "opacity-75",
                className
            )}
            data-component-id={component.id}
        >
            <div className={cn(
                "h-full flex-1 flex flex-col",
                isDisabled && "pointer-events-none select-none"
            )}>
                {children}
            </div>

            {/* Disabled Overlay */}
            {isDisabled && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 rounded-lg overflow-hidden border border-border/20">
                    <div className="absolute inset-0 opacity-5 bg-muted" />
                </div>
            )}
        </div>
    )
}
