# 🧪 Guia de Testes - CEE-SC Enumerador

## ✅ Status do Projeto

**TODAS as funcionalidades principais foram implementadas!**

### 🎯 Funcionalidades Implementadas

#### Backend (API)
- ✅ **Autenticação** - Endpoints de login/logout (mock para desenvolvimento)
- ✅ **Dashboard** - Estatísticas gerais e por série
- ✅ **Séries** - CRUD completo (criar, listar, editar, desativar)
- ✅ **Números** - Reservar, emitir, anular, listar com filtros
- ✅ **Validação** - Schemas Zod para todas as entradas
- ✅ **Transações** - Concorrência segura para reserva de números
- ✅ **Auditoria** - Trilha completa de ações

#### Frontend (Web)
- ✅ **Dashboard** - Estatísticas em tempo real
- ✅ **Emitir Números** - Interface completa para reserva e emissão
- ✅ **Histórico** - Listagem com filtros avançados
- ✅ **Gerenciar Séries** - CRUD com preview de formato
- ✅ **Design** - Interface moderna com shadcn/ui
- ✅ **Responsivo** - Funciona em desktop e mobile

#### Infraestrutura
- ✅ **Docker Compose** - PostgreSQL + API + Web
- ✅ **Banco de Dados** - Schema completo com relacionamentos
- ✅ **Seed** - Dados iniciais das séries
- ✅ **Scripts** - Desenvolvimento e produção

## 🚀 Como Testar

### 1. Subir a Infraestrutura

```bash
# Subir apenas o banco de dados
[infra] docker compose up -d db

# Verificar se está rodando
[infra] docker compose ps
```

### 2. Configurar o Backend

```bash
# Instalar dependências
[backend] npm install

# Copiar variáveis de ambiente
[backend] cp env.example .env

# Executar migrações
[backend] npx prisma migrate dev --name init

# Popular com dados iniciais
[backend] npm run prisma:seed

# Iniciar servidor
[backend] npm run dev
```

### 3. Configurar o Frontend

```bash
# Instalar dependências
[frontend] npm install

# Iniciar servidor
[frontend] npm run dev
```

### 4. Acessar as Aplicações

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Prisma Studio**: `[backend] npx prisma studio`

## 🧪 Cenários de Teste

### 1. Dashboard
- ✅ Acessar http://localhost:3000
- ✅ Verificar estatísticas carregando
- ✅ Navegar entre as páginas

### 2. Emitir Números
- ✅ Acessar /emitir
- ✅ Selecionar uma série
- ✅ Ver preview do próximo número
- ✅ Reservar números
- ✅ Preencher metadados
- ✅ Emitir números

### 3. Histórico
- ✅ Acessar /historico
- ✅ Ver lista de números
- ✅ Usar filtros (série, ano, estado, busca)
- ✅ Anular números

### 4. Gerenciar Séries
- ✅ Acessar /series
- ✅ Ver séries existentes
- ✅ Criar nova série
- ✅ Editar série existente
- ✅ Ver preview do formato
- ✅ Desativar série

### 5. API Endpoints
- ✅ GET /health - Health check
- ✅ GET /api/dashboard/stats - Estatísticas
- ✅ GET /api/series - Listar séries
- ✅ POST /api/numbers/reserve - Reservar números
- ✅ POST /api/numbers/:id/issue - Emitir número
- ✅ POST /api/numbers/:id/void - Anular número

## 🔍 Verificações Importantes

### Concorrência
- ✅ Abrir 2 abas do navegador
- ✅ Reservar números da mesma série simultaneamente
- ✅ Verificar que não há duplicatas

### Validação
- ✅ Tentar reservar sem selecionar série
- ✅ Tentar emitir número já emitido
- ✅ Tentar anular número já anulado

### Interface
- ✅ Responsividade em diferentes tamanhos
- ✅ Loading states funcionando
- ✅ Mensagens de erro/sucesso
- ✅ Navegação entre páginas

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"
```bash
[infra] docker compose down
[infra] docker compose up -d db
[backend] npx prisma migrate dev
```

### Erro: "Module not found"
```bash
[backend] npm install
[frontend] npm install
```

### Erro: "CORS policy"
- Verificar se NEXT_PUBLIC_API_URL está correto
- Verificar se backend está rodando na porta 3001

### Erro: "Prisma client not generated"
```bash
[backend] npx prisma generate
```

## 📊 Dados de Teste

O sistema vem com dados iniciais:
- **Séries**: ANÁLISE/CEDP, CI/PRES, RELATÓRIOS DE VISITAS/ANO, etc.
- **Usuário**: admin@cee-sc.gov.br (role: ADMIN)
- **Formato**: #{seq:3}/#{sigla} → 001/CEDP

## 🎉 Resultado Esperado

Após seguir este guia, você deve ter:
- ✅ Sistema funcionando completamente
- ✅ Interface moderna e responsiva
- ✅ Todas as funcionalidades operacionais
- ✅ Dados persistindo no banco
- ✅ Navegação fluida entre páginas

**O projeto está 100% funcional e pronto para uso!** 🚀
