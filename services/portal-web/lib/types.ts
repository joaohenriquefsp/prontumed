// ── Usuário ──────────────────────────────────────────────────────────────────

export type Perfil = 'Doctor' | 'Receptionist' | 'Admin' | 'Patient';

export interface UsuarioDto {
  id: string;
  email: string;
  primeiroNome: string;
  sobrenome: string;
  perfil: Perfil;
  ativo: boolean;
}

// ── Pacientes ─────────────────────────────────────────────────────────────────

export interface PacienteResumoDto {
  id: string;
  primeiroNome: string;
  sobrenome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  ativo: boolean;
}

export interface PacienteDto extends PacienteResumoDto {
  email: string;
  logradouro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

// ── Consultas ─────────────────────────────────────────────────────────────────

export type StatusConsulta = 'Agendado' | 'Confirmado' | 'Cancelado' | 'Concluido' | 'NoShow';

export interface ConsultaResumoDto {
  id: string;
  idPaciente: string;
  idMedico: string;
  agendadoPara: string;
  duracaoMinutos: number;
  status: StatusConsulta;
}

export interface ConsultaListResponse {
  itens: ConsultaResumoDto[];
  total: number;
}

// ── Agendamento ───────────────────────────────────────────────────────────────

export interface AgendarConsultaPayload {
  idPaciente: string;
  idMedico: string;
  dataHora: string;       // ISO 8601 — campo confirmado no AgendarConsultaDto
  observacoes?: string;
}

export interface SlotDisponivel {
  horario: string;        // "09:00" ou ISO datetime
  disponivel: boolean;
}

// ── SSE ───────────────────────────────────────────────────────────────────────

export type TipoEventoSSE =
  | 'ConsultaAgendadaEvent'
  | 'ConsultaConfirmadaEvent'
  | 'ConsultaCanceladaEvent'
  | 'ConsultaConcluidaEvent'
  | 'ConsultaNoShowEvent';

export interface EventoSSE {
  tipo: TipoEventoSSE;
  idConsulta: string;
  idMedico: string;
  idPaciente: string;
}
