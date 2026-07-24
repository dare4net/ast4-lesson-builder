const DB_NAME = 'ast_offline_db';
const DB_VERSION = 2; // Incremented for new project

export const STORES = {
    LESSONS: 'lessons',
    USER_PROGRESS: 'user_progress',
    CACHED_RESPONSES: 'cached_responses',
    FEEDBACKS: 'feedbacks',
    PROGRAMS: 'programs'
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') return;

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains(STORES.LESSONS)) {
                const lessonStore = db.createObjectStore(STORES.LESSONS, { keyPath: 'id' });
                lessonStore.createIndex('moduleId', 'moduleId', { unique: false });
                lessonStore.createIndex('programId', 'programId', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORES.USER_PROGRESS)) {
                const progressStore = db.createObjectStore(STORES.USER_PROGRESS, { keyPath: 'lessonId' });
                progressStore.createIndex('userId', 'userId', { unique: false });
                progressStore.createIndex('timestamp', 'timestamp', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORES.CACHED_RESPONSES)) {
                const cacheStore = db.createObjectStore(STORES.CACHED_RESPONSES, { keyPath: 'url' });
                cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORES.FEEDBACKS)) {
                const feedbackStore = db.createObjectStore(STORES.FEEDBACKS, { keyPath: '_id' });
                feedbackStore.createIndex('userId', 'userId', { unique: false });
                feedbackStore.createIndex('category', 'category', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORES.PROGRAMS)) {
                const programStore = db.createObjectStore(STORES.PROGRAMS, { keyPath: '_id' });
                programStore.createIndex('status', 'status', { unique: false });
            }
        };
    });
};

export const idb = {
    async set(storeName: StoreName, data: any): Promise<IDBValidKey> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            transaction.oncomplete = () => db.close();
        });
    },

    async get(storeName: StoreName, key: IDBValidKey): Promise<any> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            transaction.oncomplete = () => db.close();
        });
    },

    async getAll(storeName: StoreName): Promise<any[]> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            transaction.oncomplete = () => db.close();
        });
    },

    async delete(storeName: StoreName, key: IDBValidKey): Promise<void> {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
            transaction.oncomplete = () => db.close();
        });
    },

    async cacheResponse(url: string, data: any, ttl = 3600000) {
        await this.set(STORES.CACHED_RESPONSES, {
            url,
            data,
            timestamp: Date.now(),
            ttl
        });
    },

    async getCachedResponse(url: string): Promise<any> {
        const cached = await this.get(STORES.CACHED_RESPONSES, url);
        if (!cached) return null;

        if (Date.now() - cached.timestamp > cached.ttl) {
            await this.delete(STORES.CACHED_RESPONSES, url);
            return null;
        }

        return cached.data;
    },

    async bulkAdd(storeName: StoreName, items: any[]): Promise<{ success: number; errors: any[] }> {
        const db = await initDB();
        return new Promise((resolve) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            let completed = 0;
            const errors: any[] = [];

            items.forEach((item) => {
                const request = store.put(item);
                request.onsuccess = () => {
                    completed++;
                    if (completed === items.length) resolve({ success: completed - errors.length, errors });
                };
                request.onerror = (error: any) => {
                    errors.push({ item, error: error.target.error });
                    completed++;
                    if (completed === items.length) resolve({ success: completed - errors.length, errors });
                };
            });

            transaction.oncomplete = () => db.close();
        });
    }
};
