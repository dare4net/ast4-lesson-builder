import { NextRequest, NextResponse } from 'next/server'
import { uploadThumbnailToCloudinary, deleteImageFromCloudinaryUrl, getCloudinaryPublicId } from '@/lib/cloudinary'

/**
 * POST /api/thumbnail/upload
 * Handles uploading program/module thumbnail images to Cloudinary.
 * Converts Base64 data URLs to secure Cloudinary URLs and deletes previous Cloudinary images if replaced.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { imageDataUrl, type, id, previousUrl } = body

        if (!type || !id) {
            return NextResponse.json({ error: 'Missing type or id' }, { status: 400 })
        }

        let finalUrl = imageDataUrl || ''

        // 1. If base64 data URL, upload to Cloudinary
        if (imageDataUrl && typeof imageDataUrl === 'string' && imageDataUrl.startsWith('data:image/')) {
            finalUrl = await uploadThumbnailToCloudinary(imageDataUrl, type as 'program' | 'module', id)
        }

        // 2. If previousUrl was on Cloudinary, check if it needs cleanup
        if (previousUrl && typeof previousUrl === 'string' && previousUrl.includes('res.cloudinary.com')) {
            const oldPublicId = getCloudinaryPublicId(previousUrl)
            const newPublicId = getCloudinaryPublicId(finalUrl)

            // If the old image had a different public_id, delete it to prevent Cloudinary storage bloat
            if (oldPublicId && oldPublicId !== newPublicId) {
                console.log(`[Thumbnail API] Replacing old Cloudinary image: ${oldPublicId}`)
                await deleteImageFromCloudinaryUrl(previousUrl)
            }
        }

        return NextResponse.json({ url: finalUrl })
    } catch (err: any) {
        console.error('[thumbnail/upload] Error:', err)
        return NextResponse.json({ error: err.message || 'Failed to process thumbnail upload' }, { status: 500 })
    }
}
