# ProntuMed — Contexto Atual do Projeto
> Última atualização: 2026-06-15

---

## O que é o ProntuMed

Sistema de gestão clínica baseado em microsserviços com comunicação orientada a eventos. Projeto de TCC desenvolvido em .NET 10, NestJS, Next.js e React Native.

**MVP:** Agendamento de consultas + Prontuário eletrônico + Notificações

---

## Status dos serviços

| Serviço | Tipo | Porta | Status |
|---|---|---|---|
| Identity Service | Microsserviço .NET 10 | 5001 | ✅ Concluído |
| Patient Service | Microsserviço .NET 10 | 5002 | ⏳ próximo passo |
| Appointment Service | Microsserviço .NET 10 | 5003 | ⏳ |
| Medical Record Service | Microsserviço .NET 10 | 5004 | ⏳ |
| Notification Service | Worker .NET 10 | — | ⏳ |
| BFF Gateway | NestJS | 3000 | ⏳ |
| Portal Web | Next.js 14 | — | ⏳ |
| App Mobile | React Native + Expo | — | ⏳ |

---

## O que já foi feito

### ✅ Documentação de arquitetura (`Arquitetura/`)
- `arquitetura-software.md` — referência técnica completa da stack e padrões
- `arquitetura-tcc.md` — proposta arquitetural formatada para o TCC
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

Todos os nomes de tabelas e colunas estão em **português** (snake_case).

| Banco | Tabelas |
|---|---|
| `db_identity` | `usuarios`, `tokens_renovacao`, `eventos_saida` |
| `db_patients` | `pacientes`, `eventos_saida` |
| `db_appointments` | `grade_horarios`, `horarios_bloqueados`, `consultas`, `estado_saga`, `eventos_saida` |
| `db_medical_records` | `repositorio_eventos`, `log_acesso_prontuario`, `eventos_saida` |
| `db_notifications` | `logs_envio`, `modelos_notificacao` (com seed de 5 modelos) |

### ✅ Conectores Debezium (`infra/debezium/connectors/`)

4 conectores JSON — um por serviço que produz eventos:
- `identity-outbox-connector.json` → tópico `prontumed.User`
- `patients-outbox-connector.json` → tópico `prontumed.Patient`
- `appointments-outbox-connector.json` → tópico `prontumed.Appointment`
- `medical-outbox-connector.json` → tópico `prontumed.MedicalRecord`

Todos os conectores usam campos em português (`tipo_agregado`, `id_agregado`, `tipo_evento`, `payload`, `criado_em`) para mapear a tabela `eventos_saida`.

Registrar conectores (rodar uma vez após o Docker subir):
```bash
bash infra/debezium/register-connectors.sh
```

### ✅ Pipeline de PR (`.github/workflows/pr-infra.yml`)

Roda automaticamente em PRs que tocam `docker-compose.yml` ou `infra/**`:
- **Job 1:** Valida sintaxe do `docker-compose.yml`
- **Job 2:** Verifica se todos os bancos têm `01-schema.sql`
- **Job 3:** Valida JSON dos conectores + confirma `topic.prefix`

### ✅ Identity Service (`services/identity/`)

Primeiro microsserviço implementado. Clean Architecture em 4 projetos .NET 10.

**Endpoints:**
- `POST /auth/login` — autentica via cookie HttpOnly (sem Bearer)
- `POST /auth/refresh` — renova tokens via cookie refresh_token
- `POST /auth/logout` — revoga sessão
- `POST /auth/alterar-senha` — troca senha do usuário autenticado
- `GET /usuarios/me` — dados do usuário logado
- `GET /usuarios` — listar todos [Admin]
- `GET /usuarios/{id}` — obter por ID [Admin]
- `POST /usuarios` — criar usuário [Admin]
- `PATCH /usuarios/{id}/perfil` — alterar perfil [Admin]
- `PATCH /usuarios/{id}/desativar` — soft delete [Admin]
- `GET /health` — health check

**Estrutura de pastas (padrão português aplicado a todos os serviços):**
```
Servico.Domain/
├── Entidades/     # Aggregate Roots e entidades filhas
├── Eventos/       # Domain Events
├── Repositorios/  # Interfaces de repositório
└── Excecoes/      # Exceções de domínio

Servico.Application/
├── Comandos/      # Commands (escrita) via MediatR
├── Consultas/     # Queries (leitura) via MediatR
├── Comportamentos/# ValidationBehavior
├── DTOs/          # Tipos de transferência
└── Interfaces/    # IJwtService, IHashService, IOutboxPublisher

Servico.Infrastructure/
├── Persistencia/  # AppDbContext + Configuracoes + Repositorios
├── Servicos/      # Implementações técnicas (JWT, Hash)
├── Outbox/        # OutboxPublisher
└── Migrations/    # Migrations EF Core

Servico.API/
├── Controladores/ # Controllers ASP.NET Core
├── Middlewares/   # HMAC + Exception handling
├── Requisicoes/   # Request DTOs de entrada
└── Program.cs
```

Ver `services/identity/README.md` para documentação completa dos endpoints.

---

## Padrões definidos (aplicar em todos os próximos serviços)

| Decisão | Escolha |
|---|---|
| Naming de tabelas/colunas | Português, snake_case |
| Naming de pastas dentro dos projetos | Português (Entidades, Comandos, Consultas...) |
| Naming dos projetos (.csproj) | `NomeServico.Camada` (misto — convenção .NET) |
| Autenticação serviço ↔ BFF | HMAC-SHA256 (`X-HMAC-Signature` + `X-HMAC-Timestamp`) |
| Autenticação usuário | Cookie HttpOnly (access 15min + refresh 7d) |
| Runtime | .NET 10 |
| ORM | EF Core 10 + Npgsql |
| CQRS | MediatR 12 |
| Validação | FluentValidation 11 |
| Hash de senha | BCrypt.Net-Next |
| Uma classe por arquivo | Obrigatório |

---

## Como retomar

### 1. Subir a infraestrutura
```bash
docker compose up -d
```

### 2. Registrar conectores Debezium (primeira vez)
```bash
bash infra/debezium/register-connectors.sh
```

### 3. Rodar o Identity Service
```bash
cd services/identity/IdentityService.API
dotnet run
```
Acesse: `http://localhost:5001/scalar/v1`

### 4. Próximo desenvolvimento — Patient Service
Estrutura: `services/patient/` com os mesmos 4 projetos.
Depende do Identity Service para validar JWTs no BFF.

---

## Decisões tomadas

| Decisão | Escolha | Motivo |
|---|---|---|
| Monorepo único | 1 `git clone` | Simples para TCC |
| NestJS como BFF | Sem Kong | Kong é caixa preta — BFF em código é explicável para a banca |
| HMAC | BFF assina → microsserviços validam | Zero Trust interno sem infra extra |
| Event Sourcing | Apenas Medical Record | CFM/LGPD exigem imutabilidade do prontuário |
| Saga Pattern | Apenas Appointment | Transação distribuída de agendamento |
| Português no banco | Tabelas e colunas | Consistência com o domínio e o TCC em português |
| Português nas pastas | Sub-pastas dos projetos | Consistência com o naming do banco |
