#!/usr/bin/env ts-node
/**
 * Migration Script for Lesson Files - Phase 1 Data Structure Cleanup
 * 
 * This script removes deprecated fields from existing lesson JSON files:
 * - Removes 'categorizedComponents' from each slide
 * - Removes 'component_type' from each component
 * 
 * These fields are now computed on-demand using lesson-utils functions.
 * 
 * Usage:
 *   npx ts-node scripts/migrate-lessons.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface Component {
    id: string;
    type: string;
    props: Record<string, any>;
    component_type?: string; // deprecated, will be removed
    [key: string]: any;
}

interface Slide {
    id: string;
    title: string;
    components: Component[];
    categorizedComponents?: any; // deprecated, will be removed
    [key: string]: any;
}

interface Lesson {
    id: string;
    slides: Slide[];
    [key: string]: any;
}

// Lesson files directory
const LESSONS_DIR = path.join(__dirname, '../lessons');
const BACKUP_DIR = path.join(__dirname, '../lessons-backup');

console.log('🚀 Starting Lesson Migration - Phase 1 Data Structure Cleanup\n');

// Create backup directory
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`✅ Created backup directory: ${BACKUP_DIR}\n`);
}

// Get all lesson JSON files
const lessonFiles = fs.readdirSync(LESSONS_DIR)
    .filter(file => file.endsWith('.json'));

console.log(`Found ${lessonFiles.length} lesson file(s) to migrate:\n`);

let totalSlides = 0;
let totalComponents = 0;
let filesModified = 0;

lessonFiles.forEach((filename, index) => {
    const filePath = path.join(LESSONS_DIR, filename);
    const backupPath = path.join(BACKUP_DIR, filename);

    console.log(`[${index + 1}/${lessonFiles.length}] Processing: ${filename}`);

    try {
        // Read lesson file
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lesson: Lesson = JSON.parse(fileContent);

        // Create backup
        fs.writeFileSync(backupPath, fileContent, 'utf-8');

        let slidesModified = 0;
        let componentsModified = 0;
        let modified = false;

        // Process each slide
        lesson.slides.forEach(slide => {
            // Remove categorizedComponents if it exists
            if ('categorizedComponents' in slide) {
                delete slide.categorizedComponents;
                slidesModified++;
                modified = true;
            }

            // Remove component_type from each component
            slide.components.forEach(component => {
                if ('component_type' in component) {
                    delete component.component_type;
                    componentsModified++;
                    modified = true;
                }
            });
        });

        // Write migrated lesson back to file
        if (modified) {
            const migratedContent = JSON.stringify(lesson, null, 2);
            fs.writeFileSync(filePath, migratedContent, 'utf-8');

            filesModified++;
            totalSlides += slidesModified;
            totalComponents += componentsModified;

            console.log(`  ✅ Migrated: ${slidesModified} slide(s), ${componentsModified} component(s)`);
        } else {
            console.log(`  ⏭️  Skipped: Already migrated`);
        }

    } catch (error) {
        console.error(`  ❌ Error processing ${filename}:`, error);
    }

    console.log('');
});

// Summary
console.log('═'.repeat(60));
console.log('📊 Migration Summary:');
console.log('═'.repeat(60));
console.log(`Files processed: ${lessonFiles.length}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Total slides cleaned: ${totalSlides}`);
console.log(`Total components cleaned: ${totalComponents}`);
console.log(`\n✅ Backups saved to: ${BACKUP_DIR}`);
console.log('\n🎉 Migration completed successfully!');
console.log('\nNote: The removed fields are now computed on-demand using:');
console.log('  - getCategorizedComponents(slide.components)');
console.log('  - getComponentCategory(component.type)');
console.log('\nSee: lib/lesson-utils.ts');
