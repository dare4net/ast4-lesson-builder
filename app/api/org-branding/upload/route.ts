import { NextRequest, NextResponse } from 'next/server'
import { uploadOrgBrandingToCloudinary } from '@/lib/cloudinary'

/**
 * POST /api/org-branding/upload
 * Body (multipart): file, orgId, kind (logo | banner)
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        const orgId = String(formData.get('orgId') || '').trim()
        const kind = String(formData.get('kind') || '').trim()

        if (!file || !orgId || (kind !== 'logo' && kind !== 'banner' && kind !== 'favicon')) {
            return NextResponse.json({ error: 'Missing file, orgId, or kind (logo|banner|favicon)' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const url = await uploadOrgBrandingToCloudinary(buffer, orgId, kind)
        return NextResponse.json({ url })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to upload branding image'
        console.error('[org-branding/upload] Error:', err)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
