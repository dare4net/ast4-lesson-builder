import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────
// Lesson Similarity Comparison Script
// Usage:
//   npx tsx scripts/compare-lessons.ts <lesson.json>              — compare with all siblings
//   npx tsx scripts/compare-lessons.ts <lesson.json> <other.json> — compare two specific lessons
// ─────────────────────────────────────────────────────────────

const COLORS = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
};

// ── Types ───────────────────────────────────────────────────
interface SlideSignature {
    slideIndex: number;
    slideTitle: string;
    componentTypes: string[];
    pattern: string; // e.g. "heading → image → hotspot → callout"
}

interface LessonProfile {
    file: string;
    title: string;
    slideCount: number;
    totalComponents: number;
    distinctTypes: Set<string>;
    typeFrequency: Map<string, number>;
    slideSignatures: SlideSignature[];
    fullPattern: string; // concatenated slide patterns
}

interface ComparisonResult {
    lessonA: string;
    lessonB: string;
    titleA: string;
    titleB: string;
    patternSimilarity: number;       // Jaccard of slide-level patterns
    componentOverlap: number;        // Jaccard of distinct component types
    sequenceSimilarity: number;      // Longest common subsequence ratio of full component sequence
    structuralSimilarity: number;    // Slide-by-slide arrangement similarity
    overallSimilarity: number;       // Weighted average
    sharedTypes: string[];
    uniqueToA: string[];
    uniqueToB: string[];
    slideBySlide: { slideNum: number; patternA: string; patternB: string; match: boolean }[];
}

// ── Helpers ─────────────────────────────────────────────────

function loadLesson(filePath: string): any {
    const abs = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(abs)) {
        console.error(`${COLORS.red}File not found: ${abs}${COLORS.reset}`);
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(abs, 'utf-8'));
}

function buildProfile(filePath: string, lesson: any): LessonProfile {
    const slides = lesson.slides || [];
    const distinctTypes = new Set<string>();
    const typeFrequency = new Map<string, number>();
    const slideSignatures: SlideSignature[] = [];
    let totalComponents = 0;

    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const comps = (slide.components || []).map((c: any) => c.type as string);
        totalComponents += comps.length;

        comps.forEach((t: string) => {
            distinctTypes.add(t);
            typeFrequency.set(t, (typeFrequency.get(t) || 0) + 1);
        });

        slideSignatures.push({
            slideIndex: i,
            slideTitle: slide.title || `Slide ${i + 1}`,
            componentTypes: comps,
            pattern: comps.join(' → '),
        });
    }

    return {
        file: path.basename(filePath),
        title: lesson.title || 'Untitled',
        slideCount: slides.length,
        totalComponents,
        distinctTypes,
        typeFrequency,
        slideSignatures,
        fullPattern: slideSignatures.map(s => s.pattern).join(' | '),
    };
}

// Jaccard similarity: |A ∩ B| / |A ∪ B|
function jaccard(a: Set<string>, b: Set<string>): number {
    const intersection = new Set([...a].filter(x => b.has(x)));
    const union = new Set([...a, ...b]);
    return union.size === 0 ? 1 : intersection.size / union.size;
}

// Longest Common Subsequence ratio
function lcsRatio(a: string[], b: string[]): number {
    const m = a.length, n = b.length;
    if (m === 0 && n === 0) return 1;
    if (m === 0 || n === 0) return 0;

    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1] + 1
                : Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m][n] / Math.max(m, n);
}

// Slide-by-slide structural comparison
function slideStructuralSimilarity(a: SlideSignature[], b: SlideSignature[]): number {
    const maxSlides = Math.max(a.length, b.length);
    if (maxSlides === 0) return 1;

    let matchScore = 0;
    for (let i = 0; i < maxSlides; i++) {
        if (i < a.length && i < b.length) {
            // Compare component type sequences for this slide position
            const seqA = a[i].componentTypes;
            const seqB = b[i].componentTypes;
            matchScore += lcsRatio(seqA, seqB);
        }
        // Missing slides count as 0
    }
    return matchScore / maxSlides;
}

