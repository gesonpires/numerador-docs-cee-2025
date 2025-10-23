
# CEE‑SC — Enumerador de Documentos (Plano técnico do MVP)

> **Objetivo:** substituir a numeração manual em arquivo Word por uma **web application** segura, auditável e multiusuário para **gerar, reservar, emitir e anular** números oficiais de documentos do CEE‑SC, com trilha de auditoria e exportações.

## 1) Contexto e requisitos de negócio

- Hoje a numeração está concentrada num `.doc` único, com séries por **tipo de documento** e **órgão/comissão** (ex.: *ANÁLISE*, *CI*, *DILIGÊNCIA*, *INFORMAÇÃO*, *OFÍCIO*, *PORTARIA*, *TERMO DE SANEAMENTO*, *RELATÓRIOS DE VISITAS*; com sufixos como **CEDP, CEDB, CEASPE, CEED, PRES, CLN, SEREV, COADM, CPL**, etc.).  
- Há padrões como `NNN/<COMISSÃO>` (ex.: `001/CEDP`, `010/CPL`) e numeração por **ano** para certas séries (ex.: `001/2025`, `020/SEREV`), implicando **reinício anual** por série.  
- Problemas atuais: concorrência (vários usuários), risco de sobrescrita, ausência de auditoria e difícil rastreabilidade.

### Regras de numeração (propostas)
1. **Série** = combinação de **Tipo** + **Unidade emissora** (ex.: `ANÁLISE/CEDP`, `OFÍCIO/PRES`, `RELATÓRIOS DE VISITAS/ANO`).  
2. **Formato**: `SEQ` + **separador** + **sufixo**. Exemplos:
   - `#{seq:3}/#{sigla}` → `007/CEDP`  
   - `#{seq:3}/#{ano}` → `001/2025`
3. **Política de reset** por série: `ANUAL` (reinicia em 1 no 1º dia do ano) ou `CONTÍNUA` (não reinicia).  
4. **Estados** do número: `reservado` → `emitido` → `anulado` (com motivo).  
5. **Reserva em lote** opcional (p/ eventos).  
6. **Validações**: impedir duplicidade por `(série, ano, seq)`; bloquear emissão retroativa se configurado; trilha de quem gerou/alterou.

## 2) Escopo do MVP

- Autenticação (conta institucional) e perfis: **Admin**, **Editor**, **Leitor**.
- CRUD de **Séries**: criar/editar **tipo**, **sigla**, **formato**, **reset**.  
- Ações sobre números: **Reservar**, **Emitir**, **Anular**, **Reemitir com correção de metadados**.
- Busca e filtros por: tipo, sigla, faixa, ano, estado.
- Exportar CSV/PDF; relatório diário/mensal.
- Importar histórico (CSV) para preservar continuidade.
- Auditoria completa (quem, quando, o quê).

## 3) Arquitetura

- **Frontend**: Next.js, TypeScript, App Router, Tailwind, shadcn/ui.
- **Backend**: Node.js (Express ou Fastify) + **Prisma**.
- **Banco**: PostgreSQL (transações e locks p/ concorrência).  
- **Auth**: Auth.js (e‑mail/SSO), JWT de sessão httpOnly.  
- **Logs/Auditoria**: tabela dedicada + webhooks para SI.
- **Implantação**: Docker + Compose (dev e prod).  
- **Observabilidade**: pino (logs) + healthchecks.

### Modelo de dados (simplificado)

```
User(id, name, email, role)
Series(id, name, tipo, sigla, formato, reset_policy, is_active, created_by, created_at, updated_at)
Counter(id, series_id, year, current_seq, UNIQUE(series_id, year))
DocNumber(
  id, series_id, year, seq, formatted, state, metadata_json,
  reserved_by, reserved_at, issued_by, issued_at, voided_by, voided_at, void_reason,
  UNIQUE(series_id, year, seq)
)
AuditLog(id, user_id, entity, entity_id, action, diff_json, created_at)
```

**Concorrência**: transação `BEGIN; SELECT ... FOR UPDATE` no `Counter` e incremento atômico do `current_seq` (garante `UNIQUE(series_id, year, seq)`).

## 4) API (REST)

