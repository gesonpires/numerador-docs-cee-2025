import { Series, DocNumber, DashboardStats, SeriesStats, User, PaginatedResponse, ReserveNumberForm, IssueNumberForm, VoidNumberForm, CreateSeriesForm } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // Auth
    async login(email: string, password: string) {
        return this.request<{ user: User; token: string }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async getCurrentUser() {
        return this.request<User>('/api/auth/me');
    }

    async logout() {
        return this.request<{ message: string }>('/api/auth/logout', {
            method: 'POST',
        });
    }

    // Dashboard
    async getDashboardStats() {
        return this.request<DashboardStats>('/api/dashboard/stats');
    }

    async getSeriesStats() {
        return this.request<{ data: SeriesStats[] }>('/api/dashboard/series-stats');
    }

    // Series
    async getSeries() {
        return this.request<{ data: Series[] }>('/api/series');
    }

    async getSeriesById(id: string) {
        return this.request<Series>(`/api/series/${id}`);
    }

    async createSeries(data: CreateSeriesForm) {
        return this.request<Series>('/api/series', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateSeries(id: string, data: Partial<CreateSeriesForm>) {
        return this.request<Series>(`/api/series/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteSeries(id: string) {
        return this.request<{ message: string }>(`/api/series/${id}`, {
            method: 'DELETE',
        });
    }

    // Numbers
    async reserveNumber(data: ReserveNumberForm) {
        return this.request<{ data: DocNumber[] }>('/api/numbers/reserve', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async issueNumber(id: string, data: IssueNumberForm) {
        return this.request<DocNumber>(`/api/numbers/${id}/issue`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async voidNumber(id: string, data: VoidNumberForm) {
        return this.request<DocNumber>(`/api/numbers/${id}/void`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getNumbers(params: {
        seriesId?: string;
        year?: number;
        state?: 'RESERVED' | 'ISSUED' | 'VOIDED';
        q?: string;
        page?: number;
        limit?: number;
    } = {}) {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, value.toString());
            }
        });

        const queryString = searchParams.toString();
        const endpoint = queryString ? `/api/numbers?${queryString}` : '/api/numbers';

        return this.request<PaginatedResponse<DocNumber>>(endpoint);
    }

    async getNumberById(id: string) {
        return this.request<DocNumber>(`/api/numbers/${id}`);
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
