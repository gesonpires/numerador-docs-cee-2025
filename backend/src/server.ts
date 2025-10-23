import Fastify from 'fastify';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const logger = {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname'
        }
    } : undefined
};

const fastify = Fastify({ logger });
const prisma = new PrismaClient();

fastify.register(require('@fastify/cors'), {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
});

fastify.get('/health', async (request, reply) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected'
        };
    } catch (error) {
        reply.code(503);
        return {
            status: 'error',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
});

fastify.get('/api/series', async (request, reply) => {
    try {
        const series = await prisma.series.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
        return { data: series };
    } catch (error) {
        reply.code(500);
        return { error: 'Erro interno do servidor' };
    }
});

fastify.get('/api/dashboard/stats', async (request, reply) => {
    try {
        const currentYear = new Date().getFullYear();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const totalSeries = await prisma.series.count({
            where: { isActive: true }
        });
        
        const emittedToday = await prisma.docNumber.count({
            where: {
                state: 'ISSUED',
                issuedAt: { gte: today }
            }
        });
        
        const pending = await prisma.docNumber.count({
            where: { state: 'RESERVED' }
        });
        
        const totalEmitted = await prisma.docNumber.count({
            where: { state: 'ISSUED' }
        });
        
        return {
            totalSeries,
            emittedToday,
            pending,
            totalEmitted
        };
    } catch (error) {
        reply.code(500);
        return { error: 'Erro interno do servidor' };
    }
});

fastify.get('/api/dashboard/series-stats', async (request, reply) => {
    try {
        const seriesStats = await prisma.series.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: {
                        numbers: {
                            where: { state: 'ISSUED' }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
        
        const stats = seriesStats.map(series => ({
            id: series.id,
            name: series.name,
            totalEmitted: series._count.numbers
        }));
        
        return { data: stats };
    } catch (error) {
        reply.code(500);
        return { error: 'Erro interno do servidor' };
    }
});

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3001');
        const host = process.env.HOST || '0.0.0.0';
        await fastify.listen({ port, host });
        fastify.log.info(`🚀 Servidor rodando em http://${host}:${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();

// Rota para buscar números (histórico)
fastify.get('/api/numbers', async (request, reply) => {
    try {
        const { seriesId, year, state, q, page = 1, limit = 10 } = request.query as any;
        
        const where: any = {};
        
        if (seriesId) where.seriesId = seriesId;
        if (year) where.year = parseInt(year);
        if (state) where.state = state;
        if (q) {
            where.OR = [
                { formatted: { contains: q } },
                { metadata: { path: ['processo'], string_contains: q } },
                { metadata: { path: ['interessado'], string_contains: q } },
                { metadata: { path: ['assunto'], string_contains: q } }
            ];
        }
        
        const numbers = await prisma.docNumber.findMany({
            where,
            include: {
                series: {
                    select: { name: true, sigla: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit)
        });
        
        const total = await prisma.docNumber.count({ where });
        
        return {
            data: numbers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        reply.code(500);
        return { error: 'Erro interno do servidor' };
    }
});

// Rota para relatórios
fastify.get('/api/reports/summary', async (request, reply) => {
    try {
        const { startDate, endDate, seriesId } = request.query as any;
        
        const where: any = {};
        
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        
        if (seriesId) {
            where.seriesId = seriesId;
        }
        
        const numbers = await prisma.docNumber.findMany({
            where,
            include: {
                series: {
                    select: { name: true, sigla: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        // Estatísticas por série
        const seriesStats = await prisma.series.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: {
                        numbers: {
                            where: where.createdAt ? {
                                createdAt: where.createdAt
                            } : {}
                        }
                    }
                }
            }
        });
        
        return {
            totalNumbers: numbers.length,
            byState: {
                reserved: numbers.filter(n => n.state === 'RESERVED').length,
                issued: numbers.filter(n => n.state === 'ISSUED').length,
                voided: numbers.filter(n => n.state === 'VOIDED').length
            },
            bySeries: seriesStats.map(s => ({
                name: s.name,
                total: s._count.numbers
            })),
            numbers: numbers
        };
    } catch (error) {
        reply.code(500);
        return { error: 'Erro interno do servidor' };
    }
});
