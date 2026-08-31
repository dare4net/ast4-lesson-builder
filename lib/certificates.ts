import { AST_MASCOT_WIDTH, drawAstMascot } from '@/lib/ast-mascot'
import { prideCardTheme, type PrideCardTheme } from '@/lib/pride-card-themes'

/** Fixed A4-landscape pixels so PNG and PDF match on every device. */
export const CERT_WIDTH = 1600
export const CERT_HEIGHT = 1131
export const CERTIFICATE_PRINT_COST = 5

export type LessonCertificatePayload = {
    kind: 'lesson'
    studentName: string
    lessonTitle: string
    printedAt: string
    score?: number
    totalPossible?: number
}

export type PrideCertificatePayload = {
    kind: 'pride'
    studentName: string
    boardLabel: string
    printedAt: string
    valueLabel: string
    rank?: number | null
    crown?: string | null
    statKey?: string
}

export type CertificatePayload = LessonCertificatePayload | PrideCertificatePayload

export function formatPrintDay(iso: string) {
    const stamp = Date.parse(iso)
    const date = Number.isFinite(stamp) ? new Date(stamp) : new Date()
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    })
}

export function certificateFileStem(payload: CertificatePayload) {
    const day = formatPrintDay(payload.printedAt).replace(/\s+/g, '-').toLowerCase()
    const slug = (payload.kind === 'lesson' ? payload.lessonTitle : payload.boardLabel)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40) || 'certificate'
    return `${payload.kind}-${slug}-${day}`
}

function fontStack(kind: 'sans' | 'heading') {
    if (typeof document === 'undefined') return kind === 'heading' ? 'Lexend, sans-serif' : 'Nunito, sans-serif'
    const styles = getComputedStyle(document.documentElement)
    const named = styles.getPropertyValue(kind === 'heading' ? '--font-heading' : '--font-sans').trim()
    return named ? `${named}, Nunito, sans-serif` : 'Nunito, sans-serif'
}

async function readyFonts() {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
        await document.fonts.ready
    }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const radius = Math.min(r, w / 2, h / 2)
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + w, y, x + w, y + h, radius)
    ctx.arcTo(x + w, y + h, x, y + h, radius)
    ctx.arcTo(x, y + h, x, y, radius)
    ctx.arcTo(x, y, x + w, y, radius)
    ctx.closePath()
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxSize: number, weight: string, family: string) {
    let size = maxSize
    while (size >= 22) {
        ctx.font = `${weight} ${size}px ${family}`
        if (ctx.measureText(text).width <= maxWidth) return size
        size -= 2
    }
    ctx.font = `${weight} ${size}px ${family}`
    return size
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = 3) {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean)
    const lines: string[] = []
    let current = ''
    for (const word of words) {
        const next = current ? `${current} ${word}` : word
        if (ctx.measureText(next).width <= maxWidth) {
            current = next
        } else {
            if (current) lines.push(current)
            current = word
            if (lines.length === maxLines - 1) break
        }
    }
    if (current && lines.length < maxLines) lines.push(current)
    const leftover = words.slice(lines.join(' ').split(/\s+/).filter(Boolean).length)
    if (leftover.length && lines.length) {
        lines[lines.length - 1] = `${lines[lines.length - 1].replace(/\s+\S+$/, '')}…`
    }
    return lines
}

const LOGO_CANDIDATES = ['/icons/icon-512x512.png', '/icons/icon-192x192.png', '/logo.webp']

function loadImage(src: string) {
    return new Promise<HTMLImageElement | null>((resolve) => {
        if (typeof Image === 'undefined') {
            resolve(null)
            return
        }
        const image = new Image()
        let settled = false
        const finish = (value: HTMLImageElement | null) => {
            if (settled) return
            settled = true
            clearTimeout(timer)
            resolve(value)
        }
        const timer = setTimeout(() => finish(null), 1800)
        image.onload = () => finish(image)
        image.onerror = () => finish(null)
        image.src = src
        if (image.complete && image.naturalWidth > 0) finish(image)
    })
}

