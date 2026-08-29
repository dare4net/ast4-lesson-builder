import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { createNewLesson } from '@/components/lesson-controls'
import { defaultLesson } from '@/lib/default-lesson'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('editor chrome', () => {
    it('keeps the library mounted while the inspector is a dialog', () => {
        const builder = read('components/lesson-builder.tsx')
        expect(builder).toContain('<ComponentLibrary')
        expect(builder).toContain('<Dialog')
        expect(builder).toContain('hideOverlay')
        expect(builder).toContain('modal={false}')
        expect(builder).not.toMatch(/isInspectorOpen && editingComponent \?/)
        expect(builder).not.toMatch(/handleCloseInspector[\s\S]{0,200}setIsLibraryCollapsed\(true\)/)
        expect(builder).toContain('CollapsibleRail')
        expect(builder).not.toContain('sm:aspect-[16/9]')
        expect(builder).toContain('<SaveLessonModal')
        expect(builder).toContain('<LoadLessonModal')
        expect(builder).toContain('onAddLibraryComponent')
        expect(read('components/component-editor.tsx')).not.toContain('max-w-[400px]')
        expect(read('components/component-editor.tsx')).toContain('Live preview')
        expect(read('components/component-editor.tsx')).toContain('propertiesOpen')
        expect(read('components/slide-editor.tsx')).toContain('title="Edit component"')
        expect(read('components/slide-editor.tsx')).not.toMatch(/onClick=\{onSelect\}/)
        expect(read('components/slide-editor.tsx')).not.toContain('max-w-4xl mx-auto')
    })

    it('hides New Lesson from the chrome and keeps the function', () => {
        const controls = read('components/lesson-controls.tsx')
        expect(controls).toContain('export function createNewLesson')
        expect(controls).not.toMatch(/>[\s\n]*New Lesson[\s\n]*</)
        expect(typeof createNewLesson).toBe('function')
    })

    it('resets to a fresh lesson when createNewLesson is called', () => {
        const imported: unknown[] = []
        window.confirm = () => true
        const removeItem = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => undefined)

        createNewLesson((lesson) => { imported.push(lesson) })

        expect(removeItem).toHaveBeenCalledWith('currentLesson')
        expect(imported).toHaveLength(1)
        expect((imported[0] as typeof defaultLesson).title).toBe(defaultLesson.title)
        expect((imported[0] as typeof defaultLesson).id).not.toBe(defaultLesson.id)

        removeItem.mockRestore()
    })
})