function compare(profileA: LessonProfile, profileB: LessonProfile): ComparisonResult {
    // 1. Component type overlap (Jaccard)
    const componentOverlap = jaccard(profileA.distinctTypes, profileB.distinctTypes);

    // 2. Slide pattern similarity (Jaccard of unique slide patterns)
    const patternsA = new Set(profileA.slideSignatures.map(s => s.pattern));
    const patternsB = new Set(profileB.slideSignatures.map(s => s.pattern));
    const patternSimilarity = jaccard(patternsA, patternsB);

    // 3. Full sequence LCS similarity
    const seqA = profileA.slideSignatures.flatMap(s => s.componentTypes);
    const seqB = profileB.slideSignatures.flatMap(s => s.componentTypes);
    const sequenceSimilarity = lcsRatio(seqA, seqB);

    // 4. Structural slide-by-slide similarity
    const structuralSimilarity = slideStructuralSimilarity(
        profileA.slideSignatures, profileB.slideSignatures
    );

    // Weighted overall
    const overallSimilarity =
        patternSimilarity * 0.20 +
        componentOverlap * 0.15 +
        sequenceSimilarity * 0.35 +
        structuralSimilarity * 0.30;

    // Sets
    const sharedTypes = [...profileA.distinctTypes].filter(t => profileB.distinctTypes.has(t));
    const uniqueToA = [...profileA.distinctTypes].filter(t => !profileB.distinctTypes.has(t));
    const uniqueToB = [...profileB.distinctTypes].filter(t => !profileA.distinctTypes.has(t));

    // Slide-by-slide
    const maxSlides = Math.max(profileA.slideCount, profileB.slideCount);
    const slideBySlide: ComparisonResult['slideBySlide'] = [];
    for (let i = 0; i < maxSlides; i++) {
        const pa = profileA.slideSignatures[i]?.pattern || '—';
        const pb = profileB.slideSignatures[i]?.pattern || '—';
        slideBySlide.push({ slideNum: i + 1, patternA: pa, patternB: pb, match: pa === pb });
    }

    return {
        lessonA: profileA.file,
        lessonB: profileB.file,
        titleA: profileA.title,
        titleB: profileB.title,
        patternSimilarity,
        componentOverlap,
        sequenceSimilarity,
        structuralSimilarity,
        overallSimilarity,
        sharedTypes,
        uniqueToA,
        uniqueToB,
        slideBySlide,
    };
}

// ── Display ─────────────────────────────────────────────────

function similarityBar(pct: number, width = 30): string {
    const filled = Math.round(pct * width);
    const empty = width - filled;
    const color = pct <= 0.35 ? COLORS.green : pct <= 0.60 ? COLORS.yellow : COLORS.red;
    return `${color}${'█'.repeat(filled)}${COLORS.dim}${'░'.repeat(empty)}${COLORS.reset} ${(pct * 100).toFixed(1)}%`;
}

function ratingLabel(pct: number): string {
    if (pct <= 0.25) return `${COLORS.green}${COLORS.bold}🟢 VERY DISTINCT${COLORS.reset}`;
    if (pct <= 0.40) return `${COLORS.green}${COLORS.bold}🟢 DISTINCT${COLORS.reset}`;
    if (pct <= 0.55) return `${COLORS.yellow}${COLORS.bold}🟡 MODERATE${COLORS.reset}`;
    if (pct <= 0.70) return `${COLORS.yellow}${COLORS.bold}🟠 SIMILAR${COLORS.reset}`;
    return `${COLORS.red}${COLORS.bold}🔴 TOO SIMILAR${COLORS.reset}`;
}

function printProfile(profile: LessonProfile) {
    console.log(`  ${COLORS.bold}${profile.title}${COLORS.reset} (${profile.file})`);
    console.log(`  Slides: ${profile.slideCount} | Components: ${profile.totalComponents} | Distinct Types: ${profile.distinctTypes.size}`);
    console.log(`  Types: ${[...profile.distinctTypes].sort().join(', ')}`);
    console.log();
    profile.slideSignatures.forEach((s, i) => {
        console.log(`  ${COLORS.dim}Slide ${i + 1}:${COLORS.reset} ${s.pattern}`);
    });
    console.log();
}

