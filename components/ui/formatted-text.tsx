"use client"

import React, { useMemo } from "react"
import { cn } from "@/lib/utils"

interface FormattedTextProps {
    content?: string
    className?: string
    as?: React.ElementType
}

/**
 * FormattedText
 * 
 * Safely renders HTML & rich formatted text produced by the WYSIWYG editor
 * while stripping unsafe script tags and malicious attributes (XSS Protection).
 */
export function FormattedText({ content = "", className, as: Component = "span" }: FormattedTextProps) {
    const sanitizedHtml = useMemo(() => {
        if (!content) return ""

        // Basic XSS Sanitization: Strip script tags, iframes, and event handlers
        let clean = content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
            .replace(/on\w+="[^"]*"/gi, "")
            .replace(/on\w+='[^']*'/gi, "")
            .replace(/javascript:/gi, "")

        // Also support legacy Markdown & custom tokens if passed:
        // **bold**
        clean = clean.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // *italic*
        clean = clean.replace(/\*(.*?)\*/g, "<em>$1</em>")
        // [badge:text]
        clean = clean.replace(
            /\[badge:(?:([a-zA-Z]+):)?([^\]]+)\]/g,
            '<span class="inline-flex items-center px-2 py-0.5 mx-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/40">$2</span>'
        )
        // [highlight:text]
        clean = clean.replace(
            /\[highlight:(?:([a-zA-Z]+):)?([^\]]+)\]/g,
            '<span class="px-1.5 py-0.5 mx-0.5 rounded bg-amber-500/30 text-amber-200 font-bold">$2</span>'
        )

        return clean
    }, [content])

    if (!content) return null

    return (
        <Component
            className={cn("inline-block leading-relaxed font-medium", className)}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    )
}
