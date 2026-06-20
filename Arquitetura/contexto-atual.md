# ProntuMed — Contexto Atual do Projeto
> Última atualização: 2026-06-20

---

## O que é o ProntuMed

Sistema de gestão clínica baseado em microsserviços com comunicação orientada a eventos. Projeto de TCC desenvolvido em .NET 10, NestJS, Next.js e React Native.

**MVP:** Agendamento de consultas + Prontuário eletrônico + Notificações

---

## Status dos serviços

| Serviço | Tipo | Porta | Status |
|---|---|---|---|
| Identity Service | Microsserviço .NET 10 | 5001 | ✅ Concluído + revisado |
| Patient Service | Microsserviço .NET 10 | 5002 | ✅ Concluído + revisado |
| Appointment Service | Microsserviço .NET 10 | 5003 | ✅ Concluído + code review aplicado |
| Medical Record Service | Microsserviço .NET 10 | 5004 | ⏳ Próximo |
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

Todos os conectores usam campos em português (`tipo_agregado`, `id_agregado`, `tipo_evento`, `payload`, `criado_em`).

Registrar conectores (rodar uma vez após o Docker subir):
```bash
bash infra/debezium/register-connectors.sh
```

### ✅ Pipelines de PR (`.github/workflows/`)

Cada serviço tem um workflow dedicado que roda em PRs e aceita `workflow_dispatch`:

| Workflow | Path gatilho | Jobs |
|---|---|---|
| `pr-infra.yml` | `docker-compose.yml`, `infra/**` | Valida compose, schemas SQL e conectores Debezium |
| `pr-identity.yml` | `services/identity/**` | restore → build → format check |
| `pr-patient.yml` | `services/patient/**` | restore → build → format check |
| `pr-appointment.yml` | `services/appointment/**` | restore → build → format check |
| `pr-medical-record.yml` | `services/medical-record/**` | restore → build → format check |
| `pr-notification.yml` | `services/notification/**` | restore → build → format check |

### ✅ Identity Service (`services/identity/`)

Microsserviço de autenticação e gestão de usuários. Clean Architecture em 4 projetos .NET 10.

**Endpoints:**
- `POST /auth/login` — autentica via cookie HttpOnly
- `POST /auth/refresh` — renova tokens
- `POST /auth/logout` — revoga sessão
- `POST /auth/alterar-senha`
- `GET /usuarios/me`, `GET /usuarios`, `GET /usuarios/{id}`
- `POST /usuarios`, `PATCH /usuarios/{id}/perfil`, `PATCH /usuarios/{id}/desativar`
- `GET /health`

Ver `services/identity/README.md` para documentação completa.

### ✅ Patient Service (`services/patient/`)

Cadastro e gestão de pacientes. Clean Architecture em 4 projetos .NET 10.

**Endpoints:**
- `POST /pacientes`, `GET /pacientes`, `GET /pacientes/{id}`, `GET /pacientes/cpf/{cpf}`
- `PUT /pacientes/{id}`, `PATCH /pacientes/{id}/desativar`, `GET /health`

Ver `services/patient/README.md` para documentação completa.

### ✅ Appointment Service (`services/appointment/`) — com code review aplicado

Agendamento de consultas, grade de horários e controle de disponibilidade. Clean Architecture em 4 projetos .NET 10.

**Endpoints:**
- `POST /consultas` — agendar [Receptionist, Admin]
- `GET /consultas` — listar com filtros (idMedico forçado pelo JWT para Doctor — LGPD)
- `GET /consultas/{id}` — obter por ID
- `PATCH /consultas/{id}/confirmar` — confirmar [Receptionist, Admin]
- `PATCH /consultas/{id}/cancelar` — cancelar [Receptionist, Admin]
- `PATCH /consultas/{id}/concluir` — concluir [Doctor]
- `PATCH /consultas/{id}/no-show` — registrar ausência [Doctor, Admin]
- `POST /grade-horarios`, `GET /grade-horarios`, `DELETE /grade-horarios/{id}`
- `GET /disponibilidade?idMedico=&data=`
- `POST /horarios-bloqueados`, `DELETE /horarios-bloqueados/{id}`
- `GET /health`

