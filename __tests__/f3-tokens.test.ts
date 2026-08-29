import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { duoTheme } from '@/lib/duo-theme'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('F3 tokens and global CSS', () => {
    it('uses brand green #58CC02 as --primary', () => {
        const css = read('app/globals.css')
        expect(css).toContain('--primary: 94 98% 40%')
        expect(css).not.toContain('--primary: 130 70% 45%')
        expect(css).toContain('Brand: #58CC02')
    })

    it('does not keep a second color/component source on duoTheme', () => {
        expect(duoTheme).not.toHaveProperty('colors')
        expect(duoTheme).not.toHaveProperty('components')
        expect(duoTheme).not.toHaveProperty('animations')
        expect(read('lib/duo-theme.ts')).not.toContain('#58CC02')
        expect(read('tailwind.config.ts')).toContain('primary-hover')
        expect(read('tailwind.config.ts')).toContain('background-secondary')
    })

    it('defines card/input/badge classes in the live stylesheet', () => {
        const css = read('app/globals.css')
        expect(css).toContain('.duo-card-interactive')
        expect(css).toContain('.duo-input-large')
        expect(css).toContain('.duo-badge-primary')
        expect(css).toContain('.duo-text-primary')
        expect(existsSync(join(process.cwd(), 'styles/globals.css'))).toBe(false)
        expect(read('components/ui/card.tsx')).toContain('duo-card-interactive')
        expect(read('components/ui/input.tsx')).toContain('duo-input-large')
        expect(read('components/ui/badge.tsx')).toContain('duo-badge-primary')
    })

    it('resolves disabled-state colors through hsl(var(--token))', () => {
        const css = read('styles/disabled-states.css')
        expect(css).toContain('hsl(var(--muted))')
        expect(css).toContain('hsl(var(--border))')
        expect(css).toContain('hsl(var(--muted-foreground))')
        expect(css).not.toContain('background-color: var(--muted)')
    })

    it('loads Nunito and Lexend through next/font only', () => {
        const layout = read('app/layout.tsx')
        expect(layout).toContain('Nunito')
        expect(layout).toContain('"800"')
        expect(layout).toContain('"900"')
        expect(layout).toContain('Lexend')
        expect(layout).toContain('next/font/google')
        expect(layout).toContain('nunito.className')
        expect(layout).toContain('--font-sans')
        expect(layout).toContain('--font-heading')
        expect(layout).not.toMatch(/\bInter\b/)
        expect(read('app/globals.css')).not.toContain('fonts.googleapis.com')
        expect(read('app/globals.css')).not.toContain('DIN Round')
        expect(read('lib/duo-theme.ts')).not.toContain('DIN Round')
        expect(read('tailwind.config.ts')).toContain('var(--font-sans, ui-sans-serif)')
    })

    it('scopes active tab layout to TabsContent and drops flex/overflow !important', () => {
        expect(read('components/ui/tabs.tsx')).toContain('data-[state=active]:flex')
        expect(read('components/ui/tabs.tsx')).toContain('data-[state=active]:h-full')
        const css = read('app/globals.css')
        expect(css).not.toContain('[data-state="active"]')
        expect(css).not.toContain('.flex-1 {')
        expect(css).not.toContain('.overflow-auto {')
        expect(css).not.toContain('flex: 1 1 0% !important')
        expect(css).not.toContain('overflow: auto !important')
    })
})
