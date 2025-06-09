"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { defaultTheme, getThemeById, type Theme } from "@/lib/themes"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultThemeId?: string
}

type ThemeContextType = {
  theme: Theme
  setTheme: (themeId: string) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => null,
})

export function ThemeProvider({ children, defaultThemeId = "default" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)

  // Initialize theme from localStorage or default
  useEffect(() => {
    const savedThemeId = localStorage.getItem("themeId") || defaultThemeId
    setThemeState(getThemeById(savedThemeId))
  }, [defaultThemeId])

  // Apply theme to document
  useEffect(() => {
    if (!theme) return

    // Apply theme colors as CSS variables
    document.documentElement.style.setProperty("--theme-primary", theme.colors.primary)
    document.documentElement.style.setProperty("--theme-secondary", theme.colors.secondary)
    document.documentElement.style.setProperty("--theme-accent", theme.colors.accent)
    document.documentElement.style.setProperty("--theme-highlight", theme.colors.highlight)
    document.documentElement.style.setProperty("--theme-background", theme.colors.background)
    document.documentElement.style.setProperty("--theme-card-background", theme.colors.cardBackground)
    document.documentElement.style.setProperty("--theme-card-border", theme.colors.cardBorder)
    document.documentElement.style.setProperty("--theme-card-shadow", theme.colors.cardShadow)
    document.documentElement.style.setProperty("--theme-text", theme.colors.text)
    document.documentElement.style.setProperty("--theme-text-muted", theme.colors.textMuted)
    document.documentElement.style.setProperty("--theme-success", theme.colors.success)
    document.documentElement.style.setProperty("--theme-error", theme.colors.error)
    document.documentElement.style.setProperty("--theme-warning", theme.colors.warning)
    document.documentElement.style.setProperty("--theme-info", theme.colors.info)
    document.documentElement.style.setProperty("--theme-border-radius", theme.borderRadius)
    document.documentElement.style.setProperty("--theme-font-family", theme.fontFamily)

    // Apply font family
    document.body.style.fontFamily = theme.fontFamily

    // Apply background color to body
    document.body.style.backgroundColor = theme.colors.background

    // Set data attribute for theme ID
    document.documentElement.setAttribute("data-theme", theme.id)

    // Store the current theme ID in localStorage
    localStorage.setItem("themeId", theme.id)
  }, [theme])

  const setTheme = (themeId: string) => {
    const newTheme = getThemeById(themeId)
    setThemeState(newTheme)
    localStorage.setItem("themeId", themeId)
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
