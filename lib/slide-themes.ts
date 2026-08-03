/**
 * Slide Transition Themes
 *
 * Provides lesson-locked flat graphic pattern styles and solid per-slide pastel colors
 * for the SlideTransitionOverlay component.
 */

import type React from "react";

export interface SlideTheme {
    /** 100% Solid Pastel background color hex */
    solidBgHex: string;
    /** Primary text color hex */
    textHex: string;
    /** Secondary/subtle text color hex */
    subtleTextHex: string;
    /** Accent shape color hex used for background graphic patterns */
    shapeHex: string;
    /** Button background color hex */
    btnBgHex: string;
    /** Button text color hex */
    btnTextHex: string;
}

/** 8 Distinct 100% Solid Pastel Themes */
export const PASTEL_PALETTE: SlideTheme[] = [
    // 1. Sky Blue
    {
        solidBgHex: "#E0F2FE",
        textHex: "#0369A1",
        subtleTextHex: "#0284C7",
        shapeHex: "#BAE6FD",
        btnBgHex: "#0284C7",
        btnTextHex: "#FFFFFF",
    },
    // 2. Mint Emerald
    {
        solidBgHex: "#D1FAE5",
        textHex: "#047857",
        subtleTextHex: "#059669",
        shapeHex: "#A7F3D0",
        btnBgHex: "#059669",
        btnTextHex: "#FFFFFF",
    },
    // 3. Soft Lavender
    {
        solidBgHex: "#EDE9FE",
        textHex: "#6D28D9",
        subtleTextHex: "#7C3AED",
        shapeHex: "#DDD6FE",
        btnBgHex: "#7C3AED",
        btnTextHex: "#FFFFFF",
    },
    // 4. Warm Peach
    {
        solidBgHex: "#FFEDD5",
        textHex: "#C2410C",
        subtleTextHex: "#EA580C",
        shapeHex: "#FED7AA",
        btnBgHex: "#EA580C",
        btnTextHex: "#FFFFFF",
    },
    // 5. Pastel Rose
    {
        solidBgHex: "#FCE7F3",
        textHex: "#BE185D",
        subtleTextHex: "#DB2777",
        shapeHex: "#FBCFE8",
        btnBgHex: "#DB2777",
        btnTextHex: "#FFFFFF",
    },
    // 6. Sunshine Yellow
    {
        solidBgHex: "#FEF3C7",
        textHex: "#B45309",
        subtleTextHex: "#D97706",
        shapeHex: "#FDE68A",
        btnBgHex: "#D97706",
        btnTextHex: "#FFFFFF",
    },
    // 7. Soft Teal
    {
        solidBgHex: "#CCFBF1",
        textHex: "#0F766E",
        subtleTextHex: "#0D9488",
        shapeHex: "#99F6E4",
        btnBgHex: "#0D9488",
        btnTextHex: "#FFFFFF",
    },
    // 8. Soft Coral
    {
        solidBgHex: "#FEE2E2",
        textHex: "#B91C1C",
        subtleTextHex: "#DC2626",
        shapeHex: "#FECDD3",
        btnBgHex: "#DC2626",
        btnTextHex: "#FFFFFF",
    },
];

export type GraphicPatternStyle = "polka-dots" | "waves" | "polygons" | "squiggles" | "sunburst";

const PATTERNS: GraphicPatternStyle[] = ["polka-dots", "waves", "polygons", "squiggles", "sunburst"];

/**
 * Returns a deterministic graphic pattern style locked to the lesson ID.
 */
export function getLessonPattern(lessonId: string): GraphicPatternStyle {
    let hash = 0;
    for (let i = 0; i < lessonId.length; i++) {
        hash = (hash * 31 + lessonId.charCodeAt(i)) >>> 0;
    }
    return PATTERNS[hash % PATTERNS.length];
}

/**
 * Returns the solid pastel theme for a specific slide index.
 */
export function getSlideTheme(slideIndex: number): SlideTheme {
    return PASTEL_PALETTE[slideIndex % PASTEL_PALETTE.length];
}
