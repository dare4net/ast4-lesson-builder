"use client"

import type { Dispatch, ReactNode, SetStateAction } from "react"
import type { Component } from "@/types/lesson"
import { QuizEditor } from "@/components/editors/quiz-editor"
import { MatchingPairsEditor } from "@/components/editors/matching-pairs-editor"
import { DragDropEditor } from "@/components/editors/drag-drop-editor"
import { FlashcardsEditor } from "@/components/editors/flashcards-editor"
import { HotspotEditor } from "@/components/editors/hotspot-editor"
import { TableEditor } from "@/components/editors/table-editor"
import { PollEditor } from "@/components/editors/poll-editor"
import { FlashcardQuizEditor } from "@/components/editors/flashcard-quiz-editor"
import { MultiSelectQuizEditor } from "@/components/editors/multi-select-quiz-editor"
import { BulletListEditor } from "@/components/editors/bullet-list-editor"
import { FillInTheBlankEditor } from "@/components/editors/fill-in-the-blank-editor"
import { CodeEditorEditor } from "@/components/editors/code-editor-editor"
import { ShortAnswerEditor } from "@/components/editors/short-answer-editor"
import { AccordionEditor } from "@/components/editors/accordion-editor"
import { QuoteEditor } from "@/components/editors/quote-editor"
import { CalloutEditor } from "@/components/editors/callout-editor"
import { TimelineEditor } from "@/components/editors/timeline-editor"
import { CategoriseEditor } from "@/components/editors/categorise-editor"
import { WordScrambleEditor } from "@/components/editors/word-scramble-editor"
import { AnnotationBoardEditor } from "@/components/editors/annotation-board-editor"
import { AnagramEditor } from "@/components/editors/anagram-editor"
import { HangmanEditor } from "@/components/editors/hangman-editor"
import { SwipeDeckEditor } from "@/components/editors/swipe-deck-editor"
import { CrosswordEditor } from "@/components/editors/crossword-editor"
import { SpectrumSorterEditor } from "@/components/editors/spectrum-sorter-editor"
import { JigsawEditor } from "@/components/editors/jigsaw-editor"
import { MemoryGridEditor } from "@/components/editors/memory-grid-editor"
import { TrueFalseEditor } from "@/components/editors/true-false-editor"
import { ScaleSliderEditor } from "@/components/editors/scale-slider-editor"
import { AnnotateImageEditor } from "@/components/editors/annotate-image-editor"
import { WordCloudEditor } from "@/components/editors/word-cloud-editor"
import { SpinTheWheelEditor } from "@/components/editors/spin-the-wheel-editor"

export type EditorCtx = {
    component: Component
    props: Record<string, any>
    lessonId?: string
    handleChange: (name: string, value: any) => void
    setProps: Dispatch<SetStateAction<Record<string, any>>>
    setHasDraftChanges: (value: boolean) => void
}

type EditorRenderer = (ctx: EditorCtx) => ReactNode

