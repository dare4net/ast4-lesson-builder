"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { animationClassFor } from './feedback-animation'
import { SoundEffects, SoundEffect } from './sound-effects'
import { setLessonAudioPrefs } from './lesson-audio'

export { animationClassFor } from './feedback-animation'

export interface FeedbackOptions {
  animation?: boolean
  sound?: boolean
}

interface FeedbackContextType {
  isSoundEnabled: boolean
  soundVolume: number
  isAnimationEnabled: boolean
  toggleSound: () => void
  toggleAnimation: () => void
  setVolume: (volume: number) => void
  playFeedback: (type: SoundEffect, options?: FeedbackOptions) => Promise<string>
}

interface FeedbackScopeValue {
  apply: (className: string) => void
  animationClass: string
}

const STORAGE_KEY = 'ast-feedback-prefs'

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)
export const FeedbackScopeContext = createContext<FeedbackScopeValue | null>(null)

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function animationDurationMs(className: string): number {
  if (className.includes('duo-shake')) return 550
  if (className.includes('duo-pop')) return 350
  return 1100
}

export function FeedbackAnimationScope({ children }: { children: React.ReactNode }) {
  const [animationClass, setAnimationClass] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const apply = useCallback((className: string) => {
    if (!className) return
    setAnimationClass(className)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setAnimationClass(''), animationDurationMs(className))
  }, [])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return (
    <FeedbackScopeContext.Provider value={{ apply, animationClass }}>
      {children}
    </FeedbackScopeContext.Provider>
  )
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [soundVolume, setSoundVolume] = useState(0.5)
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as {
          isSoundEnabled?: boolean
          soundVolume?: number
          isAnimationEnabled?: boolean
        }
        if (typeof parsed.isSoundEnabled === 'boolean') setIsSoundEnabled(parsed.isSoundEnabled)
        if (typeof parsed.soundVolume === 'number') setSoundVolume(parsed.soundVolume)
        if (typeof parsed.isAnimationEnabled === 'boolean') setIsAnimationEnabled(parsed.isAnimationEnabled)
      }
    } catch {
      // Ignore unreadable prefs and keep defaults.
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        isSoundEnabled,
        soundVolume,
        isAnimationEnabled,
      }))
    } catch {
      // Ignore quota / private-mode failures.
    }
  }, [hydrated, isSoundEnabled, soundVolume, isAnimationEnabled])

  useEffect(() => {
    SoundEffects.preloadAll()
    return () => {
      SoundEffects.unloadAll()
    }
  }, [])

  useEffect(() => {
    setLessonAudioPrefs({ enabled: isSoundEnabled, volume: soundVolume })
    if (isSoundEnabled) {
      SoundEffects.unmute()
      SoundEffects.setVolume(soundVolume)
    } else {
      SoundEffects.mute()
    }
  }, [isSoundEnabled, soundVolume])

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev)
  }, [])

  const toggleAnimation = useCallback(() => {
    setIsAnimationEnabled(prev => !prev)
  }, [])

  const setVolume = useCallback((volume: number) => {
    setSoundVolume(Math.max(0, Math.min(1, volume)))
  }, [])

  const playFeedback = useCallback(async (type: SoundEffect, options: FeedbackOptions = {}) => {
    const { animation = true, sound = true } = options

    if (sound && isSoundEnabled) {
      await SoundEffects.play(type)
    }

    if (animation && isAnimationEnabled && !prefersReducedMotion()) {
      return animationClassFor(type)
    }

    return ''
  }, [isSoundEnabled, isAnimationEnabled])

  const value = useMemo(() => ({
    isSoundEnabled,
    soundVolume,
    isAnimationEnabled,
    toggleSound,
    toggleAnimation,
    setVolume,
    playFeedback,
  }), [isSoundEnabled, soundVolume, isAnimationEnabled, toggleSound, toggleAnimation, setVolume, playFeedback])

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider')
  }
  return context
}
