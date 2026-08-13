"use client";

import { useEffect, useState } from "react";
import { extractYouTubeVideoId } from "@/components/renderers/video-renderer";

const CACHE_NAME = "ast-lesson-media-v1";
const CACHE_TTL_MS = 60 * 60 * 1000;

type AssetType = "image" | "audio" | "video";

interface MediaAsset {
    url: string;
    type: AssetType;
}

interface PreloadStatus {
    isPreloading: boolean;
    progress: number;
    preloadedCount: number;
    totalCount: number;
    error: string | null;
}

interface UseLessonPreloaderOptions {
    lessonData?: any;
    enabled?: boolean;
}

interface PreloadSession {
    lessonId: string;
    abortController: AbortController;
    status: PreloadStatus;
    listeners: Set<() => void>;
    running: boolean;
    needsRerun: boolean;
}

const completedUrls = new Set<string>();
const sessions = new Map<string, PreloadSession>();

const EMPTY_STATUS: PreloadStatus = {
    isPreloading: false,
    progress: 0,
    preloadedCount: 0,
    totalCount: 0,
    error: null,
};

function isValidAssetUrl(url: unknown): url is string {
    if (typeof url !== "string" || !url.trim()) return false;
    const trimmed = url.trim();
    if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return false;
    return (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("/")
    );
}

