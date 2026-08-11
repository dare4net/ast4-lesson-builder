import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

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
                if (this.token) {
                    config.headers.Authorization = `Bearer ${this.token}`;
                }
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

    async delete<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.api.delete(endpoint, config);
        return response.data;
    }

    // Studio-specific endpoints
    studio = {
        // Programs
        getPrograms: () => this.get('/studio/programs'),
        getProgram: (id: string) => this.get(`/studio/programs/${id}`),
        createProgram: (data: { name: string; description?: string }) =>
            this.post('/studio/programs', data),
        updateProgram: (id: string, data: { name?: string; description?: string }) =>
            this.put(`/studio/programs/${id}`, data),
        deleteProgram: (id: string) => this.delete(`/studio/programs/${id}`),

        // Modules
        getModules: (programId: string) => this.get(`/studio/programs/${programId}/modules`),
        getModule: (id: string) => this.get(`/studio/modules/${id}`),
        createModule: (programId: string, data: { name: string; description?: string; order?: number }) =>
            this.post(`/studio/programs/${programId}/modules`, data),
        updateModule: (id: string, data: { name?: string; description?: string; order?: number }) =>
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
            }
        ) => this.put(`/studio/lessons/${id}`, data),
        deleteLesson: (id: string) => this.delete(`/studio/lessons/${id}`),

        // Analytics
        getStats: () => this.get('/studio/stats'),
        getActivity: () => this.get('/studio/activity'),
        getStudents: () => this.get('/studio/students'),
        getStudentDetail: (id: string) => this.get(`/studio/students/${id}`),
        getStudentProgramBreakdown: (id: string, programId: string) => this.get(`/studio/students/${id}/programs/${programId}`),
        markStudentResponse: (studentId: string, lessonId: string, componentId: string, data: { score: number; isApproved: boolean }) =>
            this.post(`/studio/students/${studentId}/lessons/${lessonId}/components/${componentId}/mark`, data),
    };

    // Programs (Student access)
    programs = {
        list: () => this.get('/programs'),
        getCatalog: () => this.get('/programs'),
        getMyPrograms: () => this.get('/programs/my/programs'),
        getDetails: (id: string) => this.get(`/programs/${id}`),
        getMyProgramProgress: (id: string) => this.get(`/programs/my/programs/${id}/progress`),
        register: (id: string) => this.post(`/programs/${id}/register`),
        unregister: (id: string) => this.delete(`/programs/${id}/unregister`),
    };

    lessons = {
        getModuleLessons: (moduleId: string) => this.get(`/lessons/module/${moduleId}/lessons`),
        markCompleted: (lessonId: string, score: number = 0) => this.post(`/lessons/${lessonId}/complete`, { score }),
    };
}

// Export singleton instance
export const apiClient = new APIClient();
