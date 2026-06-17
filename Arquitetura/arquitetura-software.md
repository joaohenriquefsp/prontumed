# Arquitetura de Software — ProntuMed

> Documento de referência arquitetural. Use como contexto para desenvolvimento com Claude Code.

---

## Visão Geral

Sistema de gestão clínica baseado em microsserviços, projetado para clínicas médicas gerais com capacidade de escala para hospitais. Arquitetura orientada a eventos com comunicação assíncrona via Kafka e comunicação síncrona via BFF NestJS.

**Tipo:** Single-tenant (MVP) → Multi-tenant via schema isolation (v2)  
**Domínio:** Clínica médica geral (clínico geral + especialistas)  
**MVP:** Agendamento + Prontuário eletrônico + Notificações

---

## Frontends — 2 clientes

### Portal Web
- **Tecnologia:** Next.js 14 (App Router)
- **Perfis atendidos:** Médico, Recepcionista, Admin, Paciente
- **Separação:** Por role — cada perfil tem layout, rotas e permissões próprias via RBAC
- **Responsabilidades:**
  - Médico: agenda do dia, prontuário, histórico de pacientes
  - Recepcionista: agendamentos, cadastro de pacientes, agenda geral
  - Admin: gestão de usuários, configurações da clínica
  - Paciente: consultas agendadas, histórico básico, notificações

### App Mobile
- **Tecnologia:** React Native + Expo
- **Perfis atendidos:** Médico + Paciente
- **Separação:** Por role — navegação e telas distintas por perfil
- **Responsabilidades:**
  - Médico: agenda do dia, acesso ao prontuário, push de novos agendamentos
  - Paciente: acompanhamento de consultas, push de confirmações e lembretes

> Ambos os clientes consomem exclusivamente o BFF NestJS. Nenhum frontend fala diretamente com microsserviços .NET.

---

## Camada de Entrada — BFF NestJS

**Um único BFF para todos os clientes** — não um BFF por microsserviço. O BFF é organizado por *cliente* (Portal Web e App Mobile), não por domínio de backend.

```
Portal Web  ─┐
             ├──▶  BFF NestJS (porta 3000)  ──▶  Identity Service
App Mobile  ─┘                              ──▶  Patient Service
                                            ──▶  Appointment Service
                                            ──▶  Medical Record Service
                                            ──▶  Notification Service
```

Responsabilidades do BFF:
- Validação de tokens JWT (OAuth2)
- Autorização RBAC por rota
- Roteamento para microsserviços internos
- Composição de respostas (agregação de dados de múltiplos serviços)
- Assinatura HMAC em todas as chamadas para serviços internos
- Validação de formato dos dados de entrada (antes de enviar ao microsserviço)
- Rate limiting por cliente

**Porta:** `3000`  
**Tecnologia:** NestJS + Passport.js + HMAC request signing

---

## Estratégia de Validação

A validação ocorre em **duas camadas** por motivos distintos — é redundante de propósito:

| Camada | O que valida | Por quê |
|---|---|---|
| **BFF** | Formato, campos obrigatórios, tamanho, regex | Feedback rápido ao usuário; evita chamada desnecessária ao serviço |
| **Microsserviço** | Regras de negócio (unicidade, dígito verificador, invariantes de domínio) | O serviço não confia em nenhum caller — nem no BFF |

**Exemplo — cadastro de paciente:**
- BFF valida: CPF tem 11 dígitos, nome não está vazio, data de nascimento é uma data válida
- Patient Service valida: CPF não está cadastrado, dígito verificador do CPF é válido

> O microsserviço pode ser chamado diretamente (bypass do BFF), por outro serviço interno, ou por um cliente futuro. A regra de negócio deve sempre ser protegida na camada de domínio.

---

## Bounded Contexts — 5 Microsserviços .NET

Cada microsserviço é um projeto .NET Core independente com banco de dados próprio (Database per Service pattern), seguindo DDD + Clean Architecture internamente.

### 1. Identity Service
**Porta:** `5001`  
**Banco:** `db_identity`  
**Responsabilidade:** Autenticação, gestão de usuários, roles e permissões. Emite e valida JWTs.

