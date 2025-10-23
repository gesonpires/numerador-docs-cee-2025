import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function dashboardRoutes(fastify: FastifyInstance) {
    // GET /api/dashboard/stats - Estatísticas gerais
    fastify.get('/api/dashboard/stats', async (request, reply) => {
        try {
            const currentYear = new Date().getFullYear();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const [
                totalSeries,
                totalNumbers,
                numbersToday,
                pendingNumbers,
                recentNumbers
            ] = await Promise.all([
                // Total de séries ativas
                prisma.series.count({
                    where: { isActive: true }
                }),

                // Total de números emitidos
                prisma.docNumber.count({
                    where: { state: 'ISSUED' }
                }),

                // Números emitidos hoje
                prisma.docNumber.count({
                    where: {
                        state: 'ISSUED',
                        issuedAt: {
                            gte: today
                        }
                    }
                }),

                // Números pendentes (reservados)
                prisma.docNumber.count({
                    where: { state: 'RESERVED' }
                }),

                // Números recentes (últimos 10)
                prisma.docNumber.findMany({
                    where: { state: 'ISSUED' },
                    include: {
                        series: {
                            select: { name: true, tipo: true, sigla: true }
                        }
                    },
                    orderBy: { issuedAt: 'desc' },
                    take: 10
                })
            ]);

            return {
                totalSeries,
                totalNumbers,
                numbersToday,
                pendingNumbers,
                recentNumbers: recentNumbers.map(number => ({
                    id: number.id,
                    formatted: number.formatted,
                    series: number.series,
                    issuedAt: number.issuedAt?.toISOString()
                }))
            };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500);
            return { error: 'Erro interno do servidor' };
        }
    });

    // GET /api/dashboard/series-stats - Estatísticas por série
    fastify.get('/api/dashboard/series-stats', async (request, reply) => {
        try {
            const currentYear = new Date().getFullYear();

            const seriesStats = await prisma.series.findMany({
                where: { isActive: true },
                include: {
                    counters: {
                        where: { year: currentYear },
                        select: { currentSeq: true }
                    },
                    numbers: {
                        where: { year: currentYear },
                        select: {
                            state: true,
                            issuedAt: true
                        }
                    }
                },
                orderBy: { name: 'asc' }
            });

            const stats = seriesStats.map(series => {
                const counter = series.counters[0];
                const currentSeq = counter?.currentSeq || 0;

                const numbersByState = series.numbers.reduce((acc, number) => {
                    acc[number.state] = (acc[number.state] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const todayCount = series.numbers.filter(number =>
                    number.state === 'ISSUED' &&
                    number.issuedAt &&
                    number.issuedAt >= today
                ).length;

                // Gerar próximo número
                let nextNumber = series.formato;
                const nextSeq = currentSeq + 1;
                nextNumber = nextNumber.replace(/#{seq:(\d+)}/g, (match, digits) => {
                    return nextSeq.toString().padStart(parseInt(digits), '0');
                });
                nextNumber = nextNumber.replace(/#{sigla}/g, series.sigla);
                nextNumber = nextNumber.replace(/#{ano}/g, currentYear.toString());

                return {
                    id: series.id,
                    name: series.name,
                    tipo: series.tipo,
                    sigla: series.sigla,
                    nextNumber,
                    currentSeq,
                    totalIssued: numbersByState.ISSUED || 0,
                    totalReserved: numbersByState.RESERVED || 0,
                    totalVoided: numbersByState.VOIDED || 0,
                    todayCount
                };
            });

            return { data: stats };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500);
            return { error: 'Erro interno do servidor' };
        }
    });
}
