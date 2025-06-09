"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [htmlValue, setHtmlValue] = useState(value)
  const [activeTab, setActiveTab] = useState<"visual" | "html">("visual")
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 })
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setHtmlValue(value)
  }, [value])

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setHtmlValue(newValue)
    onChange(newValue)

    // Save selection
    if (textareaRef.current) {
      setSelection({
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd,
      })
    }
  }

  const applyFormat = (format: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = htmlValue.substring(start, end)
    let newText = ""
    let newCursorPos = 0

    switch (format) {
      case "bold":
        newText = htmlValue.substring(0, start) + `<strong>${selectedText}</strong>` + htmlValue.substring(end)
        newCursorPos = end + 17
        break
      case "italic":
        newText = htmlValue.substring(0, start) + `<em>${selectedText}</em>` + htmlValue.substring(end)
        newCursorPos = end + 9
        break
      case "underline":
        newText = htmlValue.substring(0, start) + `<u>${selectedText}</u>` + htmlValue.substring(end)
        newCursorPos = end + 7
        break
      case "align-left":
        newText =
          htmlValue.substring(0, start) +
          `<div style="text-align: left">${selectedText}</div>` +
          htmlValue.substring(end)
        newCursorPos = end + 35
        break
      case "align-center":
        newText =
          htmlValue.substring(0, start) +
          `<div style="text-align: center">${selectedText}</div>` +
          htmlValue.substring(end)
        newCursorPos = end + 37
        break
      case "align-right":
        newText =
          htmlValue.substring(0, start) +
          `<div style="text-align: right">${selectedText}</div>` +
          htmlValue.substring(end)
        newCursorPos = end + 36
        break
      case "ul":
        newText = htmlValue.substring(0, start) + `<ul>\n  <li>${selectedText}</li>\n</ul>` + htmlValue.substring(end)
        newCursorPos = end + 14
        break
      case "ol":
        newText = htmlValue.substring(0, start) + `<ol>\n  <li>${selectedText}</li>\n</ol>` + htmlValue.substring(end)
        newCursorPos = end + 14
        break
      case "link":
        const url = prompt("Enter URL:", "https://")
        if (url) {
          newText =
            htmlValue.substring(0, start) + `<a href="${url}">${selectedText || url}</a>` + htmlValue.substring(end)
          newCursorPos = end + 15 + url.length + (selectedText ? 0 : url.length)
        }
        break
      default:
        return
    }

    setHtmlValue(newText)
    onChange(newText)

    // Set focus back to textarea and restore cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(
          format === "link" ? newCursorPos : end,
          format === "link" ? newCursorPos : end,
        )
      }
    }, 0)
  }

  const renderPreview = () => {
    return <div className="p-3 border rounded-md min-h-[150px]" dangerouslySetInnerHTML={{ __html: htmlValue }} />
  }

  return (
    <div className="border rounded-md">
      <div className="flex items-center gap-1 p-1 border-b bg-muted/50">
        <Button variant="ghost" size="icon" onClick={() => applyFormat("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => applyFormat("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => applyFormat("underline")} title="Underline">
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button variant="ghost" size="icon" onClick={() => applyFormat("align-left")} title="Align Left">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => applyFormat("align-center")} title="Align Center">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => applyFormat("align-right")} title="Align Right">
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button variant="ghost" size="icon" onClick={() => applyFormat("ul")} title="Bullet List">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => applyFormat("ol")} title="Numbered List">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => applyFormat("link")} title="Insert Link">
          <Link className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="visual" onValueChange={(value) => setActiveTab(value as "visual" | "html")}>
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-2">
          <TabsTrigger
            value="visual"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Visual
          </TabsTrigger>
          <TabsTrigger
            value="html"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            HTML
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="p-0 border-0">
          <Textarea
            ref={textareaRef}
            value={htmlValue}
            onChange={handleHtmlChange}
            placeholder={placeholder}
            className="min-h-[150px] border-0 focus-visible:ring-0 rounded-none"
          />
        </TabsContent>

        <TabsContent value="html" className="p-0 border-0">
          <Textarea
            ref={textareaRef}
            value={htmlValue}
            onChange={handleHtmlChange}
            placeholder={placeholder}
            className="min-h-[150px] border-0 focus-visible:ring-0 rounded-none font-mono text-sm"
          />
        </TabsContent>

        <TabsContent value="preview" className="p-2 border-0">
          {renderPreview()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
