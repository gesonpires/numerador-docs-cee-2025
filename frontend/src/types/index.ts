// Tipos para as respostas da API
export interface Series {
    id: string;
    name: string;
    tipo: string;
    sigla: string;
    formato: string;
    resetPolicy: 'ANNUAL' | 'CONTINUOUS';
    isActive: boolean;
    nextNumber?: string;
    currentYear?: number;
    currentSeq?: number;
}

export interface DocNumber {
    id: string;
    seriesId: string;
    year: number;
    seq: number;
    formatted: string;
    state: 'RESERVED' | 'ISSUED' | 'VOIDED';
    metadata?: any;
    reservedAt?: string;
    issuedAt?: string;
    voidedAt?: string;
    voidReason?: string;
    series?: {
        name: string;
        tipo: string;
        sigla: string;
    };
}

export interface DashboardStats {
    totalSeries: number;
    totalNumbers: number;
    numbersToday: number;
    pendingNumbers: number;
    recentNumbers: Array<{
        id: string;
        formatted: string;
        series: {
            name: string;
            tipo: string;
            sigla: string;
        };
        issuedAt: string;
    }>;
}

export interface SeriesStats {
    id: string;
    name: string;
    tipo: string;
    sigla: string;
    nextNumber: string;
    currentSeq: number;
    totalIssued: number;
    totalReserved: number;
    totalVoided: number;
    todayCount: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'EDITOR' | 'READER';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Tipos para formulários
export interface ReserveNumberForm {
    seriesId: string;
    count: number;
}

export interface IssueNumberForm {
    metadata?: {
        processo?: string;
        interessado?: string;
        assunto?: string;
    };
}

export interface VoidNumberForm {
    reason: string;
}

export interface CreateSeriesForm {
    name: string;
    tipo: string;
    sigla: string;
    formato: string;
    resetPolicy: 'ANNUAL' | 'CONTINUOUS';
}
