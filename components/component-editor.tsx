"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Component } from "@/types/lesson"
import { componentDefinitions } from "@/lib/component-definitions"
import { RichTextEditor } from "@/components/rich-text-editor"
import { ImageUploader } from "@/components/renderers/image-uploader"
import { QuizEditor } from "@/components/editors/quiz-editor"
import { MatchingPairsEditor } from "@/components/editors/matching-pairs-editor"
import { DragDropEditor } from "@/components/editors/drag-drop-editor"
import { FlashcardsEditor } from "@/components/editors/flashcards-editor"
import { HotspotEditor } from "@/components/editors/hotspot-editor"
import { BulletListEditor } from "@/components/editors/bullet-list-editor"
import { FillInTheBlankEditor } from "@/components/editors/fill-in-the-blank-editor"
import { CodeEditorEditor } from "@/components/editors/code-editor-editor"
import { ComponentRenderer } from "@/components/component-renderer"

interface ComponentEditorProps {
  component: Component
  updateComponent: (props: Record<string, any>) => void
  onClose: () => void
  isMobile?: boolean
}

export function ComponentEditor({ component, updateComponent, onClose, isMobile = false }: ComponentEditorProps) {
  const [props, setProps] = useState<Record<string, any>>(component.props)

  // Get component definition
  const componentDef = componentDefinitions.find((def) => def.type === component.type)

  // Update props when component changes
  useEffect(() => {
    setProps(component.props)
  }, [component])

  const handleChange = (name: string, value: any) => {
    const updatedProps = { ...props, [name]: value }
    setProps(updatedProps)
    updateComponent(updatedProps)
  }

  if (!componentDef) {
    return (
      <div className={`${isMobile ? "w-full" : "w-80"} border-l p-4 flex flex-col h-full`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Unknown Component</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-muted-foreground">No editor available for this component type.</p>
      </div>
    )
  }

  // Mobile UI
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">{componentDef.label} Settings</h3>
        </div>

        <Tabs defaultValue="properties" className="flex-1">
          <TabsList className="grid grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="flex-1 p-0 m-0">
            <ScrollArea className="h-[calc(100vh-150px)]">
              <div className="px-4 py-4">
                <div className="space-y-4 pb-8">
                  {componentDef.propDefinitions.map((propDef) => (
                    <div key={propDef.name} className="space-y-2">
                      <Label htmlFor={propDef.name}>
                        {propDef.label}
                        {propDef.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>

                      {propDef.type === "string" && (
                        <Input
                          id={propDef.name}
                          value={props[propDef.name] || ""}
                          onChange={(e) => handleChange(propDef.name, e.target.value)}
                          placeholder={propDef.placeholder}
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
                        />
                      )}

                      {propDef.type === "boolean" && (
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={propDef.name}
                            checked={props[propDef.name] || false}
                            onCheckedChange={(checked) => handleChange(propDef.name, checked)}
                          />
                          <Label htmlFor={propDef.name}>{props[propDef.name] ? "Enabled" : "Disabled"}</Label>
                        </div>
                      )}

                      {propDef.type === "select" && propDef.options && (
                        <Select
                          value={String(props[propDef.name])}
                          onValueChange={(value) => handleChange(propDef.name, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={propDef.placeholder || "Select..."} />
                          </SelectTrigger>
                          <SelectContent>
                            {propDef.options.map((option) => {
                              const value = typeof option === "object" ? option.value : option
                              const label = typeof option === "object" ? option.label : option

                              return (
                                <SelectItem key={String(value)} value={String(value)}>
                                  {label}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      )}

                      {propDef.type === "richText" && (
                        <RichTextEditor
                          value={props[propDef.name] || ""}
                          onChange={(value) => handleChange(propDef.name, value)}
                          placeholder={propDef.placeholder}
                        />
                      )}

                      {propDef.type === "image" && (
                        <ImageUploader
                          value={props[propDef.name] || ""}
                          onChange={(value) => handleChange(propDef.name, value)}
                        />
                      )}

                      {propDef.type === "componentArray" &&
                        component.type === "quiz" &&
                        propDef.name === "questions" && (
                          <QuizEditor
                            questions={props.questions || []}
                            onChange={(questions) => handleChange("questions", questions)}
                          />
                        )}

                      {propDef.type === "componentArray" &&
                        component.type === "matchingPairs" &&
                        propDef.name === "pairs" && (
                          <MatchingPairsEditor
                            pairs={props.pairs || []}
                            onChange={(pairs) => handleChange("pairs", pairs)}
                          />
                        )}

                      {propDef.type === "componentArray" &&
                        component.type === "dragDrop" &&
                        propDef.name === "items" && (
                          <DragDropEditor
                            items={props.items || []}
                            onChange={(items) => handleChange("items", items)}
                          />
                        )}

                      {propDef.type === "componentArray" &&
                        component.type === "flashcards" &&
                        propDef.name === "cards" && (
                          <FlashcardsEditor
                            cards={props.cards || []}
                            onChange={(cards) => handleChange("cards", cards)}
                          />
                        )}

                      {propDef.type === "componentArray" &&
                        component.type === "hotspot" &&
                        propDef.name === "hotspots" && (
                          <HotspotEditor
                            image={props.image || ""}
                            hotspots={props.hotspots || []}
                            onChange={(hotspots) => handleChange("hotspots", hotspots)}
                          />
                        )}

                      {propDef.type === "componentArray" &&
                        component.type === "bulletList" &&
                        propDef.name === "items" && (
                          <BulletListEditor
                            items={props.items || []}
                            onChange={(items) => handleChange("items", items)}
                          />
                        )}

                      {propDef.type === "componentArray" &&
                        component.type === "fillInTheBlank" &&
                        propDef.name === "blanks" && (
                          <FillInTheBlankEditor
                            text={props.text || ""}
                            blanks={props.blanks || []}
                            onTextChange={(text) => handleChange("text", text)}
                            onBlanksChange={(blanks) => handleChange("blanks", blanks)}
                          />
                        )}

                      {propDef.type === "componentArray" &&
                        component.type === "codeEditor" &&
                        propDef.name === "testCases" && (
                          <CodeEditorEditor
                            initialCode={props.initialCode || ""}
                            language={props.language || "javascript"}
                            testCases={props.testCases || []}
                            onInitialCodeChange={(code) => handleChange("initialCode", code)}
                            onLanguageChange={(lang) => handleChange("language", lang)}
                            onTestCasesChange={(testCases) => handleChange("testCases", testCases)}
                          />
                        )}

                      {propDef.type === "componentArray" &&
                        component.type !== "quiz" &&
                        component.type !== "matchingPairs" &&
                        component.type !== "dragDrop" &&
                        component.type !== "flashcards" &&
                        component.type !== "hotspot" &&
                        component.type !== "bulletList" &&
                        component.type !== "fillInTheBlank" &&
                        component.type !== "codeEditor" && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              This property requires a custom editor that is not yet implemented.
                            </p>
                          </div>
                        )}

                      {propDef.description && <p className="text-xs text-muted-foreground">{propDef.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 p-0 m-0">
            <ScrollArea className="h-[calc(100vh-150px)]">
              <div className="p-4">
                <div className="border rounded-md p-4">
                  <ComponentRenderer
                    component={{
                      id: component.id,
                      type: component.type,
                      props: props,
                    }}
                    isEditing={false}
                  />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Desktop UI
  return (
    <div className="w-80 border-l flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold">{componentDef.label} Settings</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="properties" className="h-full m-0 p-0 overflow-auto">
              <div className="px-4 py-4">
                <div className="space-y-4 pb-8">
                  {componentDef.propDefinitions.map((propDef) => (
                    <div key={propDef.name} className="space-y-2">
                      <Label htmlFor={propDef.name}>
                        {propDef.label}
                        {propDef.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>

                      {propDef.type === "string" && (
                        <Input
                          id={propDef.name}
                          value={props[propDef.name] || ""}
                          onChange={(e) => handleChange(propDef.name, e.target.value)}
                          placeholder={propDef.placeholder}
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
                        />
                      )}

                      {propDef.type === "boolean" && (
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={propDef.name}
                            checked={props[propDef.name] || false}
                            onCheckedChange={(checked) => handleChange(propDef.name, checked)}
                          />
                          <Label htmlFor={propDef.name}>{props[propDef.name] ? "Enabled" : "Disabled"}</Label>
                        </div>
                      )}

                      {propDef.type === "select" && propDef.options && (
                        <Select
                          value={String(props[propDef.name])}
                          onValueChange={(value) => handleChange(propDef.name, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={propDef.placeholder || "Select..."} />
                          </SelectTrigger>
                          <SelectContent>
                            {propDef.options.map((option) => {
                              const value = typeof option === "object" ? option.value : option
                              const label = typeof option === "object" ? option.label : option

                              return (
                                <SelectItem key={String(value)} value={String(value)}>
                                  {label}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      )}

                      {propDef.type === "richText" && (
                        <RichTextEditor
                          value={props[propDef.name] || ""}
                          onChange={(value) => handleChange(propDef.name, value)}
                          placeholder={propDef.placeholder}
                        />
                      )}

                      {propDef.type === "image" && (
                        <ImageUploader
                          value={props[propDef.name] || ""}
                          onChange={(value) => handleChange(propDef.name, value)}
                        />
                      )}

                      {propDef.type === "componentArray" &&
                        component.type === "quiz" &&
                        propDef.name === "questions" && (
                          <QuizEditor
                            questions={props.questions || []}
                            onChange={(questions) => handleChange("questions", questions)}
                          />
                        )}

                      {propDef.type === "componentArray" &&
                        component.type === "matchingPairs" &&
                        propDef.name === "pairs" && (
                          <MatchingPairsEditor
                            pairs={props.pairs || []}
                            onChange={(pairs) => handleChange("pairs", pairs)}
                          />
                        )}

                      {propDef.type === "componentArray" &&
                        component.type === "dragDrop" &&
                        propDef.name === "items" && (
                          <DragDropEditor
                            items={props.items || []}
                            onChange={(items) => handleChange("items", items)}
                          />
                        )}

                      {propDef.type === "componentArray" &&
                        component.type === "flashcards" &&
                        propDef.name === "cards" && (
                          <FlashcardsEditor
                            cards={props.cards || []}
                            onChange={(cards) => handleChange("cards", cards)}
                          />
                        )}

                      {propDef.type === "componentArray" &&
                        component.type === "hotspot" &&
                        propDef.name === "hotspots" && (
                          <HotspotEditor
                            image={props.image || ""}
                            hotspots={props.hotspots || []}
                            onChange={(hotspots) => handleChange("hotspots", hotspots)}
                          />
                        )}

                      {propDef.type === "componentArray" &&
                        component.type === "bulletList" &&
                        propDef.name === "items" && (
                          <BulletListEditor
                            items={props.items || []}
                            onChange={(items) => handleChange("items", items)}
                          />
                        )}

                      {propDef.type === "componentArray" &&
                        component.type === "fillInTheBlank" &&
                        propDef.name === "blanks" && (
                          <FillInTheBlankEditor
                            text={props.text || ""}
                            blanks={props.blanks || []}
                            onTextChange={(text) => handleChange("text", text)}
                            onBlanksChange={(blanks) => handleChange("blanks", blanks)}
                          />
                        )}

                      {propDef.type === "componentArray" &&
                        component.type === "codeEditor" &&
                        propDef.name === "testCases" && (
                          <CodeEditorEditor
                            initialCode={props.initialCode || ""}
                            language={props.language || "javascript"}
                            testCases={props.testCases || []}
                            onInitialCodeChange={(code) => handleChange("initialCode", code)}
                            onLanguageChange={(lang) => handleChange("language", lang)}
                            onTestCasesChange={(testCases) => handleChange("testCases", testCases)}
                          />
                        )}

                      {propDef.type === "componentArray" &&
                        component.type !== "quiz" &&
                        component.type !== "matchingPairs" &&
                        component.type !== "dragDrop" &&
                        component.type !== "flashcards" &&
                        component.type !== "hotspot" &&
                        component.type !== "bulletList" &&
                        component.type !== "fillInTheBlank" &&
                        component.type !== "codeEditor" && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              This property requires a custom editor that is not yet implemented.
                            </p>
                          </div>
                        )}

                      {propDef.description && <p className="text-xs text-muted-foreground">{propDef.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="h-full m-0 p-0 overflow-auto">
              <div className="p-4">
                <div className="border rounded-md p-4">
                  <ComponentRenderer
                    component={{
                      id: component.id,
                      type: component.type,
                      props: props,
                    }}
                    isEditing={false}
                  />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
