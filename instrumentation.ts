export async function register() {
    if (process.env.NEXT_RUNTIME === 'edge') return
    const { validateFrontendEnv } = await import('./lib/env')
    validateFrontendEnv(process.env)
}