**Máquina de estados:** `Agendado → Confirmado → Concluido / Cancelado / NoShow`
- `Agendado → Concluido` e `Agendado → NoShow` também são válidos (consultas não confirmadas explicitamente)
- Rastreada em `estado_saga` com constantes tipadas (`EtapaSaga`, `StatusSaga`)

**Eventos publicados:** `ConsultaAgendada`, `ConsultaConfirmada`, `ConsultaCancelada`, `ConsultaConcluida`, `ConsultaNoShow` → tópico `prontumed.Appointment`

**Bugfixes aplicados (2026-06-20) — 7 PRs mergeados:**

| PR | Correção |
|---|---|
| #7 | Credenciais removidas do `appsettings.json` + `appsettings.Development.json` no `.gitignore` |
| #8 | HMAC: QueryString incluída na assinatura + proteção contra replay com `IMemoryCache` (nonce) |
| #9 | LGPD: Doctor só pode listar suas próprias consultas (idMedico extraído do JWT claim) |
| #10 | Race condition: unique constraint parcial `idx_consultas_slot_unico` + `DbUpdateException` → 409 |
| #11 | Transições: `Agendado → Concluido` e `Agendado → NoShow` aceitos como válidos |
| #12 | Saga: `EtapaSaga` com constantes tipadas + validação em `AtualizarEtapa` |
| #13 | Status padronizados para português nos valores do banco (`"Agendado"`, `"Confirmado"`, etc.) |

---

## Padrões definidos (aplicar em todos os próximos serviços)

| Decisão | Escolha |
|---|---|
| Naming de tabelas/colunas/valores de status | Português, snake_case |
| Naming de pastas dentro dos projetos | Inglês (Entities, Commands, Queries, Controllers...) |
| Naming dos projetos (.csproj) | `NomeServico.Camada` |
| Autenticação serviço ↔ BFF | HMAC-SHA256 (`X-HMAC-Signature` + `X-HMAC-Timestamp` + `X-HMAC-Nonce` via IMemoryCache) |
| HMAC — mensagem assinada | `{Method}{Path}{QueryString}{Timestamp}` |
| Autenticação usuário | Cookie HttpOnly (access 15min + refresh 7d) |
| Runtime | .NET 10 |
| ORM | EF Core 10 + Npgsql |
| CQRS | MediatR 12 |
| Validação | FluentValidation 11 |
| Hash de senha | BCrypt.Net-Next |
| Uma classe por arquivo | Obrigatório |
| LGPD — listagem por Doctor | `idMedico` sempre extraído do JWT claim `NameIdentifier` |
| Credenciais | Nunca em `appsettings.json`; sempre em `appsettings.Development.json` (gitignored) |

---

## Como retomar

### 1. Clonar e subir a infra
```bash
git clone https://github.com/joaohenriquefsp/prontumed.git
cd prontumed
docker compose up -d
```

### 2. Registrar conectores Debezium (primeira vez)
```bash
bash infra/debezium/register-connectors.sh
```

### 3. Criar `appsettings.Development.json` para cada serviço

Cada serviço precisa de um arquivo local com credenciais (não está no git):

**Identity** (`services/identity/IdentityService.API/appsettings.Development.json`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=db_identity;Username=clinicos;Password=prontumed_secret"
  },
  "Jwt": { "Chave": "chave-desenvolvimento-minimo-32-caracteres" },
  "Hmac": { "Chave": "chave-hmac-compartilhada-com-o-bff" }
}
```

**Patient** (`services/patient/PatientService.API/appsettings.Development.json`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=db_patients;Username=clinicos;Password=prontumed_secret"
  },
  "Hmac": { "Chave": "chave-hmac-compartilhada-com-o-bff" }
}
```

