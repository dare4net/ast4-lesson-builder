import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildStudentViewerHref } from '@/lib/viewer-url'

describe('buildStudentViewerHref', () => {
    it('builds a path with no query when there are no extras', () => {
        expect(buildStudentViewerHref('lesson-1')).toBe('/viewer/lesson-1')
    })

    it('includes returnUrl and moduleId but never token or userId', () => {
        const href = buildStudentViewerHref('lesson-1', {
            returnUrl: '/dashboard/student',
            moduleId: 'mod-9',
        })
        expect(href).toContain('/viewer/lesson-1?')
        expect(href).toContain('returnUrl=')
        expect(href).toContain('moduleId=mod-9')
        expect(href).not.toMatch(/token=/)
        expect(href).not.toMatch(/userId=/)
    })
})

describe('student launch sites do not put JWT in the URL', () => {
    it('dashboard, module launcher, and production viewer omit token query params', () => {
        const files = [
            'app/dashboard/student/page.tsx',
            'app/dashboard/student/programs/[id]/modules/[moduleId]/page.tsx',
            'components/viewer/LessonViewer.tsx',
            'app/viewer/[id]/page.tsx',
        ]
        for (const file of files) {
            const source = readFileSync(join(process.cwd(), file), 'utf8')
            expect(source, file).not.toMatch(/token=\$\{/)
            expect(source, file).not.toMatch(/params\.set\(['"]token['"]/)
        }
    })
})
