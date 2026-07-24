'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Lesson } from '@/types/lesson';
import { normalizeSlides } from '@/lib/lesson-utils';

interface LoadLessonModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLoadSuccess: (lesson: Lesson, lessonId: string) => void;
}

export function LoadLessonModal({ open, onOpenChange, onLoadSuccess }: LoadLessonModalProps) {
    const [programs, setPrograms] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [lessons, setLessons] = useState<any[]>([]);
    const [selectedProgramId, setSelectedProgramId] = useState('');
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [selectedLessonId, setSelectedLessonId] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingPrograms, setFetchingPrograms] = useState(false);
    const [fetchingModules, setFetchingModules] = useState(false);
    const [fetchingLessons, setFetchingLessons] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            loadPrograms();
        }
    }, [open]);

    useEffect(() => {
        if (selectedProgramId) {
            loadModules(selectedProgramId);
        } else {
            setModules([]);
            setLessons([]);
        }
    }, [selectedProgramId]);

    useEffect(() => {
        if (selectedModuleId) {
            loadLessons(selectedModuleId);
        } else {
            setLessons([]);
        }
    }, [selectedModuleId]);

    const loadPrograms = async () => {
        setFetchingPrograms(true);
        try {
            const data = await apiClient.studio.getPrograms();
            setPrograms(data);
        } catch (err: any) {
            setError('Failed to load programs');
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
        } finally {
            setFetchingModules(false);
        }
    };

    const loadLessons = async (moduleId: string) => {
        setFetchingLessons(true);
        try {
            const data = await apiClient.studio.getLessons(moduleId);
            setLessons(data);
        } catch (err: any) {
            setError('Failed to load lessons');
        } finally {
            setFetchingLessons(false);
        }
    };

    const handleLoad = async () => {
        if (!selectedLessonId) {
            setError('Please select a lesson');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const lessonData = await apiClient.studio.getLesson(selectedLessonId);

            // Transform to expected Lesson format
            const lesson: Lesson = {
                id: lessonData.content.id,
                title: lessonData.title,
                slides: normalizeSlides(lessonData.content.slides || []),
                settings: lessonData.content.settings || {},
            };

            onLoadSuccess(lesson, selectedLessonId);
            onOpenChange(false);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load lesson');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Load Lesson from Database</DialogTitle>
                    <DialogDescription>
                        Browse your programs and select a lesson to load
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}

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

                    <div className="space-y-2">
                        <Label>Lesson</Label>
                        {fetchingLessons ? (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading lessons...
                            </div>
                        ) : (
                            <ScrollArea className="h-[200px] rounded-md border">
                                <div className="p-2 space-y-2">
                                    {lessons.length === 0 ? (
                                        <div className="text-sm text-gray-500 text-center py-8">
                                            {selectedModuleId ? 'No lessons in this module' : 'Select a module first'}
                                        </div>
                                    ) : (
                                        lessons.map((lesson) => (
                                            <button
                                                key={lesson._id}
                                                onClick={() => setSelectedLessonId(lesson._id)}
                                                className={`w-full p-3 text-left rounded-md transition-colors ${selectedLessonId === lesson._id
                                                    ? 'bg-blue-100 border-blue-500 border-2'
                                                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm truncate">{lesson.title}</div>
                                                        {lesson.description && (
                                                            <div className="text-xs text-gray-600 truncate">
                                                                {lesson.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button onClick={handleLoad} disabled={loading || !selectedLessonId}>
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Load Lesson'
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
