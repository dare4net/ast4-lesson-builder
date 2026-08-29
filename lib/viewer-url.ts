/**
 * Student lesson viewer URLs must never include JWT or userId.
 * Identity comes from the ast_token cookie / apiClient header.
 */
export function buildStudentViewerHref(
    lessonId: string,
    opts?: { returnUrl?: string; moduleId?: string }
): string {
    const params = new URLSearchParams()
    if (opts?.returnUrl) params.set('returnUrl', opts.returnUrl)
    if (opts?.moduleId) params.set('moduleId', opts.moduleId)
    const qs = params.toString()
    return qs ? `/viewer/${encodeURIComponent(lessonId)}?${qs}` : `/viewer/${encodeURIComponent(lessonId)}`
}
