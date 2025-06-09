"use client"

import { useState } from "react"
import { Check, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { themes, type Theme } from "@/lib/themes"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

// Update the ThemeSelectorProps interface to include isMobile
interface ThemeSelectorProps {
  currentThemeId: string
  onThemeChange: (themeId: string) => void
  isMobile?: boolean
}

// Update the ThemeSelector component to handle mobile view
export function ThemeSelector({ currentThemeId, onThemeChange, isMobile = false }: ThemeSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedThemeId, setSelectedThemeId] = useState(currentThemeId)

  const handleThemeChange = (themeId: string) => {
    setSelectedThemeId(themeId)
  }

  const applyTheme = () => {
    onThemeChange(selectedThemeId)
    setOpen(false)
  }

  // For mobile, show a full-width button
  if (isMobile) {
    return (
      <>
        <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
          <Palette className="h-4 w-4 mr-2" />
          Change Theme
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Choose a Theme</DialogTitle>
              <DialogDescription>Select a theme that best fits your lesson style and audience.</DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 max-h-[70vh] pr-4">
              <RadioGroup
                value={selectedThemeId}
                onValueChange={handleThemeChange}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4"
              >
                {themes.map((theme) => (
                  <ThemeOption key={theme.id} theme={theme} isSelected={selectedThemeId === theme.id} />
                ))}
              </RadioGroup>
            </ScrollArea>

            <DialogFooter className="flex-shrink-0 pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={applyTheme}>Apply Theme</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Desktop view remains the same
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Palette className="h-4 w-4 mr-2" />
        Change Theme
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Choose a Theme</DialogTitle>
            <DialogDescription>Select a theme that best fits your lesson style and audience.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 max-h-[70vh] pr-4">
            <RadioGroup
              value={selectedThemeId}
              onValueChange={handleThemeChange}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4"
            >
              {themes.map((theme) => (
                <ThemeOption key={theme.id} theme={theme} isSelected={selectedThemeId === theme.id} />
              ))}
            </RadioGroup>
          </ScrollArea>

          <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyTheme}>Apply Theme</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface ThemeOptionProps {
  theme: Theme
  isSelected: boolean
}

function ThemeOption({ theme, isSelected }: ThemeOptionProps) {
  return (
    <div className="relative">
      <RadioGroupItem value={theme.id} id={theme.id} className="sr-only" />
      <Label
        htmlFor={theme.id}
        className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${
          isSelected ? "border-primary ring-2 ring-primary ring-opacity-50" : "border-border hover:border-primary/50"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm sm:text-base">{theme.name}</span>
          {isSelected && <Check className="h-4 w-4 text-primary" />}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3">{theme.description}</p>
        <div className="flex gap-2 mb-3">
          <div
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
            style={{ backgroundColor: theme.colors.primary }}
            title="Primary"
          ></div>
          <div
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
            style={{ backgroundColor: theme.colors.secondary }}
            title="Secondary"
          ></div>
          <div
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
            style={{ backgroundColor: theme.colors.accent }}
            title="Accent"
          ></div>
          <div
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
            style={{ backgroundColor: theme.colors.highlight }}
            title="Highlight"
          ></div>
        </div>
        <div
          className="p-3 rounded text-xs sm:text-sm"
          style={{
            backgroundColor: theme.colors.cardBackground,
            borderRadius: theme.borderRadius,
            boxShadow: theme.colors.cardShadow,
            border: `1px solid ${theme.colors.cardBorder}`,
            color: theme.colors.text,
          }}
        >
          Sample card
        </div>
      </Label>
    </div>
  )
}
