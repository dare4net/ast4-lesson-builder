export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { uploadImageBufferToCloudinary } from '@/lib/cloudinary'

/**
 * POST /api/image/upload
 * Accepts a multipart FormData file with fields: file, lessonId, componentId
 * Streams buffer directly to Cloudinary under ast_images/{lessonId}/{componentId}.
 * Completely avoids local disk write errors on serverless/deployed platforms.
 * Returns { url: string }
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        const lessonId = formData.get('lessonId') as string | null
        const componentId = formData.get('componentId') as string | null

        if (!file || !lessonId || !componentId) {
            return NextResponse.json({ error: 'Missing file, lessonId, or componentId' }, { status: 400 })
        }

        // Upload buffer directly to Cloudinary via stream — zero local disk IO
        const buffer = Buffer.from(await file.arrayBuffer())
        const cloudinaryUrl = await uploadImageBufferToCloudinary(buffer, lessonId, componentId)

        return NextResponse.json({ url: cloudinaryUrl })
    } catch (err: any) {
        console.error('[image/upload] Error:', err)
        return NextResponse.json({ error: err.message || 'Failed to upload image' }, { status: 500 })
    }
}
