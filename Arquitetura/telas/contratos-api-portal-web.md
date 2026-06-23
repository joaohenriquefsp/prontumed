# Contratos de API — Portal Web
> Extraído em 2026-06-23. Referência para implementação das telas: consultas, usuários, grade-horários e prontuários.

---

## Módulos BFF-Web (`services/bff-web/src/modules/`)

Módulos existentes: `appointments`, `auth`, `health`, `medical-record`, `patients`, `users`

> **Atenção:** não existe módulo `consultas`, `grade-horarios` nem `prontuarios` isolados.
> - Consultas e grade de horários estão em `appointments`
> - Prontuário está em `medical-record`

---

## 1. Módulo `appointments` — consultas + grade-horários

| Método | Rota | Query params | Body | Roles |
|---|---|---|---|---|
| GET | `/consultas` | (repassa string) | — | Doctor, Receptionist, Admin |
| GET | `/consultas/:id` | — | — | Doctor, Receptionist, Admin |
| POST | `/consultas` | — | `AgendarConsultaDto` | Receptionist, Admin |
| PATCH | `/consultas/:id/confirmar` | — | — | Receptionist, Admin |
| PATCH | `/consultas/:id/cancelar` | — | `CancelarConsultaDto` | Receptionist, Admin |
| PATCH | `/consultas/:id/concluir` | — | — | Doctor |
| PATCH | `/consultas/:id/no-show` | — | — | Doctor, Admin |
| GET | `/disponibilidade` | `idMedico`, `data` | — | Doctor, Receptionist, Admin |
| GET | `/grade-horarios` | `idMedico` | — | Doctor, Receptionist, Admin |
| POST | `/grade-horarios` | — | `CriarGradeHorarioDto` | Admin |
| DELETE | `/grade-horarios/:id` | — | — | Admin |

```typescript
// Body: POST /consultas
interface AgendarConsultaDto {
  idPaciente: string;   // UUID
  idMedico: string;     // UUID
  dataHora: string;     // ISO 8601
  observacoes?: string;
}

// Body: PATCH /consultas/:id/cancelar
interface CancelarConsultaDto {
  motivo?: string;
}

// Body: POST /grade-horarios
interface CriarGradeHorarioDto {
  idMedico: string;         // UUID
  diaSemana: number;        // 0 = domingo … 6 = sábado
  horaInicio: string;       // "HH:mm"
  horaFim: string;          // "HH:mm"
  duracaoMinutos: number;   // mínimo 10
}
```

---

## 2. Módulo `users`

| Método | Rota | Query params | Body | Roles |
|---|---|---|---|---|
| GET | `/usuarios/me` | — | — | (autenticado) |
| GET | `/usuarios` | — | — | Admin |
| GET | `/usuarios/:id` | — | — | Admin |
| POST | `/usuarios` | — | `CriarUsuarioDto` | Admin |
| PATCH | `/usuarios/:id/perfil` | — | `AlterarPerfilDto` | Admin |
| PATCH | `/usuarios/:id/desativar` | — | — | Admin |

```typescript
type Perfil = 'Doctor' | 'Receptionist' | 'Admin' | 'Patient';

// Body: POST /usuarios
interface CriarUsuarioDto {
  primeiroNome: string;
  sobrenome: string;
  email: string;
  senha: string;   // mínimo 6 chars
  perfil: Perfil;
}

// Body: PATCH /usuarios/:id/perfil
interface AlterarPerfilDto {
  primeiroNome?: string;
  sobrenome?: string;
}
```

---

## 3. Módulo `medical-record` (prontuários)

| Método | Rota | Query params | Body | Roles |
|---|---|---|---|---|
| GET | `/prontuarios/:idPaciente` | — | — | Doctor |
| POST | `/prontuarios/:idPaciente` | — | — | Doctor |
| POST | `/prontuarios/:idPaciente/entradas` | — | `AdicionarEntradaDto` | Doctor |
| GET | `/prontuarios/:idPaciente/entradas/:idEntrada` | — | — | Doctor |
| GET | `/prontuarios/:idPaciente/historico` | — | — | Doctor, Admin |

