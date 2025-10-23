import { PrismaClient, UserRole, ResetPolicy } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar usuário admin padrão
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@cee-sc.gov.br' },
        update: {},
        create: {
            name: 'Administrador do Sistema',
            email: 'admin@cee-sc.gov.br',
            role: UserRole.ADMIN,
        },
    });

    console.log('✅ Usuário admin criado:', adminUser.email);

    // Criar séries iniciais conforme especificado no plan.md
    const seriesData = [
        {
            name: 'ANÁLISE/CEDP',
            tipo: 'ANÁLISE',
            sigla: 'CEDP',
            formato: '#{seq:3}/#{sigla}',
            resetPolicy: ResetPolicy.ANNUAL,
        },
        {
            name: 'CI/PRES',
            tipo: 'CI',
            sigla: 'PRES',
            formato: '#{seq:3}/#{sigla}',
            resetPolicy: ResetPolicy.ANNUAL,
        },
        {
            name: 'RELATÓRIOS DE VISITAS/ANO',
            tipo: 'RELATÓRIOS DE VISITAS',
            sigla: '',
            formato: '#{seq:3}/#{ano}',
            resetPolicy: ResetPolicy.ANNUAL,
        },
        {
            name: 'OFÍCIO/CLN',
            tipo: 'OFÍCIO',
            sigla: 'CLN',
            formato: '#{seq:3}/#{sigla}',
            resetPolicy: ResetPolicy.ANNUAL,
        },
        {
            name: 'PORTARIA/PRES',
            tipo: 'PORTARIA',
            sigla: 'PRES',
            formato: '#{seq:3}/#{sigla}',
            resetPolicy: ResetPolicy.ANNUAL,
        },
    ];

    for (const seriesInfo of seriesData) {
        const series = await prisma.series.create({
            data: {
                ...seriesInfo,
                createdBy: adminUser.id,
            },
        });

        // Criar counter para o ano atual
        const currentYear = new Date().getFullYear();
        await prisma.counter.upsert({
            where: {
                seriesId_year: {
                    seriesId: series.id,
                    year: currentYear,
                },
            },
            update: {},
            create: {
                seriesId: series.id,
                year: currentYear,
                currentSeq: 0,
            },
        });

        console.log(`✅ Série criada: ${series.name}`);
    }

    console.log('🎉 Seed concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error('❌ Erro durante o seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