async function loadBrandLogo() {
    for (const src of LOGO_CANDIDATES) {
        const image = await loadImage(src)
        if (image) return image
    }
    return null
}

function drawLogo(ctx: CanvasRenderingContext2D, logo: HTMLImageElement | null, x: number, y: number, size: number) {
    if (!logo) return
    ctx.save()
    roundRect(ctx, x, y, size, size, size * 0.22)
    ctx.clip()
    ctx.drawImage(logo, x, y, size, size)
    ctx.restore()
}

function drawPridePattern(ctx: CanvasRenderingContext2D, theme: PrideCardTheme) {
    ctx.save()
    ctx.fillStyle = theme.pattern
    ctx.strokeStyle = theme.pattern
    const { patternStyle } = theme
    if (patternStyle === 'sunburst') {
        ctx.globalAlpha = 0.35
        for (let i = 0; i < 14; i += 1) {
            ctx.beginPath()
            ctx.moveTo(CERT_WIDTH * 0.78, CERT_HEIGHT * 0.55)
            const a = (i / 14) * Math.PI * 2
            const b = a + 0.12
            ctx.lineTo(CERT_WIDTH * 0.78 + Math.cos(a) * 980, CERT_HEIGHT * 0.55 + Math.sin(a) * 980)
            ctx.lineTo(CERT_WIDTH * 0.78 + Math.cos(b) * 980, CERT_HEIGHT * 0.55 + Math.sin(b) * 980)
            ctx.closePath()
            ctx.fill()
        }
    } else if (patternStyle === 'dots') {
        ctx.globalAlpha = 0.28
        for (let x = 70; x < CERT_WIDTH; x += 70) {
            for (let y = 70; y < CERT_HEIGHT; y += 70) {
                ctx.beginPath()
                ctx.arc(x + ((y / 70) % 2) * 18, y, 10, 0, Math.PI * 2)
                ctx.fill()
            }
        }
    } else if (patternStyle === 'stripes') {
        ctx.globalAlpha = 0.22
        ctx.lineWidth = 28
        for (let i = -CERT_HEIGHT; i < CERT_WIDTH; i += 72) {
            ctx.beginPath()
            ctx.moveTo(i, 0)
            ctx.lineTo(i + CERT_HEIGHT, CERT_HEIGHT)
            ctx.stroke()
        }
    } else if (patternStyle === 'chevrons') {
        ctx.globalAlpha = 0.22
        ctx.lineWidth = 18
        ctx.lineCap = 'round'
        for (let y = 80; y < CERT_HEIGHT; y += 90) {
            ctx.beginPath()
            ctx.moveTo(40, y)
            for (let x = 40; x < CERT_WIDTH; x += 80) {
                ctx.lineTo(x + 40, y - 28)
                ctx.lineTo(x + 80, y)
            }
            ctx.stroke()
        }
    } else if (patternStyle === 'grid') {
        ctx.globalAlpha = 0.2
        ctx.lineWidth = 8
        for (let x = 60; x < CERT_WIDTH; x += 96) {
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, CERT_HEIGHT)
            ctx.stroke()
        }
        for (let y = 60; y < CERT_HEIGHT; y += 96) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(CERT_WIDTH, y)
            ctx.stroke()
        }
    } else if (patternStyle === 'rings') {
        ctx.globalAlpha = 0.22
        ctx.lineWidth = 16
        for (let i = 1; i <= 8; i += 1) {
            ctx.beginPath()
            ctx.arc(CERT_WIDTH * 0.82, CERT_HEIGHT * 0.52, i * 90, 0, Math.PI * 2)
            ctx.stroke()
        }
    } else if (patternStyle === 'dashes') {
        ctx.globalAlpha = 0.28
        ctx.lineWidth = 10
        ctx.setLineDash([28, 22])
        for (let y = 50; y < CERT_HEIGHT; y += 54) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(CERT_WIDTH, y)
            ctx.stroke()
        }
        ctx.setLineDash([])
    } else {
        ctx.globalAlpha = 0.2
        for (let x = 40; x < CERT_WIDTH; x += 110) {
            for (let y = 40; y < CERT_HEIGHT; y += 110) {
                roundRect(ctx, x, y, 64, 64, 14)
                ctx.fill()
            }
        }
    }
    ctx.restore()
}

