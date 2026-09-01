"use client"

import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from "react"
import { X, Check, Undo2, Eye, SlidersHorizontal, PanelLeftOpen, PanelLeftClose } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import type { Component, Lesson, PropDefinition } from "@/types/lesson"
import { componentDefinitions } from "@/lib/component-definitions"
import { RichTextEditor } from "@/components/rich-text-editor"
import { ImageUploader } from "@/components/renderers/image-uploader"
import { SingleItemEditor } from "@/components/editors/base/SingleItemEditor"
import { renderArrayFieldEditor, renderBodyEditor } from "@/components/editors/editor-registry"
import { ComponentRenderer } from "@/components/component-renderer"
import { normalizeHotspotBehavior, resolveHotspotComponentProps } from "@/lib/hotspot-utils"
import { ReferencePicker } from "@/components/reference/reference-picker"
import { ReferencePopup } from "@/components/reference/reference-popup"
import { ReferenceProvider } from "@/context/reference-context"
import { LiveModeSettings } from "@/components/editors/live-mode-settings"
import { hasBodyEditor } from "@/components/editors/editor-registry"
import { LIVE_CAPABLE_COMPONENT_TYPES } from "@/lib/live-mode-props"

interface ComponentEditorProps {
  component: Component
  updateComponent: (props: Record<string, any>) => void
  onClose: () => void
  isMobile?: boolean
  lessonId?: string
  lesson?: Lesson | null
  referenceOptions?: { id: string; type: string; title: string }[]
}

function SchemaPropField({
  propDef,
  component,
  props,
  lessonId,
  handleChange,
  setProps,
  setHasDraftChanges,
}: {
  propDef: PropDefinition
  component: Component
  props: Record<string, any>
  lessonId?: string
  handleChange: (name: string, value: any) => void
  setProps: Dispatch<SetStateAction<Record<string, any>>>
  setHasDraftChanges: (value: boolean) => void
}) {
  const arrayEditor = propDef.type === "componentArray"
    ? renderArrayFieldEditor(component.type, propDef.name, {
        component,
        props,
        lessonId,
        handleChange,
        setProps,
        setHasDraftChanges,
      })
    : null

  return (
    <div className="space-y-3 group">
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
          value={
            component.type === "hotspot" && propDef.name === "behavior"
              ? normalizeHotspotBehavior(props[propDef.name])
              : String(props[propDef.name] ?? propDef.defaultValue ?? "")
          }
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
        <div className="relative pt-2">
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
            const val = e.target.value
            handleChange(propDef.name, val)
            handleChange("url", val)
            handleChange("src", val)
          }}
          placeholder="https://www.youtube.com/watch?v=..."
          className="bg-slate-950/50 border-slate-800 focus-visible:ring-emerald-500/50 h-11 text-sm font-bold placeholder:text-slate-700"
        />
      )}

      {propDef.type === "componentArray" && (
        <div className="space-y-4 pt-2">{arrayEditor}</div>
      )}

      {propDef.description && <p className="text-[10px] text-slate-600 font-bold ml-1">{propDef.description}</p>}
    </div>
  )
}

