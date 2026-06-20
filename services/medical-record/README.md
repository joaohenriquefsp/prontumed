# Medical Record Service

Microsserviço responsável pelo prontuário eletrônico do paciente. Diferente dos demais serviços, não armazena o "estado atual" do prontuário — armazena todos os eventos clínicos ocorridos, e o estado é reconstruído por replay (**Event Sourcing**), por exigência do CFM e da LGPD de imutabilidade e auditabilidade do histórico clínico.

**Porta:** `5004`  
**Banco:** `db_medical_records` (PostgreSQL, porta `5435`)  
**Autenticação:** Cookie HttpOnly `access_token` (JWT emitido pelo Identity Service)  
**Autenticação interna:** HMAC-SHA256 (`X-HMAC-Signature` + `X-HMAC-Timestamp`)

---

## Como rodar localmente

```bash
# 1. Subir a infraestrutura (na raiz do monorepo)
docker compose up -d

# 2. Aplicar migrations (primeira vez)
cd services/medical-record
dotnet ef database update --project MedicalRecordService.Infrastructure --startup-project MedicalRecordService.API

# 3. Rodar o serviço
cd MedicalRecordService.API
dotnet run
```

> A migration `Initial` é intencionalmente vazia — o schema (`repositorio_eventos`, `log_acesso_prontuario`, `eventos_saida`) já é criado pelo Postgres via `infra/postgres/medical/01-schema.sql` (montado como `docker-entrypoint-initdb.d`). A migration existe apenas para o Design-Time Model do EF Core reconhecer esse schema.

Acesse a documentação interativa: `http://localhost:5004/scalar/v1`

---

## Variáveis de configuração

| Variável | Descrição |
|---|---|
| `ConnectionStrings:DefaultConnection` | Connection string do PostgreSQL |
| `Jwt:Chave` | Chave secreta JWT (mesma do Identity Service) |
| `Jwt:Emissor` | Emissor JWT (ex: `prontumed-identity`) |
| `Jwt:Audiencia` | Audiência JWT (ex: `prontumed-services`) |
| `Hmac:Chave` | Chave HMAC compartilhada com o BFF |

---

## Endpoints

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `POST` | `/prontuarios/{idPaciente}` | Doctor | Criar prontuário do paciente |
| `GET` | `/prontuarios/{idPaciente}` | Doctor | Obter prontuário completo (reconstruído por replay) |
| `POST` | `/prontuarios/{idPaciente}/entradas` | Doctor | Adicionar entrada (nota, diagnóstico, prescrição ou exame) |
| `GET` | `/prontuarios/{idPaciente}/entradas/{idEntrada}` | Doctor | Obter uma entrada específica |
| `GET` | `/prontuarios/{idPaciente}/historico` | Doctor, Admin | Histórico bruto de eventos do event store |
| `GET` | `/health` | — | Health check (sem autenticação) |

A identidade de quem acessa (`idMedico`/`idUsuarioAcesso`) é **sempre** extraída do claim JWT `ClaimTypes.NameIdentifier`, nunca de parâmetro de rota ou query — é a base da auditoria LGPD deste serviço.

---

## Reconstrução do estado (Event Sourcing)

Não existe uma tabela com o "estado atual" do prontuário. Toda leitura reconstrói o agregado `Prontuario` a partir da tabela `repositorio_eventos`, lendo todos os eventos daquele paciente em ordem de `versao` e aplicando-os via `Prontuario.ReplayEventos`. Nenhuma linha de `repositorio_eventos` é jamais alterada ou apagada — correções clínicas são sempre novas entradas, nunca edições.

Eventos de domínio (registrados em `Domain/Events/`):

| Evento | Disparado quando |
|---|---|
| `RecordCreatedEvent` | Prontuário criado (primeira consulta do paciente) |
| `ConsultationNoteAddedEvent` | Médico adiciona uma nota de consulta |
| `DiagnosisAddedEvent` | Diagnóstico é registrado |
| `PrescriptionAddedEvent` | Receita médica é emitida |
| `ExamRequestedEvent` | Exame é solicitado |

Os mesmos eventos de domínio servem dois propósitos: persistência no event store (`repositorio_eventos`, fonte de verdade, versionada) **e** publicação no outbox (`eventos_saida`, consumido uma única vez pelo Debezium/Kafka). Concorrência na gravação (duas requisições adicionando entradas ao mesmo prontuário simultaneamente) é protegida pela constraint `UNIQUE(id_agregado, versao)` — uma colisão de versão gera `DbUpdateException`, mapeado para `409 Conflict`.

---

## Auditoria de acesso (LGPD/CFM)

Toda vez que um endpoint de leitura (`GET /prontuarios/{id}`, `GET .../entradas/{id}`, `GET .../historico`) retorna dados com sucesso, uma linha é inserida em `log_acesso_prontuario` registrando quem acessou e quando (ação `Viewed`). Essa gravação ocorre diretamente dentro do Query Handler, via `ILogAcessoRepository` — uma exceção deliberada e documentada à regra geral do projeto de que "queries nunca alteram estado", justificada pela exigência legal de rastreabilidade de acesso a dados sensíveis de saúde (LGPD art. 46; resoluções do CFM). Essa gravação não passa pelo outbox/Kafka — é local e síncrona.

---

## Eventos publicados (Outbox → Debezium → Kafka)

Tópico: `prontumed.MedicalRecord`

| Evento | Disparado quando |
|---|---|
| `RecordCreatedEvent` | Prontuário criado |
| `ConsultationNoteAddedEvent` | Nota de consulta adicionada |
| `DiagnosisAddedEvent` | Diagnóstico adicionado |
| `PrescriptionAddedEvent` | Prescrição adicionada |
| `ExamRequestedEvent` | Exame solicitado |

---

## Estrutura

```
MedicalRecordService.Domain/
├── Entities/       # Prontuario (AggregateRoot), EntradaProntuario, EventoArmazenado,
│                   # LogAcessoProntuario, TipoEntradaProntuario, AcaoAcessoProntuario
├── Events/         # Domain Events (também usados como eventos de Event Sourcing) + EventoArmazenadoSerializer
├── Exceptions/     # Exceções de domínio tipadas
└── Repositories/   # Interfaces (sem implementação)

MedicalRecordService.Application/
├── Commands/       # CriarProntuario, AdicionarEntrada
├── Queries/        # ObterProntuario, ObterEntrada, ObterHistorico (com auditoria de acesso embutida)
├── DTOs/           # Tipos de resposta
├── Behaviors/      # ValidationBehavior (FluentValidation no pipeline MediatR)
└── Interfaces/     # IOutboxPublisher

MedicalRecordService.Infrastructure/
├── Persistence/    # AppDbContext, Configurations, Repositories (ProntuarioRepository faz replay)
├── Outbox/         # EventoSaida, OutboxPublisher
└── Migrations/     # Migration Initial vazia — schema gerenciado pelo 01-schema.sql

MedicalRecordService.API/
├── Controllers/    # ProntuariosController
├── Middlewares/    # HmacValidationMiddleware, ExceptionHandlingMiddleware
├── Requests/       # Request DTOs de entrada
└── Program.cs
```
