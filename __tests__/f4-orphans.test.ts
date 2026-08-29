import { existsSync } from 'node:fs'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relative: string) => readFileSync(join(root, relative), 'utf8')

describe('F4 delete orphans', () => {
    it('removes unused UI, viewer, and studio files', () => {
        const gone = [
            'components/ui/sidebar.tsx',
            'tmp_old_cue.tsx',
            'components/ui/rich-text-area.tsx',
            'components/studio/student-preview-modal.tsx',
            'components/dashboard/dashboard-shell.tsx',
            'components/slide-preview.tsx',
            'components/client-only-dnd.tsx',
            'components/ui/sonner.tsx',
            'components/ui/use-toast.ts',
        ]
        for (const file of gone) {
            expect(existsSync(join(root, file)), file).toBe(false)
        }
    })

    it('keeps SingleItemEditor because component-editor still uses it', () => {
        expect(existsSync(join(root, 'components/editors/base/SingleItemEditor.tsx'))).toBe(true)
        expect(read('components/component-editor.tsx')).toContain('SingleItemEditor')
    })

    it('routes toasts through one hook and drops sonner', () => {
        expect(read('components/ui/toaster.tsx')).toContain('@/hooks/use-toast')
        expect(read('components/lesson-builder.tsx')).toContain('@/hooks/use-toast')
        expect(read('components/lesson-controls.tsx')).toContain('@/hooks/use-toast')
        expect(read('components/lesson-builder.tsx')).not.toContain('@/components/ui/use-toast')
        expect(read('components/lesson-controls.tsx')).not.toContain('@/components/ui/use-toast')
        expect(read('package.json')).not.toContain('"sonner"')
        expect(existsSync(join(root, 'hooks/use-toast.ts'))).toBe(true)
    })
})
