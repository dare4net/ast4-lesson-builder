/**
 * Insert Cloudinary fetch transforms so delivery is resized/WebP without
 * downloading the stored original. Leaves non-Cloudinary URLs unchanged.
 */
export function cloudinaryDeliveryUrl(src: string, width = 1600): string {
    if (!src || !src.includes("res.cloudinary.com") || !src.includes("/image/upload/")) {
        return src
    }
    if (/\/image\/upload\/[^/]*f_auto/.test(src)) {
        return src
    }
    const transform = ["f_auto", "q_auto", "c_limit", `w_${width}`].join(",")
    return src.replace("/image/upload/", `/image/upload/${transform}/`)
}

/** Hosts allowed in next.config.mjs `images.remotePatterns`. Keep these in sync. */
export const OPTIMIZABLE_IMAGE_HOSTS = new Set([
    "res.cloudinary.com",
])

export function canOptimizeImageSrc(src: string) {
    if (!src) return false
    if (src.startsWith("data:") || src.startsWith("blob:")) return false
    const path = src.split("?")[0].toLowerCase()
    if (path.endsWith(".svg")) return false
    if (src.startsWith("/") && !src.startsWith("//")) return true

    try {
        const url = new URL(src)
        return OPTIMIZABLE_IMAGE_HOSTS.has(url.hostname)
    } catch {
        return false
    }
}
