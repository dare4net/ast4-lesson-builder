import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('B1 single production viewer', () => {
    const viewerDir = join(process.cwd(), 'components/viewer')
    const survivor = join(viewerDir, 'LessonViewer.tsx')

    it('has one student viewer component file', () => {
        expect(existsSync(survivor)).toBe(true)
        expect(existsSync(join(viewerDir, 'LessonViewerUpload.tsx'))).toBe(false)
        const viewerFiles = readdirSync(viewerDir).filter((f) =>
            /^LessonViewer/.test(f) && !f.startsWith('Tutor')
        )
        expect(viewerFiles).toEqual(['LessonViewer.tsx'])
    })

    it('emits LESSON_COMPLETED after markCompleted and mounts gamification', () => {
        const source = readFileSync(survivor, 'utf8')
        expect(source).toContain('markCompleted(lessonData.id, earnedPoints, possiblePoints)')
        expect(source).toContain("emit('LESSON_COMPLETED'")
        expect(source).toContain('GamificationHeader')
        expect(source).toContain('initAchievementListener')
        expect(source).toContain('GamificationHubModal')
        expect(source).toContain('getModuleLessons')
        expect(source).toContain('resolveNextLesson')
        expect(source).toContain('nextLesson={nextLesson}')
    })

    it('is imported by every student viewer route', () => {
        const routes = [
            'app/viewer/page.tsx',
            'app/viewer/[id]/page.tsx',
        ]
        for (const file of routes) {
            const source = readFileSync(join(process.cwd(), file), 'utf8')
            expect(source, file).toContain("@/components/viewer/LessonViewer")
            expect(source, file).not.toContain('LessonViewerUpload')
        }
    })
})