function isAudioExtension(url: string): boolean {
    return /\.(mp3|wav|ogg|m4a|aac|flac)(\?|#|$)/i.test(url);
}

function isVideoExtension(url: string): boolean {
    return /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(url);
}

function classifyUrl(url: string): AssetType {
    if (isAudioExtension(url)) return "audio";
    if (isVideoExtension(url)) return "video";
    return "image";
}

function addUrl(
    url: unknown,
    images: Set<string>,
    audios: Set<string>,
    videos: Set<string>,
    forceType?: AssetType
) {
    if (!isValidAssetUrl(url)) return;
    const type = forceType ?? classifyUrl(url);
    if (type === "audio") audios.add(url);
    else if (type === "video") videos.add(url);
    else images.add(url);
}

function walkMediaNode(
    node: unknown,
    images: Set<string>,
    audios: Set<string>,
    videos: Set<string>,
    depth = 0
) {
    if (node == null || depth > 12) return;

    if (typeof node === "string") {
        if (isValidAssetUrl(node)) addUrl(node, images, audios, videos);
        return;
    }

    if (Array.isArray(node)) {
        node.forEach((item) => walkMediaNode(item, images, audios, videos, depth + 1));
        return;
    }

    if (typeof node !== "object") return;

    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
        if (
            key === "audioUrl" ||
            key === "readAloudUrl" ||
            key === "soundUrl" ||
            key === "titleAudioUrl" ||
            key === "introAudioUrl" ||
            key.endsWith("AudioUrl")
        ) {
            addUrl(value, images, audios, videos, "audio");
            continue;
        }

        if (key === "url" || key === "src" || key === "videoUrl") {
            if (typeof value === "string" && isValidAssetUrl(value)) {
                const ytId = extractYouTubeVideoId(value);
                if (ytId) {
                    images.add(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
                } else {
                    addUrl(value, images, audios, videos);
                }
            }
            continue;
        }

        if (
            key === "poster" ||
            key === "imageUrl" ||
            key === "image" ||
            key === "backgroundUrl" ||
            key === "thumbnail"
        ) {
            addUrl(value, images, audios, videos, "image");
            continue;
        }

        walkMediaNode(value, images, audios, videos, depth + 1);
    }
}

export function extractLessonMediaUrls(lesson: any): { images: string[]; audios: string[]; videos: string[] } {
    const images = new Set<string>();
    const audios = new Set<string>();
    const videos = new Set<string>();

    if (!lesson) {
        return { images: [], audios: [], videos: [] };
    }

    walkMediaNode(lesson, images, audios, videos);

    lesson.slides?.forEach((slide: any) => {
        slide.components?.forEach((comp: any) => {
            if (comp.type !== "video") return;
            const link = comp.props?.url || comp.props?.src;
            const videoId = extractYouTubeVideoId(link);
            if (videoId) {
                images.add(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
                if (comp.props?.poster && isValidAssetUrl(comp.props.poster)) {
                    images.add(comp.props.poster);
                }
            }
        });
    });

    return {
        images: Array.from(images),
        audios: Array.from(audios),
        videos: Array.from(videos),
    };
}

function buildAssetList(lesson: any): MediaAsset[] {
    const { images, audios, videos } = extractLessonMediaUrls(lesson);
    return [
        ...images.map((url) => ({ url, type: "image" as const })),
        ...audios.map((url) => ({ url, type: "audio" as const })),
        ...videos.map((url) => ({ url, type: "video" as const })),
    ];
}

function notifySession(session: PreloadSession) {
    session.listeners.forEach((listener) => listener());
}

function updateSessionStatus(session: PreloadSession, patch: Partial<PreloadStatus>) {
    session.status = { ...session.status, ...patch };
    notifySession(session);
}

async function preloadAsset(
    url: string,
    type: AssetType,
    cache: Cache | null,
    signal: AbortSignal
): Promise<void> {
    if (signal.aborted || completedUrls.has(url)) return;

    const timestampKey = `ast_cache_ts_${url}`;
    const lastCached = typeof window !== "undefined" ? localStorage.getItem(timestampKey) : null;
    const now = Date.now();

    if (lastCached && now - parseInt(lastCached, 10) < CACHE_TTL_MS) {
        if (cache) {
            const match = await cache.match(url);
            if (match) {
                completedUrls.add(url);
                return;
            }
        } else {
            completedUrls.add(url);
            return;
        }
    }

    if (signal.aborted) return;

    try {
        if (cache) {
            const response = await fetch(url, { mode: "cors", signal });
            if (response.ok) {
                await cache.put(url, response);
                localStorage.setItem(timestampKey, now.toString());
                completedUrls.add(url);
                return;
            }
        }

        if (signal.aborted) return;

        if (type === "image") {
            await new Promise<void>((resolve) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => resolve();
                img.src = url;
            });
        } else {
            await new Promise<void>((resolve) => {
                const media = document.createElement(type === "video" ? "video" : "audio");
                media.preload = "auto";
                const done = () => resolve();
                media.oncanplaythrough = done;
                media.onloadeddata = done;
                media.onerror = done;
                media.src = url;
                media.load();
            });
        }

        localStorage.setItem(timestampKey, now.toString());
        completedUrls.add(url);
    } catch {
        // Keep going — one failed asset must not block the rest
    }
}

async function runPreloadSession(lesson: any, session: PreloadSession) {
    if (session.running) {
        session.needsRerun = true;
        return;
    }

    session.running = true;

    do {
        session.needsRerun = false;

        const allAssets = buildAssetList(lesson);
        const pending = allAssets.filter((asset) => !completedUrls.has(asset.url));
        const total = allAssets.length;

        if (total === 0) {
            updateSessionStatus(session, {
                isPreloading: false,
                progress: 100,
                preloadedCount: 0,
                totalCount: 0,
                error: null,
            });
            break;
        }

        updateSessionStatus(session, {
            isPreloading: pending.length > 0,
            progress: Math.min(100, Math.round(((total - pending.length) / total) * 100)),
            preloadedCount: total - pending.length,
            totalCount: total,
            error: null,
        });

        if (pending.length === 0) break;

        let cache: Cache | null = null;
        if (typeof window !== "undefined" && "caches" in window) {
            try {
                cache = await window.caches.open(CACHE_NAME);
            } catch {
                cache = null;
            }
        }

        const batchSize = 4;
        let loaded = total - pending.length;

        for (let i = 0; i < pending.length; i += batchSize) {
            if (session.abortController.signal.aborted) break;

            const batch = pending.slice(i, i + batchSize);
            await Promise.all(
                batch.map((asset) =>
                    preloadAsset(asset.url, asset.type, cache, session.abortController.signal)
                )
            );

            loaded = Math.min(total, loaded + batch.length);
            updateSessionStatus(session, {
                isPreloading: loaded < total,
                progress: Math.min(100, Math.round((loaded / total) * 100)),
                preloadedCount: loaded,
                totalCount: total,
                error: null,
            });
        }

        updateSessionStatus(session, {
            isPreloading: false,
            progress: 100,
            preloadedCount: total,
            totalCount: total,
            error: null,
        });
    } while (session.needsRerun && !session.abortController.signal.aborted);

    session.running = false;
}

function getOrStartSession(lesson: any): PreloadSession | null {
    const lessonId = lesson?.id;
    if (!lessonId) return null;

    let session = sessions.get(lessonId);
    if (!session) {
        session = {
            lessonId,
            abortController: new AbortController(),
            status: { ...EMPTY_STATUS },
            listeners: new Set(),
            running: false,
            needsRerun: false,
        };
        sessions.set(lessonId, session);
    }

    void runPreloadSession(lesson, session);
    return session;
}

/** Preloads lesson media in the background; continues after intro cue and across remounts */
export function useLessonPreloader({ lessonData, enabled = true }: UseLessonPreloaderOptions): PreloadStatus {
    const [status, setStatus] = useState<PreloadStatus>(EMPTY_STATUS);
    const lessonId = lessonData?.id;

    useEffect(() => {
        if (!enabled || !lessonData?.id) return;

        const session = getOrStartSession(lessonData);
        if (!session) return;

        const listener = () => setStatus({ ...session.status });
        session.listeners.add(listener);
        setStatus({ ...session.status });

        return () => {
            session.listeners.delete(listener);
            // Do not abort — preload keeps running for other subscribers or resumes later
            queueMicrotask(() => {
                const active = sessions.get(lessonData.id);
                if (active && active.listeners.size === 0) {
                    active.abortController.abort();
                    sessions.delete(lessonData.id);
                }
            });
        };
    }, [enabled, lessonData, lessonId]);

    return status;
}
