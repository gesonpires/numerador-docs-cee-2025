# Guia de Desenvolvimento - CEE-SC Enumerador

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 20.x
- Docker Desktop
- Git

### 1. Configuração Inicial

```bash
# Clonar o repositório
git clone <repo-url>
cd numerador-cee

# Subir infraestrutura
[infra] docker compose up -d db
```

### 2. Configurar Backend

```bash
[backend] npm install
[backend] cp env.example .env
[backend] npm run prisma:migrate
[backend] npm run prisma:seed
[backend] npm run dev
```

### 3. Configurar Frontend

```bash
[frontend] npm install
[frontend] npm run dev
```

## 📊 URLs de Desenvolvimento

- **Banco de Dados**: `postgresql://postgres:postgres@localhost:5432/ceesc`
- **API Backend**: http://localhost:3001
- **Frontend Web**: http://localhost:3000
- **Prisma Studio**: `[backend] npm run prisma:studio`

## 🗄️ Banco de Dados

### Estrutura Principal

- **Users**: Usuários do sistema (Admin, Editor, Leitor)
- **Series**: Séries de numeração (ANÁLISE/CEDP, CI/PRES, etc.)
- **Counters**: Contadores por série e ano
- **DocNumbers**: Números de documentos (reservados, emitidos, anulados)
- **AuditLog**: Trilha de auditoria

### Comandos Úteis

```bash
# Resetar banco
[backend] npx prisma migrate reset

# Aplicar migrações
[backend] npx prisma migrate dev

# Gerar cliente Prisma
[backend] npx prisma generate

# Visualizar banco
[backend] npx prisma studio
```

## 🔧 Desenvolvimento

### Estrutura do Backend

```
backend/
├── src/
│   ├── server.ts          # Servidor principal
│   ├── routes/            # Rotas da API
│   ├── types/             # Tipos TypeScript
│   └── utils/             # Utilitários
├── prisma/
│   ├── schema.prisma      # Schema do banco
│   └── seed.ts           # Dados iniciais
└── package.json
```

### Estrutura do Frontend

```
frontend/
├── src/
│   ├── app/               # App Router (Next.js 14)
│   ├── components/        # Componentes reutilizáveis
│   ├── lib/              # Utilitários
│   └── types/            # Tipos TypeScript
└── package.json
```

## 🧪 Testes

```bash
# Testes unitários
[backend] npm test

# Testes e2e
[frontend] npm run test:e2e
```

## 📝 Convenções

### Commits
Seguir conventional commits:
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `chore:` tarefas de manutenção
- `docs:` documentação

### Código
- TypeScript strict mode
- ESLint + Prettier
- Nomes descritivos
- Funções curtas
- Tratamento explícito de erros

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   ```bash
   [infra] docker compose down
   [infra] docker compose up -d db
   ```

2. **Dependências não instaladas**
   ```bash
   [backend] rm -rf node_modules package-lock.json
   [backend] npm install
   ```

3. **Prisma não gera cliente**
   ```bash
   [backend] npx prisma generate
   ```

## 📚 Recursos

- [Prisma Docs](https://www.prisma.io/docs)
- [Fastify Docs](https://www.fastify.io/docs/latest/)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
