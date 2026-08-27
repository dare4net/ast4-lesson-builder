"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigationLock } from "@/context/navigation-lock-context"

interface UseTypingAnimationProps {
    content: string
    speed?: number
    startDelay?: number
    onComplete?: () => void
    componentId: string
    isEditing?: boolean
    alreadyCompleted?: boolean
    autoStart?: boolean
}

export function useTypingAnimation({
    content,
    speed = 65, // Base speed in ms (Slower for readability)
    startDelay = 100,
    onComplete,
    componentId,
    isEditing = false,
    alreadyCompleted = false,
    autoStart = true
}: UseTypingAnimationProps) {
    const [displayedContent, setDisplayedContent] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [isCompleted, setIsCompleted] = useState(alreadyCompleted)
    const [showCursor, setShowCursor] = useState(false)

    const { registerLock, unregisterLock } = useNavigationLock()

    // Refs to handle timeouts and state within closure
    const indexRef = useRef(0)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const contentRef = useRef(content)

    // Reset or initialize when content changes
    useEffect(() => {
        contentRef.current = content
    }, [content])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            unregisterLock(componentId)
        }
    }, [componentId, unregisterLock])

    // Animation Loop
    const animate = useCallback(() => {
        if (isEditing || alreadyCompleted) {
            setDisplayedContent(contentRef.current)
            setIsCompleted(true)
            return
        }

        if (isPaused) return

        if (indexRef.current < contentRef.current.length) {
            const currentStr = contentRef.current

            // HTML Tag Skipping: If pointing to an HTML tag '<', skip tag in 0ms
            if (currentStr.charAt(indexRef.current) === "<") {
                const closingTagIdx = currentStr.indexOf(">", indexRef.current)
                if (closingTagIdx !== -1) {
                    const fullTag = currentStr.substring(indexRef.current, closingTagIdx + 1)
                    setDisplayedContent(prev => prev + fullTag)
                    indexRef.current = closingTagIdx + 1
                    // Instantly trigger next character so tag parsing is seamless
                    timeoutRef.current = setTimeout(animate, 0)
                    return
                }
            }

            const char = currentStr.charAt(indexRef.current)

            // Calculate dynamic delay for "dramatic" effect
            // Pause longer at punctuation
            let charDelay = speed
            if ([".", "!", "?", ":"].includes(char)) charDelay = speed * 8
            else if ([",", ";"].includes(char)) charDelay = speed * 4

            // Slight random variation for natural feel
            charDelay += Math.random() * 15

            setDisplayedContent(prev => prev + char)
            indexRef.current += 1

            timeoutRef.current = setTimeout(animate, charDelay)
        } else {
            setIsTyping(false)
            setIsCompleted(true)
            unregisterLock(componentId)
            if (onComplete) onComplete()
        }
    }, [isEditing, alreadyCompleted, isPaused, speed, componentId, onComplete, unregisterLock])

    // Start Animation
    useEffect(() => {
        if (isEditing || alreadyCompleted) {
            setDisplayedContent(content)
            setIsCompleted(true)
            return
        }

        if (!autoStart) return

        // Initial Delay
        const startTimeout = setTimeout(() => {
            setIsTyping(true)
            registerLock(componentId)
            animate()
        }, startDelay)

        return () => clearTimeout(startTimeout)
    }, [isEditing, alreadyCompleted, componentId, registerLock, animate, startDelay, content, autoStart])

    // Cursor Blink Effect
    useEffect(() => {
        if (!isTyping || isPaused) {
            setShowCursor(false)
            return
        }

        const interval = setInterval(() => {
            setShowCursor(prev => !prev)
        }, 530)

        return () => clearInterval(interval)
    }, [isTyping, isPaused])

    // Re-trigger animation if paused changes to false
    useEffect(() => {
        if (!isPaused && isTyping) {
            animate()
        }
    }, [isPaused, isTyping, animate])

    const togglePause = () => {
        if (!isTyping || isCompleted) return
        setIsPaused(prev => !prev)
    }

    // Calculate dynamic font size based on length
    const getDynamicFontSizeClass = () => {
        const len = content.length
        if (len < 50) return "text-2xl md:text-3xl lg:text-4xl" // Short & Punchy
        if (len < 150) return "text-xl md:text-2xl" // Medium
        return "text-sm md:text-base" // Long/Standard
    }

    return {
        displayedContent,
        isTyping,
        isPaused,
        isCompleted,
        showCursor,
        togglePause,
        fontSizeClass: getDynamicFontSizeClass()
    }
}
