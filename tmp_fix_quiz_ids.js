const fs = require('fs');
const path = require('path');

function getAllJsonFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllJsonFiles(filePath, fileList);
        } else if (file.endsWith('.json')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const lessonsDir = path.join(__dirname, 'lessons');
const jsonFiles = getAllJsonFiles(lessonsDir);
let fixedCount = 0;
let totalOptionsFixed = 0;

jsonFiles.forEach(file => {
    try {
        const raw = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(raw);
        let modified = false;

        function processComponent(comp) {
            if (!comp || !comp.props) return;
            if (comp.type === 'quiz' || comp.type === 'multiSelectQuiz' || comp.type === 'poll') {
                const questions = comp.props.questions || (comp.props.question ? [comp.props] : []);
                questions.forEach((q, qIdx) => {
                    if (Array.isArray(q.options)) {
                        q.options.forEach((opt, oIdx) => {
                            if (!opt.id) {
                                opt.id = `opt-${qIdx + 1}-${oIdx + 1}-${Math.random().toString(36).substring(2, 7)}`;
                                modified = true;
                                totalOptionsFixed++;
                            }
                        });
                    }
                });

                // Also check if component props directly has options (like poll or standalone quiz)
                if (Array.isArray(comp.props.options)) {
                    comp.props.options.forEach((opt, oIdx) => {
                        if (!opt.id) {
                            opt.id = `opt-${oIdx + 1}-${Math.random().toString(36).substring(2, 7)}`;
                            modified = true;
                            totalOptionsFixed++;
                        }
                    });
                }
            }
        }

        if (Array.isArray(data.slides)) {
            data.slides.forEach(slide => {
                if (Array.isArray(slide.components)) {
                    slide.components.forEach(processComponent);
                }
            });
        }

        if (modified) {
            fs.writeFileSync(file, JSON.stringify(data, null, 4), 'utf8');
            fixedCount++;
            console.log(`Fixed missing option IDs in: ${path.basename(file)}`);
        }
    } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
    }
});

console.log(`\nMigration completed! Fixed ${totalOptionsFixed} options across ${fixedCount} lesson files.`);
