import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { COMPONENT_REGISTRY, getCanonicalComponentType, getRegistryEntry } from '@/lib/component-registry'
import { RENDERER_LOADERS } from '@/lib/component-renderer-loaders'
import { componentDefinitions } from '@/lib/component-definitions'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('F6 authoring ergonomics', () => {
    it('derives renderer aliases and ComponentType from the registry', () => {
        expect(getCanonicalComponentType('word-scramble')).toBe('wordScramble')
        expect(getCanonicalComponentType('videoClip')).toBe('video')
        expect(getCanonicalComponentType('labScale')).toBe('spectrumSorter')
        expect(getRegistryEntry('word-scramble')?.type).toBe('wordScramble')
        const types = COMPONENT_REGISTRY.map((e) => e.type)
        expect(types).toContain('codeBlock')
        expect(types).not.toContain('tabsPanel')
        expect(new Set(types).size).toBe(types.length)
    })

    it('generates the viewer renderer map from registry loaders', () => {
        const renderer = read('components/component-renderer.tsx')
        expect(renderer).toContain('buildComponentRenderers')
        expect(renderer).toContain('RENDERER_LOADERS')
        expect(renderer).toContain('entry.aliases')
        expect(renderer).not.toMatch(/paragraph: loadRenderer\(\(\) => import/)
        expect(Object.keys(RENDERER_LOADERS)).toContain('quiz')
        expect(Object.keys(RENDERER_LOADERS)).toContain('slideTitle')
        expect(Object.keys(RENDERER_LOADERS)).not.toContain('clickableImage')
    })

    it('splits studio definitions per component type', () => {
        expect(existsSync(join(process.cwd(), 'lib/component-definitions.ts'))).toBe(false)
        expect(existsSync(join(process.cwd(), 'lib/component-definitions/index.ts'))).toBe(true)
        expect(existsSync(join(process.cwd(), 'lib/component-definitions/paragraph.ts'))).toBe(true)
        expect(existsSync(join(process.cwd(), 'lib/component-definitions/spinTheWheel.ts'))).toBe(true)
        expect(componentDefinitions.length).toBeGreaterThan(30)
        expect(componentDefinitions.find((d) => d.type === 'quiz')).toBeTruthy()
        expect(read('lib/component-definitions/spinTheWheel.ts')).toContain('DEFAULT_WHEEL_QUESTIONS')
    })

    it('looks up schema-driven editors by component type', () => {
        expect(read('components/editors/editor-registry.tsx')).toContain('quote:')
        expect(read('components/editors/editor-registry.tsx')).toContain('hangman:')
        expect(read('components/editors/editor-registry.tsx')).toContain('export function hasBodyEditor')
        expect(read('components/component-editor.tsx')).toContain('renderBodyEditor')
        expect(read('components/component-editor.tsx')).toContain('renderArrayFieldEditor')
        expect(read('components/lesson-builder.tsx')).toContain('hasValidationErrors')
        expect(read('components/lesson-builder.tsx')).toContain('Cannot save')
        expect(read('components/lesson-controls.tsx')).toContain('saveDisabled')
    })

    it('uses one drag-and-drop library', () => {
        expect(read('package.json')).not.toContain('@hello-pangea/dnd')
        expect(read('components/slide-navigator.tsx')).toContain('from "react-dnd"')
        expect(read('components/slide-navigator.tsx')).not.toContain('@hello-pangea/dnd')
        expect(read('components/component-tree.tsx')).toContain('from "react-dnd"')
    })

    it('adds lesson undo/redo last', () => {
        expect(existsSync(join(process.cwd(), 'hooks/use-lesson-history.ts'))).toBe(true)
        expect(read('components/lesson-builder.tsx')).toContain('useLessonHistory')
        expect(read('components/lesson-controls.tsx')).toContain('aria-label="Undo"')
        expect(read('components/lesson-controls.tsx')).toContain('aria-label="Redo"')
    })
})