function crownPalette(tier?: string | null) {
    if (tier === 'silver') return { metal: '#CBD5E1', ink: '#334155' }
    if (tier === 'bronze') return { metal: '#D97706', ink: '#7C2D12' }
    return { metal: '#FFC800', ink: '#7C4A00' }
}

function drawFlatCrown(ctx: CanvasRenderingContext2D, cx: number, cy: number, width: number, tier: string) {
    const h = width * 0.58
    const x = cx - width / 2
    const y = cy - h / 2
    ctx.save()
    ctx.fillStyle = crownPalette(tier).metal
    ctx.beginPath()
    ctx.moveTo(x, y + h)
    ctx.lineTo(x, y + h * 0.52)
    ctx.lineTo(x + width * 0.18, y + h * 0.16)
    ctx.lineTo(x + width * 0.34, y + h * 0.52)
    ctx.lineTo(x + width * 0.5, y)
    ctx.lineTo(x + width * 0.66, y + h * 0.52)
    ctx.lineTo(x + width * 0.82, y + h * 0.16)
    ctx.lineTo(x + width, y + h * 0.52)
    ctx.lineTo(x + width, y + h)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
}

function drawLessonCertificate(ctx: CanvasRenderingContext2D, payload: LessonCertificatePayload, logo: HTMLImageElement | null) {
    const sans = fontStack('sans')
    const heading = fontStack('heading')
    const day = formatPrintDay(payload.printedAt)

    ctx.fillStyle = '#F4FBF0'
    ctx.fillRect(0, 0, CERT_WIDTH, CERT_HEIGHT)

    drawPridePattern(ctx, {
        bg: '#F4FBF0',
        ink: '#1A1A1A',
        muted: '#6B7280',
        accent: '#58CC02',
        pattern: '#D7F9B5',
        patternStyle: 'dots',
        impression: 'proud',
        numberFill: '#FFFFFF',
        numberStroke: '#3B8C00',
        pill: '#58CC02',
        pillInk: '#FFFFFF',
    })

    ctx.fillStyle = '#58CC02'
    ctx.fillRect(0, 0, CERT_WIDTH, 140)
    ctx.fillStyle = '#FFC800'
    ctx.fillRect(0, 140, CERT_WIDTH, 18)

    drawLogo(ctx, logo, 72, 36, 72)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `900 22px ${sans}`
    ctx.textAlign = 'left'
    ctx.fillText('AFTER-SCHOOL.TECH', 164, 80)

    ctx.save()
    ctx.translate(CERT_WIDTH + 20, 200)
    drawAstMascot(ctx, -AST_MASCOT_WIDTH * 1.95, 0, 1.95, 'proud')
    ctx.restore()

    ctx.fillStyle = '#3B8C00'
    ctx.font = `900 18px ${sans}`
    ctx.textAlign = 'left'
    ctx.fillText('LESSON CERTIFICATE', 80, 230)

    ctx.fillStyle = '#6B7280'
    ctx.font = `800 22px ${sans}`
    ctx.fillText('This certifies that', 80, 300)

    const name = payload.studentName.trim() || 'Student'
    fitText(ctx, name, 980, 86, '900', heading)
    ctx.fillStyle = '#1A1A1A'
    ctx.fillText(name, 80, 400)

    ctx.fillStyle = '#6B7280'
    ctx.font = `700 22px ${sans}`
    ctx.fillText('finished', 80, 460)

    ctx.fillStyle = '#FFFFFF'
    roundRect(ctx, 80, 500, 980, 170, 32)
    ctx.fill()
    ctx.strokeStyle = '#58CC02'
    ctx.lineWidth = 6
    roundRect(ctx, 80, 500, 980, 170, 32)
    ctx.stroke()

    ctx.fillStyle = '#1A1A1A'
    ctx.font = `800 36px ${heading}`
    const titleLines = wrapLines(ctx, payload.lessonTitle || 'Lesson', 900, 2)
    titleLines.forEach((line, index) => {
        ctx.fillText(line, 110, 570 + index * 48)
    })

    if (payload.totalPossible && payload.totalPossible > 0) {
        ctx.fillStyle = '#58CC02'
        roundRect(ctx, 80, 700, 280, 64, 32)
        ctx.fill()
        ctx.fillStyle = '#FFFFFF'
        ctx.font = `900 22px ${sans}`
        ctx.textAlign = 'center'
        ctx.fillText(`${payload.score || 0} / ${payload.totalPossible} pts`, 220, 742)
        ctx.textAlign = 'left'
    }

    ctx.fillStyle = '#6B7280'
    ctx.font = `800 16px ${sans}`
    ctx.fillText('PRINTED', 80, 980)
    ctx.fillStyle = '#1A1A1A'
    ctx.font = `800 28px ${heading}`
    ctx.fillText(day, 80, 1024)
}

