/**
 * SyncEngine.ts
 * Core logic for offline queue management and background synchronization.
 */

import { offlineStore, SyncTask } from './offline-store';
import { saveUserInteraction as apiSaveInteraction } from './user-interactions';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

class SyncEngine {
    private isSyncing = false;
    private lastSyncTime: number | null = null;
    private statusListeners: ((status: SyncStatus, lastSync: number | null, error: string | null) => void)[] = [];
    private currentStatus: SyncStatus = 'synced';
    private errorDetails: string | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.sync());
            window.addEventListener('offline', () => this.setStatus('offline'));
            this.currentStatus = navigator.onLine ? 'synced' : 'offline';

            // Periodic heartbeat sync every 60 seconds just in case
            setInterval(() => {
                if (navigator.onLine && !this.isSyncing && this.currentStatus !== 'error') {
                    this.sync();
                }
            }, 60000);
        }
    }

    // --- Status Management ---

    private setStatus(status: SyncStatus, error: string | null = null) {
        this.currentStatus = status;
        this.errorDetails = error;
        this.notifyListeners();
    }

    subscribe(callback: (status: SyncStatus, lastSync: number | null, error: string | null) => void) {
        this.statusListeners.push(callback as any);
        callback(this.currentStatus, this.lastSyncTime, this.errorDetails);
        return () => {
            this.statusListeners = this.statusListeners.filter(l => l !== callback);
        };
    }

    private notifyListeners() {
        this.statusListeners.forEach(l => (l as any)(this.currentStatus, this.lastSyncTime, this.errorDetails));
    }

    getStatus() {
        return { status: this.currentStatus, lastSync: this.lastSyncTime, error: this.errorDetails };
    }

    // --- Main Operations ---

    /**
     * Primary entry point for saving data.
     * Updates local store and queues for background sync.
     */
    async save(userId: string, lessonId: string, data: any) {
        if (!userId || !lessonId) return;

        console.log(`[SyncEngine] Saving interaction for ${lessonId}`);
        // 1. Update local storage immediately for instant UI responsiveness
        await offlineStore.saveInteraction(userId, lessonId, data, false);

        // 2. Queue for background sync
        await offlineStore.queueSyncTask(userId, lessonId, data);

        // 3. Trigger sync if online
        if (navigator.onLine) {
            this.sync();
        } else {
            this.setStatus('offline');
        }
    }

    /**
     * Processes the sync queue exhaustively with deduplication and error resilience.
     */
    async sync() {
        if (this.isSyncing || !navigator.onLine) return;

        this.isSyncing = true;
        this.setStatus('syncing');

        try {
            while (true) {
                if (!navigator.onLine) break;

                const queue = await offlineStore.getSyncQueue();
                if (queue.length === 0) break;

                // Deduplicate: Only sync the LATEST state for each unique userId+lessonId
                const taskMap = new Map<string, SyncTask>();
                for (const task of queue) {
                    const key = `${task.userId}_${task.lessonId}`;
                    taskMap.set(key, task);
                }

                console.log(`[SyncEngine] Compacting queue: ${queue.length} tasks -> ${taskMap.size} unique targets`);

                let cycleHasError = false;
                let lastErrorMessage = null;

                // Process unique tasks
                for (const [key, task] of taskMap.entries()) {
                    if (!navigator.onLine) break;

                    try {
                        console.log(`[SyncEngine] Pushing state to server for ${task.lessonId}`);
                        const { success, error } = await apiSaveInteraction(task.userId, task.lessonId, task.data);

                        if (success) {
                            // Successfully synced! Clear the queue for this lesson up to this update
                            await offlineStore.clearQueueByLesson(task.userId, task.lessonId, task.timestamp);
                            // Also mark the interaction as synced in the local store
                            await offlineStore.saveInteraction(task.userId, task.lessonId, task.data, true);
                        } else {
                            lastErrorMessage = error || 'Server rejected update';
                            console.warn(`[SyncEngine] Server rejected update for ${task.lessonId}: ${lastErrorMessage}. Will retry in next cycle.`);
                            cycleHasError = true;
                        }
                    } catch (pushErr: any) {
                        lastErrorMessage = pushErr.message || 'Network failure';
                        console.error(`[SyncEngine] Individual task push failed for ${task.lessonId}:`, pushErr);
                        cycleHasError = true;
                        // Continue to other tasks even if one fails
                    }
                }

                // If we're still online and might have had concurrent additions, loop again
                // unless we had errors in this cycle, in which case we stop to prevent infinite fast-retries
                if (navigator.onLine && !cycleHasError) {
                    const remainingQueue = await offlineStore.getSyncQueue();
                    if (remainingQueue.length === 0) break;
                    await new Promise(r => setTimeout(r, 500)); // Brief pause before next cycle
                } else {
                    if (cycleHasError) {
                        this.setStatus('error', lastErrorMessage || 'One or more tasks failed to sync. Check network/payload.');
                    }
                    break;
                }
            }

            this.lastSyncTime = Date.now();
            if (this.currentStatus !== 'error') {
                this.setStatus(navigator.onLine ? 'synced' : 'offline');
            }
        } catch (err: any) {
            console.error('[SyncEngine] Critical terminal sync failure:', err);
            this.setStatus('error', err.message || 'Critical sync failure');
        } finally {
            this.isSyncing = false;
            this.notifyListeners();
        }
    }

    /**
     * Force a sync operation immediately.
     */
    async forceSync() {
        if (navigator.onLine) {
            await this.sync();
        }
    }

    /**
     * Retrieves the most recent state for a lesson.
     */
    async getLatestState(userId: string, lessonId: string, serverData: any) {
        if (!userId || !lessonId) return serverData;

        try {
            const local = await offlineStore.getInteraction(userId, lessonId);

            // Server timestamp could be 'lastUpdated' or 'updatedAt'
            const serverTime = serverData?.lastUpdated ? new Date(serverData.lastUpdated).getTime() :
                (serverData?.updatedAt ? new Date(serverData.updatedAt).getTime() : 0);

            const localTime = local?.lastUpdated || 0;

            console.log(`[SyncEngine] Reconciliation for ${lessonId}:`, {
                localTime: new Date(localTime).toISOString(),
                serverTime: new Date(serverTime).toISOString(),
                useLocal: localTime > serverTime ? 'local is newer' : (localTime < serverTime ? 'server is newer' : 'timestamps are equal')
            });

            // Use local if it's strictly newer
            if (local && (!serverData || localTime > serverTime)) {
                return local.data;
            }
        } catch (err) {
            console.error('[SyncEngine] Error retrieving latest local state:', err);
        }

        return serverData;
    }
}

export const syncEngine = new SyncEngine();
