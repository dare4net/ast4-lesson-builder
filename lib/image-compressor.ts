/**
 * Compresses an uploaded image file on a client-side HTML5 canvas
 * to ensure fast uploads, minimal memory overhead, and compliance with API body limits.
 */
export function compressImageFile(
    file: File,
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.85
): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            return reject(new Error('Selected file is not an image'))
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let width = img.width
                let height = img.height

                if (width > maxWidth || height > maxHeight) {
                    if (width / height > maxWidth / maxHeight) {
                        height = Math.round((height * maxWidth) / width)
                        width = maxWidth
                    } else {
                        width = Math.round((width * maxHeight) / height)
                        height = maxHeight
                    }
                }

                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    return resolve(e.target?.result as string)
                }

                // Draw and compress to JPEG
                ctx.drawImage(img, 0, 0, width, height)
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
                resolve(compressedDataUrl)
            }

            img.onerror = () => reject(new Error('Failed to load image for compression'))
            img.src = e.target?.result as string
        }

        reader.onerror = () => reject(new Error('Failed to read image file'))
        reader.readAsDataURL(file)
    })
}
