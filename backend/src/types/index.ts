import { z } from 'zod';

// Schemas de validação para as rotas
export const ReserveNumberSchema = z.object({
    seriesId: z.string().cuid(),
    count: z.number().int().min(1).max(100).default(1),
});

export const IssueNumberSchema = z.object({
    metadata: z.record(z.any()).optional(),
});

export const VoidNumberSchema = z.object({
    reason: z.string().min(1).max(500),
});

export const CreateSeriesSchema = z.object({
    name: z.string().min(1).max(100),
    tipo: z.string().min(1).max(50),
    sigla: z.string().max(20),
    formato: z.string().min(1).max(100),
    resetPolicy: z.enum(['ANNUAL', 'CONTINUOUS']),
});

export const UpdateSeriesSchema = CreateSeriesSchema.partial();

export const GetNumbersSchema = z.object({
    seriesId: z.string().cuid().optional(),
    year: z.number().int().optional(),
    state: z.enum(['RESERVED', 'ISSUED', 'VOIDED']).optional(),
    q: z.string().optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
});

// Tipos TypeScript derivados dos schemas
export type ReserveNumberRequest = z.infer<typeof ReserveNumberSchema>;
export type IssueNumberRequest = z.infer<typeof IssueNumberSchema>;
export type VoidNumberRequest = z.infer<typeof VoidNumberSchema>;
export type CreateSeriesRequest = z.infer<typeof CreateSeriesSchema>;
export type UpdateSeriesRequest = z.infer<typeof UpdateSeriesSchema>;
export type GetNumbersRequest = z.infer<typeof GetNumbersSchema>;

// Tipos de resposta
export interface NumberResponse {
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
}

export interface SeriesResponse {
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

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
