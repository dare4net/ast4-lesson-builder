import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Inter } from "next/font/google"
import { FeedbackProvider } from "@/lib/feedback-context"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { AuthProvider } from "@/context/auth-context"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Afterschool Interactive Learning Environment",
  description: "The official interactive learning platform for Afterschool Tech",
  generator: "AST",
  manifest: "/manifest.json",
  themeColor: "#4CAF50",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AST Builder" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#4CAF50" />
        <script src="/register-sw.js" defer></script>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <FeedbackProvider>
              {children}
              <Toaster />
              <PWAInstallPrompt />
            </FeedbackProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
