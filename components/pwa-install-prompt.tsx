"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { X, Download, Share } from "lucide-react"

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installable, setInstallable] = useState(false)

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    setIsIOS(isIOSDevice)
    console.log("Is iOS device:", isIOSDevice)
    console.log("Is Safari:", isSafari)

    // Check if running in standalone mode
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || 
                        (window.navigator as any).standalone || 
                        document.referrer.includes("android-app://")
    console.log("Is standalone:", isStandalone)

    if (isStandalone) {
      console.log("App is already installed")
      return
    }

    // Show prompt immediately for iOS Safari
    if (isIOSDevice && isSafari) {
      console.log("Showing iOS Safari install instructions")
      setShowPrompt(true)
      return
    }

    // For other browsers, show prompt after a delay
    const timer = setTimeout(() => {
      if (!isStandalone && !deferredPrompt) {
        console.log("Showing default install prompt")
        setShowPrompt(true)
      }
    }, 3000)

    // Handle PWA install prompt for other devices
    const handleInstallPrompt = (e: any) => {
      console.log("Install prompt event fired")
      console.log("Browser supports PWA installation")
      e.preventDefault()
      setDeferredPrompt(e)
      setInstallable(true)
      setShowPrompt(true)
    }
    
    console.log("Setting up beforeinstallprompt listener")
    window.addEventListener("beforeinstallprompt", handleInstallPrompt)
    
    // Log if browser doesn't support installation
    if (!('BeforeInstallPromptEvent' in window)) {
      console.log("Browser doesn't support PWA installation")
    }

    return () => {
      clearTimeout(timer)
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log('Install prompt outcome:', outcome)

      if (outcome === "accepted") {
        setShowPrompt(false)
      }
    } catch (error) {
      console.error('Error during installation:', error)
    }

    setDeferredPrompt(null)
    setInstallable(false)
  }

  if (!showPrompt) return null

  const isIOSSafari = isIOS && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-[400px] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            {isIOSSafari ? <Share className="h-5 w-5" /> : <Download className="h-5 w-5" />}
            Install App
          </h3>
          {isIOSSafari ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                To install this app on your iOS device:
              </p>
              <ol className="text-sm text-gray-600 dark:text-gray-300 list-decimal list-inside space-y-1">
                <li>Tap the share button <Share className="h-4 w-4 inline" /></li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to install</li>
              </ol>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Install this app for a better experience with offline support and quick access
              </p>
              {!installable && (
                <p className="text-xs text-gray-500 mt-2">
                  Tip: Use Chrome or Edge for the best installation experience
                </p>
              )}
            </div>
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
      
      {!isIOSSafari && (
        <div className="mt-4 flex justify-end gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrompt(false)}
          >
            Not now
          </Button>
          {installable ? (
            <Button
              variant="default"
              size="sm"
              onClick={handleInstall}
              className="bg-[#4CAF50] hover:bg-[#43A047]"
            >
              Install Now
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => window.open('https://www.google.com/chrome/', '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Get Chrome
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
