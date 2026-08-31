/** Practice keeps try-count honest. Live is one-shot, so revealing is fine. */
export function shouldRevealAnswer(mode?: string | null): boolean {
    return mode === 'live'
}