**Eventos publicados:**
- `UserCreated`
- `UserRoleChanged`
- `PasswordReset`

---

### 2. Patient Service
**Porta:** `5002`  
**Banco:** `db_patients`  
**Responsabilidade:** Cadastro e gestão de pacientes. Outros serviços referenciam pacientes pelo `idPaciente` — nunca acessam este banco diretamente.

**Endpoints:**
- `POST /pacientes` — cadastrar [Receptionist, Admin]
- `GET /pacientes` — listar com paginação e filtro [Receptionist, Admin, Doctor]
- `GET /pacientes/{id}` — obter por ID [Receptionist, Admin, Doctor]
- `GET /pacientes/cpf/{cpf}` — buscar por CPF [Receptionist, Admin, Doctor]
- `PUT /pacientes/{id}` — atualizar dados [Receptionist, Admin]
- `PATCH /pacientes/{id}/desativar` — soft delete (LGPD) [Admin]
- `GET /health`

**Aggregate Root — `Paciente`:**
- Campos: `primeiroNome`, `sobrenome`, `cpf`, `dataNascimento`, `telefone`, `email`, `logradouro`, `cidade`, `uf`, `cep`, `ativo`
- CPF: dígito verificador validado no domínio + unicidade garantida pelo banco
- Endereço: campos separados (não JSONB) para facilitar busca e filtragem
- Soft delete: campo `ativo` — registros inativados são mantidos (exigência LGPD)

**Eventos publicados:**
- `PacienteCadastrado`
- `PacienteAtualizado`
- `PacienteDesativado`

---

### 3. Appointment Service
**Porta:** `5003`  
**Banco:** `db_appointments`  
**Responsabilidade:** Agendamento, cancelamento, controle de agenda médica. Saga Pattern como máquina de estados interna — verificação de disponibilidade, reserva de slot e criação da consulta são atômicas dentro do mesmo serviço. A notificação é assíncrona via Outbox + Kafka.

**Eventos publicados:**
- `AppointmentScheduled`
- `AppointmentCancelled`
- `AppointmentCompleted`
- `SlotBlocked`

---

### 4. Medical Record Service
**Porta:** `5004`  
**Banco:** `db_medical_records`  
**Responsabilidade:** Prontuário eletrônico. Somente médico escreve e visualiza. Histórico imutável via Event Sourcing.

**Eventos publicados:**
- `RecordCreated`
- `ConsultationNoteAdded`
- `RecordAccessed` *(auditoria LGPD)*

---

### 5. Notification Service
**Porta:** worker (sem API REST)  
**Banco:** `db_notifications` *(apenas log de entregas)*  
**Responsabilidade:** Worker puro. Consome eventos Kafka e dispara notificações via Email e Push.

**Eventos consumidos:**
- `AppointmentScheduled` → email + push de confirmação para paciente e médico
- `AppointmentCancelled` → email + push de cancelamento
- `AppointmentCompleted` → push solicitando feedback ao paciente

---

## Estrutura Interna — DDD + Clean Architecture

Todos os microsserviços seguem a mesma estrutura de camadas. A regra de dependência aponta sempre para dentro: `API → Application → Domain`. Infrastructure implementa interfaces definidas no Domain.

**Regras de ouro:**
- Uma classe por arquivo. Interfaces nunca no mesmo arquivo da implementação.
- **Todo serviço novo deve ter um `README.md` na raiz da sua pasta** (`services/nome-servico/README.md`) documentando: porta, banco, endpoints (método + rota + autenticação + request/response), variáveis de configuração e como rodar localmente. Ver `services/identity/README.md` como referência.

```
services/
└── nome-servico/
    ├── README.md                  ← obrigatório
    ├── NomeServico.Domain/
    ├── NomeServico.Application/
    ├── NomeServico.Infrastructure/
    └── NomeServico.API/
```

---

### Padrões aplicados por camada