- `POST /auth/signin`
- `GET /series` | `POST /series` | `PATCH /series/:id` | `DELETE /series/:id`
- `POST /numbers/reserve` body `{ seriesId, count?=1 }`
- `POST /numbers/issue/:id` body `{ metadata }`
- `POST /numbers/void/:id` body `{ reason }`
- `GET /numbers?seriesId&year&state&q&page`
- `POST /import` (CSV) | `GET /export.csv` | `GET /export.pdf`
- `GET /audit?entity&id`

## 5) UI/UX (páginas)

- **Dashboard**: cartões por série (próximo número, emitidos hoje, pendentes), filtros rápidos.  
- **Emitir número**: escolher **Série** → ver **preview** do formato → **Gerar** e **Emitir** (com metadados básicos: processo, interessado, assunto).  
- **Histórico**: tabela com chips de estado, ações (anular, ver auditoria).  
- **Séries**: CRUD com **validador de formato** (`#{seq}`, `#{sigla}`, `#{ano}`).  
- **Importar/Exportar**: templates e validações.

## 6) Migração do Word

1. **Mapeamento** das séries existentes (ex.: `ANÁLISE/CEDP`, `CI/PRES`, `RELATÓRIOS DE VISITAS/ANO`).  
2. **Template CSV**: `tipo,sigla,ano,seq,formatted,estado,data,observacao`.  
3. **Carga inicial**: importar e travar lacunas; manter `current_seq` coerente por `(série, ano)`.  
4. **Conferência amostral** e auditoria de diferenças.  

> Observação: manter o livro antigo **somente leitura** após o *cut‑over*; números novos apenas no sistema.

## 7) Segurança, auditoria e LGPD

- Sessões httpOnly, CSRF em ações críticas.  
- RBAC por série (Admin/Editor/Leitor).  
- Auditoria imutável (hash da linha) e exportável.  
- Retenção e base legal: finalidade administrativa; metadados mínimos.

## 8) Roadmap do MVP (2–3 sprints)

**Sprint 1 — Fundações**
- [Backend] Projeto, Prisma, modelos, migrações
- [Backend] `reserve` com transação/lock
- [Frontend] Auth + layout base (shadcn/ui)
- [Frontend] Listagem de séries e criação rápida
- [DevOps] Docker Compose (db, api, web)

**Sprint 2 — Operação**
- [Backend] `issue`, `void`, busca, export CSV
- [Frontend] Tela “Emitir número” + histórico com filtros
- [Frontend] CRUD de séries com validador de formato
- [Import] Upload de CSV e relatórios de inconsistências
- [Qualidade] Testes de integração + e2e (Playwright)

**Sprint 3 — Fechamento**
- Auditoria detalhada por registro
- Exportação PDF (lista por período)
- Reserva em lote
- Perfis/Permissões avançadas
- Observabilidade e hardening

## 9) Critérios de aceite (MVP)

- **Concorrência**: 2+ editores geram números da mesma série sem colisão.  
- **Integridade**: não existe duplicidade `(série, ano, seq)`; trilha completa de ações.  
- **Recuperação**: restauração de backup do banco funciona.  
- **Usabilidade**: gerar e emitir um número em ≤ 3 cliques.  
- **Relatórios**: CSV por período/estado/serie disponível.  
- **Migração**: importar ≥ 95% das linhas válidas do histórico.

## 10) Stack e versões

- Node.js 20.x; TypeScript 5.x  
- Next.js 14.x; Tailwind; shadcn/ui  
- Fastify 4.x (ou Express 4.x); Zod; Prisma 5.x; PostgreSQL 15+  
- Jest/Vitest; Playwright  
- Docker 24+; Compose v2

## 11) Estrutura do repositório (monorepo simples)

```
cee-sc-enumerador/
  backend/        # API Fastify/Express
  frontend/       # Next.js (App Router)
  infra/          # Docker, compose, scripts
  docs/           # plan.md, diagramas, CSVs de import
```

## 12) Comandos (com diretório explícito)

### 12.1 Inicialização
- **Projeto root**:
  ```bash
  git init && git add . && git commit -m "chore: bootstrap repo"
  ```

