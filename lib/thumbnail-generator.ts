"use client"

/**
 * Aesthetic Pastel Thumbnail Generator (Flat Design)
 * Features soft pastel backgrounds, flat white circle with washed logo watermark,
 * and bold inverted dark typography with no shadows or outer borders.
 */

const PASTEL_COLOR_PALETTES = [
    { bg: "#E2F7E1", border: "#B4ECB2", text: "#0F172A", tag: "PASTEL MINT" },
    { bg: "#E0F2FE", border: "#BAE6FD", text: "#0F172A", tag: "PASTEL SKY" },
    { bg: "#F3E8FF", border: "#E9D5FF", text: "#0F172A", tag: "PASTEL LILAC" },
    { bg: "#FFEDD5", border: "#FED7AA", text: "#0F172A", tag: "PASTEL PEACH" },
    { bg: "#FFE4E6", border: "#FECDD3", text: "#0F172A", tag: "PASTEL ROSE" },
    { bg: "#FEF9C3", border: "#FEF08A", text: "#0F172A", tag: "PASTEL BUTTER" },
];

export async function generateArtisticThumbnail(
    title: string,
    _subtitle: string = "AFTERSCHOOL TECH",
    styleIndex: number = 0
): Promise<string> {
    if (typeof window === "undefined") return "";

    const width = 800;
    const height = 450;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return "";

    // Select pastel color theme based on styleIndex & title length
    const colorCount = PASTEL_COLOR_PALETTES.length;
    let baseHash = styleIndex;
    for (let i = 0; i < title.length; i++) {
        baseHash += title.charCodeAt(i);
    }
    const theme = PASTEL_COLOR_PALETTES[baseHash % colorCount];
    const styleVariant = (styleIndex + baseHash) % 4;

    // 1. Flat Soft Pastel Background (No outer border)
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    // 2. Flat Geometric Background Accents
    ctx.save();
    ctx.fillStyle = theme.border;
    ctx.globalAlpha = 0.35;
    if (styleVariant === 0) {
        ctx.beginPath();
        ctx.arc(width - 40, height - 40, 160, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(60, 60, 90, 0, Math.PI * 2);
        ctx.fill();
    } else if (styleVariant === 1) {
        ctx.beginPath();
        ctx.moveTo(width, 0);
        ctx.lineTo(width, height);
        ctx.lineTo(width * 0.5, height);
        ctx.closePath();
        ctx.fill();
    } else if (styleVariant === 2) {
        ctx.lineWidth = 16;
        ctx.strokeStyle = theme.border;
        ctx.beginPath();
        ctx.arc(width * 0.85, height * 0.5, 130, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 2;
        const step = 45;
        for (let x = 0; x < width; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
    }
    ctx.restore();

    // 3. Flat White Center Circle & Washed Logo (No shadows)
    try {
        const logoImg = new Image();
        logoImg.src = "/icons/icon-512x512.png";

        await new Promise((resolve) => {
            if (logoImg.complete) {
                resolve(true);
            } else {
                logoImg.onload = () => resolve(true);
                logoImg.onerror = () => resolve(false);
            }
        });

        const centerX = width / 2;
        const centerY = height / 2;
        const circleRadius = 130;

        ctx.save();
        // Flat white circle background
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
        ctx.fill();

        // Washed Logo inside white circle
        ctx.globalAlpha = 0.28;
        const logoSize = 200;
        ctx.drawImage(
            logoImg,
            centerX - logoSize / 2,
            centerY - logoSize / 2,
            logoSize,
            logoSize
        );
        ctx.restore();
    } catch {
        // Fallback if image fails to load
    }

    // 4. Inverted Dark Main Title (Centered & Large Font)
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "900 48px Inter, sans-serif";
    ctx.fillStyle = theme.text;

    const words = title.split(" ");
    let line = "";
    const lines = [];
    const maxLineWidth = width - 180;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && n > 0) {
            lines.push(line.trim());
            line = words[n] + " ";
        } else {
            line = testLine;
        }
    }
    lines.push(line.trim());

    // Vertical line spacing
    const lineHeight = 56;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = height / 2 - totalHeight / 2;

    lines.forEach((l, i) => {
        ctx.fillText(l, width / 2, startY + i * lineHeight);
    });

    ctx.restore();

    return canvas.toDataURL("image/png", 0.85);
}
