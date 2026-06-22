# Appointment Service

Microsserviço responsável pelo agendamento de consultas, controle de agenda médica e máquina de estados do ciclo de vida de cada consulta.

**Porta:** `5003`  
**Banco:** `db_appointments` (PostgreSQL, porta `5434`)  
**Autenticação:** Cookie HttpOnly `access_token` (JWT emitido pelo Identity Service)  
**Autenticação interna:** HMAC-SHA256 (`X-HMAC-Signature` + `X-HMAC-Timestamp`)

---

## Como rodar localmente

```bash
# 1. Subir a infraestrutura (na raiz do monorepo)
docker compose up -d

# 2. Aplicar migrations (primeira vez)
cd services/appointment
dotnet ef database update --project AppointmentService.Infrastructure --startup-project AppointmentService.API

# 3. Rodar o serviço
cd AppointmentService.API
dotnet run
```

Acesse a documentação interativa: `http://localhost:5003/scalar/v1`

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

### Consultas

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `POST` | `/consultas` | Receptionist, Admin | Agendar consulta |
| `GET` | `/consultas` | Receptionist, Admin, Doctor | Listar com filtros |
| `GET` | `/consultas/{id}` | Receptionist, Admin, Doctor | Obter por ID |
| `PATCH` | `/consultas/{id}/confirmar` | Receptionist, Admin | Confirmar agendamento |
| `PATCH` | `/consultas/{id}/cancelar` | Receptionist, Admin | Cancelar consulta |
| `PATCH` | `/consultas/{id}/concluir` | Doctor | Concluir consulta |
| `PATCH` | `/consultas/{id}/no-show` | Doctor, Admin | Registrar ausência |

### Grade de Horários

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `POST` | `/grade-horarios` | Admin | Criar slot semanal |
| `GET` | `/grade-horarios?idMedico=` | Receptionist, Admin, Doctor | Listar por médico |
| `DELETE` | `/grade-horarios/{id}` | Admin | Remover slot |

### Disponibilidade

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `GET` | `/disponibilidade?idMedico=&data=` | Receptionist, Admin | Slots disponíveis numa data |

### Horários Bloqueados

| Método | Rota | Roles | Descrição |
|---|---|---|---|
| `POST` | `/horarios-bloqueados` | Admin | Bloquear período |
| `DELETE` | `/horarios-bloqueados/{id}` | Admin | Desbloquear período |

### Sistema

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Health check (sem autenticação) |

---

## Máquina de estados — Consulta

```
              Agendar
                 ↓
           [Scheduled] ──── Cancelar ────→ [Cancelled]
                 ↓
            Confirmar
                 ↓
           [Confirmed] ──── Cancelar ────→ [Cancelled]
                 ↓
         Concluir │ NoShow
          ↙           ↘
    [Completed]     [NoShow]
```

O estado da máquina é persistido em `estado_saga` com correlação pelo `id` da consulta.

---

## Eventos publicados (Outbox → Debezium → Kafka)

Tópico: `prontumed.Consulta` (nome real = classe do Aggregate Root `Consulta`, não o nome do serviço)

| Evento | Disparado quando |
|---|---|
| `ConsultaAgendadaEvent` | Consulta criada com sucesso |
| `ConsultaConfirmadaEvent` | Status alterado para Confirmed |
| `ConsultaCanceladaEvent` | Status alterado para Cancelled |
| `ConsultaConcluidaEvent` | Status alterado para Completed |
| `ConsultaNoShowEvent` | Paciente não compareceu |

---

## Estrutura

```
AppointmentService.Domain/
├── Entities/       # Consulta (AggregateRoot), GradeHorario, HorarioBloqueado, EstadoSaga
├── Events/         # Domain Events publicados via Outbox
├── Exceptions/     # Exceções de domínio tipadas
└── Repositories/   # Interfaces (sem implementação)

AppointmentService.Application/
├── Commands/       # AgendarConsulta, ConfirmarConsulta, CancelarConsulta, ConcluirConsulta,
│                   # RegistrarNoShow, CriarGradeHorario, RemoverGradeHorario,
│                   # BloquearHorario, DesbloquearHorario
├── Queries/        # ListarConsultas, ObterConsultaPorId, ObterDisponibilidade, ListarGradeHorarios
├── DTOs/           # Tipos de resposta
├── Behaviors/      # ValidationBehavior (FluentValidation no pipeline MediatR)
└── Interfaces/     # IOutboxPublisher

AppointmentService.Infrastructure/
├── Persistence/    # AppDbContext, Configurations, Repositories
├── Outbox/         # EventoSaida, OutboxPublisher
└── Migrations/     # Migrations EF Core

AppointmentService.API/
├── Controllers/    # ConsultasController, GradeHorariosController,
│                   # DisponibilidadeController, HorariosBloqueadosController
├── Middlewares/    # HmacValidationMiddleware, ExceptionHandlingMiddleware
├── Requests/       # Request DTOs de entrada
└── Program.cs
```
