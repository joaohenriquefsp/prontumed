# ProntuMed — Contexto Atual do Projeto
> Última atualização: 2026-06-09

---

## O que é o ProntuMed

Sistema de gestão clínica baseado em microsserviços com comunicação orientada a eventos. Projeto de TCC desenvolvido em .NET 8, NestJS, Next.js e React Native.

**MVP:** Agendamento de consultas + Prontuário eletrônico + Notificações

---

## O que já foi feito

### ✅ Documentação de arquitetura (`Arquitetura/`)
- `arquitetura-software.md` — referência técnica completa da stack e padrões
- `arquitetura-tcc.md` — proposta arquitetural formatada para o TCC
- `Joao e Marco.pdf` — guia de estrutura dos capítulos do TCC
- `contexto-atual.md` — este arquivo

### ✅ Infraestrutura (`docker-compose.yml` + `infra/`)

Um único `docker compose up -d` sobe toda a infraestrutura:

| Container | Porta | Função |
|---|---|---|
| `postgres-identity` | 5432 | Banco do Identity Service |
| `postgres-patients` | 5433 | Banco do Patient Service |
| `postgres-appointments` | 5434 | Banco do Appointment Service |
| `postgres-medical` | 5435 | Banco do Medical Record Service |
| `postgres-notifications` | 5436 | Banco do Notification Service |
| `zookeeper` | interno | Coordenação do Kafka |
| `kafka` | 9092 | Event broker |
| `kafka-ui` | 8080 | UI para ver tópicos e conectores |
| `debezium-connect` | 8083 | CDC — lê WAL do PostgreSQL e publica no Kafka |

**Detalhe importante:** Todos os bancos sobem com `wal_level=logical` para habilitar o Debezium.

### ✅ Schemas SQL (`infra/postgres/*/01-schema.sql`)

Cada banco tem seu schema criado automaticamente quando o container sobe pela primeira vez via `/docker-entrypoint-initdb.d`.

| Banco | Tabelas |
|---|---|
| `db_identity` | `users`, `refresh_tokens`, `outbox_events` |
| `db_patients` | `patients`, `outbox_events` |
| `db_appointments` | `doctor_schedules`, `blocked_slots`, `appointments`, `saga_state`, `outbox_events` |
| `db_medical_records` | `event_store`, `record_access_log`, `outbox_events` |
| `db_notifications` | `delivery_logs`, `notification_templates` (com seed de 5 templates) |

Todos os arquivos SQL estão documentados em português coluna a coluna.

### ✅ Conectores Debezium (`infra/debezium/connectors/`)

4 conectores JSON — um por serviço que produz eventos:
- `identity-outbox-connector.json` → tópico `prontumed.User`
- `patients-outbox-connector.json` → tópico `prontumed.Patient`
- `appointments-outbox-connector.json` → tópico `prontumed.Appointment`
- `medical-outbox-connector.json` → tópico `prontumed.MedicalRecord`

Registrar conectores (rodar uma vez após o Docker subir):
```bash
bash infra/debezium/register-connectors.sh
```

### ✅ Repositório Git
- Git inicializado na raiz do projeto
- Commit inicial feito: `feat: infraestrutura base do ProntuMed`
- `.gitattributes` com `eol=lf` para compatibilidade com Linux/Docker
- `.env` no `.gitignore` (nunca vai pro repositório)

### ✅ Pipeline de PR (`github/workflows/pr-infra.yml`)

Roda automaticamente em PRs que tocam `docker-compose.yml` ou `infra/**`:
- **Job 1:** Valida sintaxe do `docker-compose.yml`
- **Job 2:** Verifica se todos os bancos têm `01-schema.sql`
- **Job 3:** Valida JSON dos conectores + confirma `topic.prefix=prontumed`

**Pendente:** Fazer `git remote add origin` e `git push` após criar o repositório em `github.com/joaohenriquefsp/prontumed`.

---

## O que ainda não foi feito

### Serviços da aplicação (nenhum iniciado)

| Serviço | Tipo | Porta | Status |
|---|---|---|---|
| Identity Service | Microsserviço .NET 8 | 5001 | ⏳ próximo passo |
| Patient Service | Microsserviço .NET 8 | 5002 | ⏳ |
| Appointment Service | Microsserviço .NET 8 | 5003 | ⏳ |
| Medical Record Service | Microsserviço .NET 8 | 5004 | ⏳ |
| Notification Service | Worker .NET 8 | — | ⏳ |
| BFF Gateway | NestJS | 3000 | ⏳ |
| Portal Web | Next.js 14 | — | ⏳ |
| App Mobile | React Native + Expo | — | ⏳ |

---

## Decisões tomadas

| Decisão | Escolha | Motivo |
|---|---|---|
| Nome do projeto | ProntuMed | Escolha do usuário |
| Estrutura de repositório | Monorepo único | Simples para TCC, um `git clone` traz tudo |
| API Gateway | NestJS BFF (sem Kong) | Kong seria caixa preta para a banca; o BFF em código é explicável |
| HMAC | BFF assina → microsserviços validam | Zero Trust interno sem depender de infraestrutura extra |
| Nomes das tabelas | Inglês com comentários em português | Padrão do mercado, documentação em português |
| Prefixo dos tópicos Kafka | `prontumed.*` | Consistente com o nome do projeto |

---

## Como retomar amanhã

### 1. Subir a infraestrutura
```bash
docker compose up -d
```

### 2. Registrar conectores Debezium (primeira vez)
```bash
bash infra/debezium/register-connectors.sh
```

### 3. Verificar que tudo está de pé
- Kafka UI: http://localhost:8080
- Debezium API: http://localhost:8083

### 4. Próximo desenvolvimento — Identity Service
Estrutura que vamos criar:
```
services/
└── identity/
    ├── IdentityService.Domain/
    ├── IdentityService.Application/
    ├── IdentityService.Infrastructure/
    └── IdentityService.API/
```

O Identity Service é o pré-requisito de tudo — ele emite os JWTs que os outros serviços e o BFF dependem.

---

## Stack resumida

| Camada | Tecnologia |
|---|---|
| Microsserviços | .NET 8 + EF Core + MediatR + FluentValidation + Polly |
| BFF | NestJS + Passport.js |
| Frontend Web | Next.js 14 (App Router) |
| App Mobile | React Native + Expo |
| Banco de dados | PostgreSQL 16 (um por serviço) |
| Mensageria | Apache Kafka + Debezium + Outbox Pattern |
| Segurança | OAuth2 + PKCE, JWT (15min), Refresh Token (7d), RBAC, HMAC |
| Infra | Docker + Docker Compose |
| CI/CD | GitHub Actions |
