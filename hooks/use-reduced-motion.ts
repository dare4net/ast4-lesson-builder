'use client'

import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'

/** True when the user has requested reduced motion (WCAG 2.3.3 / 2.2.2). */
export function useReducedMotion(): boolean {
    return Boolean(useFramerReducedMotion())
}