const BODY_EDITORS: Partial<Record<string, EditorRenderer>> = {
    quote: ({ props, handleChange }) => (
        <QuoteEditor
            text={props.text || ""}
            onTextChange={(val) => handleChange("text", val)}
            author={props.author || ""}
            onAuthorChange={(val) => handleChange("author", val)}
            source={props.source || ""}
            onSourceChange={(val) => handleChange("source", val)}
            audioUrl={props.audioUrl || ""}
            onAudioUrlChange={(val) => handleChange("audioUrl", val)}
        />
    ),
    callout: ({ props, handleChange }) => (
        <CalloutEditor
            variant={props.variant || "note"}
            onVariantChange={(val) => handleChange("variant", val)}
            title={props.title || ""}
            onTitleChange={(val) => handleChange("title", val)}
            content={props.content || ""}
            onContentChange={(val) => handleChange("content", val)}
            audioUrl={props.audioUrl || ""}
            onAudioUrlChange={(val) => handleChange("audioUrl", val)}
        />
    ),
    timeline: ({ props, handleChange }) => (
        <TimelineEditor
            title={props.title || ""}
            onTitleChange={(val) => handleChange("title", val)}
            events={props.events || []}
            onEventsChange={(events) => handleChange("events", events)}
        />
    ),
    categorise: ({ props, handleChange }) => (
        <CategoriseEditor
            title={props.title || ""}
            onTitleChange={(val) => handleChange("title", val)}
            categories={props.categories || []}
            onCategoriesChange={(cats) => handleChange("categories", cats)}
            items={props.items || []}
            onItemsChange={(items) => handleChange("items", items)}
        />
    ),
    wordScramble: ({ props, handleChange }) => (
        <WordScrambleEditor
            title={props.title || "Unscramble the Sequence"}
            onTitleChange={(val: string) => handleChange("title", val)}
            variant={props.variant || "single"}
            onVariantChange={(val) => handleChange("variant", val)}
            word={props.word || ""}
            onWordChange={(val: string) => handleChange("word", val)}
            words={props.words || []}
            onWordsChange={(val) => handleChange("words", val)}
            sentence={props.sentence || ""}
            onSentenceChange={(val) => handleChange("sentence", val)}
            hint={props.hint || ""}
            onHintChange={(val: string) => handleChange("hint", val)}
            allowTextClue={props.allowTextClue !== undefined ? props.allowTextClue : true}
            onAllowTextClueChange={(val) => handleChange("allowTextClue", val)}
            allowLetterReveal={props.allowLetterReveal !== undefined ? props.allowLetterReveal : true}
            onAllowLetterRevealChange={(val) => handleChange("allowLetterReveal", val)}
            maxLetterReveals={props.maxLetterReveals ?? 3}
            onMaxLetterRevealsChange={(val) => handleChange("maxLetterReveals", val)}
            allowWordSolve={props.allowWordSolve !== undefined ? props.allowWordSolve : true}
            onAllowWordSolveChange={(val) => handleChange("allowWordSolve", val)}
            maxWordSolves={props.maxWordSolves ?? 1}
            onMaxWordSolvesChange={(val) => handleChange("maxWordSolves", val)}
            allowFirstLetterAnchors={props.allowFirstLetterAnchors !== undefined ? props.allowFirstLetterAnchors : true}
            onAllowFirstLetterAnchorsChange={(val) => handleChange("allowFirstLetterAnchors", val)}
        />
    ),
    memoryGrid: ({ props, handleChange }) => (
        <MemoryGridEditor
            title={props.title || ""}
            onTitleChange={(val) => handleChange("title", val)}
            pairs={props.pairs || []}
            onPairsChange={(pairs) => handleChange("pairs", pairs)}
        />
    ),
    trueFalse: ({ props, handleChange }) => (
        <TrueFalseEditor
            statement={props.statement || ""}
            onStatementChange={(val) => handleChange("statement", val)}
            isTrue={props.isTrue ?? true}
            onIsTrueChange={(val) => handleChange("isTrue", val)}
            explanation={props.explanation || ""}
            onExplanationChange={(val) => handleChange("explanation", val)}
        />
    ),
    scaleSlider: ({ props, handleChange }) => (
        <ScaleSliderEditor
            title={props.title || ""}
            onTitleChange={(val) => handleChange("title", val)}
            prompt={props.prompt || ""}
            onPromptChange={(val) => handleChange("prompt", val)}
            minLabel={props.minLabel || "Not at all"}
            onMinLabelChange={(val) => handleChange("minLabel", val)}
            maxLabel={props.maxLabel || "Very confident"}
            onMaxLabelChange={(val) => handleChange("maxLabel", val)}
            min={props.min ?? 1}
            onMinChange={(val) => handleChange("min", val)}
            max={props.max ?? 10}
            onMaxChange={(val) => handleChange("max", val)}
            step={props.step ?? 1}
            onStepChange={(val) => handleChange("step", val)}
            defaultValue={props.defaultValue ?? 5}
            onDefaultValueChange={(val) => handleChange("defaultValue", val)}
        />
    ),
    annotateImage: ({ props, handleChange, lessonId, component }) => (
        <AnnotateImageEditor
            title={props.title || ""}
            onTitleChange={(val) => handleChange("title", val)}
            image={props.image || ""}
            onImageChange={(val) => handleChange("image", val)}
            labels={props.labels || []}
            onLabelsChange={(labels) => handleChange("labels", labels)}
            lessonId={lessonId}
            componentId={component.id}
        />
    ),
    wordCloud: ({ props, handleChange }) => (
        <WordCloudEditor
            title={props.title || ""}
            onTitleChange={(val) => handleChange("title", val)}
            prompt={props.prompt || ""}
            onPromptChange={(val) => handleChange("prompt", val)}
            words={props.words || []}
            onWordsChange={(words) => handleChange("words", words)}
            maxWords={props.maxWords ?? 20}
            onMaxWordsChange={(val) => handleChange("maxWords", val)}
        />
    ),
    spinTheWheel: ({ props, handleChange, setProps, setHasDraftChanges }) => (
        <SpinTheWheelEditor
            title={props.title || ""}
            onTitleChange={(val) => handleChange("title", val)}
            questions={props.questions}
            items={props.items}
            onQuestionsChange={(questions) => {
                setProps((prev: any) => {
                    const updatedProps = { ...prev, questions }
                    if (Array.isArray(updatedProps.items) && updatedProps.items.length > 0) {
                        delete updatedProps.items
                    }
                    const count = Array.isArray(questions) ? questions.length : 0
                    const currentSpins = updatedProps.requiredSpins ?? 3
                    if (count > 0 && currentSpins > count) {
                        updatedProps.requiredSpins = count
                    }
                    return updatedProps
                })
                setHasDraftChanges(true)
            }}
            requiredSpins={props.requiredSpins ?? 3}
            onRequiredSpinsChange={(val) => handleChange("requiredSpins", val)}
        />
    ),
    shortAnswer: ({ props, handleChange }) => (
        <ShortAnswerEditor
            question={props.question || ""}
            placeholder={props.placeholder || ""}
            markingMode={props.markingMode || "self-mark"}
            correctKeywords={props.correctKeywords || props.keyConcepts || []}
            onQuestionChange={(val) => handleChange("question", val)}
            onPlaceholderChange={(val) => handleChange("placeholder", val)}
            onMarkingModeChange={(val) => handleChange("markingMode", val)}
            onKeywordsChange={(val) => {
                handleChange("correctKeywords", val)
                handleChange("keyConcepts", val)
            }}
        />
    ),
    annotationBoard: ({ props, handleChange }) => (
        <AnnotationBoardEditor
            title={props.title || "Identify Grammar Roles"}
            onTitleChange={(val) => handleChange("title", val)}
            passage={props.passage || ""}
            onPassageChange={(val) => handleChange("passage", val)}
            labels={props.labels || []}
            onLabelsChange={(labels) => handleChange("labels", labels)}
            correctAnswers={props.correctAnswers || []}
            onCorrectAnswersChange={(answers) => handleChange("correctAnswers", answers)}
            groups={props.groups || []}
            onGroupsChange={(groups) => handleChange("groups", groups)}
        />
    ),
    anagram: ({ props, handleChange }) => (
        <AnagramEditor
            word={props.word || ""}
            onWordChange={(val) => handleChange("word", val)}
            hint={props.hint || ""}
            onHintChange={(val) => handleChange("hint", val)}
        />
    ),
    hangman: ({ props, handleChange }) => (
        <HangmanEditor
            word={props.secretWord || props.word || props.targetWord || props.answer || ""}
            onWordChange={(val) => {
                handleChange("secretWord", val)
                handleChange("word", val)
            }}
            category={props.category || ""}
            onCategoryChange={(val) => handleChange("category", val)}
            clue={props.clue || ""}
            onClueChange={(val) => handleChange("clue", val)}
            theme={props.theme || "mascot"}
            onThemeChange={(val) => handleChange("theme", val)}
            maxLives={props.maxLives || props.maxAttempts || 6}
            onMaxLivesChange={(val) => {
                handleChange("maxLives", val)
                handleChange("maxAttempts", val)
            }}
        />
    ),
    swipeDeck: ({ props, handleChange }) => (
        <SwipeDeckEditor
            leftLabel={props.leftLabel || "Myth"}
            onLeftLabelChange={(val) => handleChange("leftLabel", val)}
            rightLabel={props.rightLabel || "Fact"}
            onRightLabelChange={(val) => handleChange("rightLabel", val)}
            cards={props.cards || []}
            onCardsChange={(cards) => handleChange("cards", cards)}
        />
    ),
    crossword: ({ props, handleChange }) => (
        <CrosswordEditor
            gridSize={props.gridSize || { rows: 5, cols: 5 }}
            onGridSizeChange={(val) => handleChange("gridSize", val)}
            words={props.words || []}
            onWordsChange={(words) => handleChange("words", words)}
        />
    ),
    spectrumSorter: ({ props, handleChange }) => (
        <SpectrumSorterEditor
            minLabel={props.minLabel || "Low"}
            onMinLabelChange={(val) => handleChange("minLabel", val)}
            maxLabel={props.maxLabel || "High"}
            onMaxLabelChange={(val) => handleChange("maxLabel", val)}
            tolerance={props.tolerance || 10}
            onToleranceChange={(val) => handleChange("tolerance", val)}
            items={props.items || []}
            onItemsChange={(items) => handleChange("items", items)}
        />
    ),
    jigsaw: ({ props, handleChange, lessonId, component }) => (
        <JigsawEditor
            image={props.image || ""}
            onImageChange={(val) => handleChange("image", val)}
            gridSize={typeof props.gridSize === "object" ? (props.gridSize?.rows ?? 3) as 2 | 3 | 4 : (props.gridSize ?? 3) as 2 | 3 | 4}
            onGridSizeChange={(val) => handleChange("gridSize", val)}
            lessonId={lessonId}
            componentId={component.id}
        />
    ),
}

