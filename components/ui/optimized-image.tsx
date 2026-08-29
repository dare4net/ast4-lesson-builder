"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"
import { cn } from "@/lib/utils"
import { canOptimizeImageSrc, cloudinaryDeliveryUrl } from "@/lib/cloudinary-delivery"

type OptimizedImageProps = Omit<ImageProps, "src"> & {
    src: string
    fallbackSrc?: string
}

export function OptimizedImage({
    src,
    alt,
    className,
    fallbackSrc = "/logo.webp",
    onError,
    sizes,
    fill,
    ...rest
}: OptimizedImageProps) {
    const [failed, setFailed] = useState(false)
    const resolved = failed ? fallbackSrc : src
    const deliverySrc = cloudinaryDeliveryUrl(resolved)
    const resolvedSizes = sizes ?? (fill ? "100vw" : undefined)

    const handleError: ImageProps["onError"] = (event) => {
        if (!failed) setFailed(true)
        onError?.(event)
    }

    if (!canOptimizeImageSrc(deliverySrc)) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={deliverySrc || fallbackSrc}
                alt={alt}
                className={cn(fill && "absolute inset-0 h-full w-full", className)}
                onError={handleError}
            />
        )
    }

    return (
        <Image
            src={deliverySrc}
            alt={alt}
            fill={fill}
            className={cn(className)}
            sizes={resolvedSizes}
            onError={handleError}
            {...rest}
        />
    )
}
