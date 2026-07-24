/**
 * OfflineStore.ts
 * Manages local persistence for student progress using IndexedDB.
 */

const DB_NAME = 'AfterSchoolTech_OfflineStore';
const DB_VERSION = 1;
const INTERACTION_STORE = 'interactions';
const SYNC_QUEUE_STORE = 'syncQueue';

export interface OfflineInteraction {
    id: string; // userId_lessonId
    lessonId: string;
    userId: string;
    data: any;
    lastUpdated: number;
    synced: boolean;
}

export interface SyncTask {
    id?: number;
    lessonId: string;
    userId: string;
    timestamp: number;
    data: any;
}

class OfflineStore {
    private db: IDBDatabase | null = null;
    private initPromise: Promise<void> | null = null;

    async init(): Promise<void> {
        if (this.db) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(INTERACTION_STORE)) {
                    const store = db.createObjectStore(INTERACTION_STORE, { keyPath: 'id' });
                    store.createIndex('lesson_user', ['lessonId', 'userId'], { unique: true });
                }
                if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
                    db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = (event: any) => {
                this.db = event.target.result;
                resolve();
            };

            request.onerror = (event: any) => {
                console.error('OfflineStore: Database error', event.target.error);
                reject(event.target.error);
            };
        });

        return this.initPromise;
    }

    private async createTransaction(storeNames: string | string[], mode: IDBTransactionMode) {
        await this.init();
        if (!this.db) throw new Error('OfflineStore: Database not initialized');
        const transaction = this.db.transaction(storeNames, mode);
        return {
            transaction,
            store: (name: string) => transaction.objectStore(name)
        };
    }

    // --- Interaction Persistence ---

    async saveInteraction(userId: string, lessonId: string, data: any, synced: boolean = false): Promise<void> {
        const id = `${userId}_${lessonId}`;
        const { transaction, store } = await this.createTransaction(INTERACTION_STORE, 'readwrite');
        const s = store(INTERACTION_STORE);

        return new Promise((resolve, reject) => {
            const request = s.put({
                id,
                userId,
                lessonId,
                data,
                lastUpdated: Date.now(),
                synced
            });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getInteraction(userId: string, lessonId: string): Promise<OfflineInteraction | null> {
        const id = `${userId}_${lessonId}`;
        const { transaction, store } = await this.createTransaction(INTERACTION_STORE, 'readonly');
        const s = store(INTERACTION_STORE);

        return new Promise((resolve, reject) => {
            const request = s.get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    // --- Sync Queue Management ---

    async queueSyncTask(userId: string, lessonId: string, data: any): Promise<number> {
        const { transaction, store } = await this.createTransaction(SYNC_QUEUE_STORE, 'readwrite');
        const s = store(SYNC_QUEUE_STORE);

        return new Promise((resolve, reject) => {
            const request = s.add({
                userId,
                lessonId,
                data,
                timestamp: Date.now()
            });
            request.onsuccess = () => resolve(request.result as number);
            request.onerror = () => reject(request.error);
        });
    }

    async getSyncQueue(): Promise<SyncTask[]> {
        const { transaction, store } = await this.createTransaction(SYNC_QUEUE_STORE, 'readonly');
        const s = store(SYNC_QUEUE_STORE);

        return new Promise((resolve, reject) => {
            const request = s.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async removeSyncTask(id: number): Promise<void> {
        const { transaction, store } = await this.createTransaction(SYNC_QUEUE_STORE, 'readwrite');
        const s = store(SYNC_QUEUE_STORE);

        return new Promise((resolve, reject) => {
            const request = s.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clears specific tasks from the queue in a single transaction.
     */
    async clearQueueByLesson(userId: string, lessonId: string, maxTimestamp: number): Promise<void> {
        const { transaction, store } = await this.createTransaction(SYNC_QUEUE_STORE, 'readwrite');
        const s = store(SYNC_QUEUE_STORE);

        return new Promise((resolve, reject) => {
            const getAllRequest = s.getAll();

            getAllRequest.onsuccess = () => {
                const tasks = getAllRequest.result as SyncTask[];
                const tasksToDelete = tasks.filter(t =>
                    t.userId === userId &&
                    t.lessonId === lessonId &&
                    t.timestamp <= maxTimestamp
                );

                for (const task of tasksToDelete) {
                    if (task.id !== undefined) {
                        s.delete(task.id);
                    }
                }

                // We resolve when the whole transaction completes
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            };

            getAllRequest.onerror = () => reject(getAllRequest.error);
        });
    }
}

export const offlineStore = new OfflineStore();
