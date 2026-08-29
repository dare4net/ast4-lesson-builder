import { useCallback, useEffect, useRef, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { Lesson } from "@/types/lesson"

const HISTORY_LIMIT = 50
const DEBOUNCE_MS = 400

function snapshot(lesson: Lesson) {
    return JSON.stringify(lesson)
}

export function useLessonHistory(
    lesson: Lesson,
    setLesson: Dispatch<SetStateAction<Lesson>>,
    enabled: boolean,
) {
    const past = useRef<string[]>([])
    const future = useRef<string[]>([])
    const skipping = useRef(false)
    const lastPushed = useRef(snapshot(lesson))
    const [canUndo, setCanUndo] = useState(false)
    const [canRedo, setCanRedo] = useState(false)

    const syncFlags = () => {
        setCanUndo(past.current.length > 0)
        setCanRedo(future.current.length > 0)
    }

    useEffect(() => {
        if (!enabled) {
            past.current = []
            future.current = []
            lastPushed.current = snapshot(lesson)
            skipping.current = false
            syncFlags()
            return
        }
        if (skipping.current) {
            skipping.current = false
            lastPushed.current = snapshot(lesson)
            return
        }
        const json = snapshot(lesson)
        if (json === lastPushed.current) return
        const timer = setTimeout(() => {
            past.current.push(lastPushed.current)
            if (past.current.length > HISTORY_LIMIT) past.current.shift()
            lastPushed.current = json
            future.current = []
            syncFlags()
        }, DEBOUNCE_MS)
        return () => clearTimeout(timer)
    }, [lesson, enabled])

    const undo = useCallback(() => {
        const previous = past.current.pop()
        if (!previous) return
        future.current.push(lastPushed.current)
        skipping.current = true
        lastPushed.current = previous
        setLesson(JSON.parse(previous) as Lesson)
        syncFlags()
    }, [setLesson])

    const redo = useCallback(() => {
        const next = future.current.pop()
        if (!next) return
        past.current.push(lastPushed.current)
        skipping.current = true
        lastPushed.current = next
        setLesson(JSON.parse(next) as Lesson)
        syncFlags()
    }, [setLesson])

    return { undo, redo, canUndo, canRedo }
}
