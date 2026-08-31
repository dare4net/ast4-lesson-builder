import { z } from 'zod'

const emptyToUndefined = (value: unknown) => {
    if (value == null) return undefined
    if (typeof value === 'string' && value.trim() === '') return undefined
    return value
}

export const frontendEnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
    JWT_SECRET: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    NEXT_PUBLIC_API_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
    NEXT_PUBLIC_SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().url().optional()),
    NEXT_PUBLIC_FIREBASE_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    CLOUDINARY_CLOUD_NAME: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    CLOUDINARY_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    CLOUDINARY_API_SECRET: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    CLOUDINARY_IMAGE_MAX_WIDTH: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
    CLOUDINARY_THUMBNAIL_MAX_WIDTH: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
    MONGODB_URI: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
})

export type FrontendEnv = z.infer<typeof frontendEnvSchema>

function formatZodError(error: z.ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`).join('; ')
}

export function validateFrontendEnv(
    raw: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
    { requireSecrets = raw.NODE_ENV !== 'test' } = {},
): FrontendEnv {
    const parsed = frontendEnvSchema.safeParse(raw)
    if (!parsed.success) {
        throw new Error(`Invalid frontend environment: ${formatZodError(parsed.error)}`)
    }

    if (requireSecrets && !parsed.data.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured')
    }

    return parsed.data
}
