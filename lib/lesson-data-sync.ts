import { idb } from './indexed-db';

interface SyncOptions<T> {
    cacheKey: string;
    fetcher: () => Promise<T>;
    compare?: (newData: T, cachedData: T | null) => boolean;
    setData?: (data: T) => void;
    setLoading?: (loading: boolean) => void;
    setError?: (error: string | null) => void;
    ttl?: number;
}

async function staleWhileRevalidateSync<T>({
    cacheKey,
    fetcher,
    compare,
    setData,
    setLoading,
    setError,
    ttl = 604800000 // 7 days
}: SyncOptions<T>) {
    try {
        const cachedData = await idb.getCachedResponse(cacheKey);

        if (cachedData) {
            setData?.(cachedData);
            setError?.(null);
            setLoading?.(false);
        }

        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            setLoading?.(false);
            return cachedData;
        }

        const freshData = await fetcher();
        const hasChanged = compare ? compare(freshData, cachedData) : true;

        if (hasChanged) {
            await idb.cacheResponse(cacheKey, freshData, ttl);
            setData?.(freshData);
        }

        setLoading?.(false);
        setError?.(null);
        return freshData;
    } catch (err: any) {
        console.error(`[${cacheKey}] Sync failed:`, err);
        setError?.(err.message || 'Failed to sync data');
        setLoading?.(false);
        return null;
    }
}

function hasLessonDataChanged(newData: any, cachedData: any) {
    if (!cachedData || !newData) return true;
    if (!Array.isArray(newData) || !Array.isArray(cachedData)) return true;
    if (newData.length !== cachedData.length) return true;

    return newData.some((lesson: any, index: number) => {
        const cached = cachedData[index];
        return (
            lesson.lessonId !== cached.lessonId ||
            lesson.progress !== cached.progress ||
            lesson.thumbnail !== cached.thumbnail ||
            lesson.lastUpdated !== cached.lastUpdated ||
            JSON.stringify(lesson.lessonState) !== JSON.stringify(cached.lessonState)
        );
    });
}

export async function lessonsListSync({
    userId,
    token,
    setLessons,
    setLoading,
    setError
}: {
    userId: string;
    token: string;
    setLessons: (lessons: any[]) => void;
    setLoading?: (loading: boolean) => void;
    setError?: (error: string | null) => void;
}) {
    if (!userId || !token) return;

    return staleWhileRevalidateSync<any[]>({
        cacheKey: `lessons_list_${userId}`,
        fetcher: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/lessons/my/interactions/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 404) return [];
            if (!res.ok) throw new Error('Failed to fetch lesson list');
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        compare: hasLessonDataChanged,
        setData: setLessons,
        setLoading,
        setError,
    });
}
