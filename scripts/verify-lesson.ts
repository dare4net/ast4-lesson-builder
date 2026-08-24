import fs from 'fs';
import path from 'path';
import { validateLesson } from '../lib/validation/master-validator';

const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: npx tsx scripts/verify-lesson.ts <path-to-lesson.json>');
    process.exit(1);
}

const absolutePath = path.resolve(process.cwd(), filePath);
if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
}

try {
    const rawData = fs.readFileSync(absolutePath, 'utf-8');
    const lessonJson = JSON.parse(rawData);

    console.log(`\n==================================================`);
    console.log(`VERIFYING LESSON: ${lessonJson.title || 'Untitled'} (${path.basename(absolutePath)})`);
    console.log(`==================================================\n`);

    const report = validateLesson(lessonJson, { forceRevalidate: true });

    console.log(`VALID STATUS : ${report.isValid ? '✅ VALID (100% PASS)' : '❌ INVALID (ERRORS FOUND)'}`);
    console.log(`TOTAL ERRORS : ${report.totalErrors}`);
    console.log(`TOTAL WARNINGS: ${report.totalWarnings}\n`);

    if (report.errors.length > 0) {
        console.log(`--- 🔴 ERRORS (${report.errors.length}) ---`);
        report.errors.forEach((err, idx) => {
            console.log(`${idx + 1}. [${err.code}] (${err.fieldPath})`);
            console.log(`   Message: ${err.message}\n`);
        });
    }

    if (report.warnings.length > 0) {
        console.log(`--- 🟡 WARNINGS (${report.warnings.length}) ---`);
        report.warnings.forEach((warn, idx) => {
            console.log(`${idx + 1}. [${warn.code}] (${warn.fieldPath})`);
            console.log(`   Message: ${warn.message}`);
            if (warn.recommendation) {
                console.log(`   Recommendation: ${warn.recommendation}`);
            }
            console.log('');
        });
    }

    if (report.isValid && report.warnings.length === 0) {
        console.log(`🎉 Perfect pass! Zero errors and zero warnings.`);
    }

} catch (err: any) {
    console.error(`Failed to parse or validate lesson JSON:`, err.message);
    process.exit(1);
}
