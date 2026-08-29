import type React from "react"
import type { Metadata, Viewport } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Nunito, Lexend } from "next/font/google"
import { FeedbackProvider } from "@/lib/feedback-context"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { ErrorTrackingInit } from "@/components/error-tracking-init"
import { AuthProvider } from "@/context/auth-context"
import { QueryProvider } from "@/components/providers/query-provider"
import { GamificationProvider } from "@/context/gamification-context"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
})

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-heading",
  display: "swap",
})

export const viewport: Viewport = {
  themeColor: "#58CC02",
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "Afterschool Interactive Learning Environment",
  description: "The official interactive learning platform for Afterschool Tech",
  generator: "AST",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AST Learn",
  },
  icons: {
    icon: "/icons/icon-512x512.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${lexend.variable}`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AST Builder" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__deferredPWAInstallPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__deferredPWAInstallPrompt = e;
                window.dispatchEvent(new Event('pwa-install-available'));
              });
            `,
          }}
        />
        <script src="/register-sw.js" defer></script>
      </head>
      <body className={`${nunito.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <QueryProvider>
              <GamificationProvider>
                <FeedbackProvider>
                  {children}
                  <Toaster />
                  <PWAInstallPrompt />
                  <ErrorTrackingInit />
                </FeedbackProvider>
              </GamificationProvider>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
