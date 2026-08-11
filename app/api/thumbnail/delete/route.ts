import { NextRequest, NextResponse } from 'next/server'
import { deleteImageFromCloudinaryUrl } from '@/lib/cloudinary'

/**
 * POST /api/thumbnail/delete
 * Deletes a program or module thumbnail from Cloudinary when replaced by link/empty or when program/module is deleted.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { previousUrl } = body

        if (!previousUrl) {
            return NextResponse.json({ message: 'No previous URL provided' })
        }

        const success = await deleteImageFromCloudinaryUrl(previousUrl)
        return NextResponse.json({ success, deletedUrl: previousUrl })
    } catch (err: any) {
        console.error('[thumbnail/delete] Error:', err)
        return NextResponse.json({ error: err.message || 'Failed to delete thumbnail' }, { status: 500 })
    }
}
