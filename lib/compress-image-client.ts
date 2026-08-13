/**
 * Compress / resize an image in the browser before upload.
 * Reduces upload time and avoids server timeouts on large camera photos.
 */
export async function compressImageFile(
  file: File,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number },
): Promise<File> {
  const maxWidth = options?.maxWidth ?? 1600
  const maxHeight = options?.maxHeight ?? 1600
  const quality = options?.quality ?? 0.82

  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file
  }

  // Already small enough — skip re-encoding
  if (file.size <= 400_000) {
    return file
  }

  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img
      const scale = Math.min(1, maxWidth / width, maxHeight / height)
      width = Math.max(1, Math.round(width * scale))
      height = Math.max(1, Math.round(height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(file)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file)
            return
          }
          const ext = outputType === 'image/png' ? '.png' : '.jpg'
          const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
          resolve(new File([blob], `${baseName}${ext}`, { type: outputType, lastModified: Date.now() }))
        },
        outputType,
        quality,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file)
    }

    img.src = objectUrl
  })
}
