import { ScoringService } from "../services/scoring-service";
import { isInteractiveComponent } from "../lib/lesson-utils";
import type { Lesson } from "../types/lesson";

console.log("=== RUNNING SCORING & LESSON UTILS TEST SUITE ===\n");

// 1. Test isInteractiveComponent for all interactive/gamified types
const interactiveTypes = [
    "quiz",
    "dragDrop",
    "matchingPairs",
    "fillInTheBlank",
    "hotspot",
    "flashcardQuiz",
    "multiSelectQuiz",
    "flashcards"
];

console.log("--- 1. Testing Component Categorization ---");
let categoryFailures = 0;
for (const type of interactiveTypes) {
    const result = isInteractiveComponent(type);
    if (result) {
        console.log(`  [PASS] ${type} is correctly recognized as interactive/gamified`);
    } else {
        console.error(`  [FAIL] ${type} NOT recognized as interactive/gamified!`);
        categoryFailures++;
    }
}

// 2. Test ScoringService.getTotalPossiblePoints
console.log("\n--- 2. Testing ScoringService.getTotalPossiblePoints ---");

const mockLesson: Lesson = {
    id: "test-lesson-1",
    title: "Test Scoring Lesson",
    description: "Test",
    slides: [
        {
            id: "slide-1",
            title: "Slide 1 - Live Quiz",

            components: [
                {
                    id: "q1",
                    type: "quiz",
                    mode: "live",
                    state: "active",
                    status: "uncompleted",
                    props: {
                        title: "Quiz 1",
                        points: 15,
                        questions: [
                            { id: "q1_1", question: "Q1", options: [] },
                            { id: "q1_2", question: "Q2", options: [] }
                        ]
                    }
                } // 15 points * 2 questions = 30 points
            ]
        },
        {
            id: "slide-2",
            title: "Slide 2 - Live FlashcardQuiz & MultiSelectQuiz",
            order: 2,
            components: [
                {
                    id: "fq1",
                    type: "flashcardQuiz",
                    mode: "live",
                    state: "active",
                    status: "uncompleted",
                    props: {
                        title: "Flashcard Quiz",
                        points: 20,
                        questions: [{ question: "Q1", options: [], correctAnswer: 0 }]
                    }
                }, // 20 points
                {
                    id: "msq1",
                    type: "multiSelectQuiz",
                    mode: "live",
                    state: "active",
                    status: "uncompleted",
                    props: {
                        title: "Multi Select",
                        points: 25,
                        questions: [{ id: "m1", question: "Q1", options: [] }]
                    }
                } // 25 points
            ]
        },
        {
            id: "slide-3",
            title: "Slide 3 - Live DragDrop & FillInTheBlank & Hotspot & MatchingPairs",
            order: 3,
            components: [
                {
                    id: "dd1",
                    type: "dragDrop",
                    mode: "live",
                    state: "active",
                    status: "uncompleted",
                    props: {
                        title: "Drag Drop",
                        points: 10,
                        items: [{ id: "1", text: "A", correctIndex: 0 }, { id: "2", text: "B", correctIndex: 1 }]
                    }
                }, // 10 points * 2 items = 20 points
                {
                    id: "fitb1",
                    type: "fillInTheBlank",
                    mode: "live",
                    state: "active",
                    status: "uncompleted",
                    props: {
                        title: "FITB",
                        points: 5,
                        blanks: [{ id: "b1", answer: "ans1" }, { id: "b2", answer: "ans2" }]
                    }
                }, // 5 points * 2 blanks = 10 points
                {
                    id: "hs1",
                    type: "hotspot",
                    mode: "live",
                    state: "active",
                    status: "uncompleted",
                    props: {
                        title: "Hotspot",
                        points: 15,
                        image: "img.jpg",
                        hotspots: [{ id: "h1", x: 0.1, y: 0.1, label: "L1", content: "C1" }]
                    }
                }, // 15 points
                {
                    id: "mp1",
                    type: "matchingPairs",
                    mode: "live",
                    state: "active",
                    status: "uncompleted",
                    props: {
                        title: "Matching Pairs",
                        points: 10,
                        pairs: [{ id: "p1", left: "L1", right: "R1" }, { id: "p2", left: "L2", right: "R2" }]
                    }
                } // 10 points * 2 pairs = 20 points
            ]
        },
        {
            id: "slide-4",
            title: "Slide 4 - Practice Mode Component (Should contribute 0 points)",
            order: 4,
            components: [
                {
                    id: "practice_q",
                    type: "quiz",
                    mode: "practice",
                    state: "active",
                    status: "uncompleted",
                    props: {
                        title: "Practice Quiz",
                        points: 100,
                        questions: [{ id: "pq1", question: "PQ1", options: [] }]
                    }
                } // 0 points because mode === 'practice'
            ]
        }
    ]
};

// Expected Total:
// Slide 1: 15 * 2 = 30
// Slide 2: 20 + 25 = 45
// Slide 3: (10*2) + (5*2) + 15 + (10*2) = 20 + 10 + 15 + 20 = 65
// Slide 4: 0
// Grand Total = 30 + 45 + 65 = 140 points.

const totalPoints = ScoringService.getTotalPossiblePoints(mockLesson);
console.log(`Calculated Total Points: ${totalPoints}`);
console.log(`Expected Total Points:   140`);

let scoringFailures = 0;
if (totalPoints === 140) {
    console.log("  [PASS] Total points match expected (140 points) perfectly!");
} else {
    console.error(`  [FAIL] Total points mismatch! Expected 140 but got ${totalPoints}`);
    scoringFailures++;
}

// 3. Detailed per-component breakdown check
console.log("\n--- 3. Per-Component Max Points Breakdown ---");
const slide1_q = mockLesson.slides[0].components[0];
const slide2_fq = mockLesson.slides[1].components[0];
const slide2_msq = mockLesson.slides[1].components[1];
const slide3_dd = mockLesson.slides[2].components[0];
const slide3_fitb = mockLesson.slides[2].components[1];
const slide3_hs = mockLesson.slides[2].components[2];
const slide3_mp = mockLesson.slides[2].components[3];

const checks = [
    { comp: slide1_q, expected: 30, label: "Quiz (2 questions @ 15 pts)" },
    { comp: slide2_fq, expected: 20, label: "Flashcard Quiz (20 pts flat)" },
    { comp: slide2_msq, expected: 25, label: "Multi-Select Quiz (25 pts flat)" },
    { comp: slide3_dd, expected: 20, label: "Drag Drop (2 items @ 10 pts)" },
    { comp: slide3_fitb, expected: 10, label: "Fill-In-The-Blank (2 blanks @ 5 pts)" },
    { comp: slide3_hs, expected: 15, label: "Hotspot (15 pts flat)" },
    { comp: slide3_mp, expected: 20, label: "Matching Pairs (2 pairs @ 10 pts)" }
];

for (const check of checks) {
    const pts = ScoringService.getComponentMaxPoints(check.comp);
    if (pts === check.expected) {
        console.log(`  [PASS] ${check.label}: ${pts} pts`);
    } else {
        console.error(`  [FAIL] ${check.label}: expected ${check.expected} pts but got ${pts}`);
        scoringFailures++;
    }
}

console.log("\n=== TEST SUMMARY ===");
if (categoryFailures === 0 && scoringFailures === 0) {
    console.log("ALL SCORING TESTS PASSED PERFECTLY! ✅");
    process.exit(0);
} else {
    console.error(`TESTS FAILED: ${categoryFailures} category errors, ${scoringFailures} scoring errors ❌`);
    process.exit(1);
}
