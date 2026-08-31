export function programProgressPercent(prog: any): number {
    if (!prog) return 0
    const progress = prog.progress || prog.registration?.progress || {}
    if (typeof progress.percent_complete === 'number') return progress.percent_complete
    if (typeof progress.percentComplete === 'number') return progress.percentComplete
    if (typeof prog.overallProgress === 'number') return prog.overallProgress
    if (typeof prog.totalProgress === 'number') return prog.totalProgress
    if (typeof prog.percent_complete === 'number') return prog.percent_complete
    const published = Number(progress.published_lessons)
    const completed = Number(progress.completed_published_lessons)
    if (Number.isFinite(published) && published > 0 && Number.isFinite(completed)) {
        return Math.round((completed / published) * 100)
    }
    const modules = prog.modules
    if (!Array.isArray(modules) || modules.length === 0) return 0
    const done = progress.completed_modules?.length || 0
    return Math.round((done / modules.length) * 100)
}

export const CURRICULUM_INBOX_TYPES = new Set([
    'PROGRAM_LESSON_PUBLISHED',
    'PROGRAM_MODULE_PUBLISHED',
    'NEXT_LESSON_UNLOCKED',
])