function printComparison(result: ComparisonResult) {
    const divider = '═'.repeat(70);
    console.log(`\n${COLORS.bold}${divider}${COLORS.reset}`);
    console.log(`${COLORS.bold}  📊 COMPARISON: ${COLORS.cyan}${result.lessonA}${COLORS.reset} ${COLORS.bold}vs${COLORS.reset} ${COLORS.cyan}${result.lessonB}${COLORS.reset}`);
    console.log(`${COLORS.bold}${divider}${COLORS.reset}\n`);

    // Overall
    console.log(`  ${COLORS.bold}OVERALL SIMILARITY:${COLORS.reset}  ${similarityBar(result.overallSimilarity)}  ${ratingLabel(result.overallSimilarity)}`);
    console.log();

    // Breakdown
    console.log(`  ${COLORS.bold}Breakdown:${COLORS.reset}`);
    console.log(`    Slide Pattern Match:     ${similarityBar(result.patternSimilarity, 20)}  ${COLORS.dim}(weight: 20%)${COLORS.reset}`);
    console.log(`    Component Type Overlap:  ${similarityBar(result.componentOverlap, 20)}  ${COLORS.dim}(weight: 15%)${COLORS.reset}`);
    console.log(`    Full Sequence LCS:       ${similarityBar(result.sequenceSimilarity, 20)}  ${COLORS.dim}(weight: 35%)${COLORS.reset}`);
    console.log(`    Structural Arrangement:  ${similarityBar(result.structuralSimilarity, 20)}  ${COLORS.dim}(weight: 30%)${COLORS.reset}`);
    console.log();

    // Component types
    console.log(`  ${COLORS.bold}Component Types:${COLORS.reset}`);
    console.log(`    ${COLORS.green}Shared:${COLORS.reset}         ${result.sharedTypes.join(', ') || 'None'}`);
    console.log(`    ${COLORS.cyan}Only in ${result.lessonA}:${COLORS.reset}  ${result.uniqueToA.join(', ') || 'None'}`);
    console.log(`    ${COLORS.magenta}Only in ${result.lessonB}:${COLORS.reset}  ${result.uniqueToB.join(', ') || 'None'}`);
    console.log();

    // Slide-by-slide
    console.log(`  ${COLORS.bold}Slide-by-Slide Pattern Comparison:${COLORS.reset}`);
    console.log(`  ${'─'.repeat(66)}`);
    result.slideBySlide.forEach(s => {
        const icon = s.match ? `${COLORS.red}⚠ IDENTICAL${COLORS.reset}` : `${COLORS.green}✓ Different${COLORS.reset}`;
        console.log(`  ${COLORS.bold}Slide ${s.slideNum}:${COLORS.reset} ${icon}`);
        console.log(`    ${COLORS.cyan}A:${COLORS.reset} ${s.patternA}`);
        console.log(`    ${COLORS.magenta}B:${COLORS.reset} ${s.patternB}`);
    });
    console.log(`  ${'─'.repeat(66)}\n`);
}

function printOverviewMatrix(profiles: LessonProfile[], results: ComparisonResult[]) {
    console.log(`\n${COLORS.bold}${'═'.repeat(70)}${COLORS.reset}`);
    console.log(`${COLORS.bold}  📋 SIMILARITY OVERVIEW MATRIX${COLORS.reset}`);
    console.log(`${COLORS.bold}${'═'.repeat(70)}${COLORS.reset}\n`);

    // Header row
    const labels = profiles.map((_, i) => `L${i + 1}`);
    const colW = 12;
    let header = ''.padEnd(16);
    labels.forEach(l => { header += l.padEnd(colW); });
    console.log(`  ${COLORS.bold}${header}${COLORS.reset}`);
    console.log(`  ${'─'.repeat(16 + labels.length * colW)}`);

    // Matrix rows
    for (let i = 0; i < profiles.length; i++) {
        let row = `  ${COLORS.bold}L${i + 1} ${profiles[i].file.replace('lesson-', 'L').replace('.json', '').padEnd(11)}${COLORS.reset}`;
        for (let j = 0; j < profiles.length; j++) {
            if (i === j) {
                row += `${COLORS.dim}  ——  ${COLORS.reset}`.padEnd(colW + 9); // account for escape codes
            } else {
                const r = results.find(
                    r => (r.lessonA === profiles[i].file && r.lessonB === profiles[j].file) ||
                        (r.lessonA === profiles[j].file && r.lessonB === profiles[i].file)
                );
                if (r) {
                    const pct = r.overallSimilarity;
                    const color = pct <= 0.35 ? COLORS.green : pct <= 0.60 ? COLORS.yellow : COLORS.red;
                    row += `${color}${(pct * 100).toFixed(1).padStart(5)}%${COLORS.reset}     `;
                } else {
                    row += '  N/A       ';
                }
            }
        }
        console.log(row);
    }

    console.log();

    // Legend
    console.log(`  ${COLORS.bold}Legend:${COLORS.reset}`);
    console.log(`    ${COLORS.green}■ 0–35%${COLORS.reset}  DISTINCT    ${COLORS.yellow}■ 36–60%${COLORS.reset}  MODERATE    ${COLORS.red}■ 61–100%${COLORS.reset}  TOO SIMILAR`);
    console.log();

    // Component diversity per lesson
    console.log(`  ${COLORS.bold}Component Diversity per Lesson:${COLORS.reset}`);
    profiles.forEach((p, i) => {
        console.log(`    L${i + 1} (${p.file}): ${COLORS.bold}${p.distinctTypes.size}${COLORS.reset} distinct types → ${[...p.distinctTypes].sort().join(', ')}`);
    });
    console.log();
}

