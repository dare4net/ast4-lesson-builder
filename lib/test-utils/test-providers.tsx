'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NavigationLockProvider } from '@/context/navigation-lock-context'
import { ScoringProvider } from '@/context/scoring-context'
import { FeedbackProvider } from '@/lib/feedback-context'
import { LivePowerupsProvider } from '@/context/live-powerups-context'

export function RendererTestProviders({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    return (
        <QueryClientProvider client={queryClient}>
            <FeedbackProvider>
                <NavigationLockProvider>
                    <ScoringProvider lesson={null}>
                        <LivePowerupsProvider>
                            {children}
                        </LivePowerupsProvider>
                    </ScoringProvider>
                </NavigationLockProvider>
            </FeedbackProvider>
        </QueryClientProvider>
    )
}
