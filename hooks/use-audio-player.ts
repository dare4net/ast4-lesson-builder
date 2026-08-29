"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import {
    canPlayLessonAudio,
    registerLessonAudio,
    subscribeLessonAudioPrefs,
} from '@/lib/lesson-audio'

interface UseAudioPlayerOptions {
    audioUrl?: string
    autoPlay?: boolean
    onEnded?: () => void
}

export function useAudioPlayer({ audioUrl, autoPlay = false, onEnded }: UseAudioPlayerOptions) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const onEndedRef = useRef(onEnded)
    const autoPlayRef = useRef(autoPlay)
    const [isPlaying, setIsPlaying] = useState(false)
    const [hasAudio, setHasAudio] = useState(false)

    useEffect(() => {
        onEndedRef.current = onEnded
    }, [onEnded])

    useEffect(() => {
        autoPlayRef.current = autoPlay
    }, [autoPlay])

    useEffect(() => {
        if (!audioUrl) {
            setHasAudio(false)
            audioRef.current = null
            return
        }

        const audio = new Audio(audioUrl)
        audioRef.current = audio
        setHasAudio(true)

        const unregister = registerLessonAudio(audio)

        audio.onplay = () => setIsPlaying(true)
        audio.onpause = () => setIsPlaying(false)
        audio.onended = () => {
            setIsPlaying(false)
            onEndedRef.current?.()
        }
        audio.onerror = () => {
            setIsPlaying(false)
        }

        if (autoPlay && canPlayLessonAudio()) {
            audio.play().catch(() => {
                // Autoplay blocked — overlay timer still unlocks the cue.
            })
        }

        const unsubscribe = subscribeLessonAudioPrefs((prefs) => {
            if (!autoPlayRef.current || !canPlayLessonAudio(prefs) || audio.ended) return
            if (audio.paused) {
                audio.play().catch(() => {})
            }
        })

        return () => {
            unsubscribe()
            unregister()
            audio.pause()
            audio.src = ''
            if (audioRef.current === audio) audioRef.current = null
        }
    }, [audioUrl, autoPlay])

    const play = useCallback(() => {
        if (!audioRef.current || !canPlayLessonAudio()) return
        audioRef.current.currentTime = 0
        audioRef.current.play().catch((err) => {
            console.warn('[useAudioPlayer] play() blocked:', err)
        })
    }, [])

    const pause = useCallback(() => {
        audioRef.current?.pause()
    }, [])

    const stop = useCallback(() => {
        if (!audioRef.current) return
        audioRef.current.pause()
        audioRef.current.currentTime = 0
    }, [])

    return { isPlaying, hasAudio, play, pause, stop }
}
