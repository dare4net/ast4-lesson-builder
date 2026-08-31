'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { superadminClient } from '@/lib/superadmin-client';
import { Loader2, LogOut, Plus, Save, Trash2 } from 'lucide-react';
import { JobsPanel } from '@/components/superadmin/jobs-panel';
import {
    ACHIEVEMENT_EVENT_LABELS,
    ACHIEVEMENT_EVENT_TYPES,
    ACHIEVEMENT_FIELDS_BY_EVENT,
    ACHIEVEMENT_ICONS,
    ACHIEVEMENT_PRESETS,
    MISSION_PRESETS,
    MISSION_STAT_KEYS,
    MISSION_STAT_LABELS,
    RULE_OP_LABELS,
    RULE_OPS,
    SCORED_COMPONENT_TYPES,
    describeAchievementRecipe,
    describeMissionRecipe,
    persistMissionFilters,
    visibleAchievementRules,
    canUsePerfectAttempt,
    isScoredCatalogType,
    type AchievementEventType,
    type AchievementRule,
    type CatalogLessonTarget,
    type MissionFilters,
    type MissionStatKey,
    type RuleOp,
} from '@/lib/gamification-catalog';

type MissionDraft = {
    id: string;
    level: number;
    title: string;
    description: string;
    targetCount: number;
    rewardStars: number;
    stat: MissionStatKey;
    filters: MissionFilters;
    enabled: boolean;
};

type AchievementDraft = {
    id: string;
    title: string;
    description: string;
    icon: string;
    rewardStars: number;
    eventType: AchievementEventType;
    enabled: boolean;
    rules: AchievementRule[];
};

type LessonTarget = CatalogLessonTarget & {
    moduleTitle?: string;
    published?: boolean;
};

const emptyMission = (level = 1): MissionDraft => ({
    id: '',
    level,
    title: '',
    description: '',
    targetCount: 1,
    rewardStars: 3,
    stat: 'programsEnrolled',
    filters: {},
    enabled: true,
});

const emptyAchievement = (): AchievementDraft => ({
    id: '',
    title: '',
    description: '',
    icon: 'award',
    rewardStars: 5,
    eventType: 'COMPONENT_SUBMITTED',
    enabled: true,
    rules: [{ field: 'type', op: 'eq', value: 'quiz' }],
});

function nextMissionFilters(current: MissionFilters, patch: Partial<MissionFilters>, lessons: LessonTarget[]): MissionFilters {
    const next = { ...current, ...patch };
    if (!canUsePerfectAttempt(next, lessons)) next.perfect = undefined;
    return next;
}