```typescript
type TipoEntrada = 'NotaConsulta' | 'Diagnostico' | 'Prescricao' | 'SolicitacaoExame';

// Body: POST /prontuarios/:idPaciente/entradas
interface AdicionarEntradaDto {
  tipo: TipoEntrada;
  conteudo: string;   // mínimo 3 chars
}
```

> O BFF repassa as respostas do microsserviço downstream sem reempacotar — não há DTO de response explícito no bff-web.

---

## 4. Schemas SQL relevantes

### `consultas`

```
id:                   UUID          NOT NULL (PK)
id_paciente:          UUID          NOT NULL
id_medico:            UUID          NOT NULL
agendado_para:        TIMESTAMPTZ   NOT NULL
duracao_minutos:      SMALLINT      NOT NULL  DEFAULT 30
status:               VARCHAR(30)   NOT NULL  DEFAULT 'Agendado'
                      -- Agendado | Confirmado | Cancelado | Concluido | NoShow
motivo_cancelamento:  VARCHAR(500)  NULLABLE
observacoes:          TEXT          NULLABLE
criado_em:            TIMESTAMPTZ   NOT NULL
atualizado_em:        TIMESTAMPTZ   NOT NULL
```

Constraint única parcial: `(id_medico, agendado_para)` WHERE status NOT IN ('Cancelado', 'Concluido', 'NoShow')

### `grade_horarios`

```
id:                    UUID        NOT NULL (PK)
id_medico:             UUID        NOT NULL
dia_semana:            SMALLINT    NOT NULL  -- 0=dom … 6=sáb
horario_inicio:        TIME        NOT NULL
horario_fim:           TIME        NOT NULL
duracao_slot_minutos:  SMALLINT    NOT NULL  DEFAULT 30
ativo:                 BOOLEAN     NOT NULL  DEFAULT true
criado_em:             TIMESTAMPTZ NOT NULL
```

### `horarios_bloqueados`

```
id:         UUID         NOT NULL (PK)
id_medico:  UUID         NOT NULL
inicio_em:  TIMESTAMPTZ  NOT NULL
fim_em:     TIMESTAMPTZ  NOT NULL
motivo:     VARCHAR(255) NULLABLE
criado_em:  TIMESTAMPTZ  NOT NULL
```

### `usuarios`

```
id:            UUID         NOT NULL (PK)
email:         VARCHAR(255) NOT NULL UNIQUE
hash_senha:    VARCHAR(255) NOT NULL
primeiro_nome: VARCHAR(100) NOT NULL
sobrenome:     VARCHAR(100) NOT NULL
perfil:        VARCHAR(50)  NOT NULL  -- Patient | Doctor | Receptionist | Admin
ativo:         BOOLEAN      NOT NULL  DEFAULT true
criado_em:     TIMESTAMPTZ  NOT NULL
atualizado_em: TIMESTAMPTZ  NOT NULL
```

### `repositorio_eventos` (Event Sourcing — Medical Record)

```
id:             UUID         NOT NULL (PK)
id_agregado:    UUID         NOT NULL
tipo_agregado:  VARCHAR(100) NOT NULL  DEFAULT 'MedicalRecord'
tipo_evento:    VARCHAR(150) NOT NULL
                -- RecordCreated | ConsultationNoteAdded | DiagnosisAdded
                -- PrescriptionAdded | ExamRequested
versao:         INT          NOT NULL
payload:        JSONB        NOT NULL
metadados:      JSONB        NULLABLE
ocorreu_em:     TIMESTAMPTZ  NOT NULL
UNIQUE(id_agregado, versao)
```

### `log_acesso_prontuario` (auditoria LGPD)

