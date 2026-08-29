"use client"

import * as React from "react"
import { BaseComponentRenderer, BaseRendererProps } from "./base-renderer"
import { useInteractiveState } from "./hooks"
import { isComponentCompleted } from "@/domain/component-status"
import { LiveComponentMetaProvider } from "@/components/live-mode"
import { cn } from "@/lib/utils"
import { FeedbackAnimationScope, FeedbackScopeContext } from "@/lib/feedback-context"

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
 * - Applying playFeedback animation classes on this component only
 */
export function InteractiveRenderer<S>(props: InteractiveRendererProps<S>) {
    return (
        <LiveComponentMetaProvider componentId={props.component.id} type={props.component.type}>
            <FeedbackAnimationScope>
                <InteractiveRendererView {...props} />
            </FeedbackAnimationScope>
        </LiveComponentMetaProvider>
    )
}

function InteractiveRendererView<S>({
    component,
    initialState,
    savedState,
    setComponentState,
    onRender,
    className,
    ...baseProps
}: InteractiveRendererProps<S>) {
    const animationClass = React.useContext(FeedbackScopeContext)?.animationClass ?? ''
    const [state, setState] = useInteractiveState({
        initialState,
        savedState,
        setComponentState
    })

    const isComplete =
        isComponentCompleted(state) ||
        component.status === 'completed'

    return (
        <BaseComponentRenderer
            component={component}
            className={cn(className, animationClass)}
            {...baseProps}
        >
            {onRender({ state, setState, isComplete })}
        </BaseComponentRenderer>
    )
}