| Camada | Padrões |
|---|---|
| Domain | Aggregate Root, Value Objects, Domain Events, Repository Interface |
| Application | CQRS, MediatR, FluentValidation, Use Cases |
| Infrastructure | EF Core, Outbox Pattern, Kafka Publisher, Debezium CDC |
| API | Controllers, HMAC Middleware, Health Checks |

---

### Estrutura de pastas detalhada (template — válido para todos os serviços)

O exemplo abaixo usa o Identity Service. Os demais serviços seguem o mesmo padrão, adaptando os nomes das entidades e casos de uso.

```
IdentityService.Domain/
├── Entities/
│   ├── Usuario.cs                         # Aggregate Root
│   └── TokenRenovacao.cs                  # Entidade filha
├── Events/
│   ├── UsuarioCriadoEvent.cs              # Domain Event
│   └── PerfilAlteradoEvent.cs
├── Repositories/
│   ├── IUsuarioRepository.cs              # Interface — NUNCA a implementação
│   └── ITokenRenovacaoRepository.cs
└── Exceptions/
    └── UsuarioNaoEncontradoException.cs

IdentityService.Application/
├── Commands/                              # Operações que ALTERAM estado
│   ├── CriarUsuario/
│   │   ├── CriarUsuarioCommand.cs         # O "pedido" (record com os dados)
│   │   ├── CriarUsuarioCommandHandler.cs  # A lógica — implementa IRequestHandler
│   │   └── CriarUsuarioCommandValidator.cs # FluentValidation
│   ├── Login/
│   │   ├── LoginCommand.cs
│   │   ├── LoginCommandHandler.cs
│   │   └── LoginCommandValidator.cs
│   └── RenovarToken/
│       ├── RenovarTokenCommand.cs
│       └── RenovarTokenCommandHandler.cs
├── Queries/                               # Operações que LEEM estado (sem efeito colateral)
│   ├── ObterUsuarioPorId/
│   │   ├── ObterUsuarioPorIdQuery.cs      # O "pedido" de leitura
│   │   └── ObterUsuarioPorIdQueryHandler.cs
│   └── ListarUsuarios/
│       ├── ListarUsuariosQuery.cs
│       └── ListarUsuariosQueryHandler.cs
├── Behaviors/
│   └── ValidationBehavior.cs              # Executa FluentValidation no pipeline MediatR
├── DTOs/
│   └── TokenDto.cs                        # Tipos compartilhados entre Commands/Queries
└── Interfaces/
    ├── IJwtService.cs                     # Interface de serviço externo (domínio não depende de JWT)
    ├── IHashService.cs
    └── IOutboxPublisher.cs

IdentityService.Infrastructure/
├── Persistence/
│   ├── AppDbContext.cs
│   ├── Configurations/                    # Mapeamento EF Core (um arquivo por entidade)
│   │   ├── UsuarioConfiguration.cs
│   │   ├── TokenRenovacaoConfiguration.cs
│   │   └── EventoSaidaConfiguration.cs
│   └── Repositories/                      # Implementações concretas das interfaces do Domain
│       ├── UsuarioRepository.cs           # Implementa IUsuarioRepository
│       └── TokenRenovacaoRepository.cs
├── Services/
│   ├── JwtService.cs                      # Implementa IJwtService
│   └── BcryptHashService.cs               # Implementa IHashService
├── Outbox/
│   ├── EventoSaida.cs                     # POCO da tabela eventos_saida
│   └── OutboxPublisher.cs
└── Migrations/

IdentityService.API/
├── Controllers/
│   ├── AuthController.cs
│   └── UsuariosController.cs
├── Middlewares/
│   ├── HmacValidationMiddleware.cs
│   └── ExceptionHandlingMiddleware.cs
├── Requests/
│   ├── AlterarSenhaRequest.cs
│   └── AlterarPerfilRequest.cs
└── Program.cs
```

---

### CQRS — Command vs Query

**Command** (escrita): altera estado, publica eventos, retorna apenas confirmação ou ID.
```
POST /usuarios → CriarUsuarioCommand → Handler → salva no banco + insere em eventos_saida
```

