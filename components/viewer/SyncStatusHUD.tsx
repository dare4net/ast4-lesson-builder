/**
 * SyncStatusHUD.tsx
 * Status indicator for the lesson viewer showing sync state and connection.
 */

import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { syncEngine, SyncStatus } from '@/lib/sync-engine';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function SyncStatusHUD() {
    const [status, setStatus] = useState<SyncStatus>('synced');
    const [lastSync, setLastSync] = useState<number | null>(null);
    const [lastSyncText, setLastSyncText] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = syncEngine.subscribe((newStatus, lastSyncTime, error) => {
            setStatus(newStatus);
            setLastSync(lastSyncTime);
            setErrorMsg(error);
        });

        const interval = setInterval(() => {
            if (lastSync) {
                setLastSyncText(`Synced ${formatDistanceToNow(lastSync)} ago`);
            }
        }, 10000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, [lastSync]);

    const handleForceSync = () => {
        syncEngine.forceSync();
    };

    return (
        <div className="flex items-center gap-3 px-3.5 py-1.5 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md shadow-sm transition-all text-xs">
            {/* Icon Section */}
            <div className="flex items-center justify-center">
                {status === 'synced' && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />}
                {status === 'syncing' && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
                {status === 'offline' && <CloudOff className="w-4 h-4 text-amber-500" />}
                {status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />}
            </div>

            {/* Text Section */}
            <div className="flex flex-col">
                <span className={cn(
                    "text-xs font-bold leading-tight",
                    status === 'synced' && "text-slate-800 dark:text-slate-200",
                    status === 'syncing' && "text-blue-600 dark:text-blue-400",
                    status === 'offline' && "text-amber-600 dark:text-amber-400",
                    status === 'error' && "text-red-600 dark:text-red-400"
                )}>
                    {status === 'synced' && "Saved online"}
                    {status === 'syncing' && "Saving..."}
                    {status === 'offline' && "Saved on device"}
                    {status === 'error' && "Sync issue"}
                </span>
                {status === 'error' && (
                    <span className="text-[11px] text-red-500/80 truncate max-w-[150px]">
                        {errorMsg || "Click to retry sync"}
                    </span>
                )}
                {lastSync && status !== 'offline' && status !== 'error' && (
                    <span className="text-[10px] text-slate-400">
                        {lastSyncText || "Just now"}
                    </span>
                )}
                {status === 'offline' && (
                    <span className="text-[10px] text-amber-500/70">
                        Will sync when reconnected
                    </span>
                )}
            </div>

            {/* Force Sync Trigger */}
            <button
                onClick={handleForceSync}
                disabled={status === 'syncing' || status === 'offline'}
                className="ml-1 w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all disabled:opacity-30"
                title="Sync now"
            >
                <RefreshCw className={cn("w-3 h-3", status === 'syncing' && "animate-spin")} />
            </button>
        </div>
    );
}
