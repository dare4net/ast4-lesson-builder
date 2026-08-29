/**
 * Fail closed when the signing secret is missing.
 * Never fall back to a hardcoded value — that lets anyone forge dashboard sessions.
 */
export function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }
  return secret
}
