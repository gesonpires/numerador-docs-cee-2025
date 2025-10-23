import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { ReserveNumberSchema, IssueNumberSchema, VoidNumberSchema, GetNumbersSchema } from '../types';

const prisma = new PrismaClient();

export async function numbersRoutes(fastify: FastifyInstance) {
    // POST /api/numbers/reserve - Reservar número(s)
    fastify.post('/api/numbers/reserve', async (request, reply) => {
        try {
            const { seriesId, count } = ReserveNumberSchema.parse(request.body);

            // TODO: Implementar autenticação e obter userId
            const userId = 'admin-user-id'; // Temporário

            const result = await prisma.$transaction(async (tx) => {
                // Buscar série
                const series = await tx.series.findUnique({
                    where: { id: seriesId, isActive: true }
                });

                if (!series) {
                    throw new Error('Série não encontrada ou inativa');
                }

                const currentYear = new Date().getFullYear();

                // Lock no counter e incrementar sequencialmente
                const counter = await tx.counter.findUnique({
                    where: {
                        seriesId_year: {
                            seriesId,
                            year: currentYear
                        }
                    }
                });

                if (!counter) {
                    throw new Error('Counter não encontrado para esta série e ano');
                }

                // Lock e incremento atômico
                const updatedCounter = await tx.counter.update({
                    where: { id: counter.id },
                    data: {
                        currentSeq: counter.currentSeq + count
                    }
                });

                // Criar números reservados
                const numbers = [];
                for (let i = 1; i <= count; i++) {
                    const seq = counter.currentSeq + i;

                    // Gerar número formatado
                    let formatted = series.formato;
                    formatted = formatted.replace(/#{seq:(\d+)}/g, (match, digits) => {
                        return seq.toString().padStart(parseInt(digits), '0');
                    });
                    formatted = formatted.replace(/#{sigla}/g, series.sigla);
                    formatted = formatted.replace(/#{ano}/g, currentYear.toString());

                    const number = await tx.docNumber.create({
                        data: {
                            seriesId,
                            year: currentYear,
                            seq,
                            formatted,
                            state: 'RESERVED',
                            reservedBy: userId,
                            reservedAt: new Date()
                        }
                    });

                    numbers.push({
                        id: number.id,
                        seriesId: number.seriesId,
                        year: number.year,
                        seq: number.seq,
                        formatted: number.formatted,
                        state: number.state,
                        reservedAt: number.reservedAt?.toISOString()
                    });
                }

                return numbers;
            });

            reply.code(201);
            return { data: result };
        } catch (error) {
            if (error instanceof Error && error.name === 'ZodError') {
                reply.code(400);
                return { error: 'Dados inválidos', details: error.message };
            }

            fastify.log.error(error);
            reply.code(500);
            return { error: error instanceof Error ? error.message : 'Erro interno do servidor' };
        }
    });

    // POST /api/numbers/:id/issue - Emitir número
    fastify.post('/api/numbers/:id/issue', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const { metadata } = IssueNumberSchema.parse(request.body);

            // TODO: Implementar autenticação e obter userId
            const userId = 'admin-user-id'; // Temporário

            const number = await prisma.docNumber.update({
                where: {
                    id,
                    state: 'RESERVED' // Só pode emitir números reservados
                },
                data: {
                    state: 'ISSUED',
                    metadata,
                    issuedBy: userId,
                    issuedAt: new Date()
                }
            });

            if (!number) {
                reply.code(404);
                return { error: 'Número não encontrado ou já emitido' };
            }

            return {
                id: number.id,
                seriesId: number.seriesId,
                year: number.year,
                seq: number.seq,
                formatted: number.formatted,
                state: number.state,
                metadata: number.metadata,
                reservedAt: number.reservedAt?.toISOString(),
                issuedAt: number.issuedAt?.toISOString()
            };
        } catch (error) {
            if (error instanceof Error && error.name === 'ZodError') {
                reply.code(400);
                return { error: 'Dados inválidos', details: error.message };
            }

            fastify.log.error(error);
            reply.code(500);
            return { error: 'Erro interno do servidor' };
        }
    });

    // POST /api/numbers/:id/void - Anular número
    fastify.post('/api/numbers/:id/void', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const { reason } = VoidNumberSchema.parse(request.body);

            // TODO: Implementar autenticação e obter userId
            const userId = 'admin-user-id'; // Temporário

            const number = await prisma.docNumber.update({
                where: {
                    id,
                    state: { in: ['RESERVED', 'ISSUED'] } // Só pode anular números reservados ou emitidos
                },
                data: {
                    state: 'VOIDED',
                    voidReason: reason,
                    voidedBy: userId,
                    voidedAt: new Date()
                }
            });

            if (!number) {
                reply.code(404);
                return { error: 'Número não encontrado ou já anulado' };
            }

            return {
                id: number.id,
                seriesId: number.seriesId,
                year: number.year,
                seq: number.seq,
                formatted: number.formatted,
                state: number.state,
                metadata: number.metadata,
                reservedAt: number.reservedAt?.toISOString(),
                issuedAt: number.issuedAt?.toISOString(),
                voidedAt: number.voidedAt?.toISOString(),
                voidReason: number.voidReason
            };
        } catch (error) {
            if (error instanceof Error && error.name === 'ZodError') {
                reply.code(400);
                return { error: 'Dados inválidos', details: error.message };
            }

            fastify.log.error(error);
            reply.code(500);
            return { error: 'Erro interno do servidor' };
        }
    });

    // GET /api/numbers - Listar números com filtros
    fastify.get('/api/numbers', async (request, reply) => {
        try {
            const query = GetNumbersSchema.parse(request.query);
            const { seriesId, year, state, q, page, limit } = query;

            const where: any = {};

            if (seriesId) where.seriesId = seriesId;
            if (year) where.year = year;
            if (state) where.state = state;

            if (q) {
                where.OR = [
                    { formatted: { contains: q, mode: 'insensitive' } },
                    { metadata: { path: '$', string_contains: q } }
                ];
            }

            const [numbers, total] = await Promise.all([
                prisma.docNumber.findMany({
                    where,
                    include: {
                        series: {
                            select: { name: true, tipo: true, sigla: true }
                        }
                    },
                    orderBy: [
                        { year: 'desc' },
                        { seq: 'desc' }
                    ],
                    skip: (page - 1) * limit,
                    take: limit
                }),
                prisma.docNumber.count({ where })
            ]);

            const data = numbers.map(number => ({
                id: number.id,
                seriesId: number.seriesId,
                year: number.year,
                seq: number.seq,
                formatted: number.formatted,
                state: number.state,
                metadata: number.metadata,
                reservedAt: number.reservedAt?.toISOString(),
                issuedAt: number.issuedAt?.toISOString(),
                voidedAt: number.voidedAt?.toISOString(),
                voidReason: number.voidReason,
                series: number.series
            }));

            return {
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            if (error instanceof Error && error.name === 'ZodError') {
                reply.code(400);
                return { error: 'Parâmetros inválidos', details: error.message };
            }

            fastify.log.error(error);
            reply.code(500);
            return { error: 'Erro interno do servidor' };
        }
    });

    // GET /api/numbers/:id - Obter número específico
    fastify.get('/api/numbers/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            const number = await prisma.docNumber.findUnique({
                where: { id },
                include: {
                    series: {
                        select: { name: true, tipo: true, sigla: true }
                    }
                }
            });

            if (!number) {
                reply.code(404);
                return { error: 'Número não encontrado' };
            }

            return {
                id: number.id,
                seriesId: number.seriesId,
                year: number.year,
                seq: number.seq,
                formatted: number.formatted,
                state: number.state,
                metadata: number.metadata,
                reservedAt: number.reservedAt?.toISOString(),
                issuedAt: number.issuedAt?.toISOString(),
                voidedAt: number.voidedAt?.toISOString(),
                voidReason: number.voidReason,
                series: number.series
            };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500);
            return { error: 'Erro interno do servidor' };
        }
    });
}
