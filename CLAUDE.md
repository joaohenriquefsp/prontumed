# ProntuMed — Instruções para Claude Code

## Sobre o projeto

Sistema de gestão clínica (TCC) baseado em microsserviços .NET 10, NestJS, Next.js e React Native. Leia `Arquitetura/contexto-atual.md` para entender o estado atual antes de começar qualquer tarefa.

---

## Ao finalizar qualquer implementação de serviço ou feature

Antes de fazer o commit final ou abrir PR, **sempre executar os 3 passos abaixo**:

### 1. Atualizar `Arquitetura/contexto-atual.md`
- Marcar o serviço como `✅ Concluído` na tabela de status
- Adicionar seção documentando: endpoints, decisões específicas, eventos publicados
- Atualizar a data no topo do arquivo

### 2. Atualizar `Arquitetura/arquitetura-software.md`
- Adicionar ADR se houver nova decisão arquitetural relevante
- Atualizar descrição do serviço se divergir do que foi planejado

### 3. Criar ou atualizar `services/<nome>/README.md`
O README de cada serviço deve conter:
- Porta, banco e conexão
- Como rodar localmente (docker compose + migrations + dotnet run)
- Tabela de endpoints com: método, rota, roles, descrição
- Tabela de variáveis de configuração (JWT, HMAC, ConnectionString)
- Eventos publicados (tópico Kafka + nome do evento + quando é disparado)
- Estrutura de pastas resumida
- Máquina de estados (se houver)

Referência: `services/appointment/README.md` ou `services/identity/README.md`

---

## Padrões de código (aplicar em todos os serviços .NET)

| Decisão | Valor |
|---|---|
| Runtime | .NET 10 |
| Naming de tabelas/colunas | Português, snake_case |
| Naming de pastas nos projetos | Inglês (Entities, Commands, Queries, Controllers...) |
| Uma classe por arquivo | Obrigatório |
| Arquivo de solução | `.slnx` (não `.sln`) |
| Autenticação usuário → serviço | Cookie HttpOnly `access_token` (JWT 15min + refresh 7d) |
| Autenticação BFF → serviço | HMAC-SHA256 (`X-HMAC-Signature` + `X-HMAC-Timestamp`) |
| ORM | EF Core 10 + Npgsql |
| CQRS | MediatR 12 |
| Validação | FluentValidation 11 |
| Hash de senha | BCrypt.Net-Next |

## Padrão de OutboxPublisher (atomicidade)

Os repositórios de entidades com eventos **não chamam SaveChanges**. Apenas o `OutboxPublisher` chama `SaveChangesAsync` ao final, salvando entidade + outbox events em uma única transação.

Repositórios de entidades sem eventos (GradeHorario, HorarioBloqueado) chamam `SaveChangesAsync` internamente.

---

## Fluxo de branches e commits

- Cada serviço/feature em branch separada: `feat/<nome-do-servico>`
- Commits em português com prefixo convencional: `feat:`, `fix:`, `docs:`, `refactor:`
- **Nunca adicionar `Co-Authored-By: Claude`** nos commits
- Pipeline CI usa `.slnx` — verificar que o arquivo existe antes de abrir PR

---

## Estrutura do monorepo

```
Arquitetura/          ← documentação arquitetural (sempre atualizar)
infra/                ← docker-compose, schemas SQL, conectores Debezium
services/
  identity/           ← porta 5001, banco db_identity
  patient/            ← porta 5002, banco db_patients
  appointment/        ← porta 5003, banco db_appointments
  medical-record/     ← porta 5004, banco db_medical_records (Event Sourcing)
  notification/       ← worker .NET 10, sem API REST
.github/workflows/    ← um pipeline por serviço, triggado por path
```

---

## Decisões arquiteturais fixas (não questionar, apenas aplicar)

- BFF NestJS único (sem Kong) — explicável para a banca
- Saga no Appointment = máquina de estados interna (ADR-006) — não cross-service
- Event Sourcing apenas no Medical Record (CFM/LGPD) — ADR-002
- Outbox + Debezium para todos os eventos de domínio — ADR-003
- Single-tenant no MVP — ADR-005
