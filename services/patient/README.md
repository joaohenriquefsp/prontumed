# Patient Service

Microsserviço de gestão de pacientes do ProntuMed. Centraliza o cadastro de dados pessoais dos pacientes. Todos os outros serviços referenciam pacientes pelo `idPaciente` — nunca acessam este banco diretamente.

**Porta:** `5002`  
**Banco:** `db_patients` (PostgreSQL, porta 5433)  
**Runtime:** .NET 10 + ASP.NET Core

---

## Autenticação

Todas as rotas (exceto `/health`) exigem:
1. **HMAC** — headers `X-HMAC-Signature` e `X-HMAC-Timestamp` assinados pelo BFF
2. **JWT** — claims do usuário autenticado extraídas do token para aplicar RBAC

Perfis com acesso: `Doctor`, `Receptionist`, `Admin` (pacientes não acessam este serviço diretamente no MVP).

---

## Endpoints

### `POST /pacientes` — `[Receptionist, Admin]`
Cadastra um novo paciente.

**Request body:**
```json
{
  "primeiroNome": "Maria",
  "sobrenome": "Silva",
  "cpf": "12345678909",
  "dataNascimento": "1990-05-15",
  "sexo": "Feminino",
  "telefone": "31999990000",
  "email": "maria@email.com",
  "logradouro": "Rua das Flores, 123",
  "cidade": "Belo Horizonte",
  "uf": "MG",
  "cep": "30140110"
}
```

**Response `201 Created`:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```
Header `Location: /pacientes/{id}`

**Validações no domínio:**
- CPF: dígito verificador válido + não cadastrado anteriormente
- Data de nascimento: não pode ser futura

**Erros:**
- `400` — CPF inválido, campos obrigatórios ausentes
- `409` — CPF já cadastrado

Publica `PacienteCadastradoEvent` na tabela `eventos_saida` → Kafka `prontumed.Patient`.

---

### `GET /pacientes` — `[Receptionist, Admin, Doctor]`
Lista pacientes com paginação e filtro.

**Query params:**
| Param | Tipo | Padrão | Descrição |
|---|---|---|---|
| `pagina` | int | `1` | Número da página |
| `tamanhoPagina` | int | `20` | Itens por página |
| `nome` | string | — | Filtro parcial por nome |
| `cpf` | string | — | Filtro exato por CPF |

**Response `200 OK`:**
```json
[
  {
    "id": "...",
    "primeiroNome": "Maria",
    "sobrenome": "Silva",
    "cpf": "12345678909",
    "dataNascimento": "1990-05-15",
    "telefone": "31999990000",
    "ativo": true
  }
]
```

---

### `GET /pacientes/{id}` — `[Receptionist, Admin, Doctor]`
Retorna dados completos de um paciente pelo ID.

**Response `200 OK`:**
```json
{
  "id": "...",
  "primeiroNome": "Maria",
  "sobrenome": "Silva",
  "cpf": "12345678909",
  "dataNascimento": "1990-05-15",
  "sexo": "Feminino",
  "telefone": "31999990000",
  "email": "maria@email.com",
  "logradouro": "Rua das Flores, 123",
  "cidade": "Belo Horizonte",
  "uf": "MG",
  "cep": "30140110",
  "ativo": true
}
```

**Erros:**
- `404` — paciente não encontrado

---

### `GET /pacientes/cpf/{cpf}` — `[Receptionist, Admin, Doctor]`
Busca paciente pelo CPF (apenas dígitos, sem pontuação).

**Response `200 OK`:** mesmo formato de `/pacientes/{id}`

**Erros:**
- `404` — nenhum paciente com este CPF

---

### `PUT /pacientes/{id}` — `[Receptionist, Admin]`
Atualiza os dados de um paciente. Substituição completa dos campos editáveis.

**Request body:** mesmo formato do `POST`, exceto `cpf` (CPF não pode ser alterado após cadastro).

**Response `204 No Content`**

Publica `PacienteAtualizadoEvent` na tabela `eventos_saida`.

**Erros:**
- `404` — paciente não encontrado

---

### `PATCH /pacientes/{id}/desativar` — `[Admin]`
Desativa um paciente (soft delete — o registro permanece no banco, conforme LGPD).

**Response `204 No Content`**

Publica `PacienteDesativadoEvent` na tabela `eventos_saida`.

**Erros:**
- `404` — paciente não encontrado

---

### `GET /health`
Health check público. Isento de HMAC e autenticação.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "service": "patient"
}
```

---

## Documentação interativa

Com o serviço rodando: `http://localhost:5002/scalar/v1`

---

## Como rodar localmente

**Pré-requisito:** container `postgres-patients` rodando (via `docker compose up -d`).

```bash
cd services/patient/PatientService.API
dotnet run
```

---

## Variáveis de configuração

Definidas em `appsettings.Development.json` (não versionado):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=db_patients;Username=clinicos;Password=prontumed_secret"
  },
  "Hmac": {
    "Chave": "chave-hmac-compartilhada-com-o-bff"
  }
}
```

---

## Estrutura interna

```
PatientService.Domain/
├── Entities/        # Paciente (Aggregate Root)
├── Events/          # PacienteCadastradoEvent, PacienteAtualizadoEvent, PacienteDesativadoEvent
├── Repositories/    # IPacienteRepository
├── Services/        # ValidadorCpf (dígito verificador)
└── Exceptions/      # PacienteNaoEncontradoException, CpfJaCadastradoException, CpfInvalidoException

PatientService.Application/
├── Commands/        # CadastrarPaciente, AtualizarPaciente, DesativarPaciente
├── Queries/         # ObterPacientePorId, ObterPacientePorCpf, ListarPacientes
├── Behaviors/       # ValidationBehavior
├── DTOs/            # PacienteDto, PacienteResumoDto
└── Interfaces/      # IOutboxPublisher

PatientService.Infrastructure/
├── Persistence/     # AppDbContext, Configurations, Repositories
├── Outbox/          # OutboxPublisher
└── Migrations/

PatientService.API/
├── Controllers/     # PacientesController
├── Middlewares/     # HmacValidationMiddleware, ExceptionHandlingMiddleware
├── Requests/        # CadastrarPacienteRequest, AtualizarPacienteRequest
└── Program.cs
```

---

## Tabelas do banco

| Tabela | Descrição |
|---|---|
| `pacientes` | Dados pessoais e endereço dos pacientes |
| `eventos_saida` | Fila de eventos para o Kafka via Debezium (Outbox Pattern) |

---

## Eventos publicados

| Evento | Quando | Tópico Kafka |
|---|---|---|
| `PacienteCadastrado` | Novo paciente registrado | `prontumed.Patient` |
| `PacienteAtualizado` | Dados do paciente alterados | `prontumed.Patient` |
| `PacienteDesativado` | Paciente inativado | `prontumed.Patient` |