function SuperadminCatalog() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [tab, setTab] = useState<'missions' | 'achievements' | 'jobs'>('missions');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [missions, setMissions] = useState<MissionDraft[]>([]);
    const [achievements, setAchievements] = useState<AchievementDraft[]>([]);
    const [editingMission, setEditingMission] = useState<MissionDraft>(emptyMission());
    const [editingAchievement, setEditingAchievement] = useState<AchievementDraft>(emptyAchievement());
    const [isNewMission, setIsNewMission] = useState(true);
    const [isNewAchievement, setIsNewAchievement] = useState(true);
    const [lessonTargets, setLessonTargets] = useState<LessonTarget[]>([]);

    const load = async () => {
        setError('');
        setLoading(true);
        try {
            const [missionRes, achievementRes, targetRes] = await Promise.all([
                superadminClient.listMissions(),
                superadminClient.listAchievements(),
                superadminClient.listTargets().catch(() => ({ lessons: [] })),
            ]);
            setMissions(Array.isArray(missionRes?.missions) ? missionRes.missions.map((m: MissionDraft) => ({
                ...emptyMission(),
                ...m,
                filters: m.filters || {},
                enabled: m.enabled !== false,
            })) : []);
            setAchievements(Array.isArray(achievementRes?.achievements) ? achievementRes.achievements : []);
            setLessonTargets(Array.isArray(targetRes?.lessons) ? targetRes.lessons : []);
        } catch {
            setError('Failed to load catalog.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = superadminClient.getToken();
        if (!token) {
            router.replace('/superadmin/login');
            return;
        }
        superadminClient.me()
            .then(() => {
                setReady(true);
                void load();
            })
            .catch(() => {
                superadminClient.clearToken();
                router.replace('/superadmin/login');
            });
    }, [router]);

    const maxLevel = useMemo(
        () => missions.reduce((max, m) => Math.max(max, Number(m.level) || 1), 1),
        [missions]
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
        } catch (err: any) {
            setError(err.response?.data?.error || 'Could not save mission');
        } finally {
            setSaving(false);
        }
    };

    const saveAchievement = async () => {
        setSaving(true);
        setError('');
        try {
            const payload = {
                title: editingAchievement.title,
                description: editingAchievement.description,
                icon: editingAchievement.icon,
                rewardStars: Number(editingAchievement.rewardStars),
                eventType: editingAchievement.eventType,
                enabled: editingAchievement.enabled,
                rules: visibleAchievementRules(editingAchievement.rules, lessonTargets).filter((rule) => rule.field && rule.op),
            };
            if (isNewAchievement) {
                await superadminClient.createAchievement(payload);
            } else {
                await superadminClient.updateAchievement(editingAchievement.id, payload);
            }
            await load();
            setIsNewAchievement(true);
            setEditingAchievement(emptyAchievement());
        } catch (err: any) {
            setError(err.response?.data?.error || 'Could not save achievement');
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

    const deleteAchievement = async (id: string) => {
        if (!confirm(`Delete achievement ${id}? Students who already earned it keep the badge.`)) return;
        await superadminClient.deleteAchievement(id);
        await load();
        if (editingAchievement.id === id) {
            setIsNewAchievement(true);
            setEditingAchievement(emptyAchievement());
        }
    };

    const applyMissionPreset = (preset: typeof MISSION_PRESETS[number]) => {
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

    const applyAchievementPreset = (preset: typeof ACHIEVEMENT_PRESETS[number]) => {
        setIsNewAchievement(true);
        setEditingAchievement({
            ...emptyAchievement(),
            title: preset.title,
            description: preset.description,
            eventType: preset.eventType,
            rules: preset.rules.map((rule) => ({ ...rule })),
        });
    };

    const targetingBlock = editingAchievement.rules.some((rule) => rule.field === 'componentId' && rule.value !== undefined && rule.value !== '');
    const targetedAchievementType = targetingBlock
        ? lessonTargets.flatMap((lesson) => lesson.components).find((block) => block.id === editingAchievement.rules.find((rule) => rule.field === 'componentId')?.value)?.type
        : String(editingAchievement.rules.find((rule) => rule.field === 'type')?.value || '');
    const achievementAllowsScore = !targetedAchievementType || isScoredCatalogType(targetedAchievementType);
    const eventFields = (ACHIEVEMENT_FIELDS_BY_EVENT[editingAchievement.eventType] || [])
        .filter((field) => !targetingBlock || (field !== 'type' && field !== 'mode'))
        .filter((field) => achievementAllowsScore || !['percentage', 'isFirstAttempt', 'score', 'maxScore'].includes(field));
    const fieldClass = 'w-full h-10 px-3 rounded-xl border-2 border-slate-200 text-sm font-medium';

    if (!ready) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm font-bold gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Checking access…
            </div>
        );
    }

    const logout = () => {
        superadminClient.clearToken();
        router.replace('/superadmin/login');
    };

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="h-1 w-full bg-amber-500" />
            <header className="sticky top-0 z-20 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Platform Superadmin</p>
                        <p className="text-sm font-black text-white truncate">
                            {tab === 'jobs' ? 'Manual jobs' : 'Missions, levels & achievements'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl">
                        <button type="button" onClick={() => setTab('missions')} className={`h-8 px-3 rounded-lg text-xs font-bold ${tab === 'missions' ? 'bg-[#58CC02] text-white' : 'text-slate-300'}`}>Missions</button>
                        <button type="button" onClick={() => setTab('achievements')} className={`h-8 px-3 rounded-lg text-xs font-bold ${tab === 'achievements' ? 'bg-purple-600 text-white' : 'text-slate-300'}`}>Achievements</button>
                        <button type="button" onClick={() => setTab('jobs')} className={`h-8 px-3 rounded-lg text-xs font-bold ${tab === 'jobs' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'}`}>Jobs</button>
                    </div>
                    <button type="button" onClick={logout} className="h-9 w-9 rounded-xl border border-slate-700 text-slate-400 flex items-center justify-center" aria-label="Sign out">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <main className="px-4 sm:px-6 py-5 max-w-6xl mx-auto space-y-4">
                {tab !== 'jobs' && (
                    <p className="text-xs font-medium text-slate-400">
                        Platform-wide catalog. Add a mission at a new level number to create that level. Credentials live in server env only.
                    </p>
                )}
                {error && tab !== 'jobs' && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">{error}</div>}
                {tab === 'jobs' ? (
                    <JobsPanel />
                ) : loading ? (
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-bold"><Loader2 className="w-4 h-4 animate-spin" /> Loading catalog…</div>
                ) : tab === 'missions' ? (
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
                                            onClick={() => { setIsNewMission(false); setEditingMission({ ...emptyMission(), ...mission, filters: mission.filters || {}, enabled: mission.enabled !== false }); }}
                                            className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-[#58CC02] flex items-center justify-between gap-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-slate-800 truncate">{mission.title}</p>
                                                <p className="text-[11px] text-slate-500 truncate">{describeMissionRecipe(mission, lessonTargets)}</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-amber-600 shrink-0">+{mission.rewardStars}</span>
                                        </button>
                                    ))}
                                </section>
                            ))}
                        </div>
                        <form
                            className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-3 h-fit"
                            onSubmit={(e) => { e.preventDefault(); void saveMission(); }}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-800">{isNewMission ? 'New mission' : 'Edit mission'}</h3>
                                <div className="flex gap-1">
                                    <button type="button" onClick={() => { setIsNewMission(true); setEditingMission(emptyMission(maxLevel)); }} className="h-8 px-2 rounded-lg text-[10px] font-bold border border-slate-200">Clear</button>
                                    <button type="button" onClick={() => { setIsNewMission(true); setEditingMission(emptyMission(maxLevel + 1)); }} className="h-8 px-2 rounded-lg text-[10px] font-bold text-white bg-[#1CB0F6] flex items-center gap-1"><Plus className="w-3 h-3" /> New level</button>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Presets</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {MISSION_PRESETS.map((preset) => (
                                        <button key={preset.label} type="button" onClick={() => applyMissionPreset(preset)} className="h-7 px-2 rounded-lg text-[10px] font-bold border border-slate-200 text-slate-600 hover:border-[#58CC02]">
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
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Title
                                <input className={fieldClass} value={editingMission.title} onChange={(e) => setEditingMission((m) => ({ ...m, title: e.target.value }))} />
                            </label>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Description
                                <textarea className={`${fieldClass} h-20 py-2`} value={editingMission.description} onChange={(e) => setEditingMission((m) => ({ ...m, description: e.target.value }))} />
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Level
                                    <input type="number" min={1} className={fieldClass} value={editingMission.level} onChange={(e) => setEditingMission((m) => ({ ...m, level: Number(e.target.value) }))} />
                                </label>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Target
                                    <input type="number" min={1} className={fieldClass} value={editingMission.targetCount} onChange={(e) => setEditingMission((m) => ({ ...m, targetCount: Number(e.target.value) }))} />
                                </label>
                            </div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">What to count
                                <select className={fieldClass} value={editingMission.stat} onChange={(e) => setEditingMission((m) => ({ ...m, stat: e.target.value as MissionStatKey, filters: e.target.value === 'submits' ? m.filters : {} }))}>
                                    {MISSION_STAT_KEYS.map((stat) => <option key={stat} value={stat}>{MISSION_STAT_LABELS[stat]}</option>)}
                                </select>
                            </label>
                            {editingMission.stat === 'submits' && (
                                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50">
                                    <label className="col-span-2 block text-[10px] font-black uppercase tracking-wider text-slate-400">Lesson
                                        <select className={fieldClass} value={editingMission.filters.lessonId || ''} onChange={(e) => setEditingMission((m) => ({ ...m, filters: nextMissionFilters(m.filters, { lessonId: e.target.value || undefined, componentId: undefined }, lessonTargets) }))}>
                                            <option value="">Any lesson</option>
                                            {lessonTargets.map((lesson) => (
                                                <option key={lesson.id} value={lesson.id}>
                                                    {lesson.programTitle ? `${lesson.programTitle} · ` : ''}{lesson.title}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="col-span-2 block text-[10px] font-black uppercase tracking-wider text-slate-400">Block
                                        <select
                                            className={fieldClass}
                                            value={editingMission.filters.componentId || ''}
                                            disabled={!editingMission.filters.lessonId}
                                            onChange={(e) => {
                                                const componentId = e.target.value || undefined;
                                                setEditingMission((m) => ({
                                                    ...m,
                                                    filters: nextMissionFilters(m.filters, {
                                                        componentId,
                                                        ...(componentId ? { mode: undefined, type: undefined } : {}),
                                                    }, lessonTargets),
                                                }));
                                            }}
                                        >
                                            <option value="">{editingMission.filters.lessonId ? 'Any scored block in this lesson' : 'Pick a lesson first'}</option>
                                            {(lessonTargets.find((lesson) => lesson.id === editingMission.filters.lessonId)?.components || [])
                                                .filter((block) => isScoredCatalogType(block.type))
                                                .map((block) => (
                                                    <option key={block.id} value={block.id}>{block.title} ({block.type})</option>
                                                ))}
                                        </select>
                                    </label>
                                    {!editingMission.filters.componentId && (
                                        <>
                                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Mode
                                                <select className={fieldClass} value={editingMission.filters.mode || ''} onChange={(e) => setEditingMission((m) => ({ ...m, filters: nextMissionFilters(m.filters, { mode: (e.target.value || undefined) as MissionFilters['mode'] }, lessonTargets) }))}>
                                                    <option value="">Any mode</option>
                                                    <option value="live">Live</option>
                                                    <option value="practice">Practice</option>
                                                </select>
                                            </label>
                                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Block type
                                                <select className={fieldClass} value={editingMission.filters.type || ''} onChange={(e) => setEditingMission((m) => ({ ...m, filters: nextMissionFilters(m.filters, { type: e.target.value || undefined }, lessonTargets) }))}>
                                                    <option value="">Any block</option>
                                                    {SCORED_COMPONENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                                                </select>
                                            </label>
                                        </>
                                    )}
                                    {canUsePerfectAttempt(editingMission.filters, lessonTargets) && (
                                        <label className="col-span-2 flex items-center gap-2 text-xs font-bold text-slate-700">
                                            <input type="checkbox" checked={editingMission.filters.perfect === true} onChange={(e) => setEditingMission((m) => ({ ...m, filters: { ...m.filters, perfect: e.target.checked || undefined } }))} />
                                            100% on first attempt
                                        </label>
                                    )}
                                </div>
                            )}
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Star reward
                                <input type="number" min={0} className={fieldClass} value={editingMission.rewardStars} onChange={(e) => setEditingMission((m) => ({ ...m, rewardStars: Number(e.target.value) }))} />
                            </label>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                <input type="checkbox" checked={editingMission.enabled} onChange={(e) => setEditingMission((m) => ({ ...m, enabled: e.target.checked }))} />
                                Enabled for students
                            </label>
                            <div className="flex gap-2">
                                <button type="submit" disabled={saving} className="flex-1 h-10 rounded-xl text-xs font-extrabold text-white bg-[#58CC02] flex items-center justify-center gap-1.5">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                                </button>
                                {!isNewMission && (
                                    <button type="button" onClick={() => void deleteMission(editingMission.id)} className="h-10 w-10 rounded-xl border-2 border-red-200 text-red-500 flex items-center justify-center">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-4">
                        <div className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-2">
                            {achievements.map((ach) => (
                                <button
                                    key={ach.id}
                                    type="button"
                                    onClick={() => { setIsNewAchievement(false); setEditingAchievement({ ...emptyAchievement(), ...ach, enabled: ach.enabled !== false, rules: ach.rules?.length ? ach.rules : emptyAchievement().rules }); }}
                                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-400 flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-slate-800 truncate">{ach.title}</p>
                                        <p className="text-[11px] text-slate-500 truncate">{ACHIEVEMENT_EVENT_LABELS[ach.eventType] || ach.eventType} · {ach.rules?.length || 0} rules</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-600 shrink-0">+{ach.rewardStars}</span>
                                </button>
                            ))}
                        </div>
                        <form className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-3 h-fit" onSubmit={(e) => { e.preventDefault(); void saveAchievement(); }}>
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-800">{isNewAchievement ? 'New achievement' : 'Edit achievement'}</h3>
                                <button type="button" onClick={() => { setIsNewAchievement(true); setEditingAchievement(emptyAchievement()); }} className="h-8 px-2 rounded-lg text-[10px] font-bold border border-slate-200">Clear</button>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Presets</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {ACHIEVEMENT_PRESETS.map((preset) => (
                                        <button key={preset.label} type="button" onClick={() => applyAchievementPreset(preset)} className="h-7 px-2 rounded-lg text-[10px] font-bold border border-slate-200 text-slate-600 hover:border-purple-400">
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {!isNewAchievement && editingAchievement.id ? (
                                <p className="text-[10px] font-bold text-slate-400">Saved as {editingAchievement.id}</p>
                            ) : null}
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Title
                                <input className={fieldClass} value={editingAchievement.title} onChange={(e) => setEditingAchievement((a) => ({ ...a, title: e.target.value }))} />
                            </label>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Description
                                <textarea className={`${fieldClass} h-20 py-2`} value={editingAchievement.description} onChange={(e) => setEditingAchievement((a) => ({ ...a, description: e.target.value }))} />
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Icon
                                    <select className={fieldClass} value={editingAchievement.icon} onChange={(e) => setEditingAchievement((a) => ({ ...a, icon: e.target.value }))}>
                                        {ACHIEVEMENT_ICONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                                    </select>
                                </label>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Stars
                                    <input type="number" min={0} className={fieldClass} value={editingAchievement.rewardStars} onChange={(e) => setEditingAchievement((a) => ({ ...a, rewardStars: Number(e.target.value) }))} />
                                </label>
                            </div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">When this happens
                                <select className={fieldClass} value={editingAchievement.eventType} onChange={(e) => {
                                    const eventType = e.target.value as AchievementEventType;
                                    const fields = ACHIEVEMENT_FIELDS_BY_EVENT[eventType] || [];
                                    setEditingAchievement((a) => ({
                                        ...a,
                                        eventType,
                                        rules: [{ field: fields[0] || 'type', op: 'eq', value: fields[0] === 'type' ? 'quiz' : '' }],
                                    }));
                                }}>
                                    {ACHIEVEMENT_EVENT_TYPES.map((eventType) => <option key={eventType} value={eventType}>{ACHIEVEMENT_EVENT_LABELS[eventType]}</option>)}
                                </select>
                            </label>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                                {describeAchievementRecipe(editingAchievement.eventType, editingAchievement.rules, lessonTargets)}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Criteria (all must match)</p>
                                    <button type="button" onClick={() => setEditingAchievement((a) => ({ ...a, rules: [...a.rules, { field: eventFields[0] || 'type', op: 'eq', value: '' }] }))} className="text-[10px] font-bold text-[#1CB0F6]">Add rule</button>
                                </div>
                                {editingAchievement.rules.map((rule, index) => {
                                    if (targetingBlock && (rule.field === 'type' || rule.field === 'mode')) return null;
                                    if (!achievementAllowsScore && ['percentage', 'isFirstAttempt', 'score', 'maxScore'].includes(rule.field)) return null;
                                    return (
                                    <div key={index} className="space-y-1">
                                        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-1">
                                            <select className="h-9 px-2 rounded-lg border border-slate-200 text-xs" value={eventFields.includes(rule.field) ? rule.field : '__custom'} onChange={(e) => {
                                                const field = e.target.value === '__custom' ? '' : e.target.value;
                                                setEditingAchievement((a) => ({ ...a, rules: a.rules.map((r, i) => i === index ? { ...r, field } : r) }));
                                            }}>
                                                {eventFields.map((field) => <option key={field} value={field}>{field}</option>)}
                                                <option value="__custom">custom field</option>
                                            </select>
                                            <select className="h-9 px-2 rounded-lg border border-slate-200 text-xs" value={rule.op} onChange={(e) => setEditingAchievement((a) => ({ ...a, rules: a.rules.map((r, i) => i === index ? { ...r, op: e.target.value as RuleOp } : r) }))}>
                                                {RULE_OPS.map((op) => <option key={op} value={op}>{RULE_OP_LABELS[op]}</option>)}
                                            </select>
                                            {rule.op === 'exists' ? (
                                                <div className="h-9" />
                                            ) : rule.field === 'type' ? (
                                                <select className="h-9 px-2 rounded-lg border border-slate-200 text-xs" value={String(rule.value || '')} onChange={(e) => setEditingAchievement((a) => ({ ...a, rules: a.rules.map((r, i) => i === index ? { ...r, value: e.target.value } : r) }))}>
                                                    <option value="">Select type</option>
                                                    {SCORED_COMPONENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                                                </select>
                                            ) : rule.field === 'mode' ? (
                                                <select className="h-9 px-2 rounded-lg border border-slate-200 text-xs" value={String(rule.value || '')} onChange={(e) => setEditingAchievement((a) => ({ ...a, rules: a.rules.map((r, i) => i === index ? { ...r, value: e.target.value } : r) }))}>
                                                    <option value="live">live</option>
                                                    <option value="practice">practice</option>
                                                </select>
                                            ) : rule.field === 'isFirstAttempt' ? (
                                                <select className="h-9 px-2 rounded-lg border border-slate-200 text-xs" value={String(rule.value)} onChange={(e) => setEditingAchievement((a) => ({ ...a, rules: a.rules.map((r, i) => i === index ? { ...r, value: e.target.value === 'true' } : r) }))}>
                                                    <option value="true">true</option>
                                                    <option value="false">false</option>
                                                </select>
                                            ) : rule.field === 'lessonId' ? (
                                                <select className="h-9 px-2 rounded-lg border border-slate-200 text-xs" value={String(rule.value || '')} onChange={(e) => setEditingAchievement((a) => ({ ...a, rules: a.rules.map((r, i) => i === index ? { ...r, value: e.target.value } : r) }))}>
                                                    <option value="">Select lesson</option>
                                                    {lessonTargets.map((lesson) => (
                                                        <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                                                    ))}
                                                </select>
                                            ) : rule.field === 'componentId' ? (
                                                <select className="h-9 px-2 rounded-lg border border-slate-200 text-xs" value={String(rule.value || '')} onChange={(e) => setEditingAchievement((a) => ({
                                                    ...a,
                                                    rules: visibleAchievementRules(a.rules.map((r, i) => i === index ? { ...r, value: e.target.value } : r), lessonTargets),
                                                }))}>
                                                    <option value="">Select block</option>
                                                    {lessonTargets.flatMap((lesson) => lesson.components.map((block) => (
                                                        <option key={`${lesson.id}-${block.id}`} value={block.id}>{lesson.title} · {block.title}</option>
                                                    )))}
                                                </select>
                                            ) : (
                                                <input className="h-9 px-2 rounded-lg border border-slate-200 text-xs" placeholder="value" value={rule.value === undefined ? '' : String(rule.value)} onChange={(e) => {
                                                    const raw = e.target.value;
                                                    const parsed = raw === 'true' ? true : raw === 'false' ? false : raw !== '' && !Number.isNaN(Number(raw)) ? Number(raw) : raw;
                                                    setEditingAchievement((a) => ({ ...a, rules: a.rules.map((r, i) => i === index ? { ...r, value: parsed } : r) }));
                                                }} />
                                            )}
                                            <button type="button" onClick={() => setEditingAchievement((a) => ({ ...a, rules: a.rules.filter((_, i) => i !== index) }))} className="h-9 w-8 text-slate-400">×</button>
                                        </div>
                                        {!eventFields.includes(rule.field) && (
                                            <input className="h-9 w-full px-2 rounded-lg border border-slate-200 text-xs" placeholder="custom field name" value={rule.field} onChange={(e) => setEditingAchievement((a) => ({ ...a, rules: a.rules.map((r, i) => i === index ? { ...r, field: e.target.value } : r) }))} />
                                        )}
                                        {rule.op === 'ratioLt' && (
                                            <input className="h-9 w-full px-2 rounded-lg border border-slate-200 text-xs" placeholder="divide by field, e.g. timeLimitMs" value={rule.over || ''} onChange={(e) => setEditingAchievement((a) => ({ ...a, rules: a.rules.map((r, i) => i === index ? { ...r, over: e.target.value } : r) }))} />
                                        )}
                                    </div>
                                    );
                                })}
                            </div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                <input type="checkbox" checked={editingAchievement.enabled} onChange={(e) => setEditingAchievement((a) => ({ ...a, enabled: e.target.checked }))} />
                                Enabled for students
                            </label>
                            <div className="flex gap-2">
                                <button type="submit" disabled={saving} className="flex-1 h-10 rounded-xl text-xs font-extrabold text-white bg-purple-600 flex items-center justify-center gap-1.5">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                                </button>
                                {!isNewAchievement && (
                                    <button type="button" onClick={() => void deleteAchievement(editingAchievement.id)} className="h-10 w-10 rounded-xl border-2 border-red-200 text-red-500 flex items-center justify-center">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function SuperadminPage() {
    return <SuperadminCatalog />;
}
