"use client";

import { useEffect, useState, useCallback } from "react";

const CACHE_NAME = "ast-lesson-media-v1";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour max TTL

interface UseLessonPreloaderOptions {
    lessonData?: any;
    enabled?: boolean;
}

interface PreloadStatus {
    isPreloading: boolean;
    progress: number; // 0 - 100
    preloadedCount: number;
    totalCount: number;
    error: string | null;
}

/** Helper to check if a URL is valid and absolute or relative asset */
function isValidAssetUrl(url: any): url is string {
    if (typeof url !== "string" || !url.trim()) return false;
    const trimmed = url.trim();
    if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return false;
    return (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("/")
    );
}

/** Helper to extract all media asset URLs (images & audios) from a lesson JSON */
export function extractLessonMediaUrls(lesson: any): { images: string[]; audios: string[] } {
    const imagesSet = new Set<string>();
    const audiosSet = new Set<string>();

    if (!lesson || !Array.isArray(lesson.slides)) {
        return { images: [], audios: [] };
    }

    if (isValidAssetUrl(lesson.introAudioUrl)) {
        audiosSet.add(lesson.introAudioUrl);
    }

    lesson.slides.forEach((slide: any) => {
        if (isValidAssetUrl(slide.titleAudioUrl)) {
            audiosSet.add(slide.titleAudioUrl);
        }

        const components = slide.components || [];
        components.forEach((comp: any) => {
            const props = comp.props || {};

            // Extract image URLs
            [
                props.src,
                props.poster,
                props.imageUrl,
                props.image,
                props.backgroundUrl,
                props.thumbnail,
            ].forEach((url) => {
                if (isValidAssetUrl(url) && !url.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
                    imagesSet.add(url);
                }
            });

            // Extract audio URLs
            [
                props.audioUrl,
                props.readAloudUrl,
                props.soundUrl,
                props.titleAudioUrl,
            ].forEach((url) => {
                if (isValidAssetUrl(url)) {
                    audiosSet.add(url);
                }
            });

            // Extract array items with images (e.g. hotspots, flashcards, clickable images)
            if (Array.isArray(props.hotspots)) {
                props.hotspots.forEach((h: any) => {
                    if (isValidAssetUrl(h.imageUrl)) imagesSet.add(h.imageUrl);
                    if (isValidAssetUrl(h.audioUrl)) audiosSet.add(h.audioUrl);
                });
            }

            if (Array.isArray(props.items)) {
                props.items.forEach((item: any) => {
                    if (isValidAssetUrl(item.imageUrl)) imagesSet.add(item.imageUrl);
                    if (isValidAssetUrl(item.image)) imagesSet.add(item.image);
                    if (isValidAssetUrl(item.audioUrl)) audiosSet.add(item.audioUrl);
                });
            }

            if (Array.isArray(props.cards)) {
                props.cards.forEach((card: any) => {
                    if (isValidAssetUrl(card.imageUrl)) imagesSet.add(card.imageUrl);
                    if (isValidAssetUrl(card.image)) imagesSet.add(card.image);
                });
            }
        });
    });

    return {
        images: Array.from(imagesSet),
        audios: Array.from(audiosSet),
    };
}

/** Hook for preloading & caching lesson resources with 1-hour TTL */
export function useLessonPreloader({ lessonData, enabled = true }: UseLessonPreloaderOptions): PreloadStatus {
    const [status, setStatus] = useState<PreloadStatus>({
        isPreloading: false,
        progress: 0,
        preloadedCount: 0,
        totalCount: 0,
        error: null,
    });

    const preloadAsset = useCallback(async (url: string, type: "image" | "audio", cache: Cache | null) => {
        const timestampKey = `ast_cache_ts_${url}`;
        const lastCached = typeof window !== "undefined" ? localStorage.getItem(timestampKey) : null;
        const now = Date.now();

        // If cached within TTL AND exists in cache, skip re-fetch
        if (lastCached && now - parseInt(lastCached, 10) < CACHE_TTL_MS) {
            if (cache) {
                const match = await cache.match(url);
                if (match) return;
            } else {
                return;
            }
        }

        try {
            // Fetch into Cache API if supported
            if (cache) {
                const response = await fetch(url, { mode: "cors" });
                if (response.ok) {
                    await cache.put(url, response);
                    localStorage.setItem(timestampKey, now.toString());
                    return;
                }
            }

            // Fallback to DOM preloading
            if (type === "image") {
                await new Promise<void>((resolve) => {
                    const img = new Image();
                    img.onload = () => resolve();
                    img.onerror = () => resolve(); // Non-blocking on image failure
                    img.src = url;
                });
            } else {
                await new Promise<void>((resolve) => {
                    const audio = new Audio();
                    audio.oncanplaythrough = () => resolve();
                    audio.onerror = () => resolve(); // Non-blocking on audio failure
                    audio.src = url;
                    audio.load();
                });
            }

            localStorage.setItem(timestampKey, now.toString());
        } catch {
            // Ignore individual preloading errors to ensure lesson flow continues smoothly
        }
    }, []);

    useEffect(() => {
        if (!enabled || !lessonData) {
            return;
        }

        let isCancelled = false;

        const runPreloader = async () => {
            const { images, audios } = extractLessonMediaUrls(lessonData);
            const allAssets = [
                ...images.map((url) => ({ url, type: "image" as const })),
                ...audios.map((url) => ({ url, type: "audio" as const })),
            ];

            const total = allAssets.length;
            if (total === 0) {
                setStatus({
                    isPreloading: false,
                    progress: 100,
                    preloadedCount: 0,
                    totalCount: 0,
                    error: null,
                });
                return;
            }

            setStatus({
                isPreloading: true,
                progress: 0,
                preloadedCount: 0,
                totalCount: total,
                error: null,
            });

            let cache: Cache | null = null;
            if (typeof window !== "undefined" && "caches" in window) {
                try {
                    cache = await window.caches.open(CACHE_NAME);
                } catch {
                    cache = null;
                }
            }

            let loaded = 0;
            // Preload in batches of 4 for optimal performance
            const batchSize = 4;
            for (let i = 0; i < allAssets.length; i += batchSize) {
                if (isCancelled) break;
                const batch = allAssets.slice(i, i + batchSize);
                await Promise.all(batch.map((asset) => preloadAsset(asset.url, asset.type, cache)));
                loaded += batch.length;

                if (!isCancelled) {
                    setStatus({
                        isPreloading: loaded < total,
                        progress: Math.min(100, Math.round((loaded / total) * 100)),
                        preloadedCount: loaded,
                        totalCount: total,
                        error: null,
                    });
                }
            }
        };

        runPreloader();

        return () => {
            isCancelled = true;
        };
    }, [lessonData, enabled, preloadAsset]);

    return status;
}
