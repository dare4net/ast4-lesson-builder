"use client"

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseAudioPlayerOptions {
    audioUrl?: string
    autoPlay?: boolean
    onEnded?: () => void
}

export function useAudioPlayer({ audioUrl, autoPlay = false, onEnded }: UseAudioPlayerOptions) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [hasAudio, setHasAudio] = useState(false)

    useEffect(() => {
        if (!audioUrl) {
            setHasAudio(false)
            return
        }

        const audio = new Audio(audioUrl)
        audioRef.current = audio
        setHasAudio(true)

        audio.onplay = () => setIsPlaying(true)
        audio.onpause = () => setIsPlaying(false)
        audio.onended = () => {
            setIsPlaying(false)
            onEnded?.()
        }
        audio.onerror = () => {
            setIsPlaying(false)
            onEnded?.()
        }

        if (autoPlay) {
            audio.play().catch(() => {
                // Autoplay blocked — user can click the Start button
            })
            return () => {
                audio.pause()
                audio.src = ''
            }
        }

        return () => {
            audio.pause()
            audio.src = ''
        }
    }, [audioUrl, autoPlay])

    const play = useCallback(() => {
        if (!audioRef.current) return
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