// ── Main ────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error(`${COLORS.red}Usage:${COLORS.reset}`);
    console.error(`  npx tsx scripts/compare-lessons.ts <lesson.json>              — compare with all siblings`);
    console.error(`  npx tsx scripts/compare-lessons.ts <lesson.json> <other.json> — compare two specific lessons`);
    process.exit(1);
}

const primaryPath = path.resolve(process.cwd(), args[0]);
if (!fs.existsSync(primaryPath)) {
    console.error(`${COLORS.red}File not found: ${primaryPath}${COLORS.reset}`);
    process.exit(1);
}

const primaryLesson = loadLesson(args[0]);
const primaryProfile = buildProfile(args[0], primaryLesson);

if (args.length >= 2) {
    // ── Two-lesson mode ──
    const secondPath = path.resolve(process.cwd(), args[1]);
    if (!fs.existsSync(secondPath)) {
        console.error(`${COLORS.red}File not found: ${secondPath}${COLORS.reset}`);
        process.exit(1);
    }
    const secondLesson = loadLesson(args[1]);
    const secondProfile = buildProfile(args[1], secondLesson);

    console.log(`\n${COLORS.bold}  📄 Lesson A:${COLORS.reset}`);
    printProfile(primaryProfile);
    console.log(`${COLORS.bold}  📄 Lesson B:${COLORS.reset}`);
    printProfile(secondProfile);

    const result = compare(primaryProfile, secondProfile);
    printComparison(result);

} else {
    // ── Overview mode: compare with all siblings ──
    const dir = path.dirname(primaryPath);
    const siblings = fs.readdirSync(dir)
        .filter(f => f.endsWith('.json') && f.startsWith('lesson-'))
        .sort();

    if (siblings.length < 2) {
        console.log(`${COLORS.yellow}Only 1 lesson file found in ${dir}. Nothing to compare.${COLORS.reset}`);
        process.exit(0);
    }

    console.log(`\n${COLORS.bold}${'═'.repeat(70)}${COLORS.reset}`);
    console.log(`${COLORS.bold}  🔍 LESSON SIMILARITY ANALYSIS — ${path.basename(dir)}${COLORS.reset}`);
    console.log(`${COLORS.bold}${'═'.repeat(70)}${COLORS.reset}`);
    console.log(`  ${COLORS.dim}Folder: ${dir}${COLORS.reset}`);
    console.log(`  ${COLORS.dim}Lessons found: ${siblings.length}${COLORS.reset}\n`);

    // Build all profiles
    const profiles: LessonProfile[] = siblings.map(f => {
        const fp = path.join(dir, f);
        const lesson = JSON.parse(fs.readFileSync(fp, 'utf-8'));
        return buildProfile(fp, lesson);
    });

    // Print each profile summary
    profiles.forEach((p, i) => {
        console.log(`  ${COLORS.bold}L${i + 1} — ${p.title}${COLORS.reset} (${p.file})`);
        console.log(`     Slides: ${p.slideCount} | Components: ${p.totalComponents} | Distinct Types: ${p.distinctTypes.size}`);
        p.slideSignatures.forEach((s, j) => {
            console.log(`     ${COLORS.dim}S${j + 1}:${COLORS.reset} ${s.pattern}`);
        });
        console.log();
    });

    // Pairwise comparisons
    const allResults: ComparisonResult[] = [];
    for (let i = 0; i < profiles.length; i++) {
        for (let j = i + 1; j < profiles.length; j++) {
            const result = compare(profiles[i], profiles[j]);
            allResults.push(result);
            printComparison(result);
        }
    }

    // Overview matrix
    printOverviewMatrix(profiles, allResults);

    // Warnings
    const tooSimilar = allResults.filter(r => r.overallSimilarity > 0.60);
    if (tooSimilar.length > 0) {
        console.log(`  ${COLORS.bgRed}${COLORS.white}${COLORS.bold} ⚠ WARNING: ${tooSimilar.length} pair(s) exceed 60% similarity! ${COLORS.reset}\n`);
        tooSimilar.forEach(r => {
            console.log(`    ${COLORS.red}• ${r.lessonA} ↔ ${r.lessonB}: ${(r.overallSimilarity * 100).toFixed(1)}%${COLORS.reset}`);
        });
        console.log();
    } else {
        console.log(`  ${COLORS.bgGreen}${COLORS.white}${COLORS.bold} ✅ All pairs are below 60% similarity — good diversity! ${COLORS.reset}\n`);
    }
}
