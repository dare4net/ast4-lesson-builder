import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { mkdirSync } from 'fs'
import path from 'path'
import { uploadImageToCloudinary } from '@/lib/cloudinary'

/**
 * POST /api/image/upload
 * Accepts a multipart FormData file with fields: file, lessonId, componentId
 * Uploads to Cloudinary under ast_images/{lessonId}/{componentId}.
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

        // Write file to a temp path so Cloudinary SDK can read it
        const tmpDir = path.join(process.cwd(), 'public', 'tmp_images')
        mkdirSync(tmpDir, { recursive: true })
        const ext = file.name.split('.').pop() || 'png'
        const tmpPath = path.join(tmpDir, `${componentId}.${ext}`)

        const buffer = Buffer.from(await file.arrayBuffer())
        await writeFile(tmpPath, buffer)

        // Upload to Cloudinary (overwrites old image under same public_id)
        const cloudinaryUrl = await uploadImageToCloudinary(tmpPath, lessonId, componentId)

        // Clean up temp file
        unlink(tmpPath).catch(() => { })

        return NextResponse.json({ url: cloudinaryUrl })
    } catch (err: any) {
        console.error('[image/upload] Error:', err)
        return NextResponse.json({ error: err.message || 'Failed to upload image' }, { status: 500 })
    }
}
