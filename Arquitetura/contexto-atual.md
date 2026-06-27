# ProntuMed — Contexto Atual do Projeto
> Última atualização: 2026-06-27 (Validação e2e completa — todos os endpoints validados via BFF; fixes HMAC e DTO bff-web; Notification Service Confluent.Kafka confirmado funcional)

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
| Medical Record Service | Microsserviço .NET 10 | 5004 | ✅ Concluído (smoke test + PR mergeado) |
| Notification Service | Worker .NET 10 | — | ✅ Concluído (smoke test ponta a ponta) |
| bff-web | NestJS | 3000 | ✅ Concluído (Redis + Kafka + SSE — fixes PR #34) |
| bff-mobile | NestJS | 3001 | ✅ Concluído (Redis + Kafka + SSE) |
| Portal Web | Next.js 14 | 3002 | ✅ Concluído (todas as telas integradas ao bff-web real) |
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
| `prontumed-redis` | 6379 | Cache dos BFFs (ioredis, sem persistência em dev) |

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

4 conectores JSON — um por serviço que produz eventos. O nome real de cada tópico é a classe do Aggregate Root (`agregado.GetType().Name` no Outbox), não o nome do serviço — exceto Medical Record, que usa um valor fixo (`"MedicalRecord"`, hardcoded no `OutboxPublisher` porque o conector exige essa string exata):
- `identity-outbox-connector.json` → tópico `prontumed.Usuario`
- `patients-outbox-connector.json` → tópico `prontumed.Paciente`
- `appointments-outbox-connector.json` → tópico `prontumed.Consulta`
- `medical-outbox-connector.json` → tópico `prontumed.MedicalRecord`

Todos os conectores usam campos em português (`tipo_agregado`, `id_agregado`, `tipo_evento`, `payload`). O campo `criado_em` existe na tabela mas não é referenciado pelo conector (removido do `event.timestamp` do EventRouter — ver nota abaixo sobre o bug corrigido em 2026-06-21).

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

**Eventos publicados:** `ConsultaAgendadaEvent`, `ConsultaConfirmadaEvent`, `ConsultaCanceladaEvent`, `ConsultaConcluidaEvent`, `ConsultaNoShowEvent` → tópico `prontumed.Consulta`

> **Nota sobre nome do tópico:** o tópico real não é `prontumed.Appointment` (documentado assim por engano em versões anteriores deste arquivo) — o Outbox usa `agregado.GetType().Name` como `tipo_agregado`, ou seja, o nome da classe do Aggregate Root (`Consulta`, em português), não o nome do serviço. Confirmado durante a implementação do Notification Service (2026-06-21). O mesmo desalinhamento existia em Identity (`prontumed.Usuario`, real, vs `prontumed.User`, documentado) e Patient (`prontumed.Paciente`, real e confirmado em teste, vs `prontumed.Patient`, documentado) — corrigido em toda a documentação em 2026-06-21. **Medical Record é a exceção:** seu `OutboxPublisher` define `TipoAgregado = "MedicalRecord"` manualmente (hardcoded, comentário explica que o conector Debezium exige essa string exata), então `prontumed.MedicalRecord` já estava correto.

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

### ✅ Medical Record Service (`services/medical-record/`)

Prontuário eletrônico do paciente. Clean Architecture em 4 projetos .NET 10, mas com persistência via **Event Sourcing** em vez de CRUD — único serviço do sistema com essa abordagem (ADR-002).

**Endpoints:**
- `POST /prontuarios/{idPaciente}` — criar prontuário [Doctor]
- `GET /prontuarios/{idPaciente}` — obter prontuário completo, reconstruído por replay [Doctor]
- `POST /prontuarios/{idPaciente}/entradas` — adicionar entrada (nota, diagnóstico, prescrição, exame) [Doctor]
- `GET /prontuarios/{idPaciente}/entradas/{idEntrada}` — obter entrada [Doctor]
- `GET /prontuarios/{idPaciente}/historico` — histórico bruto de eventos [Doctor, Admin]
- `GET /health`

**Event Sourcing:** não há tabela de estado atual. Toda leitura reconstrói o agregado `Prontuario` lendo `repositorio_eventos` em ordem de `versao` e aplicando os eventos via `Prontuario.ReplayEventos`. Os mesmos `IDomainEvent` servem tanto de evento de domínio (outbox → Kafka) quanto de evento de event-sourcing (persistência append-only) — não há duplicação de classes de evento. Concorrência na escrita é protegida pela constraint `UNIQUE(id_agregado, versao)` → `DbUpdateException` → `409`.

**Auditoria de acesso (LGPD/CFM):** toda leitura bem-sucedida grava uma linha em `log_acesso_prontuario` (ação `Viewed`), feito diretamente no Query Handler via `ILogAcessoRepository` — exceção documentada à regra de que queries não alteram estado.

**Decisão de implementação:** a migration EF `Initial` é intencionalmente vazia (sem `CreateTable`) — o schema já é criado por `infra/postgres/medical/01-schema.sql` via `docker-entrypoint-initdb.d`, e a migration existe só para o Design-Time Model do EF reconhecer o schema existente.

**Eventos publicados:** `RecordCreatedEvent`, `ConsultationNoteAddedEvent`, `DiagnosisAddedEvent`, `PrescriptionAddedEvent`, `ExamRequestedEvent` → tópico `prontumed.MedicalRecord`

Ver `services/medical-record/README.md` para documentação completa.

**Bugs de schema/migration corrigidos nos demais serviços (2026-06-20):** durante a implementação do Medical Record, foi identificado que Identity, Patient e Appointment tinham migrations EF que recriavam tabelas já criadas pelos respectivos `01-schema.sql` — corrigido nos 4 serviços (todas as migrations `Initial`/`InitialCreate` esvaziadas, schema agora é sempre gerenciado pelo SQL). No Appointment, também foi corrigido o filtro do índice `idx_consultas_slot_unico`, que usava valores de status em inglês e nunca liberava consultas canceladas/concluídas para reagendamento.

---

### ✅ Notification Service (`services/notification/`)

Worker .NET 10 puro (sem API REST) — consome eventos Kafka do Appointment Service e dispara notificações por e-mail e push. Clean Architecture adaptada: `Domain` → `Application` → `Infrastructure` → `Worker` (substitui a camada `API`).

**Eventos consumidos** (tópico `prontumed.Consulta`, filtrados pelo header Kafka `eventType`):
- `ConsultaAgendadaEvent` → e-mail + push de confirmação ao paciente
- `ConsultaCanceladaEvent` → e-mail + push de cancelamento ao paciente
- `ConsultaConcluidaEvent` → push pedindo feedback ao paciente

> **Escopo do MVP:** apenas o paciente é notificado (é o que os templates seedados em `infra/postgres/notifications/01-schema.sql` cobrem hoje). Notificar o médico sobre novos agendamentos é descrito em `arquitetura-software.md`, mas depende do App Mobile existir (ainda não há registro de push token de médico) — ficou fora do escopo desta primeira versão.

**Enriquecimento de dados:** os eventos do Appointment só carregam IDs (`IdPaciente`, `IdMedico`). O Notification Service busca nome/e-mail via chamadas HTTP síncronas, assinadas com HMAC, a dois endpoints novos criados especificamente para uso entre serviços internos (sem JWT de usuário, já que o worker não age em nome de ninguém logado):
- `GET /pacientes/{id}/interno` (Patient Service)
- `GET /usuarios/{id}/interno` (Identity Service)

Ambos protegidos só pelo `HmacValidationMiddleware` (`[AllowAnonymous]`), não pelas regras de RBAC das rotas equivalentes usadas pelo BFF. Decisão registrada na conversa de implementação: preferido a um read model local (réplica de dados via eventos) por ser mais simples e não exigir alterar o formato de eventos já publicados pelo Patient Service.

**Resiliência:** chamadas a Patient/Identity usam retry com backoff exponencial (Polly) via `DelegatingHandler`. O consumer Kafka só comita o offset após processar com sucesso — falha temporária nos serviços internos atrasa a notificação em vez de perdê-la.

**Idempotência:** `logs_envio` tem `UNIQUE(id_evento, tipo_evento, canal)` — `id_evento` é, na prática, o `id_agregado` (`IdConsulta`) usado como chave da mensagem Kafka, que se repete entre os 3 tipos de evento da mesma consulta; por isso `tipo_evento` entra na chave de idempotência.

**Envio real:** e-mail via SMTP (MailKit) apontando para o container `smtp4dev` (novo no `docker-compose.yml`, UI em `http://localhost:5080`) — captura os e-mails sem entregá-los de fato, adequado para dev/demonstração. Push é um stub que só grava log + `logs_envio`, já que o App Mobile não existe ainda.

**Cliente Kafka:** `Confluent.Kafka` puro (primeiro consumer do sistema — os demais serviços só produzem eventos via Outbox).

**Smoke test (2026-06-21):** fluxo ponta a ponta validado manualmente — `POST /consultas` → Outbox → Debezium → Kafka → consumo → e-mail capturado no smtp4dev + push simulado, ambos com `status=Sent` em `logs_envio`.

**Bugs de infraestrutura descobertos e corrigidos durante a implementação:**
- Conectores Debezium (`infra/debezium/connectors/*.json`) tinham `transforms.outbox.table.field.event.timestamp: criado_em` apontando para uma coluna `TIMESTAMPTZ` — o Debezium nunca representa esse tipo como `INT64` (exigido pelo `EventRouter`), causando falha permanente da task do conector assim que o primeiro evento real era publicado em qualquer serviço. Campo é opcional e foi removido dos 4 conectores.
- `logs_envio` tinha `UNIQUE(id_evento, canal)` sem `tipo_evento` — bloquearia indevidamente o registro de uma consulta cancelada se a mesma consulta já tivesse sido notificada como agendada (mesmo `id_evento`/`id_agregado`).
- Seeds de `modelos_notificacao` usavam `tipo_evento` em inglês (`AppointmentScheduled` etc.), incompatível com o valor real publicado pelo Outbox (`evento.GetType().Name`).

Ver `services/notification/README.md` para documentação completa.

---

## Padrões definidos (aplicar em todos os próximos serviços)

| Decisão | Escolha |
|---|---|
| Naming de tabelas/colunas/valores de status | Português, snake_case |
| Naming de pastas dentro dos projetos | Inglês (Entities, Commands, Queries, Controllers...) |
| Naming dos projetos (.csproj) | `NomeServico.Camada` |
| Autenticação serviço ↔ BFF | HMAC-SHA256 (`X-HMAC-Signature` + `X-HMAC-Timestamp` + `X-HMAC-Nonce` via IMemoryCache) |
| HMAC — mensagem assinada | `{Method}{Path}{QueryString}{Timestamp}` |
| Autenticação serviço ↔ serviço (sem usuário) | Rota `/recurso/{id}/interno`, `[AllowAnonymous]` + só `HmacValidationMiddleware` — usado pelo Notification Service para chamar Patient/Identity sem JWT |
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

# Medical Record (porta 5004)
cd services/medical-record/MedicalRecordService.API && dotnet run

# Notification (worker, sem porta HTTP)
# DOTNET_ENVIRONMENT=Development necessário para carregar appsettings.Development.json
cd services/notification/NotificationService.Worker && DOTNET_ENVIRONMENT=Development dotnet run
```

Acesse a documentação de cada serviço (exceto Notification, que não tem API REST) em `http://localhost:{porta}/scalar/v1`

---

### ✅ Portal Web (`services/portal-web/`) — integrado ao bff-web real

Frontend web do sistema. Next.js 14 App Router, TypeScript, Tailwind CSS puro com design system via CSS custom properties (`--pm-*`). Porta 3002 em dev.

**Todas as 11 telas implementadas e integradas ao bff-web real** — mocks removidos, mock mode desativado por padrão no `.env.local`.

| Rota | Tela | Roles | Status |
|---|---|---|---|
| `/login` | Login | — | ✅ Integrado |
| `/agenda` | Agenda de Hoje (timeline) | Doctor, Admin | ✅ Integrado |
| `/pacientes` | Lista de Pacientes + modal criar | Receptionist, Admin | ✅ Integrado |
| `/agendar` | Agendar Consulta (wizard 4 passos) | Receptionist, Admin | ✅ Integrado |
| `/configuracoes` | Tema de cor + preset de sidebar | todos | ✅ Integrado |
| `/consultas` | Consultas (tabela + filtros + ações completas) | Receptionist, Admin | ✅ Integrado |
| `/proximas` | Próximas Consultas (agrupadas por dia) | Doctor | ✅ Integrado |
| `/perfil` | Meu Perfil (editar nome + alterar senha) | todos | ✅ Integrado |
| `/usuarios` | Gestão de Usuários (CRUD + modal criar) | Admin | ✅ Integrado |
| `/grade` | Grade Horária (faixas por dia da semana) | Admin, Doctor | ✅ Integrado |
| `/prontuarios` | Prontuários (event sourcing — lista + entradas) | Doctor | ✅ Integrado |

**PRs de integração mergeados (2026-06-23 a 2026-06-24):**

| PR | Escopo |
|---|---|
| #30 | Integração de `/agenda`, `/agendar`, `/pacientes`, `/proximas` com bff-web |
| #31 | Integração de `/consultas` (confirmar, cancelar, concluir, no-show), `/grade`, `/usuarios` |
| #32 | Integração de `/perfil` (salvar nome, alterar senha) |
| #33 | Integração de `/prontuarios` — `handleAdicionarEntrada` chamava `POST /prontuarios/:id/entradas` no bff (era mock local) |

**Infraestrutura real-time adicionada:**
- `hooks/use-sse.ts` — EventSource com reconnect exponencial (2s→30s), `withCredentials: true`
- `lib/toast-store.ts` — zustand store de toasts com auto-dismiss 5s
- `components/shared/toast-container.tsx` — UI de toasts (4 variantes: info/success/warning/error)
- `components/providers/sse-provider.tsx` — liga SSE ao toast; só ativa com usuário autenticado e mock desativado
- `app/(portal)/layout.tsx` — inclui `<SseProvider>` + `<ToastContainer />`

**Decisões de implementação:**
- Design system com 6 paletas de cor e 3 presets de sidebar, todos trocáveis em tempo real via CSS custom properties (sem rebuild)
- `lib/api.ts` — wrapper de fetch com cookie HttpOnly (`credentials: include`) e lógica de refresh automático em 401
- `UserProvider` — carrega `GET /usuarios/me` no mount e expõe o usuário logado via context
- Mock mode (`MOCK_AUTH=true` + `NEXT_PUBLIC_MOCK_AUTH=true` no `.env.local`) — bypass de middleware + dados fictícios; **desativado por padrão** (`false`)
- Perfil mock padrão (quando ativo): Admin (Carlos Mendes)

**Como rodar:**
```bash
cd services/portal-web
pnpm dev   # http://localhost:3002
```

Ver `services/portal-web/README.md` para documentação completa.

---

### ✅ bff-web — fixes de Redis e cache (PR #34, 2026-06-24)

Dois bugs críticos corrigidos que impediam o Redis de funcionar de ponta a ponta:

| Arquivo | Bug | Fix |
|---|---|---|
| `common/redis/redis.service.ts` | `lazyConnect: true` sem chamar `.connect()` — Redis nunca conectava de fato no startup | Implementa `OnModuleInit`; chama `client.connect()` com log de sucesso/erro |
| `modules/appointments/appointments.service.ts` | `listarConsultas()` não escrevia no cache — o Kafka consumer invalidava chaves que nunca existiam | Cache com chave `consultas:medico:{idMedico}` (TTL 60s) alinhada ao que o consumer já invalida |

**Estado atual do ciclo Redis + Kafka + SSE:**
- `GET /pacientes` e `GET /pacientes/:id` → cache `pacientes:lista` / `paciente:{id}` ✅ (já estava correto)
- `GET /consultas?idMedico=X` → cache `consultas:medico:{idMedico}` ✅ (fix PR #34)
- `GET /consultas/:id` → cache `consulta:{id}` ✅ (já estava correto)
- Kafka `prontumed.Consulta` → invalida cache de consultas + emite SSE ao médico e paciente ✅
- Kafka `prontumed.Paciente` → invalida cache de pacientes ✅ (SSE para pacientes não implementado — ver nota abaixo)
- `GET /events` (SSE) → frontend recebe toast ao vivo quando status de consulta muda ✅

> **Nota sobre SSE de pacientes:** eventos Kafka de paciente (`prontumed.Paciente`) só invalidam cache — não emitem SSE. O `EventsService` emite por `userId` específico, e o payload do evento de paciente não carrega quais admins/recepcionistas devem ser notificados. O frontend também não define `TipoEventoSSE` para eventos de paciente. Gap documentado — baixo impacto no MVP (cache com TTL 60s garante dados frescos).

---

## ✅ Validação e2e completa — 2026-06-27

Todos os endpoints de todos os microsserviços foram validados via BFF com a stack completa rodando (Docker infra + 4 microsserviços + Notification Worker + BFF).

### Endpoints validados

| Serviço | Endpoints validados |
|---|---|
| Identity (via BFF) | POST /auth/login, POST /auth/refresh, POST /auth/logout, POST /auth/alterar-senha, GET /usuarios/me, GET /usuarios, GET /usuarios/:id, POST /usuarios, PATCH /usuarios/:id/perfil, PATCH /usuarios/:id/desativar |
| Patient (via BFF) | GET /pacientes, GET /pacientes/:id, GET /pacientes/cpf/:cpf, POST /pacientes, PUT /pacientes/:id, PATCH /pacientes/:id/desativar |
| Appointment (via BFF) | POST /consultas, GET /consultas, GET /consultas/:id, PATCH /confirmar, PATCH /cancelar, PATCH /concluir (Doctor token), PATCH /no-show, POST /grade-horarios, GET /grade-horarios, DELETE /grade-horarios/:id, GET /disponibilidade |
| Medical Record (via BFF) | POST /prontuarios/:id, GET /prontuarios/:id, POST /prontuarios/:id/entradas, GET /prontuarios/:id/entradas/:idEntrada, GET /prontuarios/:id/historico |
| BFF features | Redis caching (4 chaves), Kafka consumer, SSE (/events), GET /health |
| Notification Worker | Confluent.Kafka conectado, consume `prontumed.Consulta`, e-mails via smtp4dev ✅, push simulado ✅, deduplicação por `logs_envio` ✅ |

### Fluxo e2e validado

`POST /consultas` → Appointment Service → Outbox → Debezium → Kafka `prontumed.Consulta` → BFF consumer (invalida Redis + emite SSE) → Notification Worker (e-mail `fernanda@prontumed.com` capturado no smtp4dev + push simulado em log)

### Bugs corrigidos nesta sessão (bff-web)

| Arquivo | Bug | Fix |
|---|---|---|
| `modules/appointments/appointments.service.ts` | `listarConsultas`, `disponibilidade` e `listarGradeHorarios` passavam QueryString como 3º arg para `hmac.gerarHeaders()` — assinatura HMAC divergia do que o Appointment Service validava | Removido o 3º arg — assinatura é apenas `METHOD+PATH+TIMESTAMP` |
| `modules/medical-record/dto/adicionar-entrada.dto.ts` | Campo `tipo` não correspondia ao campo `TipoEntrada` esperado pelo Medical Record; enum `SolicitacaoExame` não existia no domínio | Campo renomeado para `tipoEntrada`; enum corrigido para `Exame` |

### Notification Service — Confluent.Kafka (Windows)

O consumer Confluent.Kafka não conectava com `BootstrapServers: localhost:9092` em sessões anteriores. Fix: usar `127.0.0.1:9092` em `appsettings.Development.json`. Confirmado funcional — consumer group `notification-service` ativo, todos os eventos sendo consumidos.

---

## Próximos serviços: BFF Mobile e App Mobile

Dois BFFs NestJS dedicados — um por tipo de cliente (padrão BFF de Sam Newman). Código compartilhado extraído para um pacote interno `@prontumed/bff-core` (HMAC, HTTP clients, guards base).

### bff-mobile ✅ (já implementado)
**Tipo:** NestJS | **Porta:** `3001` | Ver `services/bff-mobile/README.md`

Atende o App Mobile com perfis Doctor e Patient. Consome Identity, Patient e Appointment.

### App Mobile ⏳ (próximo)
**Tipo:** React Native + Expo  
Telas: Agenda, Consultas, Pacientes, Perfil, Notificações.  
Consome bff-mobile (porta 3001).

Ver seção "Camada de Entrada — BFF NestJS" em `Arquitetura/arquitetura-software.md` para o desenho completo.

---

## Decisões tomadas

| Decisão | Escolha | Motivo |
|---|---|---|
| Monorepo único | 1 `git clone` | Simples para TCC |
| NestJS como BFF | Dois BFFs (bff-web + bff-mobile), sem Kong | Kong é caixa preta — BFF em código é explicável para a banca |
| BFF por tipo de cliente | Um por frontend (web e mobile) | Padrão BFF correto: cada cliente tem composição de resposta e evolução independente |
| HMAC | BFF assina → microsserviços validam (Method+Path+QueryString+Timestamp+Nonce) | Zero Trust interno sem infra extra |
| Validação dupla | BFF (formato) + microsserviço (negócio) | Cada camada defende seu próprio perímetro |
| Event Sourcing | Apenas Medical Record | CFM/LGPD exigem imutabilidade do prontuário |
| Saga Pattern | Apenas Appointment (interna, não cross-service) | Disponibilidade + slot + consulta são atômicos no mesmo banco |
| Português no banco | Tabelas, colunas e valores de status | Consistência com o domínio e o TCC em português |
| Inglês nas pastas | Sub-pastas dos projetos (.NET) | Convenção padrão do ecossistema .NET |
| Double-booking | Unique constraint parcial no banco + DbUpdateException no middleware | Atomicidade real — check em memória não é suficiente sob concorrência |
| LGPD — Doctor | idMedico forçado pelo JWT, não pelo caller | Doctor não pode consultar dados de outros médicos |
| Enriquecimento de dados no Notification Service | Chamada HTTP+HMAC síncrona a Patient/Identity, não read model local | Mais simples e mais rápido de implementar; não exige duplicar dados nem alterar eventos já publicados. Read model ficaria mais resiliente a indisponibilidade dos outros serviços, mas o ganho não se justifica para o MVP — decisão revisitável se o requisito mudar |