**Query** (leitura): nunca altera estado. Pode projetar diretamente do banco sem passar pelas entidades de domínio — isso é intencional para leituras otimizadas.
```
GET /usuarios/{id} → ObterUsuarioPorIdQuery → Handler → projeta DTO direto via EF
```

**Queries com múltiplas tabelas (joins):** o QueryHandler acessa o `AppDbContext` diretamente e usa `Select()` para projetar apenas os campos necessários no DTO de resposta. Não instancia entidades de domínio — só lê dados.

```csharp
// Exemplo de QueryHandler com projeção direta (sem carregar entidade completa)
var resultado = await _context.Usuarios
    .Where(u => u.Id == query.Id)
    .Select(u => new UsuarioDetalheResponse(
        u.Id, u.Email, u.PrimeiroNome, u.Sobrenome, u.Perfil))
    .FirstOrDefaultAsync();
```

Essa separação permite que queries evoluam independentemente das regras de negócio do Domain.

---

### Regras de dependência entre camadas

```
API          →  Application  →  Domain
Infrastructure               →  Domain
Infrastructure  →  Application (registra implementações via DI)
```

- **Domain** não depende de nada (zero NuGet de infra)
- **Application** depende apenas do Domain (usa interfaces, nunca implementações)
- **Infrastructure** implementa as interfaces do Domain e da Application
- **API** configura o DI container e roteia para os Handlers via MediatR

---

## Comunicação entre Serviços

### Síncrona — REST
- Fluxo: `Frontend → BFF → Serviço`
- Usado para leitura de dados e comandos que precisam de resposta imediata
- BFF assina cada request com HMAC antes de rotear para serviços internos
- Serviços rejeitam qualquer chamada sem assinatura HMAC válida (Zero Trust interno)

### Assíncrona — Kafka (Event-Driven)
- Eventos de domínio entre serviços
- Outbox Pattern garante entrega mesmo com Kafka indisponível
- Debezium monitora WAL do PostgreSQL e publica na tabela `eventos_saida` → tópico Kafka
- Notification Service é consumidor puro — nunca produz eventos de domínio

### Outbox + Debezium — fluxo detalhado

```
1. Serviço salva entidade + evento em eventos_saida (mesma transação SQL)
2. Debezium lê WAL do PostgreSQL (Change Data Capture)
3. Debezium publica evento no tópico Kafka correspondente
4. Consumer (ex: Notification Service) consome e processa
5. Outbox marca evento como publicado
```

> Garante at-least-once delivery sem two-phase commit e sem acoplamento ao broker.

---

## Segurança

| Mecanismo | Onde | Descrição |
|---|---|---|
| OAuth2 + PKCE | BFF + Identity Service | Autenticação de usuários. PKCE obrigatório para app mobile |
| JWT (short-lived) | BFF | Tokens de curta duração (15min) + refresh token (7 dias) |
| RBAC | BFF (guards) | 4 roles: `Patient`, `Doctor`, `Receptionist`, `Admin` |
| HMAC | BFF → Serviços internos | Assina cada request interno. Serviços rejeitam sem assinatura |
| LGPD | Medical Record + Patient | Dados sensíveis criptografados at rest, soft delete com anonimização, log de acesso |

---

## Bancos de Dados

| Serviço | Banco | Porta | Observação |
|---|---|---|---|
| Identity | `db_identity` | 5432 | `usuarios`, `tokens_renovacao`, `eventos_saida` |
| Patient | `db_patients` | 5433 | `pacientes`, `eventos_saida` |
| Appointment | `db_appointments` | 5434 | `grade_horarios`, `horarios_bloqueados`, `consultas`, `estado_saga`, `eventos_saida` |
| Medical Record | `db_medical_records` | 5435 | `repositorio_eventos`, `log_acesso_prontuario`, `eventos_saida` |
| Notification | `db_notifications` | 5436 | `logs_envio`, `modelos_notificacao` |

> Nenhum serviço acessa o banco de outro serviço diretamente. Comunicação sempre via evento ou API.

---

## Infraestrutura — Docker Compose

