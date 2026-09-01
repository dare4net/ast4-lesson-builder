'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { superadminClient } from '@/lib/superadmin-client';
import { useSuperadminLessonTargets } from '@/components/superadmin/catalog-shared';
import {
    SuperadminPageHeader,
    SUPERADMIN_FIELD_CLASS,
    SuperadminAlert,
} from '@/components/superadmin/superadmin-page-header';
import {
    ACHIEVEMENT_EVENT_LABELS,
    ACHIEVEMENT_EVENT_TYPES,
    ACHIEVEMENT_FIELDS_BY_EVENT,
    ACHIEVEMENT_ICONS,
    ACHIEVEMENT_PRESETS,
    RULE_OP_LABELS,
    RULE_OPS,
    SCORED_COMPONENT_TYPES,
    describeAchievementRecipe,
    visibleAchievementRules,
    isScoredCatalogType,
    type AchievementEventType,
    type AchievementRule,
    type RuleOp,
} from '@/lib/gamification-catalog';

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

export function AchievementsPanel() {
    const { lessonTargets, loading: targetsLoading } = useSuperadminLessonTargets();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [achievements, setAchievements] = useState<AchievementDraft[]>([]);
    const [editingAchievement, setEditingAchievement] = useState<AchievementDraft>(emptyAchievement());
    const [isNewAchievement, setIsNewAchievement] = useState(true);

    const load = async () => {
        setError('');
        setLoading(true);
        try {
            const achievementRes = await superadminClient.listAchievements();
            setAchievements(Array.isArray(achievementRes?.achievements) ? achievementRes.achievements : []);
        } catch {
            setError('Failed to load achievements.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

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
                rules: visibleAchievementRules(editingAchievement.rules, lessonTargets).filter(
                    (rule) => rule.field && rule.op,
                ),
            };
            if (isNewAchievement) {
                await superadminClient.createAchievement(payload);
            } else {
                await superadminClient.updateAchievement(editingAchievement.id, payload);
            }
            await load();
            setIsNewAchievement(true);
            setEditingAchievement(emptyAchievement());
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
            setError(message || 'Could not save achievement');
        } finally {
            setSaving(false);
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

    const applyAchievementPreset = (preset: (typeof ACHIEVEMENT_PRESETS)[number]) => {
        setIsNewAchievement(true);
        setEditingAchievement({
            ...emptyAchievement(),
            title: preset.title,
            description: preset.description,
            eventType: preset.eventType,
            rules: preset.rules.map((rule) => ({ ...rule })),
        });
    };

    const targetingBlock = editingAchievement.rules.some(
        (rule) => rule.field === 'componentId' && rule.value !== undefined && rule.value !== '',
    );
    const targetedAchievementType = targetingBlock
        ? lessonTargets
              .flatMap((lesson) => lesson.components)
              .find((block) => block.id === editingAchievement.rules.find((rule) => rule.field === 'componentId')?.value)
                  ?.type
        : String(editingAchievement.rules.find((rule) => rule.field === 'type')?.value || '');
    const achievementAllowsScore = !targetedAchievementType || isScoredCatalogType(targetedAchievementType);
    const eventFields = (ACHIEVEMENT_FIELDS_BY_EVENT[editingAchievement.eventType] || [])
        .filter((field) => !targetingBlock || (field !== 'type' && field !== 'mode'))
        .filter(
            (field) => achievementAllowsScore || !['percentage', 'isFirstAttempt', 'score', 'maxScore'].includes(field),
        );

    const busy = loading || targetsLoading;

    return (
        <div className="space-y-4">
            <SuperadminPageHeader
                title="Achievements"
                description="Platform-wide achievement badges. Students who already earned a deleted badge keep it."
                actions={
                    <button
                        type="button"
                        onClick={() => {
                            setIsNewAchievement(true);
                            setEditingAchievement(emptyAchievement());
                        }}
                        className="h-9 px-3 rounded-xl text-xs font-bold text-white bg-purple-600 flex items-center gap-1.5"
                    >
                        <Plus className="w-3.5 h-3.5" /> New achievement
                    </button>
                }
            />

            {error && <SuperadminAlert message={error} />}

            {busy ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading achievements…
                </div>
            ) : (
                <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-4">
                    <div className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-2">
                        {achievements.length === 0 ? (
                            <p className="text-xs font-medium text-slate-500">No achievements yet.</p>
                        ) : (
                            achievements.map((ach) => (
                                <button
                                    key={ach.id}
                                    type="button"
                                    onClick={() => {
                                        setIsNewAchievement(false);
                                        setEditingAchievement({
                                            ...emptyAchievement(),
                                            ...ach,
                                            enabled: ach.enabled !== false,
                                            rules: ach.rules?.length ? ach.rules : emptyAchievement().rules,
                                        });
                                    }}
                                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-400 flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-slate-800 truncate">{ach.title}</p>
                                        <p className="text-[11px] text-slate-500 truncate">
                                            {ACHIEVEMENT_EVENT_LABELS[ach.eventType] || ach.eventType} ·{' '}
                                            {ach.rules?.length || 0} rules
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-600 shrink-0">
                                        +{ach.rewardStars}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                    <form
                        className="bg-white rounded-2xl border-2 border-slate-100 p-4 space-y-3 h-fit"
                        onSubmit={(e) => {
                            e.preventDefault();
                            void saveAchievement();
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-800">
                                {isNewAchievement ? 'New achievement' : 'Edit achievement'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsNewAchievement(true);
                                    setEditingAchievement(emptyAchievement());
                                }}
                                className="h-8 px-2 rounded-lg text-[10px] font-bold border border-slate-200"
                            >
                                Clear
                            </button>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                Presets
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {ACHIEVEMENT_PRESETS.map((preset) => (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        onClick={() => applyAchievementPreset(preset)}
                                        className="h-7 px-2 rounded-lg text-[10px] font-bold border border-slate-200 text-slate-600 hover:border-purple-400"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {!isNewAchievement && editingAchievement.id ? (
                            <p className="text-[10px] font-bold text-slate-400">Saved as {editingAchievement.id}</p>
                        ) : null}
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Title
                            <input
                                className={SUPERADMIN_FIELD_CLASS}
                                value={editingAchievement.title}
                                onChange={(e) => setEditingAchievement((a) => ({ ...a, title: e.target.value }))}
                            />
                        </label>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Description
                            <textarea
                                className={`${SUPERADMIN_FIELD_CLASS} h-20 py-2`}
                                value={editingAchievement.description}
                                onChange={(e) =>
                                    setEditingAchievement((a) => ({ ...a, description: e.target.value }))
                                }
                            />
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Icon
                                <select
                                    className={SUPERADMIN_FIELD_CLASS}
                                    value={editingAchievement.icon}
                                    onChange={(e) => setEditingAchievement((a) => ({ ...a, icon: e.target.value }))}
                                >
                                    {ACHIEVEMENT_ICONS.map((icon) => (
                                        <option key={icon} value={icon}>
                                            {icon}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Stars
                                <input
                                    type="number"
                                    min={0}
                                    className={SUPERADMIN_FIELD_CLASS}
                                    value={editingAchievement.rewardStars}
                                    onChange={(e) =>
                                        setEditingAchievement((a) => ({
                                            ...a,
                                            rewardStars: Number(e.target.value),
                                        }))
                                    }
                                />
                            </label>
                        </div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                            When this happens
                            <select
                                className={SUPERADMIN_FIELD_CLASS}
                                value={editingAchievement.eventType}
                                onChange={(e) => {
                                    const eventType = e.target.value as AchievementEventType;
                                    const fields = ACHIEVEMENT_FIELDS_BY_EVENT[eventType] || [];
                                    setEditingAchievement((a) => ({
                                        ...a,
                                        eventType,
                                        rules: [
                                            {
                                                field: fields[0] || 'type',
                                                op: 'eq',
                                                value: fields[0] === 'type' ? 'quiz' : '',
                                            },
                                        ],
                                    }));
                                }}
                            >
                                {ACHIEVEMENT_EVENT_TYPES.map((eventType) => (
                                    <option key={eventType} value={eventType}>
                                        {ACHIEVEMENT_EVENT_LABELS[eventType]}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                            {describeAchievementRecipe(
                                editingAchievement.eventType,
                                editingAchievement.rules,
                                lessonTargets,
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    Criteria (all must match)
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditingAchievement((a) => ({
                                            ...a,
                                            rules: [
                                                ...a.rules,
                                                { field: eventFields[0] || 'type', op: 'eq', value: '' },
                                            ],
                                        }))
                                    }
                                    className="text-[10px] font-bold text-[#1CB0F6]"
                                >
                                    Add rule
                                </button>
                            </div>
                            {editingAchievement.rules.map((rule, index) => {
                                if (targetingBlock && (rule.field === 'type' || rule.field === 'mode')) return null;
                                if (
                                    !achievementAllowsScore &&
                                    ['percentage', 'isFirstAttempt', 'score', 'maxScore'].includes(rule.field)
                                )
                                    return null;
                                return (
                                    <div key={index} className="space-y-1">
                                        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-1">
                                            <select
                                                className="h-9 px-2 rounded-lg border border-slate-200 text-xs bg-white"
                                                value={eventFields.includes(rule.field) ? rule.field : '__custom'}
                                                onChange={(e) => {
                                                    const field = e.target.value === '__custom' ? '' : e.target.value;
                                                    setEditingAchievement((a) => ({
                                                        ...a,
                                                        rules: a.rules.map((r, i) =>
                                                            i === index ? { ...r, field } : r,
                                                        ),
                                                    }));
                                                }}
                                            >
                                                {eventFields.map((field) => (
                                                    <option key={field} value={field}>
                                                        {field}
                                                    </option>
                                                ))}
                                                <option value="__custom">custom field</option>
                                            </select>
                                            <select
                                                className="h-9 px-2 rounded-lg border border-slate-200 text-xs bg-white"
                                                value={rule.op}
                                                onChange={(e) =>
                                                    setEditingAchievement((a) => ({
                                                        ...a,
                                                        rules: a.rules.map((r, i) =>
                                                            i === index ? { ...r, op: e.target.value as RuleOp } : r,
                                                        ),
                                                    }))
                                                }
                                            >
                                                {RULE_OPS.map((op) => (
                                                    <option key={op} value={op}>
                                                        {RULE_OP_LABELS[op]}
                                                    </option>
                                                ))}
                                            </select>
                                            {rule.op === 'exists' ? (
                                                <div className="h-9" />
                                            ) : rule.field === 'type' ? (
                                                <select
                                                    className="h-9 px-2 rounded-lg border border-slate-200 text-xs bg-white"
                                                    value={String(rule.value || '')}
                                                    onChange={(e) =>
                                                        setEditingAchievement((a) => ({
                                                            ...a,
                                                            rules: a.rules.map((r, i) =>
                                                                i === index ? { ...r, value: e.target.value } : r,
                                                            ),
                                                        }))
                                                    }
                                                >
                                                    <option value="">Select type</option>
                                                    {SCORED_COMPONENT_TYPES.map((type) => (
                                                        <option key={type} value={type}>
                                                            {type}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : rule.field === 'mode' ? (
                                                <select
                                                    className="h-9 px-2 rounded-lg border border-slate-200 text-xs bg-white"
                                                    value={String(rule.value || '')}
                                                    onChange={(e) =>
                                                        setEditingAchievement((a) => ({
                                                            ...a,
                                                            rules: a.rules.map((r, i) =>
                                                                i === index ? { ...r, value: e.target.value } : r,
                                                            ),
                                                        }))
                                                    }
                                                >
                                                    <option value="live">live</option>
                                                    <option value="practice">practice</option>
                                                </select>
                                            ) : rule.field === 'isFirstAttempt' ? (
                                                <select
                                                    className="h-9 px-2 rounded-lg border border-slate-200 text-xs bg-white"
                                                    value={String(rule.value)}
                                                    onChange={(e) =>
                                                        setEditingAchievement((a) => ({
                                                            ...a,
                                                            rules: a.rules.map((r, i) =>
                                                                i === index
                                                                    ? { ...r, value: e.target.value === 'true' }
                                                                    : r,
                                                            ),
                                                        }))
                                                    }
                                                >
                                                    <option value="true">true</option>
                                                    <option value="false">false</option>
                                                </select>
                                            ) : rule.field === 'lessonId' ? (
                                                <select
                                                    className="h-9 px-2 rounded-lg border border-slate-200 text-xs bg-white"
                                                    value={String(rule.value || '')}
                                                    onChange={(e) =>
                                                        setEditingAchievement((a) => ({
                                                            ...a,
                                                            rules: a.rules.map((r, i) =>
                                                                i === index ? { ...r, value: e.target.value } : r,
                                                            ),
                                                        }))
                                                    }
                                                >
                                                    <option value="">Select lesson</option>
                                                    {lessonTargets.map((lesson) => (
                                                        <option key={lesson.id} value={lesson.id}>
                                                            {lesson.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : rule.field === 'componentId' ? (
                                                <select
                                                    className="h-9 px-2 rounded-lg border border-slate-200 text-xs bg-white"
                                                    value={String(rule.value || '')}
                                                    onChange={(e) =>
                                                        setEditingAchievement((a) => ({
                                                            ...a,
                                                            rules: visibleAchievementRules(
                                                                a.rules.map((r, i) =>
                                                                    i === index ? { ...r, value: e.target.value } : r,
                                                                ),
                                                                lessonTargets,
                                                            ),
                                                        }))
                                                    }
                                                >
                                                    <option value="">Select block</option>
                                                    {lessonTargets.flatMap((lesson) =>
                                                        lesson.components.map((block) => (
                                                            <option key={`${lesson.id}-${block.id}`} value={block.id}>
                                                                {lesson.title} · {block.title}
                                                            </option>
                                                        )),
                                                    )}
                                                </select>
                                            ) : (
                                                <input
                                                    className="h-9 px-2 rounded-lg border border-slate-200 text-xs bg-white"
                                                    placeholder="value"
                                                    value={rule.value === undefined ? '' : String(rule.value)}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        const parsed =
                                                            raw === 'true'
                                                                ? true
                                                                : raw === 'false'
                                                                  ? false
                                                                  : raw !== '' && !Number.isNaN(Number(raw))
                                                                    ? Number(raw)
                                                                    : raw;
                                                        setEditingAchievement((a) => ({
                                                            ...a,
                                                            rules: a.rules.map((r, i) =>
                                                                i === index ? { ...r, value: parsed } : r,
                                                            ),
                                                        }));
                                                    }}
                                                />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditingAchievement((a) => ({
                                                        ...a,
                                                        rules: a.rules.filter((_, i) => i !== index),
                                                    }))
                                                }
                                                className="h-9 w-8 text-slate-400"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        {!eventFields.includes(rule.field) && (
                                            <input
                                                className="h-9 w-full px-2 rounded-lg border border-slate-200 text-xs bg-white"
                                                placeholder="custom field name"
                                                value={rule.field}
                                                onChange={(e) =>
                                                    setEditingAchievement((a) => ({
                                                        ...a,
                                                        rules: a.rules.map((r, i) =>
                                                            i === index ? { ...r, field: e.target.value } : r,
                                                        ),
                                                    }))
                                                }
                                            />
                                        )}
                                        {rule.op === 'ratioLt' && (
                                            <input
                                                className="h-9 w-full px-2 rounded-lg border border-slate-200 text-xs bg-white"
                                                placeholder="divide by field, e.g. timeLimitMs"
                                                value={rule.over || ''}
                                                onChange={(e) =>
                                                    setEditingAchievement((a) => ({
                                                        ...a,
                                                        rules: a.rules.map((r, i) =>
                                                            i === index ? { ...r, over: e.target.value } : r,
                                                        ),
                                                    }))
                                                }
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <input
                                type="checkbox"
                                checked={editingAchievement.enabled}
                                onChange={(e) =>
                                    setEditingAchievement((a) => ({ ...a, enabled: e.target.checked }))
                                }
                            />
                            Enabled for students
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 h-10 rounded-xl text-xs font-extrabold text-white bg-purple-600 flex items-center justify-center gap-1.5"
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}{' '}
                                Save
                            </button>
                            {!isNewAchievement && (
                                <button
                                    type="button"
                                    onClick={() => void deleteAchievement(editingAchievement.id)}
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