### 12.2 Backend (API)
- **backend/**:
  ```bash
  npm create -y
  npm i fastify zod cors pino pino-pretty
  npm i -D typescript tsx @types/node
  npx tsc --init
  npm i prisma @prisma/client
  npx prisma init
  ```
- **backend/** (scripts `package.json`):
  ```json
  {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p .",
    "start": "node dist/server.js",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
  ```

### 12.3 Frontend (Web)
- **frontend/**:
  ```bash
  npx create-next-app@latest . --ts --eslint --tailwind --src-dir --app --no-git
  npm i @tanstack/react-query
  npm i @radix-ui/react-icons
  # shadcn/ui
  npx shadcn@latest init
  npx shadcn@latest add button card input table badge dialog dropdown-menu form toast
  ```

### 12.4 Infra (Docker)
- **infra/**:
  ```yaml
  # docker-compose.yml
  services:
    db:
      image: postgres:15
      environment:
        POSTGRES_PASSWORD: postgres
        POSTGRES_USER: postgres
        POSTGRES_DB: ceesc
      ports: ["5432:5432"]
      volumes: ["pgdata:/var/lib/postgresql/data"]
    api:
      build: ../backend
      env_file:
        - ../backend/.env
      depends_on: [db]
      ports: ["3001:3001"]
    web:
      build: ../frontend
      depends_on: [api]
      ports: ["3000:3000"]
  volumes:
    pgdata: {}
  ```

## 13) Sementes (seed) iniciais de séries (exemplos)

- `ANÁLISE/CEDP` → formato `#{seq:3}/CEDP` (reset anual)
- `CI/PRES` → `#{seq:3}/PRES` (reset anual)
- `RELATÓRIOS DE VISITAS/ANO` → `#{seq:3}/#{ano}` (reset anual)
- `OFÍCIO/CLN` → `#{seq:3}/CLN` (reset anual)
- `PORTARIA/PRES` → `#{seq:3}/PRES` (reset contínuo ou anual, conforme norma interna)

> Estes exemplos refletem os padrões observados no histórico em uso e podem ser ajustados por ato normativo interno.

## 14) Importação — Template CSV

```csv
tipo,sigla,ano,seq,formatted,estado,data,observacao
ANÁLISE,CEDP,2025,1,001/CEDP,emitido,2025-01-02,"Processo 12345"
RELATÓRIOS DE VISITAS,,2025,1,001/2025,emitido,2025-02-10,"Visita X"
OFÍCIO,PRES,2025,10,010/PRES,reservado,,
```

## 15) Próximos passos práticos

1. Criar repositório e pastas `backend/`, `frontend/`, `infra/`, `docs/`.  
2. Subir Postgres via Docker (`infra/`).  
3. Modelar `Series`, `Counter`, `DocNumber`, `AuditLog` (Prisma) e rodar migração.  
4. Implementar endpoint `reserve` com transação/lock e UI “Emitir número”.  
5. Testar concorrência (abrir 2 navegadores) e validar unicidade.  
6. Definir ato interno formalizando as **regras de série** e **reset**.  
7. Preparar CSV de importação do histórico e realizar *cut‑over*.



---

## 16) Perfil da máquina e ajustes de performance (alinhado ao DevReport)

> Esta seção foi gerada considerando o relatório do seu equipamento (ver **env.md**).

**Resumo (do env.md):**

- **OS**: Windows
- **CPU**: 
- **RAM**: None
- **GPU**: 
- **Virtualização/Hyper-V**:

**Ajustes recomendados:**

- **Docker Desktop + WSL2 (Windows):**
  - Habilitar WSL2 e Plataforma de Máquina Virtual no Windows.
  - Backend do Docker configurado para WSL2; alocar RAM de acordo com a capacidade da máquina (vide *env.md*).
- **PostgreSQL (tuning):**
  - `shared_buffers`, `work_mem`, `max_connections` calibrados por faixa de memória (vide *env.md*).
  - Backups diários do volume `pgdata` via `pg_dump`.
- **Node.js e gerenciador de pacotes:**
  - Node 20.x e **PNPM** para reduzir uso de disco e acelerar instalações.
  - Cache do Next.js em `.next/` habilitado.
- **Concorrência na emissão:**
  - Operação `reserve` deve executar: `BEGIN; SELECT Counter ... FOR UPDATE; UPDATE Counter SET current_seq = current_seq + 1; INSERT DocNumber ...; COMMIT;`.
  - `UNIQUE(series_id, year, seq)` garante integridade.
- **Observabilidade e logs:**
  - `pino-pretty` em desenvolvimento, `pino` (JSON) em produção.
  - Healthcheck dos serviços com endpoints `/health` (API) e `/api/health` (Web).

**Nota:** Quando o projeto for movido para outra máquina/servidor, revisar **env.md** e atualizar os limites do Docker e parâmetros do Postgres conforme o novo hardware.
