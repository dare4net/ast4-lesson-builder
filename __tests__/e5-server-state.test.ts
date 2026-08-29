import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseProgramList, queryKeys } from '@/lib/query-keys'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('E5 TanStack Query for dashboard fetches', () => {
    it('wraps the tree with QueryProvider inside AuthProvider', () => {
        const layout = read('app/layout.tsx')
        expect(layout.indexOf('AuthProvider')).toBeLessThan(layout.indexOf('QueryProvider'))
        expect(layout.indexOf('QueryProvider')).toBeLessThan(layout.indexOf('GamificationProvider'))
    })

    it('reads stats and enrollments through shared query hooks', () => {
        expect(read('hooks/use-student-stats.ts')).toContain('queryKeys.stats')
        expect(read('hooks/use-student-stats.ts')).toContain('queryKeys.wallet')
        expect(read('hooks/use-my-programs.ts')).toContain('queryKeys.myPrograms')
        expect(read('context/gamification-context.tsx')).toContain('useStudentStats')
        expect(read('context/gamification-context.tsx')).not.toContain('apiClient.gamification.getStats')
        expect(read('app/dashboard/student/catalog/page.tsx')).toContain('useMyPrograms')
        expect(read('app/dashboard/student/programs/page.tsx')).toContain('useMyPrograms')
        expect(read('app/dashboard/student/programs/[id]/page.tsx')).toContain('useMyPrograms')
        expect(read('app/dashboard/student/programs/page.tsx')).not.toContain('getMyPrograms')
        expect(read('app/dashboard/student/programs/[id]/page.tsx')).not.toContain('getMyPrograms')
    })

    it('has loading and error route segments for student and tutor dashboards', () => {
        const files = [
            'app/dashboard/student/loading.tsx',
            'app/dashboard/student/error.tsx',
            'app/dashboard/tutor/loading.tsx',
            'app/dashboard/tutor/error.tsx',
            'app/dashboard/student/programs/[id]/loading.tsx',
            'app/dashboard/student/programs/[id]/error.tsx',
        ]
        for (const file of files) {
            expect(existsSync(join(process.cwd(), file)), file).toBe(true)
        }
        expect(read('app/dashboard/student/error.tsx')).toContain("'use client'")
        expect(read('components/dashboard/route-error.tsx')).toContain('reset()')
    })

    it('normalizes program list payloads', () => {
        expect(queryKeys.myPrograms).toEqual(['programs', 'mine'])
        expect(parseProgramList([{ _id: '1' }])).toEqual([{ _id: '1' }])
        expect(parseProgramList({ programs: [{ _id: '2' }] })).toEqual([{ _id: '2' }])
        expect(parseProgramList({ data: [{ _id: '3' }] })).toEqual([{ _id: '3' }])
        expect(parseProgramList(null)).toEqual([])
    })
})
