"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { SoundEffects } from "@/lib/sound-effects"

interface ReadAloudContextType {
    isEnabled: boolean
    toggleReadAloud: () => void
    speak: (text: string) => void
    stop: () => void
    isSpeaking: boolean
}

const ReadAloudContext = createContext<ReadAloudContextType>({
    isEnabled: true,
    toggleReadAloud: () => { },
    speak: () => { },
    stop: () => { },
    isSpeaking: false,
})

export function ReadAloudProvider({ children }: { children: React.ReactNode }) {
    const [isEnabled, setIsEnabled] = useState(true)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
    const isUnlockedRef = useRef(false)

    // Load available voices and pick an English voice
    useEffect(() => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return

        const updateVoices = () => {
            const voices = window.speechSynthesis.getVoices()
            if (voices.length > 0) {
                // Prefer English voice, ideally friendly/natural
                const engVoice = voices.find(v => v.lang.startsWith("en-GB") || v.lang.startsWith("en-US")) || voices[0]
                voiceRef.current = engVoice
            }
        }

        updateVoices()
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = updateVoices
        }
    }, [])

    // User gesture listener to unlock Web Audio API & Web Speech API on modern browsers
    useEffect(() => {
        if (typeof window === "undefined") return

        const unlockAudio = () => {
            if (isUnlockedRef.current) return
            isUnlockedRef.current = true

            // Resume Speech Synthesis
            if ("speechSynthesis" in window) {
                window.speechSynthesis.resume()
            }

            // Preload and unmute Howler sound effects
            try {
                SoundEffects.preloadAll()
                SoundEffects.unmute()
            } catch (e) {
                console.warn("Audio unlock warning:", e)
            }
        }

        window.addEventListener("click", unlockAudio, { once: true })
        window.addEventListener("touchstart", unlockAudio, { once: true })
        window.addEventListener("keydown", unlockAudio, { once: true })

        return () => {
            window.removeEventListener("click", unlockAudio)
            window.removeEventListener("touchstart", unlockAudio)
            window.removeEventListener("keydown", unlockAudio)
        }
    }, [])

    const stop = useCallback(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
        }
    }, [])

    const toggleReadAloud = useCallback(() => {
        setIsEnabled(prev => {
            const next = !prev
            if (!next) {
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel()
                }
                setIsSpeaking(false)
            }
            return next
        })
    }, [])

    const speak = useCallback((text: string) => {
        if (!isEnabled) return
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return

        try {
            window.speechSynthesis.cancel()

            // Resume speech synthesis if browser paused it
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume()
            }

            const cleanText = text.replace(/<[^>]*>?/gm, "").trim()
            if (!cleanText) return

            const utterance = new SpeechSynthesisUtterance(cleanText)
            utterance.rate = 0.9 // Calm pace for Year 4 learners
            utterance.pitch = 1.0

            if (voiceRef.current) {
                utterance.voice = voiceRef.current
            }

            utterance.onstart = () => setIsSpeaking(true)
            utterance.onend = () => setIsSpeaking(false)
            utterance.onerror = () => setIsSpeaking(false)

            window.speechSynthesis.speak(utterance)
        } catch (err) {
            console.error("Speech synthesis error:", err)
            setIsSpeaking(false)
        }
    }, [isEnabled])

    useEffect(() => {
        return () => {
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel()
            }
        }
    }, [])

    return (
        <ReadAloudContext.Provider value={{ isEnabled, toggleReadAloud, speak, stop, isSpeaking }}>
            {children}
        </ReadAloudContext.Provider>
    )
}

export function useReadAloud() {
    return useContext(ReadAloudContext)
}