const ARRAY_FIELD_EDITORS: Record<string, EditorRenderer> = {
    "quiz:questions": ({ props, handleChange }) => (
        <QuizEditor
            questions={props.questions || []}
            onChange={(questions) => handleChange("questions", questions)}
            shuffleOptions={props.shuffleOptions !== undefined ? props.shuffleOptions : (props.randomizeAnswers !== undefined ? props.randomizeAnswers : true)}
            onShuffleOptionsChange={(val) => {
                handleChange("shuffleOptions", val)
                handleChange("randomizeAnswers", val)
            }}
        />
    ),
    "matchingPairs:pairs": ({ props, handleChange }) => (
        <MatchingPairsEditor pairs={props.pairs || []} onChange={(pairs) => handleChange("pairs", pairs)} />
    ),
    "dragDrop:items": ({ props, handleChange }) => (
        <DragDropEditor items={props.items || []} onChange={(items) => handleChange("items", items)} />
    ),
    "flashcards:cards": ({ props, handleChange }) => (
        <FlashcardsEditor cards={props.cards || []} onChange={(cards) => handleChange("cards", cards)} />
    ),
    "hotspot:hotspots": ({ props, handleChange }) => (
        <HotspotEditor
            image={props.image || ""}
            hotspots={props.hotspots || []}
            behavior={props.behavior}
            onChange={(hotspots) => handleChange("hotspots", hotspots)}
        />
    ),
    "bulletList:items": ({ props, handleChange }) => (
        <BulletListEditor items={props.items || []} onChange={(items) => handleChange("items", items)} />
    ),
    "fillInTheBlank:blanks": ({ props, handleChange }) => (
        <FillInTheBlankEditor
            text={props.text || ""}
            blanks={props.blanks || []}
            onTextChange={(text) => handleChange("text", text)}
            onBlanksChange={(blanks) => handleChange("blanks", blanks)}
        />
    ),
    "codeEditor:testCases": ({ props, handleChange }) => (
        <CodeEditorEditor
            initialCode={props.initialCode || ""}
            language={props.language || "javascript"}
            testCases={props.testCases || []}
            onInitialCodeChange={(code) => handleChange("initialCode", code)}
            onLanguageChange={(lang) => handleChange("language", lang)}
            onTestCasesChange={(testCases) => handleChange("testCases", testCases)}
        />
    ),
    "table:data": ({ component, props, setProps, setHasDraftChanges }) => (
        <TableEditor
            component={{ ...component, props }}
            updateComponent={(newProps) => {
                setProps(newProps)
                setHasDraftChanges(true)
            }}
        />
    ),
    "poll:options": ({ props, handleChange }) => (
        <PollEditor
            question={props.question || ""}
            options={props.options || []}
            onQuestionChange={(q) => handleChange("question", q)}
            onOptionsChange={(opts) => handleChange("options", opts)}
        />
    ),
    "flashcardQuiz:questions": ({ props, handleChange }) => (
        <FlashcardQuizEditor questions={props.questions || []} onQuestionsChange={(qs) => handleChange("questions", qs)} />
    ),
    "multiSelectQuiz:questions": ({ props, handleChange }) => (
        <MultiSelectQuizEditor questions={props.questions || []} onQuestionsChange={(qs) => handleChange("questions", qs)} />
    ),
    "accordion:items": ({ props, handleChange }) => (
        <AccordionEditor
            title={props.title}
            onTitleChange={(t: string) => handleChange("title", t)}
            items={props.items || []}
            onChange={(items: any[]) => handleChange("items", items)}
            allowMultiple={props.allowMultiple}
            onAllowMultipleChange={(m: boolean) => handleChange("allowMultiple", m)}
        />
    ),
}

export function renderBodyEditor(ctx: EditorCtx): ReactNode | null {
    const editor = BODY_EDITORS[ctx.component.type]
    return editor ? editor(ctx) : null
}

export function renderArrayFieldEditor(type: string, propName: string, ctx: EditorCtx): ReactNode | null {
    const editor = ARRAY_FIELD_EDITORS[`${type}:${propName}`]
    return editor ? editor(ctx) : null
}

export function hasBodyEditor(type: string): boolean {
    return Boolean(BODY_EDITORS[type])
}
