/**
 * SyncStatusHUD.tsx
 * A sleek status indicator for the viewer terminal showing sync state and connection.
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
                setLastSyncText(`Last sync: ${formatDistanceToNow(lastSync)} ago`);
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
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md shadow-lg transition-all">
            {/* Icon Section */}
            <div className="flex items-center justify-center">
                {status === 'synced' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                {status === 'syncing' && <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                {status === 'offline' && <CloudOff className="w-3.5 h-3.5 text-rose-500" />}
                {status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
            </div>

            {/* Text Section */}
            <div className="flex flex-col">
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest leading-tight",
                    status === 'synced' && "text-emerald-500",
                    status === 'syncing' && "text-blue-400",
                    status === 'offline' && "text-rose-500",
                    status === 'error' && "text-rose-400"
                )}>
                    {status === 'synced' && "Operational"}
                    {status === 'syncing' && "Syncing Data"}
                    {status === 'offline' && "Offline Mode"}
                    {status === 'error' && "Sync Error"}
                </span>
                {status === 'error' && (
                    <span className="text-[8px] font-bold text-rose-400/70 uppercase tracking-wider truncate max-w-[150px]">
                        {errorMsg || "Re-synchronization required"}
                    </span>
                )}
                {lastSync && status !== 'offline' && status !== 'error' && (
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                        {lastSyncText || "Recently Synced"}
                    </span>
                )}
                {status === 'offline' && (
                    <span className="text-[8px] font-bold text-rose-500/50 uppercase tracking-wider">
                        Changes stored locally
                    </span>
                )}
            </div>

            {/* Force Sync Trigger */}
            <button
                onClick={handleForceSync}
                disabled={status === 'syncing' || status === 'offline'}
                className="ml-2 w-7 h-7 flex items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-800"
                title="Force Sync Now"
            >
                <RefreshCw className={cn("w-3 h-3", status === 'syncing' && "animate-spin")} />
            </button>
        </div>
    );
}
