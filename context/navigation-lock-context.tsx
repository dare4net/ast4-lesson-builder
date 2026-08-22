"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

interface NavigationLockContextType {
    isLocked: boolean
    setLocked: (locked: boolean) => void
    registerLock: (id: string) => void
    unregisterLock: (id: string) => void
}

const NavigationLockContext = createContext<NavigationLockContextType | undefined>(undefined)

export function NavigationLockProvider({ children }: { children: React.ReactNode }) {
    // We use a set of IDs to allow multiple components to request locks simultaneously
    const [activeLocks, setActiveLocks] = useState<Set<string>>(new Set())

    const registerLock = useCallback((id: string) => {
        setActiveLocks((prev) => {
            if (prev.has(id)) return prev
            const newSet = new Set(prev)
            newSet.add(id)
            return newSet
        })
    }, [])

    const unregisterLock = useCallback((id: string) => {
        setActiveLocks((prev) => {
            if (!prev.has(id)) return prev
            const newSet = new Set(prev)
            newSet.delete(id)
            return newSet
        })
    }, [])

    // Simple setter for single-source locking if needed, but registry is preferred
    const setLocked = useCallback((locked: boolean) => {
        if (locked) {
            registerLock("global-override")
        } else {
            unregisterLock("global-override")
        }
    }, [registerLock, unregisterLock])

    const isLocked = activeLocks.size > 0

    const value = React.useMemo(() => ({
        isLocked,
        setLocked,
        registerLock,
        unregisterLock
    }), [isLocked, setLocked, registerLock, unregisterLock])

    return (
        <NavigationLockContext.Provider value={value}>
            {children}
        </NavigationLockContext.Provider>
    )
}

export function useNavigationLock() {
    const context = useContext(NavigationLockContext)
    if (context === undefined) {
        throw new Error("useNavigationLock must be used within a NavigationLockProvider")
    }
    return context
}
