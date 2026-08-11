import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with environment variables (or fallbacks)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'rwjtoqiy',
    api_key: process.env.CLOUDINARY_API_KEY || '431677943928628',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'S1MeiLS39dDREEfHz4xTGhNTzQU',
    secure: true,
})

/**
 * Uploads an audio MP3 file to Cloudinary.
 *
 * Uses deterministic public_id: `ast_lessons/${lessonId}/${componentId}`.
 * Setting `overwrite: true` and `invalidate: true` ensures that when audio is regenerated,
 * Cloudinary immediately replaces the old audio file under the same public ID.
 * Storage bloat is 100% prevented as old files are discarded automatically.
 */
export async function uploadAudioToCloudinary(
    filePath: string,
    lessonId: string,
    componentId: string
): Promise<string> {
    try {
        const publicId = `ast_lessons/${lessonId}/${componentId}`

        // Cloudinary manages audio files under resource_type: 'video'
        const result = await cloudinary.uploader.upload(filePath, {
            public_id: publicId,
            resource_type: 'video',
            overwrite: true,
            invalidate: true,
        })

        if (!result || !result.secure_url) {
            throw new Error(`Cloudinary upload returned invalid response for ${componentId}`)
        }

        return result.secure_url
    } catch (error: any) {
        console.error(`[Cloudinary] Upload failed for ${componentId}:`, error)
        throw new Error(error.message || `Cloudinary upload failed for ${componentId}`)
    }
}

/**
 * Deletes an audio file from Cloudinary when a component or lesson is deleted.
 */
export async function deleteAudioFromCloudinary(
    lessonId: string,
    componentId: string
): Promise<boolean> {
    try {
        const publicId = `ast_lessons/${lessonId}/${componentId}`
        await cloudinary.uploader.destroy(publicId, {
            resource_type: 'video',
            invalidate: true,
        })
        return true
    } catch (error) {
        console.error(`[Cloudinary] Failed to delete audio for ${componentId}:`, error)
        return false
    }
}

/**
 * Uploads an image file to Cloudinary.
 * Uses deterministic public_id: `ast_images/${lessonId}/${componentId}`.
 * Existing images are automatically overwritten on re-upload.
 */
export async function uploadImageToCloudinary(
    filePath: string,
    lessonId: string,
    componentId: string
): Promise<string> {
    try {
        const publicId = `ast_images/${lessonId}/${componentId}`

        const result = await cloudinary.uploader.upload(filePath, {
            public_id: publicId,
            resource_type: 'image',
            overwrite: true,
            invalidate: true,
        })

        if (!result || !result.secure_url) {
            throw new Error(`Cloudinary image upload returned invalid response for ${componentId}`)
        }

        return result.secure_url
    } catch (error: any) {
        console.error(`[Cloudinary] Image upload failed for ${componentId}:`, error)
        throw new Error(error.message || `Cloudinary image upload failed for ${componentId}`)
    }
}

/**
 * Uploads an image Buffer directly to Cloudinary via stream.
 * Prevents file-system write errors on serverless/deployed platforms.
 */
export async function uploadImageBufferToCloudinary(
    buffer: Buffer,
    lessonId: string,
    componentId: string
): Promise<string> {
    return new Promise((resolve, reject) => {
        const publicId = `ast_images/${lessonId}/${componentId}`
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                public_id: publicId,
                resource_type: 'image',
                overwrite: true,
                invalidate: true,
            },
            (error, result) => {
                if (error || !result?.secure_url) {
                    console.error(`[Cloudinary] Buffer upload failed for ${componentId}:`, error)
                    return reject(new Error(error?.message || `Cloudinary image upload failed for ${componentId}`))
                }
                resolve(result.secure_url)
            }
        )
        uploadStream.end(buffer)
    })
}

/**
 * Extracts Cloudinary public_id from a Cloudinary URL.
 * e.g., https://res.cloudinary.com/rwjtoqiy/image/upload/v12345/ast_thumbnails/program_123.jpg -> ast_thumbnails/program_123
 */
export function getCloudinaryPublicId(url: string): string | null {
    if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return null
    try {
        const parts = url.split('/upload/')
        if (parts.length < 2) return null
        let publicIdWithExt = parts[1]
        // strip version if present (e.g. v12345678/)
        publicIdWithExt = publicIdWithExt.replace(/^v\d+\//, '')
        // strip file extension
        const lastDot = publicIdWithExt.lastIndexOf('.')
        return lastDot !== -1 ? publicIdWithExt.substring(0, lastDot) : publicIdWithExt
    } catch {
        return null
    }
}

/**
 * Deletes an image from Cloudinary by URL or public ID.
 */
export async function deleteImageFromCloudinaryUrl(url: string): Promise<boolean> {
    const publicId = getCloudinaryPublicId(url)
    if (!publicId) return false
    try {
        console.log(`[Cloudinary] Deleting old image: ${publicId}`)
        await cloudinary.uploader.destroy(publicId, {
            resource_type: 'image',
            invalidate: true,
        })
        return true
    } catch (err) {
        console.error(`[Cloudinary] Failed to delete image ${publicId}:`, err)
        return false
    }
}

/**
 * Uploads a base64 thumbnail string (data:image/...) to Cloudinary.
 * Uses deterministic public_id under folder `ast_thumbnails/${type}_${id}`.
 * Setting `overwrite: true` and `invalidate: true` ensures old thumbnail is replaced immediately.
 */
export async function uploadThumbnailToCloudinary(
    imageDataUrl: string,
    type: 'program' | 'module',
    id: string
): Promise<string> {
    if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
        return imageDataUrl
    }
    const publicId = `ast_thumbnails/${type}_${id}`
    const result = await cloudinary.uploader.upload(imageDataUrl, {
        public_id: publicId,
        resource_type: 'image',
        overwrite: true,
        invalidate: true,
    })

    if (!result || !result.secure_url) {
        throw new Error(`Cloudinary thumbnail upload failed for ${type} ${id}`)
    }

    return result.secure_url
}

export default cloudinary

