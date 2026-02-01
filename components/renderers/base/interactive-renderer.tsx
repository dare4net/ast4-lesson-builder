"use client"

import * as React from "react"
import { BaseComponentRenderer, BaseRendererProps } from "./base-renderer"
import { useInteractiveState } from "./hooks"

export interface InteractiveRenderProps<S> {
    state: S
    setState: React.Dispatch<React.SetStateAction<S>>
    isComplete: boolean
}

export interface InteractiveRendererProps<S> extends Omit<BaseRendererProps, 'children'> {
    initialState: S
    savedState?: S
    setComponentState?: (state: S) => void
    onRender: (props: InteractiveRenderProps<S>) => React.ReactNode
}

/**
 * InteractiveRenderer
 * 
 * Wrapper for components that have persistent state but no scoring (e.g. Flashcards).
 * Handles:
 * - Local state management
 * - Persistence to parent via setComponentState
 * - Completion status tracking
 */
export function InteractiveRenderer<S>({
    component,
    initialState,
    savedState,
    setComponentState,
    onRender,
    ...baseProps
}: InteractiveRendererProps<S>) {
    const [state, setState] = useInteractiveState({
        initialState,
        savedState,
        setComponentState
    })

    // Determine completion status
    // Checks both local state and component prop for 'completed' status
    const isComplete =
        (state as any)?.status === 'completed' ||
        (state as any)?.isComplete === true ||
        component.status === 'completed'

    return (
        <BaseComponentRenderer
            component={component}
            {...baseProps}
            // Pass children explicitly to satisfy TypeScript if implicit children fails
            children={onRender({ state, setState, isComplete })}
        />
    )
}