**Appointment** (`services/appointment/AppointmentService.API/appsettings.Development.json`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5434;Database=db_appointments;Username=clinicos;Password=prontumed_secret"
  },
  "Jwt": {
    "Chave": "chave-desenvolvimento-minimo-32-caracteres",
    "Emissor": "prontumed-identity",
    "Audiencia": "prontumed-services"
  },
  "Hmac": { "Chave": "chave-hmac-compartilhada-com-o-bff" }
}
```

### 4. Rodar os serviços
```bash
# Identity (porta 5001)
cd services/identity/IdentityService.API && dotnet run

# Patient (porta 5002)
cd services/patient/PatientService.API && dotnet run

# Appointment (porta 5003)
cd services/appointment/AppointmentService.API && dotnet run
```

Acesse a documentação de cada serviço em `http://localhost:{porta}/scalar/v1`

---

## Próximo serviço: Medical Record Service

**Porta:** `5004` | **Banco:** `db_medical_records` | **Branch:** `feat/medical-record-service`

### O que implementar

O Medical Record Service é o mais complexo do sistema — usa **Event Sourcing** internamente (exigência LGPD/CFM de imutabilidade do prontuário).

**Entidades principais:**
- `Prontuario` (Aggregate Root com Event Sourcing) — histórico imutável de entradas clínicas
- `EntradaProntuario` — nota clínica, diagnóstico, prescrição, exame
- `LogAcessoProntuario` — auditoria de quem acessou (LGPD)

**Endpoints planejados:**
- `POST /prontuarios/{idPaciente}` — criar prontuário [Doctor]
- `GET /prontuarios/{idPaciente}` — obter prontuário completo [Doctor]
- `POST /prontuarios/{idPaciente}/entradas` — adicionar entrada [Doctor]
- `GET /prontuarios/{idPaciente}/entradas/{idEntrada}` — obter entrada [Doctor]
- `GET /prontuarios/{idPaciente}/historico` — histórico de eventos [Doctor, Admin]
- `GET /health`

**Tabelas no banco (`db_medical_records`):**
- `repositorio_eventos` — stream de eventos (Event Store)
- `log_acesso_prontuario` — auditoria de acesso (LGPD)
- `eventos_saida` — outbox para Kafka

**Eventos publicados:**
- `ProntuarioCriado`, `EntradaAdicionada`, `ProntuarioAcessado` → tópico `prontumed.MedicalRecord`

**Padrões específicos deste serviço:**
- Event Sourcing: `repositorio_eventos` acumula todos os eventos do prontuário; o estado atual é reconstruído por replay
- Projeção em memória: `Prontuario.ReplayEventos()` reconstrói o agregado a partir do event store
- Nenhum UPDATE/DELETE na tabela de eventos — apenas INSERTs
- Log de acesso registrado automaticamente em cada GET (LGPD)

---

## Decisões tomadas

| Decisão | Escolha | Motivo |
|---|---|---|
| Monorepo único | 1 `git clone` | Simples para TCC |
| NestJS como BFF | Um único, sem Kong | Kong é caixa preta — BFF em código é explicável para a banca |
| BFF por cliente | Não por microsserviço | Portal Web + App Mobile compartilham o mesmo BFF |
| HMAC | BFF assina → microsserviços validam (Method+Path+QueryString+Timestamp+Nonce) | Zero Trust interno sem infra extra |
| Validação dupla | BFF (formato) + microsserviço (negócio) | Cada camada defende seu próprio perímetro |
| Event Sourcing | Apenas Medical Record | CFM/LGPD exigem imutabilidade do prontuário |
| Saga Pattern | Apenas Appointment (interna, não cross-service) | Disponibilidade + slot + consulta são atômicos no mesmo banco |
| Português no banco | Tabelas, colunas e valores de status | Consistência com o domínio e o TCC em português |
| Inglês nas pastas | Sub-pastas dos projetos (.NET) | Convenção padrão do ecossistema .NET |
| Double-booking | Unique constraint parcial no banco + DbUpdateException no middleware | Atomicidade real — check em memória não é suficiente sob concorrência |
| LGPD — Doctor | idMedico forçado pelo JWT, não pelo caller | Doctor não pode consultar dados de outros médicos |
