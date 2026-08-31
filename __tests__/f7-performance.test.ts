import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { canOptimizeImageSrc, cloudinaryDeliveryUrl } from '@/lib/cloudinary-delivery'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('F7 performance / responsive', () => {
    it('re-enables next/image optimization and allows Cloudinary', () => {
        const config = read('next.config.mjs')
        expect(config).not.toMatch(/unoptimized\s*:\s*true/)
        expect(config).toContain('remotePatterns')
        expect(config).toContain('res.cloudinary.com')
        expect(existsSync(join(process.cwd(), 'components/ui/optimized-image.tsx'))).toBe(true)
        expect(read('components/ui/optimized-image.tsx')).toContain('from "next/image"')
        expect(read('components/dashboard/student-card.tsx')).toContain('OptimizedImage')
        expect(read('components/dashboard/student/lesson-card.tsx')).toContain('OptimizedImage')
        expect(read('components/renderers/image-renderer.tsx')).toContain('OptimizedImage')
    })

    it('applies Cloudinary delivery transforms and skips data URLs', () => {
        const src = 'https://res.cloudinary.com/demo/image/upload/v1/folder/photo.jpg'
        expect(cloudinaryDeliveryUrl(src)).toContain('/image/upload/f_auto,q_auto,c_limit,w_1600/')
        expect(cloudinaryDeliveryUrl(cloudinaryDeliveryUrl(src))).toBe(cloudinaryDeliveryUrl(src))
        expect(cloudinaryDeliveryUrl('/logo.webp')).toBe('/logo.webp')
        expect(canOptimizeImageSrc('data:image/png;base64,abc')).toBe(false)
        expect(canOptimizeImageSrc('/placeholder.svg')).toBe(false)
        expect(canOptimizeImageSrc('/logo.webp')).toBe(true)
        expect(canOptimizeImageSrc('https://res.cloudinary.com/demo/image/upload/v1/photo.jpg')).toBe(true)
        expect(read('hooks/use-lesson-preloader.ts')).toContain('cloudinaryDeliveryUrl')
        expect(canOptimizeImageSrc('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfGALHUv7ZwLcozN3B5hWt0jY7Wu4RaMLgfIVygnf8kg&s=10')).toBe(false)
    })

    it('makes word-scramble, fill-in-the-blank, and code-editor responsive', () => {
        const scramble = read('components/renderers/word-scramble-renderer.tsx')
        expect(scramble).toContain('sm:p-5')
        expect(scramble).toContain('sm:flex-row')
        expect(scramble).toContain('min-h-11')
        expect(scramble).toContain('min-w-11')

        const blanks = read('components/renderers/fill-in-the-blank-renderer.tsx')
        expect(blanks).toContain('sm:px-6')
        expect(blanks).toContain('sm:flex-row')
        expect(blanks).toContain('min-h-11')

        const code = read('components/renderers/code-editor-renderer.tsx')
        expect(code).toContain('sm:px-6')
        expect(code).toContain('md:grid-cols-2')
        expect(code).toContain('sm:h-[220px]')
        expect(code).toContain('min-h-11')
    })

    it('gives primary lesson actions a 44px minimum target', () => {
        expect(read('components/ui/button.tsx')).toContain('min-h-11')
        expect(read('components/ui/button.tsx')).toContain('compoundVariants')
        expect(read('components/renderers/listen-button.tsx')).toContain('min-h-11')
        expect(read('components/renderers/image-renderer.tsx')).toContain('min-h-11')
        expect(read('components/renderers/code-editor-renderer.tsx')).toContain('min-h-11')
    })
})
