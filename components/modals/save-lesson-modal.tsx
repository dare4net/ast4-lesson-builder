'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Volume2 } from 'lucide-react';
import type { Lesson } from '@/types/lesson';
import { VoiceSelector } from '@/components/ui/voice-selector';
import { getVoiceById } from '@/lib/voices';

interface SaveLessonModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lesson: Lesson;
    onSaveSuccess: (lessonId: string) => void;
    currentLessonId?: string | null;
}

export function SaveLessonModal({
    open,
    onOpenChange,
    lesson,
    onSaveSuccess,
    currentLessonId,
}: SaveLessonModalProps) {
    const searchParams = useSearchParams();
    const moduleIdFromUrl = searchParams?.get('moduleId') || '';

    const [programs, setPrograms] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [selectedProgramId, setSelectedProgramId] = useState('');
    const [selectedModuleId, setSelectedModuleId] = useState(moduleIdFromUrl || '');
    const [lessonTitle, setLessonTitle] = useState(lesson.title || '');
    const [lessonDescription, setLessonDescription] = useState('');
    const [lessonVoice, setLessonVoice] = useState(lesson.voice || 'inherit');
    const [loading, setLoading] = useState(false);
    const [fetchingPrograms, setFetchingPrograms] = useState(false);
    const [fetchingModules, setFetchingModules] = useState(false);
    const [error, setError] = useState('');

    // Load programs on open
    useEffect(() => {
        if (open) {
            loadPrograms();
            setLessonTitle(lesson.title || '');
        }
    }, [open, lesson.title]);

    // Load modules when program is selected
    useEffect(() => {
        if (selectedProgramId) {
            loadModules(selectedProgramId);
        }
    }, [selectedProgramId]);

    const loadPrograms = async () => {
        setFetchingPrograms(true);
        try {
            const data = await apiClient.studio.getPrograms();
            setPrograms(data);
        } catch (err: any) {
            setError('Failed to load programs');
            console.error(err);
        } finally {
            setFetchingPrograms(false);
        }
    };

    const loadModules = async (programId: string) => {
        setFetchingModules(true);
        try {
            const data = await apiClient.studio.getModules(programId);
            setModules(data);
        } catch (err: any) {
            setError('Failed to load modules');
            console.error(err);
        } finally {
            setFetchingModules(false);
        }
    };

    const handleSave = async () => {
        if (!selectedModuleId || !lessonTitle.trim()) {
            setError('Please select a module and enter a title');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const lessonData = {
                title: lessonTitle,
                description: lessonDescription,
                slides: lesson.slides,
                voice: lessonVoice,
                settings: lesson.settings || {},
            };

            if (currentLessonId) {
                // Update existing lesson
                await apiClient.studio.updateLesson(currentLessonId, lessonData);
                onSaveSuccess(currentLessonId);
            } else {
                // Create new lesson
                const result = await apiClient.studio.createLesson(selectedModuleId, lessonData);
                onSaveSuccess(result.lesson._id);
            }

            onOpenChange(false);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save lesson');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {currentLessonId ? 'Update Lesson' : 'Save Lesson to Database'}
                    </DialogTitle>
                    <DialogDescription>
                        {currentLessonId
                            ? 'Update this lesson in the database'
                            : 'Select a module and save your lesson'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}

                    {!currentLessonId && (
                        <>
                            <div className="space-y-2">
                                <Label>Program</Label>
                                {fetchingPrograms ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading programs...
                                    </div>
                                ) : (
                                    <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a program" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {programs.map((program) => (
                                                <SelectItem key={program._id} value={program._id}>
                                                    {program.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Module</Label>
                                {fetchingModules ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading modules...
                                    </div>
                                ) : (
                                    <Select
                                        value={selectedModuleId}
                                        onValueChange={setSelectedModuleId}
                                        disabled={!selectedProgramId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a module" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modules.map((module) => (
                                                <SelectItem key={module._id} value={module._id}>
                                                    {module.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="title">Lesson Title *</Label>
                        <Input
                            id="title"
                            value={lessonTitle}
                            onChange={(e) => setLessonTitle(e.target.value)}
                            placeholder="Enter lesson title"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={lessonDescription}
                            onChange={(e) => setLessonDescription(e.target.value)}
                            placeholder="Brief description..."
                            rows={3}
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                            Lesson Voice Narration
                        </Label>
                        <VoiceSelector
                            value={lessonVoice}
                            onChange={setLessonVoice}
                            inheritLabel="Inherit from Module"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={handleSave}
                        disabled={loading || !lessonTitle.trim() || (!currentLessonId && !selectedModuleId)}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : currentLessonId ? (
                            'Update Lesson'
                        ) : (
                            'Save Lesson'
                        )}
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
