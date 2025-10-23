# CEE-SC — Enumerador de Documentos

Sistema web para geração, reserva, emissão e anulação de números oficiais de documentos do CEE-SC, com trilha de auditoria e exportações.

## 🎯 Objetivo

Substituir a numeração manual em arquivo Word por uma **web application** segura, auditável e multiusuário para gerar números oficiais de documentos do CEE-SC.

## 🏗️ Arquitetura

- **Frontend**: Next.js 14 + TypeScript + Tailwind + shadcn/ui
- **Backend**: Node.js + Fastify + Prisma + PostgreSQL
- **Infraestrutura**: Docker + Docker Compose
- **Autenticação**: Auth.js com JWT httpOnly
- **Auditoria**: Trilha completa de ações

## 📁 Estrutura do Projeto

```
numerador-cee/
├── backend/        # API Fastify/Express
├── frontend/       # Next.js (App Router)
├── infra/          # Docker, compose, scripts
├── docs/           # plan.md, diagramas, CSVs
├── cursorrules     # Regras do Cursor AI
└── plan.md         # Plano técnico detalhado
```

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 20.x
- Docker 24+
- Docker Compose v2

### Desenvolvimento

1. **Subir infraestrutura:**
   ```bash
   [infra] docker compose up -d db
   ```

2. **Configurar backend:**
   ```bash
   [backend] pnpm install
   [backend] pnpm prisma:migrate
   [backend] pnpm dev
   ```

3. **Configurar frontend:**
   ```bash
   [frontend] pnpm install
   [frontend] pnpm dev
   ```

## 📋 Funcionalidades

- ✅ Autenticação com perfis (Admin, Editor, Leitor)
- ✅ CRUD de Séries com formatos configuráveis
- ✅ Reserva, Emissão e Anulação de números
- ✅ Busca e filtros avançados
- ✅ Exportação CSV/PDF
- ✅ Importação de histórico
- ✅ Auditoria completa

## 🔒 Segurança

- Cookies httpOnly
- RBAC (Role-Based Access Control)
- Validação com Zod
- Transações atômicas para concorrência
- Trilha de auditoria imutável

## 📊 Roadmap

- **Sprint 1**: Fundações (backend, frontend base, Docker)
- **Sprint 2**: Operação (funcionalidades principais, testes)
- **Sprint 3**: Fechamento (auditoria, exportação PDF, hardening)

## 🤝 Contribuição

Seguir as regras definidas em `cursorrules` e o plano técnico em `plan.md`.