```
# Bancos
postgres-identity       :5432
postgres-patients       :5433
postgres-appointments   :5434
postgres-medical        :5435
postgres-notifications  :5436

# Mensageria
zookeeper               (interno)
kafka                   :9092
kafka-ui                :8080  ← visualizar tópicos em dev
debezium-connect        :8083

# Serviços
identity-service        :5001
patient-service         :5002
appointment-service     :5003
medical-record-service  :5004
notification-service    (worker)
gateway                 :3000  ← entry point único
```

---

## Fluxo Principal — Agendamento de Consulta

```
1. Recepcionista abre agenda
   → Portal Web → BFF → Professional/Appointment Service (GET disponibilidade)

2. Recepcionista confirma agendamento
   → Portal Web → BFF → Appointment Service (POST)
   → Salva appointment + outbox_events (mesma transação)

3. Debezium captura
   → Lê WAL de db_appointments
   → Publica AppointmentScheduled no Kafka

4. Notification Service consome
   → Dispara email + push para paciente
   → Dispara push para médico

5. Portal Web e App recebem push em tempo real
```

---

## Decisões Arquiteturais (ADRs)

### ADR-001 — Microsserviços ao invés de monolito modular
**Decisão:** Microsserviços independentes por Bounded Context  
**Motivo:** Escalabilidade independente por domínio. Em escala hospitalar, prontuário pode ter requisitos de compliance que exigem deploy isolado. Appointment e Notification têm picos de uso distintos.

### ADR-002 — Event Sourcing apenas no Medical Record
**Decisão:** Event Sourcing restrito ao prontuário  
**Motivo:** CFM e LGPD exigem rastreabilidade total e imutabilidade do histórico clínico. Nos demais serviços o custo de complexidade não justifica o benefício.

### ADR-003 — Outbox + Debezium ao invés de publicação direta no Kafka
**Decisão:** Outbox Pattern com CDC via Debezium  
**Motivo:** Publicação direta no Kafka após save no banco cria janela de falha. O Outbox salva na mesma transação. Debezium entrega quando Kafka estiver disponível. Zero perda de eventos.

### ADR-004 — BFF NestJS ao invés de API Gateway genérico
**Decisão:** Backend For Frontend dedicado  
**Motivo:** Cada cliente (web, mobile) tem necessidades distintas de composição de dados. O BFF agrega respostas específicas por cliente, evitando over-fetching no frontend.

### ADR-005 — Single-tenant no MVP
**Decisão:** Single-tenant com estrutura preparada para multi-tenant  
**Motivo:** Multi-tenant via tenant_id aumenta risco de vazamento de dados e complexidade de queries. A migração para multi-tenant via schema isolation é possível sem reescrita dos serviços.

### ADR-006 — Saga Pattern como máquina de estados interna (não cross-service)
**Decisão:** O Saga do Appointment Service é uma máquina de estados persistida dentro do próprio serviço, não uma coordenação distribuída entre múltiplos microsserviços.  
**Motivo:** Verificação de disponibilidade, reserva de slot e criação da consulta pertencem ao mesmo Bounded Context e são operações atômicas dentro de uma única transação SQL — não há justificativa para distribuir essa transação entre serviços distintos. A comunicação com o Notification Service (único serviço externo envolvido) é assíncrona e coberta pelo Outbox + Debezium, que já garante entrega confiável. Um Saga orquestrado cross-service adicionaria coordenação remota, endpoints de compensação e controle de idempotência sem benefício para o domínio clínico do MVP.  
**Consequência:** A tabela `estado_saga` rastreia transições (`AgendadoPendente → Confirmado → Concluído / Cancelado`) com compensação local (liberar slot) em caso de falha. O comportamento é correto e rastreável sem two-phase commit.

---

## Escalabilidade para Hospital

A arquitetura atual suporta evolução para hospital adicionando novos Bounded Contexts sem alterar os existentes:

- `Billing Service` — faturamento e convênios
- `Pharmacy Service` — estoque e dispensação
- `Lab Service` — exames e resultados
- `Bed Management Service` — internações
- `Multi-tenant` — múltiplas unidades via schema isolation

