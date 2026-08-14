"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { X, Download, Share } from "lucide-react"

declare global {
  interface Window {
    __deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null
  }
}

function isIOSSafari() {
  if (typeof navigator === "undefined") return false
  const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  return isIOSDevice && isSafari
}

function isStandalone() {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes("android-app://")
  )
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (isStandalone()) return

    if (isIOSSafari()) {
      setShowPrompt(true)
      return
    }

    const adoptPrompt = (event: BeforeInstallPromptEvent) => {
      setDeferredPrompt(event)
      setShowPrompt(true)
    }

    // Prompt may have fired before React mounted (captured in register-sw.js)
    if (window.__deferredPWAInstallPrompt) {
      adoptPrompt(window.__deferredPWAInstallPrompt)
    }

    const onInstallAvailable = () => {
      if (window.__deferredPWAInstallPrompt) {
        adoptPrompt(window.__deferredPWAInstallPrompt)
      }
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const prompt = e as BeforeInstallPromptEvent
      window.__deferredPWAInstallPrompt = prompt
      adoptPrompt(prompt)
    }

    window.addEventListener("pwa-install-available", onInstallAvailable)
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)

    return () => {
      window.removeEventListener("pwa-install-available", onInstallAvailable)
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    const prompt = deferredPrompt ?? window.__deferredPWAInstallPrompt
    if (!prompt) return

    try {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === "accepted") {
        setShowPrompt(false)
      }
    } catch (error) {
      console.error("Error during installation:", error)
    }

    window.__deferredPWAInstallPrompt = null
    setDeferredPrompt(null)
  }

  if (!showPrompt) return null

  const iosSafari = isIOSSafari()

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-[400px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            {iosSafari ? <Share className="h-5 w-5" /> : <Download className="h-5 w-5" />}
            Install App
          </h3>
          {iosSafari ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                To install this app on your iOS device:
              </p>
              <ol className="text-sm text-gray-600 dark:text-gray-300 list-decimal list-inside space-y-1">
                <li>Tap the share button <Share className="h-4 w-4 inline" /></li>
                <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                <li>Tap &quot;Add&quot; to install</li>
              </ol>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Install this app for a better experience with offline support and quick access.
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowPrompt(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!iosSafari && deferredPrompt && (
        <div className="mt-4 flex justify-end gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrompt(false)}
          >
            Not now
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleInstall}
            className="bg-[#4CAF50] hover:bg-[#43A047]"
          >
            Install Now
          </Button>
        </div>
      )}
    </div>
  )
}
