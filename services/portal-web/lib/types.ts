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

export interface CriarPacientePayload {
  primeiroNome: string;
  sobrenome: string;
  cpf: string;          // 11 dígitos numéricos
  dataNascimento: string; // YYYY-MM-DD
  telefone: string;
  email: string;
  logradouro: string;
  cidade: string;
  uf: string;           // 2 chars
  cep: string;          // 8 dígitos numéricos
}

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

// ── Consulta list (BFF enriquece com nomes para a listagem) ─────────────────

export interface ConsultaListItem extends ConsultaResumoDto {
  nomePaciente: string;
  nomeMedico: string;
  motivoCancelamento?: string;
  observacoes?: string;
}

export interface ConsultaListResponseEnriquecida {
  itens: ConsultaListItem[];
  total: number;
}

// ── Consulta enriquecida (BFF compõe paciente + médico) ─────────────────────

export interface ConsultaDetalheDto {
  id: string;
  paciente: { id: string; nomeCompleto: string };
  medico: { id: string; nomeCompleto: string };
  agendadoPara: string;
  duracaoMinutos: number;
  status: StatusConsulta;
  observacoes?: string;
}

// ── Usuários — payload de criação ────────────────────────────────────────────

export interface CriarUsuarioPayload {
  primeiroNome: string;
  sobrenome: string;
  email: string;
  senha: string;
  perfil: Perfil;
}

// ── Grade de horários ─────────────────────────────────────────────────────────

export interface GradeHorarioDto {
  id: string;
  idMedico: string;
  diaSemana: number;         // 0=dom … 6=sáb
  horarioInicio: string;     // "HH:mm"
  horarioFim: string;        // "HH:mm"
  duracaoSlotMinutos: number;
  ativo: boolean;
  criadoEm: string;
}

export interface CriarGradeHorarioPayload {
  idMedico: string;
  diaSemana: number;
  horaInicio: string;        // "HH:mm"
  horaFim: string;           // "HH:mm"
  duracaoMinutos: number;
}

// ── Prontuários (Event Sourcing) ──────────────────────────────────────────────

export type TipoEntrada = 'NotaConsulta' | 'Diagnostico' | 'Prescricao' | 'SolicitacaoExame';

export interface EntradaProntuarioDto {
  id: string;
  tipo: TipoEntrada;
  conteudo: string;
  ocorreuEm: string;   // ISO 8601
}

export interface ProntuarioDto {
  idPaciente: string;
  versao: number;
  entradas: EntradaProntuarioDto[];
}

export interface AdicionarEntradaPayload {
  tipo: TipoEntrada;
  conteudo: string;
}

export interface HistoricoEventoDto {
  id: string;
  tipoEvento: string;
  versao: number;
  payload: Record<string, unknown>;
  ocorreuEm: string;
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
