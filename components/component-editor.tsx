"use client"

import { useState, useEffect } from "react"
import { X, Check, Undo2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import type { Component } from "@/types/lesson"
import { componentDefinitions } from "@/lib/component-definitions"
import { RichTextEditor } from "@/components/rich-text-editor"
import { ImageUploader } from "@/components/renderers/image-uploader"
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
import { SingleItemEditor } from "@/components/editors/base/SingleItemEditor"
import { ComponentRenderer } from "@/components/component-renderer"

interface ComponentEditorProps {
  component: Component
  updateComponent: (props: Record<string, any>) => void
  onClose: () => void
  isMobile?: boolean
  lessonId?: string
}

export function ComponentEditor({ component, updateComponent, onClose, isMobile = false, lessonId }: ComponentEditorProps) {
  const [props, setProps] = useState<Record<string, any>>(component.props)
  const [hasDraftChanges, setHasDraftChanges] = useState(false)

  const componentDef = componentDefinitions.find((def) => def.type === component.type)

  useEffect(() => {
    setProps(component.props)
    setHasDraftChanges(false)
  }, [component])

  const handleChange = (name: string, value: any) => {
    const updatedProps = { ...props, [name]: value }
    setProps(updatedProps)
    setHasDraftChanges(true)
  }

  const handleSaveChanges = () => {
    updateComponent(props)
    setHasDraftChanges(false)
    onClose()
  }

  const handleCancelChanges = () => {
    setProps(component.props)
    setHasDraftChanges(false)
    onClose()
  }

  if (!componentDef) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-950/20 backdrop-blur-sm rounded-2xl border border-slate-800/50 m-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-6">
          <X className="h-8 w-8 text-slate-700" />
        </div>
        <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest mb-2">Unknown Fragment</h3>
        <p className="text-slate-500 text-xs font-bold px-4">The selected component does not have a registered configuration manifest.</p>
        <Button variant="ghost" onClick={onClose} className="mt-8 text-emerald-400 hover:text-emerald-300">
          Dismiss Settings
        </Button>
      </div>
    )
  }

  const renderEditorFields = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <SingleItemEditor
        title={props.title}
        points={props.points}
        titlePlaceholder={componentDef.label}
        onTitleChange={componentDef.propDefinitions.find(d => d.name === "title") ? (val) => handleChange("title", val) : undefined}
        onPointsChange={componentDef.propDefinitions.find(d => d.name === "points") ? (val) => handleChange("points", val) : undefined}
      >
        {component.type === "shortAnswer" ? (
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
        ) : (
          <div className="space-y-8">
            {componentDef.propDefinitions
              .filter(d => d.name !== "title" && d.name !== "points")
              .map((propDef) => (
                <div key={propDef.name} className="space-y-3 group">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={propDef.name} className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-focus-within:text-emerald-500 transition-colors">
                      {propDef.label}
                      {propDef.required && <span className="text-emerald-500 ml-1.5 opacity-50">*</span>}
                    </Label>
                    {propDef.description && (
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
                        {propDef.type}
                      </span>
                    )}
                  </div>

                  {propDef.type === "string" && (
                    <Input
                      id={propDef.name}
                      value={props[propDef.name] || ""}
                      onChange={(e) => handleChange(propDef.name, e.target.value)}
                      placeholder={propDef.placeholder}
                      className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 h-11 text-sm font-bold placeholder:text-slate-700"
                    />
                  )}

                  {propDef.type === "number" && (
                    <Input
                      id={propDef.name}
                      type="number"
                      value={props[propDef.name] || 0}
                      onChange={(e) => handleChange(propDef.name, Number(e.target.value))}
                      min={propDef.min}
                      max={propDef.max}
                      step={propDef.step || 1}
                      className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 h-11 text-sm font-bold"
                    />
                  )}

                  {propDef.type === "boolean" && (
                    <div className="flex items-center justify-between p-4 bg-slate-950/30 rounded-xl border border-slate-800 transition-all hover:bg-slate-950/50">
                      <Label htmlFor={propDef.name} className="text-xs font-bold text-slate-300">
                        {props[propDef.name] ? "Enabled" : "Disabled"}
                      </Label>
                      <Switch
                        id={propDef.name}
                        checked={props[propDef.name] || false}
                        onCheckedChange={(checked: boolean) => handleChange(propDef.name, checked)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                  )}

                  {propDef.type === "select" && propDef.options && (
                    <Select
                      value={String(props[propDef.name])}
                      onValueChange={(value: string) => handleChange(propDef.name, value)}
                    >
                      <SelectTrigger className="bg-slate-950/50 border-slate-800 h-11 text-sm font-bold focus:ring-emerald-500/50">
                        <SelectValue placeholder={propDef.placeholder || "Select Choice..."} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        {propDef.options.map((option) => {
                          const value = typeof option === "object" ? option.value : option
                          const label = typeof option === "object" ? option.label : option

                          return (
                            <SelectItem key={String(value)} value={String(value)} className="focus:bg-emerald-500 focus:text-slate-950 font-bold">
                              {label}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  )}

                  {propDef.type === "richText" && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 focus-within:border-emerald-500/50 transition-all">
                      <RichTextEditor
                        value={props[propDef.name] || ""}
                        onChange={(value) => handleChange(propDef.name, value)}
                        placeholder={propDef.placeholder}
                      />
                    </div>
                  )}

                  {propDef.type === "image" && (
                    <div className="rounded-xl overflow-hidden shadow-2xl">
                      <ImageUploader
                        value={props[propDef.name] || ""}
                        onChange={(value) => handleChange(propDef.name, value)}
                        lessonId={lessonId}
                        componentId={component.id}
                      />
                    </div>
                  )}

                  {propDef.type === "video" && (
                    <Input
                      id={propDef.name}
                      value={props[propDef.name] || props.url || props.src || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleChange(propDef.name, val);
                        handleChange("url", val);
                        handleChange("src", val);
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 h-11 text-sm font-bold placeholder:text-slate-700"
                    />
                  )}

                  {propDef.type === "componentArray" && (
                    <div className="space-y-4 pt-2">
                      {component.type === "quiz" && propDef.name === "questions" && (
                        <QuizEditor
                          questions={props.questions || []}
                          onChange={(questions) => handleChange("questions", questions)}
                          shuffleOptions={props.shuffleOptions !== undefined ? props.shuffleOptions : (props.randomizeAnswers !== undefined ? props.randomizeAnswers : true)}
                          onShuffleOptionsChange={(val) => {
                            handleChange("shuffleOptions", val)
                            handleChange("randomizeAnswers", val)
                          }}
                        />
                      )}
                      {component.type === "matchingPairs" && propDef.name === "pairs" && (
                        <MatchingPairsEditor
                          pairs={props.pairs || []}
                          onChange={(pairs) => handleChange("pairs", pairs)}
                        />
                      )}
                      {component.type === "dragDrop" && propDef.name === "items" && (
                        <DragDropEditor
                          items={props.items || []}
                          onChange={(items) => handleChange("items", items)}
                        />
                      )}
                      {component.type === "flashcards" && propDef.name === "cards" && (
                        <FlashcardsEditor
                          cards={props.cards || []}
                          onChange={(cards) => handleChange("cards", cards)}
                        />
                      )}
                      {component.type === "hotspot" && propDef.name === "hotspots" && (
                        <HotspotEditor
                          image={props.image || ""}
                          hotspots={props.hotspots || []}
                          onChange={(hotspots) => handleChange("hotspots", hotspots)}
                        />
                      )}
                      {component.type === "bulletList" && propDef.name === "items" && (
                        <BulletListEditor
                          items={props.items || []}
                          onChange={(items) => handleChange("items", items)}
                        />
                      )}
                      {component.type === "fillInTheBlank" && propDef.name === "blanks" && (
                        <FillInTheBlankEditor
                          text={props.text || ""}
                          blanks={props.blanks || []}
                          onTextChange={(text) => handleChange("text", text)}
                          onBlanksChange={(blanks) => handleChange("blanks", blanks)}
                        />
                      )}
                      {component.type === "codeEditor" && propDef.name === "testCases" && (
                        <CodeEditorEditor
                          initialCode={props.initialCode || ""}
                          language={props.language || "javascript"}
                          testCases={props.testCases || []}
                          onInitialCodeChange={(code) => handleChange("initialCode", code)}
                          onLanguageChange={(lang) => handleChange("language", lang)}
                          onTestCasesChange={(testCases) => handleChange("testCases", testCases)}
                        />
                      )}
                      {component.type === "table" && propDef.name === "data" && (
                        <TableEditor
                          component={{ ...component, props }}
                          updateComponent={(newProps) => {
                            setProps(newProps);
                            setHasDraftChanges(true);
                          }}
                        />
                      )}
                      {component.type === "poll" && propDef.name === "options" && (
                        <PollEditor
                          question={props.question || ""}
                          options={props.options || []}
                          onQuestionChange={(q) => handleChange("question", q)}
                          onOptionsChange={(opts) => handleChange("options", opts)}
                        />
                      )}
                      {component.type === "flashcardQuiz" && propDef.name === "questions" && (
                        <FlashcardQuizEditor
                          questions={props.questions || []}
                          onQuestionsChange={(qs) => handleChange("questions", qs)}
                        />
                      )}
                      {component.type === "multiSelectQuiz" && propDef.name === "questions" && (
                        <MultiSelectQuizEditor
                          questions={props.questions || []}
                          onQuestionsChange={(qs) => handleChange("questions", qs)}
                        />
                      )}
                    </div>
                  )}

                  {propDef.description && <p className="text-[10px] text-slate-600 font-bold ml-1">{propDef.description}</p>}
                </div>
              ))}
          </div>
        )}
      </SingleItemEditor>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-[#0F172A]">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{componentDef.label}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Draft Save / Cancel Action Bar */}
      {hasDraftChanges && (
        <div className="flex-shrink-0 p-3 px-4 bg-emerald-950/40 border-b border-emerald-800/50 flex items-center justify-between animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Unpublished Draft Edits</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelChanges}
              className="h-7 px-3 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-1"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSaveChanges}
              className="h-7 px-3 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-md shadow-emerald-500/20 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>
      )}

      {/* Content Tabs */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="properties" className="flex-1 flex flex-col min-h-0">
          <div className="px-5 py-3 border-b border-slate-800/50 bg-slate-900/20 flex-shrink-0">
            <TabsList className="grid grid-cols-2 h-9 bg-slate-950/60 p-1 rounded-full border border-slate-800">
              <TabsTrigger
                value="properties"
                className="text-[10px] font-black uppercase rounded-full data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 transition-all"
              >
                Payload
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="text-[10px] font-black uppercase rounded-full data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 transition-all"
              >
                Output
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <TabsContent value="properties" className="h-full m-0 focus-visible:outline-none">
              <ScrollArea className="h-full">
                <div className="p-5">
                  {renderEditorFields()}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="preview" className="h-full m-0 focus-visible:outline-none bg-white">
              <ScrollArea className="h-full">
                <div className="p-8 flex items-center justify-center min-h-full bg-slate-50/50">
                  <div className="w-full max-w-[400px] border border-slate-100 rounded-3xl bg-white shadow-2xl p-8">
                    <ComponentRenderer
                      component={{
                        id: component.id,
                        type: component.type,
                        props: props,
                      }}
                    />
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
