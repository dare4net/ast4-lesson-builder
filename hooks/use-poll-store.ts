"use client";

import { useEffect, useState } from "react";

export type PollVotesMap = Record<string, { votes: Record<string, number>; totalVotes: number }>;

/** Extracts all poll component IDs from a lesson JSON */
export function extractPollComponentIds(lesson: any): Array<{ componentId: string }> {
    if (!lesson || !Array.isArray(lesson.slides)) return [];
    const polls: Array<{ componentId: string }> = [];
    lesson.slides.forEach((slide: any) => {
        (slide.components || []).forEach((comp: any) => {
            if (comp.type === "poll") {
                polls.push({ componentId: comp.id });
            }
        });
    });
    return polls;
}

/**
 * usePollStore — fetches all poll vote snapshots once at lesson start.
 * Returns a map of componentId -> {votes, totalVotes}.
 * Exposes `submitVote` which POSTs to /api/polls and updates the map.
 * No real-time polling — snapshot is from lesson-start time.
 */
export function usePollStore(lesson: any) {
    const lessonId = lesson?.id || "default";
    const [pollData, setPollData] = useState<PollVotesMap>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Pre-fetch all poll data once when the lesson loads (during intro cue)
    useEffect(() => {
        if (!lesson) return;
        const pollComponents = extractPollComponentIds(lesson);
        if (pollComponents.length === 0) {
            setIsLoaded(true);
            return;
        }

        let cancelled = false;

        const fetchAll = async () => {
            const results: PollVotesMap = {};

            await Promise.all(
                pollComponents.map(async ({ componentId }) => {
                    try {
                        const res = await fetch(
                            `/api/polls?lessonId=${encodeURIComponent(lessonId)}&componentId=${encodeURIComponent(componentId)}`
                        );
                        if (res.ok) {
                            const data = await res.json();
                            results[componentId] = {
                                votes: data.votes || {},
                                totalVotes: data.totalVotes || 0,
                            };
                        } else {
                            results[componentId] = { votes: {}, totalVotes: 0 };
                        }
                    } catch {
                        results[componentId] = { votes: {}, totalVotes: 0 };
                    }
                })
            );

            if (!cancelled) {
                setPollData(results);
                setIsLoaded(true);
            }
        };

        fetchAll();

        return () => {
            cancelled = true;
        };
    }, [lesson, lessonId]);

    /**
     * Submits a vote to /api/polls and updates local state with server-authoritative counts.
     */
    const submitVote = async (componentId: string, optionId: string) => {
        try {
            const res = await fetch("/api/polls", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lessonId, componentId, optionId }),
            });

            if (res.ok) {
                const data = await res.json();
                setPollData(prev => ({
                    ...prev,
                    [componentId]: {
                        votes: data.votes || {},
                        totalVotes: data.totalVotes || 0,
                    },
                }));
            }
        } catch (err) {
            console.error("[usePollStore] Failed to submit vote:", err);
        }
    };

    return { pollData, isLoaded, submitVote };
}
