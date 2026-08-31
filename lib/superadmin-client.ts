import axios, { AxiosInstance } from 'axios';

const TOKEN_KEY = 'ast_superadmin_token';

class SuperadminClient {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
            headers: { 'Content-Type': 'application/json' },
        });

        this.api.interceptors.request.use((config) => {
            const token = this.getToken();
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        });

        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && typeof window !== 'undefined') {
                    this.clearToken();
                    if (!window.location.pathname.startsWith('/superadmin/login')) {
                        window.location.href = '/superadmin/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    getToken() {
        if (typeof window === 'undefined') return null;
        try {
            return sessionStorage.getItem(TOKEN_KEY);
        } catch {
            return null;
        }
    }

    setToken(token: string) {
        if (typeof window === 'undefined') return;
        sessionStorage.setItem(TOKEN_KEY, token);
    }

    clearToken() {
        if (typeof window === 'undefined') return;
        sessionStorage.removeItem(TOKEN_KEY);
    }

    login = (username: string, password: string) =>
        this.api.post('/superadmin/login', { username, password }).then((r) => r.data);

    me = () => this.api.get('/superadmin/me').then((r) => r.data);

    listMissions = () => this.api.get('/superadmin/catalog/missions').then((r) => r.data);
    createMission = (data: Record<string, unknown>) =>
        this.api.post('/superadmin/catalog/missions', data).then((r) => r.data);
    updateMission = (id: string, data: Record<string, unknown>) =>
        this.api.put(`/superadmin/catalog/missions/${id}`, data).then((r) => r.data);
    deleteMission = (id: string) =>
        this.api.delete(`/superadmin/catalog/missions/${id}`).then((r) => r.data);

    listTargets = () => this.api.get('/superadmin/catalog/targets').then((r) => r.data);

    listAchievements = () => this.api.get('/superadmin/catalog/achievements').then((r) => r.data);
    createAchievement = (data: Record<string, unknown>) =>
        this.api.post('/superadmin/catalog/achievements', data).then((r) => r.data);
    updateAchievement = (id: string, data: Record<string, unknown>) =>
        this.api.put(`/superadmin/catalog/achievements/${id}`, data).then((r) => r.data);
    deleteAchievement = (id: string) =>
        this.api.delete(`/superadmin/catalog/achievements/${id}`).then((r) => r.data);

    listJobs = () => this.api.get('/superadmin/jobs').then((r) => r.data);
    runJob = (id: string, data: { dryRun: boolean }) =>
        this.api.post(`/superadmin/jobs/${id}/run`, data).then((r) => r.data);
}

export const superadminClient = new SuperadminClient();
