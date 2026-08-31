export type MascotImpression = 'proud' | 'hype' | 'cool' | 'wink' | 'focused' | 'chill'

const INK = '#111111'

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const radius = Math.min(r, w / 2, h / 2)
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + w, y, x + w, y + h, radius)
    ctx.arcTo(x + w, y + h, x, y + h, radius)
    ctx.arcTo(x, y, x, y, radius)
    ctx.arcTo(x, y, x + w, y, radius)
    ctx.closePath()
}

function drawEye(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    colors: [string, string, string, string],
    pupil: { dx: number; dy: number; r: number },
    wink: boolean,
) {
    const half = size / 2
    const squish = wink ? 0.22 : 1
    ctx.save()
    ctx.translate(x, y + (wink ? half * (1 - squish) : 0))
    ctx.scale(1, squish)

    ctx.beginPath()
    ctx.rect(0, 0, half, half)
    ctx.rect(half, 0, half, half)
    ctx.rect(0, half, half, half)
    ctx.rect(half, half, half, half)
    ctx.clip()
    ctx.fillStyle = colors[0]
    ctx.fillRect(0, 0, half, half)
    ctx.fillStyle = colors[1]
    ctx.fillRect(half, 0, half, half)
    ctx.fillStyle = colors[2]
    ctx.fillRect(0, half, half, half)
    ctx.fillStyle = colors[3]
    ctx.fillRect(half, half, half, half)
    ctx.restore()

    ctx.save()
    ctx.translate(x, y + (wink ? half * (1 - squish) : 0))
    ctx.scale(1, squish)
    ctx.fillStyle = INK
    ctx.fillRect(half - size * 0.023, 0, size * 0.046, size)
    ctx.fillRect(0, half - size * 0.023, size, size * 0.046)
    ctx.lineWidth = size * 0.046
    ctx.strokeStyle = INK
    ctx.strokeRect(size * 0.023, size * 0.023, size - size * 0.046, size - size * 0.046)
    ctx.restore()

    if (wink) {
        ctx.strokeStyle = INK
        ctx.lineWidth = size * 0.07
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x + size * 0.18, y + size * 0.52)
        ctx.quadraticCurveTo(x + size * 0.5, y + size * 0.72, x + size * 0.82, y + size * 0.52)
        ctx.stroke()
        return
    }

    const cx = x + half + pupil.dx * size
    const cy = y + half + pupil.dy * size
    ctx.fillStyle = '#FFFFFF'
    ctx.strokeStyle = INK
    ctx.lineWidth = size * 0.046
    ctx.beginPath()
    ctx.arc(cx, cy, size * 0.23, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = INK
    ctx.beginPath()
    ctx.arc(cx, cy, pupil.r * size, 0, Math.PI * 2)
    ctx.fill()
}

function drawAntenna(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
    side: 'left' | 'right' | 'up',
) {
    ctx.strokeStyle = INK
    ctx.fillStyle = color
    ctx.lineWidth = size * 0.046
    ctx.lineCap = 'round'
    ctx.beginPath()
    if (side === 'up') {
        ctx.moveTo(x, y)
        ctx.lineTo(x, y - size * 0.32)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(x, y - size * 0.38, size * 0.085, 0, Math.PI * 2)
    } else if (side === 'left') {
        ctx.moveTo(x, y)
        ctx.lineTo(x - size * 0.28, y)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(x - size * 0.34, y, size * 0.078, 0, Math.PI * 2)
    } else {
        ctx.moveTo(x, y)
        ctx.lineTo(x + size * 0.28, y)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(x + size * 0.34, y, size * 0.078, 0, Math.PI * 2)
    }
    ctx.fill()
    ctx.stroke()
}

function drawShades(ctx: CanvasRenderingContext2D, leftX: number, rightX: number, y: number, size: number) {
    const rx = size * 0.4
    const ry = size * 0.28
    const cy = y + size * 0.52
    const leftCx = leftX + size / 2
    const rightCx = rightX + size / 2
    const frame = Math.max(3, size * 0.05)

    ctx.save()
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    const paintLens = (cx: number) => {
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.fillStyle = '#121212'
        ctx.fill()
        ctx.strokeStyle = INK
        ctx.lineWidth = frame * 1.55
        ctx.stroke()
        ctx.strokeStyle = '#F4B942'
        ctx.lineWidth = frame * 0.85
        ctx.stroke()

        ctx.beginPath()
        ctx.ellipse(cx - rx * 0.3, cy - ry * 0.34, rx * 0.34, ry * 0.18, -0.45, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.fill()
    }

    paintLens(leftCx)
    paintLens(rightCx)

    const bridgeLeft = leftCx + rx - frame * 0.2
    const bridgeRight = rightCx - rx + frame * 0.2
    ctx.beginPath()
    ctx.moveTo(bridgeLeft, cy)
    ctx.lineTo(bridgeRight, cy)
    ctx.strokeStyle = INK
    ctx.lineWidth = frame * 1.45
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(bridgeLeft, cy)
    ctx.lineTo(bridgeRight, cy)
    ctx.strokeStyle = '#F4B942'
    ctx.lineWidth = frame * 0.8
    ctx.stroke()

    ctx.restore()
}

/**
 * Splash-screen eyes mascot, drawn at any scale with a board-specific impression.
 */
export function drawAstMascot(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    impression: MascotImpression = 'proud',
) {
    const size = 130 * scale
    const gap = 50 * scale
    const leftX = x
    const rightX = x + size + gap
    const eyeY = y + 48 * scale

    let pupil = { dx: 0, dy: 0, r: 0.1 }
    if (impression === 'hype') pupil = { dx: 0, dy: -0.08, r: 0.12 }
    if (impression === 'focused') pupil = { dx: -0.1, dy: 0.02, r: 0.1 }
    if (impression === 'chill') pupil = { dx: 0.04, dy: 0.08, r: 0.09 }
    if (impression === 'proud') pupil = { dx: -0.12, dy: -0.02, r: 0.1 }

    const leftColors: [string, string, string, string] = ['#4FA8DE', '#6DBE45', '#35408C', '#2E7D4F']
    const rightColors: [string, string, string, string] = ['#4FA8DE', '#4FA8DE', '#6DBE45', '#E85B3A']

    drawAntenna(ctx, leftX + size / 2, eyeY, size, impression === 'hype' ? '#F4B942' : '#D94A3D', 'up')
    drawAntenna(ctx, rightX + size / 2, eyeY, size, impression === 'cool' ? '#4FA8DE' : '#F4B942', 'up')
    drawAntenna(ctx, leftX, eyeY + size / 2, size, '#D94A3D', 'left')
    drawAntenna(ctx, rightX + size, eyeY + size / 2, size, '#F4B942', 'right')

    drawEye(ctx, leftX, eyeY, size, leftColors, pupil, impression === 'wink')
    drawEye(ctx, rightX, eyeY, size, rightColors, pupil, false)

    if (impression === 'cool') {
        drawShades(ctx, leftX, rightX, eyeY, size)
    }
}

export const AST_MASCOT_WIDTH = 310
export const AST_MASCOT_HEIGHT = 220
