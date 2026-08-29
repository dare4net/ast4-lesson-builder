/**
 * Exponential backoff for sync retries: 1s, 2s, 4s, … capped at 30s.
 */
export function nextBackoffMs(
    failureCount: number,
    { base = 1000, max = 30_000 }: { base?: number; max?: number } = {}
): number {
    if (failureCount <= 0) return 0
    const exp = Math.min(failureCount - 1, 20)
    return Math.min(max, base * 2 ** exp)
}