```
id:                UUID        NOT NULL (PK)
id_prontuario:     UUID        NOT NULL
id_usuario_acesso: UUID        NOT NULL
acessado_em:       TIMESTAMPTZ NOT NULL
acao:              VARCHAR(50) NOT NULL  -- Viewed | Exported | Printed
```

---

## 5. Types já existentes no portal-web (`lib/types.ts`)

```typescript
type Perfil = 'Doctor' | 'Receptionist' | 'Admin' | 'Patient';
type StatusConsulta = 'Agendado' | 'Confirmado' | 'Cancelado' | 'Concluido' | 'NoShow';
type TipoEventoSSE =
  | 'ConsultaAgendadaEvent'
  | 'ConsultaConfirmadaEvent'
  | 'ConsultaCanceladaEvent'
  | 'ConsultaConcluidaEvent'
  | 'ConsultaNoShowEvent';

interface UsuarioDto {
  id: string;
  email: string;
  primeiroNome: string;
  sobrenome: string;
  perfil: Perfil;
  ativo: boolean;
}

interface PacienteResumoDto {
  id: string;
  primeiroNome: string;
  sobrenome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  ativo: boolean;
}

interface PacienteDto extends PacienteResumoDto {
  email: string;
  logradouro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

interface ConsultaResumoDto {
  id: string;
  idPaciente: string;
  idMedico: string;
  agendadoPara: string;
  duracaoMinutos: number;
  status: StatusConsulta;
}

interface ConsultaListResponse {
  itens: ConsultaResumoDto[];
  total: number;
}

interface ConsultaDetalheDto {
  id: string;
  paciente: { id: string; nomeCompleto: string };
  medico: { id: string; nomeCompleto: string };
  agendadoPara: string;
  duracaoMinutos: number;
  status: StatusConsulta;
  observacoes?: string;
}

interface AgendarConsultaPayload {
  idPaciente: string;
  idMedico: string;
  dataHora: string;       // ISO 8601
  observacoes?: string;
}

interface SlotDisponivel {
  horario: string;        // "HH:mm" ou ISO datetime
  disponivel: boolean;
}

interface EventoSSE {
  tipo: TipoEventoSSE;
  idConsulta: string;
  idMedico: string;
  idPaciente: string;
}
```

---

## 6. Types que faltam adicionar em `lib/types.ts`

Para cobrir os 4 módulos a implementar, os seguintes tipos ainda não existem:

```typescript
// grade-horarios
interface GradeHorarioDto {
  id: string;
  idMedico: string;
  diaSemana: number;           // 0=dom … 6=sáb
  horarioInicio: string;       // "HH:mm"
  horarioFim: string;          // "HH:mm"
  duracaoSlotMinutos: number;
  ativo: boolean;
  criadoEm: string;
}

interface HorarioBloqueadoDto {
  id: string;
  idMedico: string;
  inicioEm: string;   // ISO 8601
  fimEm: string;      // ISO 8601
  motivo?: string;
}

interface DisponibilidadeResponse {
  slots: SlotDisponivel[];
}

// prontuarios
interface ProntuarioDto {
  idPaciente: string;
  versao: number;
  entradas: EntradaProntuarioDto[];
}

interface EntradaProntuarioDto {
  id: string;
  tipo: TipoEntrada;
  conteudo: string;
  ocorreuEm: string;   // ISO 8601
}

type TipoEntrada = 'NotaConsulta' | 'Diagnostico' | 'Prescricao' | 'SolicitacaoExame';

interface HistoricoEventoDto {
  id: string;
  tipoEvento: string;
  versao: number;
  payload: Record<string, unknown>;
  ocorreuEm: string;
}

// usuarios — criação
interface CriarUsuarioPayload {
  primeiroNome: string;
  sobrenome: string;
  email: string;
  senha: string;
  perfil: Perfil;
}

interface AlterarPerfilPayload {
  primeiroNome?: string;
  sobrenome?: string;
}
```
