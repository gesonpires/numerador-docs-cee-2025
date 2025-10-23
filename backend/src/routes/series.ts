import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { CreateSeriesSchema, UpdateSeriesSchema } from '../types';

const prisma = new PrismaClient();

export async function seriesRoutes(fastify: FastifyInstance) {
    // GET /api/series - Listar todas as séries
    fastify.get('/api/series', async (request, reply) => {
        try {
            const series = await prisma.series.findMany({
                where: { isActive: true },
                include: {
                    counters: {
                        where: { year: new Date().getFullYear() },
                        select: { currentSeq: true }
                    }
                },
                orderBy: { name: 'asc' }
            });

            const seriesWithNextNumber = series.map(series => {
                const currentYear = new Date().getFullYear();
                const counter = series.counters[0];
                const nextSeq = (counter?.currentSeq || 0) + 1;

                // Gerar preview do próximo número
                let nextNumber = series.formato;
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
                    formato: series.formato,
                    resetPolicy: series.resetPolicy,
                    isActive: series.isActive,
                    nextNumber,
                    currentYear,
                    currentSeq: counter?.currentSeq || 0
                };
            });

            return { data: seriesWithNextNumber };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500);
            return { error: 'Erro interno do servidor' };
        }
    });

    // GET /api/series/:id - Obter série específica
    fastify.get('/api/series/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            const series = await prisma.series.findUnique({
                where: { id },
                include: {
                    counters: {
                        where: { year: new Date().getFullYear() },
                        select: { currentSeq: true }
                    }
                }
            });

            if (!series) {
                reply.code(404);
                return { error: 'Série não encontrada' };
            }

            const currentYear = new Date().getFullYear();
            const counter = series.counters[0];
            const nextSeq = (counter?.currentSeq || 0) + 1;

            let nextNumber = series.formato;
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
                formato: series.formato,
                resetPolicy: series.resetPolicy,
                isActive: series.isActive,
                nextNumber,
                currentYear,
                currentSeq: counter?.currentSeq || 0
            };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500);
            return { error: 'Erro interno do servidor' };
        }
    });

    // POST /api/series - Criar nova série
    fastify.post('/api/series', async (request, reply) => {
        try {
            const data = CreateSeriesSchema.parse(request.body);

            // TODO: Implementar autenticação e obter userId
            const userId = 'admin-user-id'; // Temporário

            const series = await prisma.series.create({
                data: {
                    ...data,
                    createdBy: userId
                }
            });

            // Criar counter para o ano atual
            const currentYear = new Date().getFullYear();
            await prisma.counter.create({
                data: {
                    seriesId: series.id,
                    year: currentYear,
                    currentSeq: 0
                }
            });

            reply.code(201);
            return {
                id: series.id,
                name: series.name,
                tipo: series.tipo,
                sigla: series.sigla,
                formato: series.formato,
                resetPolicy: series.resetPolicy,
                isActive: series.isActive
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

    // PATCH /api/series/:id - Atualizar série
    fastify.patch('/api/series/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const data = UpdateSeriesSchema.parse(request.body);

            const series = await prisma.series.update({
                where: { id },
                data
            });

            return {
                id: series.id,
                name: series.name,
                tipo: series.tipo,
                sigla: series.sigla,
                formato: series.formato,
                resetPolicy: series.resetPolicy,
                isActive: series.isActive
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

    // DELETE /api/series/:id - Desativar série
    fastify.delete('/api/series/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            await prisma.series.update({
                where: { id },
                data: { isActive: false }
            });

            return { message: 'Série desativada com sucesso' };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500);
            return { error: 'Erro interno do servidor' };
        }
    });
}
