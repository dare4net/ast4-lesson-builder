import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
    awardStarsBodySchema,
    claimMissionBodySchema,
    interactionSaveBodySchema,
    spendStarsBodySchema,
    statsEventBodySchema,
    type InteractionSaveBody,
} from '@/lib/contracts';
import { captureException } from '@/lib/error-tracker';
import type { OrgBrandingSettings } from '@/lib/org-branding';
import { createRequestId, REQUEST_ID_HEADER } from '@/lib/request-id';

class APIClient {
    private api: AxiosInstance;
    private token: string | null = null;

    constructor() {
        this.api = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });

        // Request interceptor to add auth token
        this.api.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                config.headers[REQUEST_ID_HEADER] = createRequestId();
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid - clear auth
                    this.clearToken();
                    if (typeof window !== 'undefined') {
                        window.location.href = '/auth/login';
                    }
                } else {
                    const status = error.response?.status as number | undefined;
                    if (!error.response || (status != null && status >= 500)) {
                        const headers = error.config?.headers;
                        const requestId =
                            headers?.[REQUEST_ID_HEADER] ||
                            headers?.['X-Request-Id'] ||
                            error.response?.headers?.[REQUEST_ID_HEADER];
                        captureException(error, {
                            requestId,
                            url: error.config?.url,
                            status,
                            source: 'api-client',
                        });
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('ast_token', token);
                document.cookie = `ast_token=${token}; path=/; max-age=86400; SameSite=Lax`;
            } catch (e) {
                console.warn('[api-client] Could not write token to storage:', e);
            }
        }
    }

    getToken(): string | null {
        if (!this.token && typeof window !== 'undefined') {
            try {
                const item = localStorage.getItem('ast_token');
                this.token = item === 'undefined' || item === 'null' ? null : item;
            } catch (e) {
                console.warn('[api-client] Could not read token from storage:', e);
                this.token = null;
            }
        }
        return this.token;
    }

    setUser(user: any) {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('ast_user', JSON.stringify(user));
            } catch (e) {
                console.warn('[api-client] Could not save user to storage:', e);
            }
        }
    }

    getUser(): any | null {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('ast_user');
                if (stored && stored !== 'undefined' && stored !== 'null') {
                    return JSON.parse(stored);
                }
            } catch (e) {
                console.warn('[api-client] Corrupted user data in storage, removing key:', e);
                try {
                    localStorage.removeItem('ast_user');
                } catch { }
                return null;
            }
        }
        return null;
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem('ast_token');
                localStorage.removeItem('ast_user');
                document.cookie = 'ast_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            } catch (e) {
                console.warn('[api-client] Error clearing storage:', e);
            }
        }
    }

    // Auth endpoints
    async signup(email: string, password: string, fullName: string, role: string = 'tutor') {
        const response = await this.api.post('/auth/signup', {
            email,
            password,
            full_name: fullName,
            role,
        });
        return response.data;
    }

    async login(email: string, password: string) {
        const response = await this.api.post('/auth/login', { email, password });
        return response.data;
    }

    // Generic HTTP methods
    async get<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.get(endpoint, config);
        return response.data;
    }

    async post<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.post(endpoint, data, config);
        return response.data;
    }

    async put<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.put(endpoint, data, config);
        return response.data;
    }

    async patch<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.patch(endpoint, data, config);
        return response.data;
    }

    async delete<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.delete(endpoint, config);
        return response.data;
    }

    // Studio-specific endpoints
    studio = {
        // Programs
        getPrograms: (orgId?: string | null) => {
            if (!orgId) return this.get('/studio/programs');
            return this.get(`/studio/programs?org_id=${encodeURIComponent(orgId)}`);
        },
        getProgram: (id: string) => this.get(`/studio/programs/${id}`),
        createProgram: (data: {
            name: string
            description?: string
            org_id?: string | null
            visibility?: 'org' | 'marketplace' | 'unlisted'
        }) => this.post('/studio/programs', data),
        updateProgram: (
            id: string,
            data: {
                name?: string
                description?: string
                org_id?: string | null
                visibility?: 'org' | 'marketplace' | 'unlisted'
                is_published?: boolean
                image_url?: string
            },
        ) => this.put(`/studio/programs/${id}`, data),
        deleteProgram: (id: string) => this.delete(`/studio/programs/${id}`),

        // Modules
        getModules: (programId: string) => this.get(`/studio/programs/${programId}/modules`),
        getModule: (id: string) => this.get(`/studio/modules/${id}`),
        createModule: (programId: string, data: { name: string; description?: string; order?: number }) =>
            this.post(`/studio/programs/${programId}/modules`, data),
        updateModule: (id: string, data: { name?: string; description?: string; order?: number; is_published?: boolean; image_url?: string; default_voice?: string }) =>
            this.put(`/studio/modules/${id}`, data),
        deleteModule: (id: string) => this.delete(`/studio/modules/${id}`),

        // Lessons
        getLessons: (moduleId: string) => this.get(`/studio/modules/${moduleId}/lessons`),
        getLesson: (id: string) => this.get(`/studio/lessons/${id}`),
        createLesson: (
            moduleId: string,
            data: {
                title: string;
                description?: string;
                order?: number;
                slides: any[];
                settings?: any;
            }
        ) => this.post(`/studio/modules/${moduleId}/lessons`, data),
        updateLesson: (
            id: string,
            data: {
                title?: string;
                description?: string;
                order?: number;
                slides?: any[];
                settings?: any;
                version?: number;
                is_published?: boolean;
                voice?: string;
                introAudioUrl?: string | null;
                introTextHash?: string;
            }
        ) => this.put(`/studio/lessons/${id}`, data),
        deleteLesson: (id: string) => this.delete(`/studio/lessons/${id}`),

        // Analytics
        getStats: () => this.get('/studio/stats'),
        getActivity: () => this.get('/studio/activity'),
        getStudents: () => this.get('/studio/students'),
        getStudentDetail: (id: string) => this.get(`/studio/students/${id}`),
        getStudentProgramBreakdown: (id: string, programId: string) => this.get(`/studio/students/${id}/programs/${programId}`),
        markStudentResponse: (studentId: string, lessonId: string, componentId: string, data: { score: number; isApproved: boolean; mode?: string; type?: string; maxScore?: number; correctAnswers?: Record<string, boolean> }) =>
            this.post(`/studio/students/${studentId}/lessons/${lessonId}/components/${componentId}/mark`, data),
        resetStudentResponse: (studentId: string, lessonId: string, componentId: string, data?: { type?: string }) =>
            this.post(`/studio/students/${studentId}/lessons/${lessonId}/components/${componentId}/reset`, data || {}),
    };

    // Programs (Student access)
    programs = {
        list: () => this.get('/programs'),
        getCatalog: () => this.get('/programs'),
        searchCurriculum: (q: string) =>
            this.get(`/programs/search?q=${encodeURIComponent(q)}`),
        getMyPrograms: (orgId?: string | null) =>
            orgId
                ? this.get(`/programs/my/programs?org_id=${encodeURIComponent(orgId)}`)
                : this.get('/programs/my/programs'),
        getDetails: (id: string) => this.get(`/programs/${id}`),
        getMyProgramProgress: (id: string) => this.get(`/programs/my/programs/${id}/progress`),
        register: (id: string) => this.post(`/programs/${id}/register`),
        unregister: (id: string) => this.delete(`/programs/${id}/unregister`),
    };

    orgs = {
        mine: () => this.get('/orgs/mine'),
        get: (id: string) => this.get(`/orgs/${id}`),
        getPrograms: (id: string) => this.get(`/orgs/${id}/programs`),
        update: (
            id: string,
            data: {
                settings?: Partial<
                    Pick<
                        OrgBrandingSettings,
                        | 'allowPublicOptIn'
                        | 'accentColor'
                        | 'logoUrl'
                        | 'bannerUrl'
                        | 'faviconUrl'
                        | 'welcomeMessage'
                        | 'prideScope'
                        | 'joinLayout'
                    >
                >
            },
        ) => this.patch(`/orgs/${id}`, data),
        addMember: (id: string, data: { email?: string; userId?: string; role: string }) =>
            this.post(`/orgs/${id}/members`, data),
        listCohorts: (id: string) => this.get(`/orgs/${id}/cohorts`),
        createCohort: (id: string, data: Record<string, unknown>) =>
            this.post(`/orgs/${id}/cohorts`, data),
        updateCohort: (orgId: string, cohortId: string, data: Record<string, unknown>) =>
            this.patch(`/orgs/${orgId}/cohorts/${cohortId}`, data),
        previewInvite: (token: string) =>
            this.get(`/orgs/invites/${encodeURIComponent(token)}`),
        completeInvite: (
            token: string,
            data: { fullName: string; password: string; cohortName: string },
        ) => this.post(`/orgs/invites/${encodeURIComponent(token)}/complete`, data),
        cancelInvite: (orgId: string, memberId: string) =>
            this.delete(`/orgs/${orgId}/members/${memberId}/invite`),
        removeMember: (orgId: string, userId: string) =>
            this.delete(`/orgs/${orgId}/members/${userId}/membership`),
        leave: (orgId: string) => this.post(`/orgs/${orgId}/leave`),
        assignMemberCohort: (orgId: string, userId: string, cohortId: string) =>
            this.post(`/orgs/${orgId}/members/${userId}/cohort`, { cohortId }),
        previewJoin: (code: string) =>
            this.get(`/orgs/join/preview?code=${encodeURIComponent(code)}`),
        getPublicBySlug: (slug: string) =>
            this.get(`/orgs/public/${encodeURIComponent(slug)}`),
        join: (code: string) => this.post('/orgs/join', { code }),
        acceptInvite: (token: string) => this.post('/orgs/invites/accept', { token }),
    };

    lessons = {
        listMine: (userId: string, orgId?: string | null) =>
            orgId
                ? this.get(`/lessons/my/interactions/${userId}?org_id=${encodeURIComponent(orgId)}`)
                : this.get(`/lessons/my/interactions/${userId}`),
        getModuleLessons: (moduleId: string) => this.get(`/lessons/module/${moduleId}/lessons`),
        getLessonDetails: async (lessonId: string) => {
            const data = await this.get(`/lessons/${lessonId}`);
            return data?.lesson ?? data;
        },
        markCompleted: (lessonId: string, score: number = 0, maxScore: number = 0) =>
            this.post(`/lessons/${lessonId}/complete`, { score, maxScore }),
    };

    interactions = {
        get: (lessonId: string, userId?: string) => {
            const params = new URLSearchParams({ lessonId });
            if (userId) params.set('userId', userId);
            return this.get(`/interactions?${params.toString()}`);
        },
        save: (data: InteractionSaveBody) =>
            this.post('/interactions', interactionSaveBodySchema.parse(data)),
    };

    live = {
        getPoll: (lessonId: string, componentId: string) =>
            this.get(`/polls?lessonId=${encodeURIComponent(lessonId)}&componentId=${encodeURIComponent(componentId)}`),
        votePoll: (lessonId: string, componentId: string, optionId: string) =>
            this.post('/polls', { lessonId, componentId, optionId }),
        getWordCloud: (lessonId: string, componentId: string) =>
            this.get(`/wordclouds?lessonId=${encodeURIComponent(lessonId)}&componentId=${encodeURIComponent(componentId)}`),
        addWordCloudWord: (lessonId: string, componentId: string, word: string) =>
            this.post('/wordclouds', { lessonId, componentId, word }),
        getScale: (lessonId: string, componentId: string) =>
            this.get(`/scales?lessonId=${encodeURIComponent(lessonId)}&componentId=${encodeURIComponent(componentId)}`),
        rateScale: (lessonId: string, componentId: string, value: number) =>
            this.post('/scales', { lessonId, componentId, value }),
    };

    store = {
        get: () => this.get('/store'),
        buy: (sku: string) => this.post('/store/buy', { sku }),
        upgrade: (sku: string) => this.post('/store/upgrade', { sku }),
        activate: (sku: string) => this.post('/store/activate', { sku }),
        quoteReset: (lessonId: string) =>
            this.get(`/store/reset-quote?lessonId=${encodeURIComponent(lessonId)}`),
        resetLesson: (lessonId: string) => this.post('/store/reset-lesson', { lessonId }),
        unlockLesson: (lessonId: string) => this.post('/store/unlock-lesson', { lessonId }),
        printCertificate: (body: { kind: 'lesson' | 'pride'; lessonId?: string; statKey?: string }) =>
            this.post('/store/print-certificate', body),
        consume: (body: { sku: 'hint_pack' | 'live_block_reset' | 'reference_credit' }) =>
            this.post('/store/consume', body),
        resetBlock: (body: { lessonId: string; componentId: string }) =>
            this.post('/store/reset-block', body),
        openReference: (body: { kind: 'practice' | 'live'; componentId?: string; questionId?: string }) =>
            this.post('/store/open-reference', body),
    };

    gamification = {
        getStats: () => this.get('/stats/summary'),
        getMissionCatalog: () => this.get('/missions/catalog'),
        getAchievements: () => this.get('/achievements/student'),
        evaluateAchievements: (eventType: string, payload: Record<string, unknown>) =>
            this.post('/achievements/evaluate', { eventType, payload }),
        getGlobalLeaderboard: () => this.get('/leaderboard/global'),
        getProgramLeaderboard: (programId: string) => this.get(`/leaderboard/program/${programId}`),
        getPersonalRank: () => this.get('/leaderboard/personal'),
        getWallet: () => this.get('/wallet'),
        awardStars: (amount: number, reason: string, componentId?: string) =>
            this.post('/wallet/award', awardStarsBodySchema.parse({ amount, reason, componentId })),
        spendStars: (amount: number, itemType: string) =>
            this.post('/wallet/spend', spendStarsBodySchema.parse({ amount, itemType })),
        claimMission: (missionId: string) =>
            this.post('/missions/claim', claimMissionBodySchema.parse({ missionId })),
        claimStreakBonus: () => this.post('/stats/claim-streak-bonus', {}),
        levelUp: () => this.post('/level/up'),
        recordProgressEvent: (eventType: string, payload?: {
            isFirstAttempt?: boolean
            percentage?: number
            mode?: 'live' | 'practice'
            type?: string
            amount?: number
            lessonId?: string
            programId?: string
            componentId?: string
            completionTimeMs?: number
            extras?: Record<string, number | boolean | string>
        }) =>
            this.post('/stats/event', statsEventBodySchema.parse({ eventType, ...payload })),
    };

    pride = {
        summary: (orgId?: string | null) =>
            orgId
                ? this.get(`/pride?org_id=${encodeURIComponent(orgId)}`)
                : this.get('/pride'),
        board: (statKey: string, orgId?: string | null) =>
            orgId
                ? this.get(`/pride/${encodeURIComponent(statKey)}?org_id=${encodeURIComponent(orgId)}`)
                : this.get(`/pride/${encodeURIComponent(statKey)}`),
    };

    profile = {
        get: () => this.get('/profile'),
        update: (data: { full_name?: string; handle?: string; isPublicProfile?: boolean; accentColor?: string; avatarId?: string; avatarFrame?: 'gold' | ''; nameplate?: 'duo' | ''; pinnedStatKey?: string | null }) =>
            this.put('/profile', data),
        updatePublicAccess: (enabled: boolean) =>
            this.patch('/profile/public-access', { enabled }),
    };

    onboarding = {
        complete: (data: { skipped?: boolean; full_name?: string; handle?: string; accentColor?: string; avatarId?: string }) =>
            this.post('/onboarding/complete', data),
    };

    people = {
        getByHandle: (handle: string) => this.get(`/people/${encodeURIComponent(handle)}`),
        search: (q = '', orgId?: string | null) => {
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            if (orgId) params.set('org_id', orgId);
            const qs = params.toString();
            return this.get(`/people/search${qs ? `?${qs}` : ''}`);
        },
        follow: (handle: string) => this.post(`/people/${encodeURIComponent(handle)}/follow`),
        unfollow: (handle: string) => this.delete(`/people/${encodeURIComponent(handle)}/follow`),
        mute: (handle: string, muted: boolean) =>
            this.post(`/people/${encodeURIComponent(handle)}/mute`, { muted }),
        block: (handle: string) => this.post(`/people/${encodeURIComponent(handle)}/block`),
        unblock: (handle: string) => this.delete(`/people/${encodeURIComponent(handle)}/block`),
    };

    notifications = {
        list: (opts?: { unread?: boolean; limit?: number }) => {
            const params = new URLSearchParams();
            if (opts?.unread) params.set('unread', 'true');
            if (opts?.limit) params.set('limit', String(opts.limit));
            const query = params.toString();
            return this.get(`/notifications${query ? `?${query}` : ''}`);
        },
        unreadCount: () => this.get('/notifications/unread-count'),
        markRead: (body: { ids?: string[]; all?: boolean }) => this.post('/notifications/read', body),
    };

    push = {
        register: (token: string) => this.post('/push/tokens', { token }),
        unregister: (token: string) => this.delete('/push/tokens', { data: { token } }),
    };
}

// Export singleton instance
export const apiClient = new APIClient();
