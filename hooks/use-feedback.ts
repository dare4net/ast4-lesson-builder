'use client'

import { useCallback, useContext } from 'react'
import {
  FeedbackScopeContext,
  useFeedback as useFeedbackSettings,
  type FeedbackOptions,
} from '@/lib/feedback-context'
import type { SoundEffect } from '@/lib/sound-effects'

export type FeedbackType = SoundEffect
export type { FeedbackOptions }

export function useFeedback() {
  const settings = useFeedbackSettings()
  const scope = useContext(FeedbackScopeContext)

  const playFeedback = useCallback(async (type: SoundEffect, options: FeedbackOptions = {}) => {
    const className = await settings.playFeedback(type, options)
    if (className) scope?.apply(className)
    return className
  }, [settings, scope])

  return {
    ...settings,
    playFeedback,
  }
}