export function ComponentEditor({ component, updateComponent, onClose, isMobile = false, lessonId, lesson, referenceOptions }: ComponentEditorProps) {
  const [props, setProps] = useState<Record<string, any>>(() =>
    component.type === "hotspot" ? resolveHotspotComponentProps(component as any) : component.props,
  )
  const [hasDraftChanges, setHasDraftChanges] = useState(false)
  const [propertiesOpen, setPropertiesOpen] = useState(true)
  const [previewStates, setPreviewStates] = useState<Record<string, any>>({})
  const setPreviewComponentState = useCallback((componentId: string, state: any) => {
    setPreviewStates((prev) => {
      const existing = prev[componentId]
      if (existing && JSON.stringify(existing) === JSON.stringify(state)) return prev
      return { ...prev, [componentId]: state }
    })
  }, [])

  const handlePreviewSetComponentState = useCallback(
    (state: any) => setPreviewComponentState(component.id, state),
    [component.id, setPreviewComponentState],
  )

  const componentDef = componentDefinitions.find((def) => def.type === component.type)

  useEffect(() => {
    setProps(component.type === "hotspot" ? resolveHotspotComponentProps(component as any) : component.props)
    setHasDraftChanges(false)
  }, [component])

  const handleChange = (name: string, value: any) => {
    let changed = false
    setProps((prev) => {
      if (Object.is(prev[name], value)) return prev
      changed = true
      return { ...prev, [name]: value }
    })
    if (changed) setHasDraftChanges(true)
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

  const handleRequestClose = () => {
    if (hasDraftChanges) {
      const discard = window.confirm("Discard unpublished draft edits for this block?")
      if (!discard) return
      setProps(component.type === "hotspot" ? resolveHotspotComponentProps(component as any) : component.props)
      setHasDraftChanges(false)
    }
    onClose()
  }

  if (!componentDef) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
          <X className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No editor for this block</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">This type is in the library but does not have a configuration form yet.</p>
        <Button variant="outline" onClick={onClose} className="mt-6">
          Close
        </Button>
      </div>
    )
  }

  const editorCtx = { component, props, lessonId, handleChange, setProps, setHasDraftChanges, referenceOptions }
  const bodyEditor = renderBodyEditor(editorCtx)
  const showLiveModeSettings =
    hasBodyEditor(component.type) && LIVE_CAPABLE_COMPONENT_TYPES.has(component.type)

  const renderEditorFields = () => (
    <div className="space-y-6">
      {showLiveModeSettings && (
        <LiveModeSettings
          componentType={component.type}
          mode={props.mode ?? component.mode}
          timeLimit={props.timeLimit}
          onModeChange={(mode) => handleChange("mode", mode)}
          onTimeLimitChange={(seconds) => handleChange("timeLimit", seconds)}
        />
      )}
      <SingleItemEditor
        title={props.title}
        points={props.points}
        titlePlaceholder={componentDef.label}
        onTitleChange={componentDef.propDefinitions.find(d => d.name === "title") ? (val) => handleChange("title", val) : undefined}
        onPointsChange={componentDef.propDefinitions.find(d => d.name === "points") ? (val) => handleChange("points", val) : undefined}
      >
        {bodyEditor ?? (
          <div className="space-y-8">
            {componentDef.propDefinitions
              .filter(d => d.name !== "title" && d.name !== "points")
              .map((propDef) => (
                <SchemaPropField
                  key={propDef.name}
                  propDef={propDef}
                  component={component}
                  props={props}
                  lessonId={lessonId}
                  handleChange={handleChange}
                  setProps={setProps}
                  setHasDraftChanges={setHasDraftChanges}
                />
              ))}
          </div>
        )}
      </SingleItemEditor>
    </div>
  )

  const previewPane = (
    <div className="h-full min-h-0 flex flex-col bg-[#F4F6F8]">
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <Eye className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">Live preview</span>
        </div>
        <span className="text-[11px] text-slate-400">Uses the full workspace</span>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 sm:p-8 min-h-full">
          <ReferenceProvider
            lesson={lesson || null}
            mode="practice"
            preview
            contained
            componentStates={previewStates}
            setComponentState={setPreviewComponentState}
          >
            <div className="relative w-full min-h-[min(70vh,640px)] flex flex-col rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
              <ComponentRenderer
                component={{
                  id: component.id,
                  type: component.type,
                  props: props,
                }}
                savedState={previewStates[component.id]}
                setComponentState={handlePreviewSetComponentState}
                isEditing
                lessonId={lessonId}
              />
              <ReferencePopup />
            </div>
          </ReferenceProvider>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  )

  const propertiesPane = (
    <ScrollArea className="h-full">
      <div className="p-4 pb-10 space-y-6">
        {renderEditorFields()}
        <ReferencePicker
          value={props.referenceComponentId || ''}
          onChange={(id) => handleChange('referenceComponentId', id)}
          options={referenceOptions}
          selfId={component.id}
        />
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  )

  return (
    <div className="flex flex-col h-full bg-[#0B1220] text-slate-200">
      <header className="flex-shrink-0 flex items-center gap-3 px-3 sm:px-4 py-2.5 border-b border-white/10 bg-[#0B1220]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center text-lg shrink-0">
            {componentDef.icon}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Block</p>
            <h3 className="text-sm font-semibold text-white truncate">{componentDef.label}</h3>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {hasDraftChanges && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelChanges}
                className="h-8 px-3 text-xs text-slate-400 hover:text-white hover:bg-white/10"
              >
                <Undo2 className="w-3.5 h-3.5 mr-1.5" />
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleSaveChanges}
                className="h-8 px-3 text-xs font-semibold bg-[#58CC02] hover:bg-[#46a302] text-white"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Save
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRequestClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {isMobile ? (
        <Tabs defaultValue="properties" className="flex-1 flex flex-col min-h-0">
          <div className="px-3 py-2 border-b border-white/10 shrink-0">
            <TabsList className="grid grid-cols-2 h-10 w-full bg-white/5 p-1 rounded-xl">
              <TabsTrigger
                value="properties"
                className="text-xs font-semibold rounded-lg data-[state=active]:bg-[#58CC02] data-[state=active]:text-white"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="text-xs font-semibold rounded-lg data-[state=active]:bg-[#58CC02] data-[state=active]:text-white"
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                Preview
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="properties" className="flex-1 min-h-0 m-0 overflow-hidden">
            {propertiesPane}
          </TabsContent>
          <TabsContent value="preview" className="flex-1 min-h-0 m-0 overflow-hidden">
            {previewPane}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex-1 min-h-0 flex">
          <aside
            className={
              propertiesOpen
                ? "w-[360px] shrink-0 border-r border-white/10 bg-[#0B1220] flex flex-col min-h-0 transition-[width] duration-300"
                : "w-12 shrink-0 border-r border-white/10 bg-[#0B1220] flex flex-col items-center py-3 gap-3"
            }
          >
            {propertiesOpen ? (
              <>
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10 shrink-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Properties</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPropertiesOpen(false)}
                    className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/10"
                    title="Hide properties"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 min-h-0">{propertiesPane}</div>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPropertiesOpen(true)}
                className="h-9 w-9 text-slate-400 hover:text-white hover:bg-white/10"
                title="Show properties"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            )}
          </aside>
          <section className="flex-1 min-w-0 min-h-0">{previewPane}</section>
        </div>
      )}
    </div>
  )
}
