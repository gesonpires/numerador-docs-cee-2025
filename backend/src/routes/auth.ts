import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

export async function authRoutes(fastify: FastifyInstance) {
    // POST /api/auth/login - Login (mock para desenvolvimento)
    fastify.post('/api/auth/login', async (request, reply) => {
        try {
            const { email, password } = LoginSchema.parse(request.body);

            // TODO: Implementar autenticação real
            // Por enquanto, aceitar qualquer email/password para desenvolvimento
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                reply.code(401);
                return { error: 'Credenciais inválidas' };
            }

            // TODO: Verificar senha com hash
            // Por enquanto, aceitar qualquer senha para desenvolvimento

            // TODO: Gerar JWT real
            const token = 'mock-jwt-token-for-development';

            return {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
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

    // GET /api/auth/me - Obter usuário atual
    fastify.get('/api/auth/me', async (request, reply) => {
        try {
            // TODO: Implementar verificação de JWT
            // Por enquanto, retornar usuário mock
            const user = await prisma.user.findFirst({
                where: { role: 'ADMIN' }
            });

            if (!user) {
                reply.code(404);
                return { error: 'Usuário não encontrado' };
            }

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500);
            return { error: 'Erro interno do servidor' };
        }
    });

    // POST /api/auth/logout - Logout
    fastify.post('/api/auth/logout', async (request, reply) => {
        // TODO: Implementar invalidação de JWT
        return { message: 'Logout realizado com sucesso' };
    });
}
