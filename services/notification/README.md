# Notification Service

Worker .NET 10 do ProntuMed. Não expõe API REST — consome eventos Kafka do Appointment Service e dispara notificações por e-mail e push para o paciente.

**Tipo:** Worker (sem porta HTTP)
**Banco:** `db_notifications` (PostgreSQL, porta 5436)
**Runtime:** .NET 10

---

## Como funciona

```
Appointment Service publica ConsultaAgendadaEvent/ConsultaCanceladaEvent/ConsultaConcluidaEvent
  → Outbox (eventos_saida) → Debezium (CDC) → Kafka (tópico prontumed.Consulta)
    → Notification Service consome
      → busca paciente (Patient Service) e médico (Identity Service) via HTTP + HMAC
      → renderiza o modelo de mensagem (tabela modelos_notificacao)
      → envia e-mail (SMTP) e/ou push (stub/log)
      → registra o resultado em logs_envio (idempotente)
```

Não tem tabela `eventos_saida` — este serviço nunca publica eventos de domínio, só consome.

---

## Eventos consumidos

Tópico Kafka: `prontumed.Consulta` (o nome real do tópico é a classe do Aggregate Root do Appointment Service, `Consulta`, não o nome do serviço). O worker filtra pelo header `eventType` de cada mensagem.

| Evento | Canal | Disparado quando |
|---|---|---|
| `ConsultaAgendadaEvent` | Email + Push | Consulta agendada |
| `ConsultaCanceladaEvent` | Email + Push | Consulta cancelada |
| `ConsultaConcluidaEvent` | Push | Consulta concluída (pede feedback) |

> Apenas o paciente é notificado nesta versão — é o que os modelos seedados cobrem hoje. Notificar o médico depende do App Mobile existir (sem ele, não há onde registrar push token de médico).

---

## Autenticação nas chamadas de saída

Este serviço não recebe requisições HTTP, mas faz chamadas de saída para Patient Service e Identity Service para buscar nome/e-mail do paciente e do médico (os eventos do Appointment só carregam IDs). Cada chamada é assinada com **HMAC-SHA256**:
- `X-HMAC-Signature` — `HMAC-SHA256(Method + Path + QueryString + Timestamp, chave_secreta)` em hex minúsculo
- `X-HMAC-Timestamp` — Unix timestamp em segundos

Chama rotas dedicadas a uso interno, sem JWT (o worker não age em nome de nenhum usuário logado):
- `GET /pacientes/{id}/interno` (Patient Service)
- `GET /usuarios/{id}/interno` (Identity Service)

Retry automático (Polly, backoff exponencial, 3 tentativas) em falhas transitórias ou `5xx`.

---

## Idempotência

Kafka garante entrega *at-least-once* — o mesmo evento pode chegar mais de uma vez. `logs_envio` tem `UNIQUE(id_evento, tipo_evento, canal)`. O worker verifica antes de processar; o índice é a garantia final contra duplicidade.

> `id_evento` é, na prática, o `id_agregado` do evento de origem (= `IdConsulta`) — é a chave que o Debezium usa na mensagem Kafka, e se repete entre `ConsultaAgendadaEvent`/`ConsultaCanceladaEvent`/`ConsultaConcluidaEvent` da mesma consulta. Por isso `tipo_evento` entra na chave de idempotência.

O consumer só comita o offset Kafka depois de processar com sucesso — uma falha (ex: Patient Service fora do ar) atrasa a notificação em vez de perdê-la.

---

## Envio de notificações

**E-mail:** real via SMTP (MailKit). Em dev, aponta para o container `smtp4dev` (ver `docker-compose.yml`) — captura os e-mails sem entregá-los de fato. UI de inspeção: `http://localhost:5080`.

**Push:** stub — registra a intenção via log e `logs_envio` (`status=Sent`), sem integração real. Trocar por Firebase/Expo Push quando o App Mobile existir.

---

## Como rodar localmente

**Pré-requisitos:** `postgres-notifications`, `kafka` e `smtp4dev` rodando (via `docker compose up -d`), e os conectores Debezium registrados (`bash infra/debezium/register-connectors.sh`).

```bash
cd services/notification/NotificationService.Worker
DOTNET_ENVIRONMENT=Development dotnet run
```

`DOTNET_ENVIRONMENT=Development` é necessário porque `Host.CreateApplicationBuilder` (usado por workers, diferente de `WebApplication.CreateBuilder`) lê essa variável — não `ASPNETCORE_ENVIRONMENT` — para decidir carregar `appsettings.Development.json`.

---

## Variáveis de configuração

Definidas em `appsettings.Development.json` (não versionado):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5436;Database=db_notifications;Username=clinicos;Password=prontumed_secret"
  },
  "Hmac": {
    "Chave": "chave-hmac-compartilhada-com-o-bff"
  },
  "ServicosInternos": {
    "PatientServiceUrl": "http://localhost:5002",
    "IdentityServiceUrl": "http://localhost:5001"
  },
  "Kafka": {
    "BootstrapServers": "localhost:9092"
  },
  "Smtp": {
    "Host": "localhost",
    "Port": 2525
  }
}
```

`Kafka:GroupId` (`notification-service`) e `Kafka:TopicoConsultas` (`prontumed.Consulta`) já têm valores padrão em `appsettings.json`, só precisam ser sobrescritos em cenários não padrão.

---

## Estrutura interna

```
NotificationService.Domain/
├── Entities/         # LogEnvio, ModeloNotificacao, e constantes TipoEvento/Canal/StatusEnvio
└── Repositories/      # ILogEnvioRepository, IModeloNotificacaoRepository

NotificationService.Application/
├── Commands/          # ProcessarConsultaAgendada/Cancelada/Concluida (MediatR)
├── DTOs/              # PacienteDto, MedicoDto (subconjunto dos DTOs reais, só o necessário)
├── Interfaces/        # IPacienteServiceClient, IMedicoServiceClient, IEmailSender, IPushSender, INotificacaoService
└── Services/          # NotificacaoService — orquestra busca de dados, template, envio e idempotência

NotificationService.Infrastructure/
├── Persistence/        # AppDbContext, Configurations, Repositories
├── Http/               # HmacSigningHandler, RetryPolicyHandler, PacienteServiceClient, MedicoServiceClient
├── Email/              # SmtpEmailSender (MailKit)
├── Push/               # PushSenderStub
├── Kafka/              # ConsultaEventConsumerWorker (BackgroundService), Payloads (contratos do evento Kafka)
└── Migrations/

NotificationService.Worker/
├── Program.cs          # Host.CreateApplicationBuilder — sem Controllers/Kestrel
└── appsettings*.json
```

---

## Tabelas do banco

| Tabela | Descrição |
|---|---|
| `logs_envio` | Histórico de cada tentativa de notificação (sucesso/falha), com chave de idempotência |
| `modelos_notificacao` | Textos das notificações por tipo de evento + canal, com variáveis `{{nome_paciente}}`, `{{nome_medico}}`, `{{data_hora}}`, `{{motivo}}` |

Não tem `eventos_saida` — este serviço não publica eventos.