function drawPrideCertificate(ctx: CanvasRenderingContext2D, payload: PrideCertificatePayload, logo: HTMLImageElement | null) {
    const sans = fontStack('sans')
    const heading = fontStack('heading')
    const day = formatPrintDay(payload.printedAt)
    const theme = prideCardTheme(payload.statKey)
    const impression = payload.crown === 'gold' ? 'cool' : theme.impression

    ctx.fillStyle = theme.bg
    ctx.fillRect(0, 0, CERT_WIDTH, CERT_HEIGHT)
    drawPridePattern(ctx, theme)

    ctx.save()
    ctx.translate(CERT_WIDTH + 36, 24)
    drawAstMascot(ctx, -AST_MASCOT_WIDTH * 2.05, 0, 2.05, impression)
    ctx.restore()

    const rightCx = CERT_WIDTH - 310
    const hasCrown = payload.crown === 'gold' || payload.crown === 'silver' || payload.crown === 'bronze'
    const rankLabel = payload.rank ? `#${payload.rank}` : ''
    const palette = crownPalette(hasCrown ? payload.crown : 'gold')

    if (hasCrown) {
        drawFlatCrown(ctx, rightCx, 640, rankLabel ? 260 : 300, payload.crown as string)
    }

    if (rankLabel) {
        const rankY = hasCrown ? 900 : 760
        fitText(ctx, rankLabel, 480, hasCrown ? 130 : 180, '900', heading)
        ctx.textAlign = 'center'
        ctx.fillStyle = hasCrown ? palette.ink : theme.numberFill
        if (!hasCrown) {
            ctx.lineJoin = 'round'
            ctx.miterLimit = 2
            ctx.lineWidth = 16
            ctx.strokeStyle = theme.numberStroke
            ctx.strokeText(rankLabel, rightCx, rankY)
        }
        ctx.fillText(rankLabel, rightCx, rankY)
        ctx.textAlign = 'left'
    }

    drawLogo(ctx, logo, 72, CERT_HEIGHT - 132, 72)
    ctx.fillStyle = theme.ink
    ctx.font = `900 20px ${sans}`
    ctx.textAlign = 'left'
    ctx.fillText('AFTER-SCHOOL.TECH', 164, CERT_HEIGHT - 86)
    ctx.fillStyle = theme.muted
    ctx.font = `800 16px ${sans}`
    ctx.fillText(`Printed ${day}`, 164, CERT_HEIGHT - 58)

    ctx.fillStyle = theme.muted
    ctx.font = `900 22px ${sans}`
    ctx.fillText((payload.studentName.trim() || 'Student').toUpperCase(), 80, 120)

    const value = payload.valueLabel || '—'
    const valueSize = fitText(ctx, value, 880, 220, '900', heading)
    ctx.lineJoin = 'round'
    ctx.miterLimit = 2
    ctx.lineWidth = Math.max(18, valueSize * 0.08)
    ctx.strokeStyle = theme.numberStroke
    ctx.fillStyle = theme.numberFill
    ctx.strokeText(value, 80, 360)
    ctx.fillText(value, 80, 360)

    ctx.fillStyle = theme.ink
    ctx.font = `900 42px ${heading}`
    const caption = wrapLines(ctx, payload.boardLabel || 'Pride board', 880, 2)
    caption.forEach((line, index) => {
        ctx.fillText(line, 80, 450 + index * 52)
    })
}

