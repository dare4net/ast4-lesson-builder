'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { superadminClient } from '@/lib/superadmin-client';
import {
    MISSION_PRESETS,
    MISSION_STAT_KEYS,
    MISSION_STAT_LABELS,
    SCORED_COMPONENT_TYPES,
    describeMissionRecipe,
    persistMissionFilters,
    canUsePerfectAttempt,
    isScoredCatalogType,
    type MissionFilters,
    type MissionStatKey,
} from '@/lib/gamification-catalog';
import {
    SuperadminPageHeader,
    SUPERADMIN_FIELD_CLASS,
    SuperadminAlert,
} from '@/components/superadmin/superadmin-page-header';
import {
    emptyMission,
    nextMissionFilters,
    useSuperadminLessonTargets,
    type MissionDraft,
} from '@/components/superadmin/catalog-shared';

export function MissionsPanel() {
    const { lessonTargets, loading: targetsLoading } = useSuperadminLessonTargets();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [missions, setMissions] = useState<MissionDraft[]>([]);
    const [editingMission, setEditingMission] = useState<MissionDraft>(emptyMission());
    const [isNewMission, setIsNewMission] = useState(true);

    const load = async () => {
        setError('');
        setLoading(true);
        try {
            const missionRes = await superadminClient.listMissions();
            setMissions(
                Array.isArray(missionRes?.missions)
                    ? missionRes.missions.map((m: MissionDraft) => ({
                          ...emptyMission(),
                          ...m,
                          filters: m.filters || {},
                          enabled: m.enabled !== false,
                      }))
                    : [],
            );
        } catch {
            setError('Failed to load missions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const maxLevel = useMemo(
        () => missions.reduce((max, m) => Math.max(max, Number(m.level) || 1), 1),
        [missions],
    );

    const missionsByLevel = useMemo(() => {
        const groups = new Map<number, MissionDraft[]>();
        for (const mission of missions) {
            const level = Number(mission.level) || 1;
            const list = groups.get(level) || [];
            list.push(mission);
            groups.set(level, list);
        }
        return [...groups.entries()].sort((a, b) => a[0] - b[0]);
    }, [missions]);

    const saveMission = async () => {
        setSaving(true);
        setError('');
        try {
            const filters = persistMissionFilters(editingMission.stat, editingMission.filters, lessonTargets);
            const payload = {
                level: Number(editingMission.level),
                title: editingMission.title,
                description: editingMission.description,
                targetCount: Number(editingMission.targetCount),
                rewardStars: Number(editingMission.rewardStars),
                stat: editingMission.stat,
                filters,
                enabled: editingMission.enabled,
            };
            if (isNewMission) {
                await superadminClient.createMission(payload);
            } else {
                await superadminClient.updateMission(editingMission.id, payload);
            }
            await load();
            setIsNewMission(true);
            setEditingMission(emptyMission(payload.level));
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
            setError(message || 'Could not save mission');
        } finally {
            setSaving(false);
        }
    };

    const deleteMission = async (id: string) => {
        if (!confirm(`Delete mission ${id}? Students who already claimed it keep the reward.`)) return;
        await superadminClient.deleteMission(id);
        await load();
        if (editingMission.id === id) {
            setIsNewMission(true);
            setEditingMission(emptyMission());
        }
    };

    const applyMissionPreset = (preset: (typeof MISSION_PRESETS)[number]) => {
        setIsNewMission(true);
        setEditingMission({
            ...emptyMission(maxLevel),
            title: preset.title,
            description: preset.description,
            stat: preset.stat,
            targetCount: preset.targetCount,
            rewardStars: preset.rewardStars,
            filters: { ...preset.filters },
        });
    };

    const isLoading = loading || targetsLoading;

    return (
        <div className="space-y-4">
            <SuperadminPageHeader
                title="Missions"
                description="Configure level-based missions and star quests. Add a mission at a new level number to create that level."
            />
            <SuperadminAlert message={error} />
            {isLoading ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading missions…
                </div>
            ) : (
                <div className="grid lg:grid-cols-[minmax(0,1fr)_400px] gap-4">
                    <div className="space-y-4">
                        {missionsByLevel.map(([level, items]) => (
                            <section key={level} className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-black text-slate-800">Level {level}</h2>
                                    <span className="text-[10px] font-bold text-slate-400">{items.length} missions</span>
                                </div>
                                {items.map((mission) => (
                                    <button
                                        key={mission.id}
                                        type="button"
                                        onClick={() => {
                                            setIsNewMission(false);
                                            setEditingMission({
                                                ...emptyMission(),
                                                ...mission,
                                                filters: mission.filters || {},
                                                enabled: mission.enabled !== false,
                                            });
                                        }}
                                        className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-[#58CC02] flex items-center justify-between gap-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-800 truncate">{mission.title}</p>
                                            <p className="text-[11px] text-slate-500 truncate">
                                                {describeMissionRecipe(mission, lessonTargets)}
                                            </p>
                                        </div>
                                        <span className="text-[10px] font-bold text-amber-600 shrink-0">
                                            +{mission.rewardStars}
                                        </span>
                                    </button>
                                ))}
                            </section>
                        ))}
                    </div>
                    <form
                        className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-3 h-fit"
                        onSubmit={(e) => {
                            e.preventDefault();
                            void saveMission();
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-800">
                                {isNewMission ? 'New mission' : 'Edit mission'}
                            </h3>
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsNewMission(true);
                                        setEditingMission(emptyMission(maxLevel));
                                    }}
                                    className="h-8 px-2 rounded-lg text-[10px] font-bold border border-slate-200"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsNewMission(true);
                                        setEditingMission(emptyMission(maxLevel + 1));
                                    }}
                                    className="h-8 px-2 rounded-lg text-[10px] font-bold text-white bg-[#1CB0F6] flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> New level
                                </button>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                Presets
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {MISSION_PRESETS.map((preset) => (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        onClick={() => applyMissionPreset(preset)}
                                        className="h-7 px-2 rounded-lg text-[10px] font-bold border border-slate-200 text-slate-600 hover:border-[#58CC02]"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700">
                            Mission recipe: {describeMissionRecipe(editingMission, lessonTargets)}
                        </div>
                        {!isNewMission && editingMission.id ? (
                            <p className="text-[10px] font-bold text-slate-400">Saved as {editingMission.id}</p>
                        ) : null}
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Title
                            <input
                                className={SUPERADMIN_FIELD_CLASS}
                                value={editingMission.title}
                                onChange={(e) => setEditingMission((m) => ({ ...m, title: e.target.value }))}
                            />
                        </label>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Description
                            <textarea
                                className={`${SUPERADMIN_FIELD_CLASS} h-20 py-2`}
                                value={editingMission.description}
                                onChange={(e) => setEditingMission((m) => ({ ...m, description: e.target.value }))}
                            />
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Level
                                <input
                                    type="number"
                                    min={1}
                                    className={SUPERADMIN_FIELD_CLASS}
                                    value={editingMission.level}
                                    onChange={(e) =>
                                        setEditingMission((m) => ({ ...m, level: Number(e.target.value) }))
                                    }
                                />
                            </label>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Target
                                <input
                                    type="number"
                                    min={1}
                                    className={SUPERADMIN_FIELD_CLASS}
                                    value={editingMission.targetCount}
                                    onChange={(e) =>
                                        setEditingMission((m) => ({ ...m, targetCount: Number(e.target.value) }))
                                    }
                                />
                            </label>
                        </div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                            What to count
                            <select
                                className={SUPERADMIN_FIELD_CLASS}
                                value={editingMission.stat}
                                onChange={(e) =>
                                    setEditingMission((m) => ({
                                        ...m,
                                        stat: e.target.value as MissionStatKey,
                                        filters: e.target.value === 'submits' ? m.filters : {},
                                    }))
                                }
                            >
                                {MISSION_STAT_KEYS.map((stat) => (
                                    <option key={stat} value={stat}>
                                        {MISSION_STAT_LABELS[stat]}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {editingMission.stat === 'submits' && (
                            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50">
                                <label className="col-span-2 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    Lesson
                                    <select
                                        className={SUPERADMIN_FIELD_CLASS}
                                        value={editingMission.filters.lessonId || ''}
                                        onChange={(e) =>
                                            setEditingMission((m) => ({
                                                ...m,
                                                filters: nextMissionFilters(
                                                    m.filters,
                                                    {
                                                        lessonId: e.target.value || undefined,
                                                        componentId: undefined,
                                                    },
                                                    lessonTargets,
                                                ),
                                            }))
                                        }
                                    >
                                        <option value="">Any lesson</option>
                                        {lessonTargets.map((lesson) => (
                                            <option key={lesson.id} value={lesson.id}>
                                                {lesson.programTitle ? `${lesson.programTitle} · ` : ''}
                                                {lesson.title}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="col-span-2 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    Block
                                    <select
                                        className={SUPERADMIN_FIELD_CLASS}
                                        value={editingMission.filters.componentId || ''}
                                        disabled={!editingMission.filters.lessonId}
                                        onChange={(e) => {
                                            const componentId = e.target.value || undefined;
                                            setEditingMission((m) => ({
                                                ...m,
                                                filters: nextMissionFilters(
                                                    m.filters,
                                                    {
                                                        componentId,
                                                        ...(componentId ? { mode: undefined, type: undefined } : {}),
                                                    },
                                                    lessonTargets,
                                                ),
                                            }));
                                        }}
                                    >
                                        <option value="">
                                            {editingMission.filters.lessonId
                                                ? 'Any scored block in this lesson'
                                                : 'Pick a lesson first'}
                                        </option>
                                        {(
                                            lessonTargets.find(
                                                (lesson) => lesson.id === editingMission.filters.lessonId,
                                            )?.components || []
                                        )
                                            .filter((block) => isScoredCatalogType(block.type))
                                            .map((block) => (
                                                <option key={block.id} value={block.id}>
                                                    {block.title} ({block.type})
                                                </option>
                                            ))}
                                    </select>
                                </label>
                                {!editingMission.filters.componentId && (
                                    <>
                                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Mode
                                            <select
                                                className={SUPERADMIN_FIELD_CLASS}
                                                value={editingMission.filters.mode || ''}
                                                onChange={(e) =>
                                                    setEditingMission((m) => ({
                                                        ...m,
                                                        filters: nextMissionFilters(
                                                            m.filters,
                                                            {
                                                                mode: (e.target.value ||
                                                                    undefined) as MissionFilters['mode'],
                                                            },
                                                            lessonTargets,
                                                        ),
                                                    }))
                                                }
                                            >
                                                <option value="">Any mode</option>
                                                <option value="live">Live</option>
                                                <option value="practice">Practice</option>
                                            </select>
                                        </label>
                                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Block type
                                            <select
                                                className={SUPERADMIN_FIELD_CLASS}
                                                value={editingMission.filters.type || ''}
                                                onChange={(e) =>
                                                    setEditingMission((m) => ({
                                                        ...m,
                                                        filters: nextMissionFilters(
                                                            m.filters,
                                                            { type: e.target.value || undefined },
                                                            lessonTargets,
                                                        ),
                                                    }))
                                                }
                                            >
                                                <option value="">Any block</option>
                                                {SCORED_COMPONENT_TYPES.map((type) => (
                                                    <option key={type} value={type}>
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </>
                                )}
                                {canUsePerfectAttempt(editingMission.filters, lessonTargets) && (
                                    <label className="col-span-2 flex items-center gap-2 text-xs font-bold text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={editingMission.filters.perfect === true}
                                            onChange={(e) =>
                                                setEditingMission((m) => ({
                                                    ...m,
                                                    filters: { ...m.filters, perfect: e.target.checked || undefined },
                                                }))
                                            }
                                        />
                                        100% on first attempt
                                    </label>
                                )}
                            </div>
                        )}
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Star reward
                            <input
                                type="number"
                                min={0}
                                className={SUPERADMIN_FIELD_CLASS}
                                value={editingMission.rewardStars}
                                onChange={(e) =>
                                    setEditingMission((m) => ({ ...m, rewardStars: Number(e.target.value) }))
                                }
                            />
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <input
                                type="checkbox"
                                checked={editingMission.enabled}
                                onChange={(e) => setEditingMission((m) => ({ ...m, enabled: e.target.checked }))}
                            />
                            Enabled for students
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 h-10 rounded-xl text-xs font-extrabold text-white bg-[#58CC02] flex items-center justify-center gap-1.5"
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}{' '}
                                Save
                            </button>
                            {!isNewMission && (
                                <button
                                    type="button"
                                    onClick={() => void deleteMission(editingMission.id)}
                                    className="h-10 w-10 rounded-xl border-2 border-red-200 text-red-500 flex items-center justify-center"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