export async function renderCertificate(payload: CertificatePayload): Promise<HTMLCanvasElement> {
    await readyFonts()
    const logo = await loadBrandLogo()
    const canvas = document.createElement('canvas')
    canvas.width = CERT_WIDTH
    canvas.height = CERT_HEIGHT
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not draw certificate')
    ctx.textBaseline = 'alphabetic'
    if (payload.kind === 'lesson') drawLessonCertificate(ctx, payload, logo)
    else drawPrideCertificate(ctx, payload, logo)
    return canvas
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export async function downloadCertificatePng(payload: CertificatePayload) {
    const canvas = await renderCertificate(payload)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('Could not export image')
    downloadBlob(blob, `${certificateFileStem(payload)}.png`)
}

function jpegToPdf(jpeg: Uint8Array, width: number, height: number) {
    const pageW = 842
    const pageH = 595
    const objects: string[] = []
    const push = (body: string) => {
        objects.push(body)
        return objects.length
    }
    push('<< /Type /Catalog /Pages 2 0 R >>')
    push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
    push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`)
    const imageDict = `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`
    const content = `q ${pageW} 0 0 ${pageH} 0 0 cm /Im0 Do Q`
    push('')
    push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`)

    const encoder = new TextEncoder()
    const chunks: Uint8Array[] = []
    const header = encoder.encode('%PDF-1.4\n')
    chunks.push(header)
    let offset = header.length
    const xref = [0]
    const write = (part: Uint8Array) => {
        chunks.push(part)
        offset += part.length
    }

    objects.forEach((body, index) => {
        xref.push(offset)
        const id = index + 1
        if (id === 4) {
            const start = encoder.encode(`${id} 0 obj\n${imageDict}`)
            const end = encoder.encode('\nendstream\nendobj\n')
            write(start)
            write(jpeg)
            write(end)
        } else {
            write(encoder.encode(`${id} 0 obj\n${body}\nendobj\n`))
        }
    })

    const xrefOffset = offset
    let xrefTable = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
    for (let i = 1; i < xref.length; i += 1) {
        xrefTable += `${String(xref[i]).padStart(10, '0')} 00000 n \n`
    }
    xrefTable += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
    write(encoder.encode(xrefTable))

    const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const merged = new Uint8Array(total)
    let cursor = 0
    for (const chunk of chunks) {
        merged.set(chunk, cursor)
        cursor += chunk.length
    }
    return new Blob([merged], { type: 'application/pdf' })
}

export async function downloadCertificatePdf(payload: CertificatePayload) {
    const canvas = await renderCertificate(payload)
    const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
    if (!jpeg) throw new Error('Could not export PDF')
    const buffer = new Uint8Array(await jpeg.arrayBuffer())
    const pdf = jpegToPdf(buffer, canvas.width, canvas.height)
    downloadBlob(pdf, `${certificateFileStem(payload)}.pdf`)
}
