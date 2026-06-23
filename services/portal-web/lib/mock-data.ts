import type { UsuarioDto, PacienteResumoDto, ConsultaResumoDto, ConsultaListItem, ConsultaDetalheDto, SlotDisponivel, GradeHorarioDto, ProntuarioDto } from "./types";

// ── Usuário logado (Admin) ────────────────────────────────────────────────────

export const MOCK_ME: UsuarioDto = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "admin@prontumed.com",
  primeiroNome: "Carlos",
  sobrenome: "Mendes",
  perfil: "Admin",
  ativo: true,
};

// ── Médicos ───────────────────────────────────────────────────────────────────

export const MOCK_USUARIOS: UsuarioDto[] = [
  MOCK_ME,
  {
    id: "00000000-0000-0000-0000-000000000010",
    email: "lucas.andrade@prontumed.com",
    primeiroNome: "Lucas",
    sobrenome: "Andrade",
    perfil: "Doctor",
    ativo: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    email: "marina.costa@prontumed.com",
    primeiroNome: "Marina",
    sobrenome: "Costa",
    perfil: "Doctor",
    ativo: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    email: "rafael.souza@prontumed.com",
    primeiroNome: "Rafael",
    sobrenome: "Souza",
    perfil: "Doctor",
    ativo: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000020",
    email: "ana.recep@prontumed.com",
    primeiroNome: "Ana",
    sobrenome: "Lima",
    perfil: "Receptionist",
    ativo: true,
  },
];

// ── Pacientes ─────────────────────────────────────────────────────────────────

export const MOCK_PACIENTES: PacienteResumoDto[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    primeiroNome: "Fernanda",
    sobrenome: "Oliveira",
    cpf: "12345678901",
    dataNascimento: "1990-03-15",
    telefone: "(11) 98765-4321",
    ativo: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    primeiroNome: "Ricardo",
    sobrenome: "Ferreira",
    cpf: "23456789012",
    dataNascimento: "1978-07-22",
    telefone: "(21) 91234-5678",
    ativo: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    primeiroNome: "Juliana",
    sobrenome: "Santos",
    cpf: "34567890123",
    dataNascimento: "1995-11-08",
    telefone: "(31) 99876-5432",
    ativo: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000004",
    primeiroNome: "Marcos",
    sobrenome: "Almeida",
    cpf: "45678901234",
    dataNascimento: "1965-02-28",
    telefone: "(41) 92345-6789",
    ativo: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000005",
    primeiroNome: "Beatriz",
    sobrenome: "Carvalho",
    cpf: "56789012345",
    dataNascimento: "2002-09-14",
    telefone: "(51) 98123-4567",
    ativo: false,
  },
  {
    id: "10000000-0000-0000-0000-000000000006",
    primeiroNome: "Rodrigo",
    sobrenome: "Nascimento",
    cpf: "67890123456",
    dataNascimento: "1988-05-30",
    telefone: "(61) 93456-7890",
    ativo: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000007",
    primeiroNome: "Camila",
    sobrenome: "Ribeiro",
    cpf: "78901234567",
    dataNascimento: "2000-12-01",
    telefone: "(71) 94567-8901",
    ativo: true,
  },
  {
    id: "10000000-0000-0000-0000-000000000008",
    primeiroNome: "Eduardo",
    sobrenome: "Pereira",
    cpf: "89012345678",
    dataNascimento: "1972-06-17",
    telefone: "(81) 95678-9012",
    ativo: true,
  },
];

// ── Consultas ─────────────────────────────────────────────────────────────────

export const MOCK_CONSULTAS: ConsultaResumoDto[] = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    idPaciente: "10000000-0000-0000-0000-000000000001",
    idMedico: "00000000-0000-0000-0000-000000000010",
    agendadoPara: "2026-06-22T08:00:00",
    duracaoMinutos: 30,
    status: "Confirmado",
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    idPaciente: "10000000-0000-0000-0000-000000000002",
    idMedico: "00000000-0000-0000-0000-000000000010",
    agendadoPara: "2026-06-22T09:00:00",
    duracaoMinutos: 30,
    status: "Agendado",
  },
  {
    id: "20000000-0000-0000-0000-000000000003",
    idPaciente: "10000000-0000-0000-0000-000000000003",
    idMedico: "00000000-0000-0000-0000-000000000011",
    agendadoPara: "2026-06-22T10:30:00",
    duracaoMinutos: 45,
    status: "Confirmado",
  },
  {
    id: "20000000-0000-0000-0000-000000000004",
    idPaciente: "10000000-0000-0000-0000-000000000004",
    idMedico: "00000000-0000-0000-0000-000000000010",
    agendadoPara: "2026-06-22T11:00:00",
    duracaoMinutos: 30,
    status: "Concluido",
  },
  {
    id: "20000000-0000-0000-0000-000000000005",
    idPaciente: "10000000-0000-0000-0000-000000000005",
    idMedico: "00000000-0000-0000-0000-000000000012",
    agendadoPara: "2026-06-22T14:00:00",
    duracaoMinutos: 30,
    status: "Cancelado",
  },
  {
    id: "20000000-0000-0000-0000-000000000006",
    idPaciente: "10000000-0000-0000-0000-000000000006",
    idMedico: "00000000-0000-0000-0000-000000000011",
    agendadoPara: "2026-06-22T15:00:00",
    duracaoMinutos: 30,
    status: "Agendado",
  },
];

// ── Consultas enriquecidas para listagem ──────────────────────────────────────

export const MOCK_CONSULTAS_LISTA: ConsultaListItem[] = [
  // Hoje (2026-06-23)
  {
    id: "20000000-0000-0000-0000-000000000030",
    idPaciente: "10000000-0000-0000-0000-000000000001",
    idMedico:   "00000000-0000-0000-0000-000000000010",
    nomePaciente: "Fernanda Oliveira",
    nomeMedico:   "Dr. Lucas Andrade",
    agendadoPara: "2026-06-23T08:00:00",
    duracaoMinutos: 30,
    status: "Confirmado",
  },
  {
    id: "20000000-0000-0000-0000-000000000031",
    idPaciente: "10000000-0000-0000-0000-000000000002",
    idMedico:   "00000000-0000-0000-0000-000000000011",
    nomePaciente: "Ricardo Ferreira",
    nomeMedico:   "Dra. Marina Costa",
    agendadoPara: "2026-06-23T09:30:00",
    duracaoMinutos: 30,
    status: "Agendado",
  },
  {
    id: "20000000-0000-0000-0000-000000000032",
    idPaciente: "10000000-0000-0000-0000-000000000003",
    idMedico:   "00000000-0000-0000-0000-000000000012",
    nomePaciente: "Juliana Santos",
    nomeMedico:   "Dr. Rafael Souza",
    agendadoPara: "2026-06-23T11:00:00",
    duracaoMinutos: 45,
    status: "Agendado",
  },
  // Ontem (2026-06-22)
  {
    id: "20000000-0000-0000-0000-000000000033",
    idPaciente: "10000000-0000-0000-0000-000000000004",
    idMedico:   "00000000-0000-0000-0000-000000000010",
    nomePaciente: "Marcos Almeida",
    nomeMedico:   "Dr. Lucas Andrade",
    agendadoPara: "2026-06-22T10:00:00",
    duracaoMinutos: 30,
    status: "Concluido",
  },
  {
    id: "20000000-0000-0000-0000-000000000034",
    idPaciente: "10000000-0000-0000-0000-000000000005",
    idMedico:   "00000000-0000-0000-0000-000000000012",
    nomePaciente: "Beatriz Carvalho",
    nomeMedico:   "Dr. Rafael Souza",
    agendadoPara: "2026-06-22T14:00:00",
    duracaoMinutos: 30,
    status: "Cancelado",
    motivoCancelamento: "Paciente desmarcou",
  },
  {
    id: "20000000-0000-0000-0000-000000000035",
    idPaciente: "10000000-0000-0000-0000-000000000006",
    idMedico:   "00000000-0000-0000-0000-000000000011",
    nomePaciente: "Rodrigo Nascimento",
    nomeMedico:   "Dra. Marina Costa",
    agendadoPara: "2026-06-22T16:00:00",
    duracaoMinutos: 30,
    status: "NoShow",
  },
  // 21/06
  {
    id: "20000000-0000-0000-0000-000000000036",
    idPaciente: "10000000-0000-0000-0000-000000000007",
    idMedico:   "00000000-0000-0000-0000-000000000010",
    nomePaciente: "Camila Ribeiro",
    nomeMedico:   "Dr. Lucas Andrade",
    agendadoPara: "2026-06-21T09:00:00",
    duracaoMinutos: 30,
    status: "Concluido",
  },
  {
    id: "20000000-0000-0000-0000-000000000037",
    idPaciente: "10000000-0000-0000-0000-000000000008",
    idMedico:   "00000000-0000-0000-0000-000000000012",
    nomePaciente: "Eduardo Pereira",
    nomeMedico:   "Dr. Rafael Souza",
    agendadoPara: "2026-06-21T10:30:00",
    duracaoMinutos: 30,
    status: "Concluido",
  },
];

// ── Slots de disponibilidade ──────────────────────────────────────────────────

export const MOCK_SLOTS: SlotDisponivel[] = [
  { horario: "08:00", disponivel: false },
  { horario: "08:30", disponivel: true },
  { horario: "09:00", disponivel: false },
  { horario: "09:30", disponivel: true },
  { horario: "10:00", disponivel: true },
  { horario: "10:30", disponivel: true },
  { horario: "11:00", disponivel: false },
  { horario: "11:30", disponivel: true },
  { horario: "14:00", disponivel: true },
  { horario: "14:30", disponivel: true },
  { horario: "15:00", disponivel: false },
  { horario: "15:30", disponivel: true },
  { horario: "16:00", disponivel: true },
  { horario: "16:30", disponivel: true },
];

// ── Próximas consultas (enriquecidas com nomes) ───────────────────────────────

export const MOCK_PROXIMAS: ConsultaDetalheDto[] = [
  {
    id: "20000000-0000-0000-0000-000000000010",
    paciente: { id: "10000000-0000-0000-0000-000000000001", nomeCompleto: "Fernanda Oliveira" },
    medico:   { id: "00000000-0000-0000-0000-000000000010", nomeCompleto: "Dr. Lucas Andrade" },
    agendadoPara: "2026-06-24T08:00:00",
    duracaoMinutos: 30,
    status: "Confirmado",
  },
  {
    id: "20000000-0000-0000-0000-000000000011",
    paciente: { id: "10000000-0000-0000-0000-000000000002", nomeCompleto: "Ricardo Ferreira" },
    medico:   { id: "00000000-0000-0000-0000-000000000010", nomeCompleto: "Dr. Lucas Andrade" },
    agendadoPara: "2026-06-24T09:00:00",
    duracaoMinutos: 30,
    status: "Agendado",
  },
  {
    id: "20000000-0000-0000-0000-000000000012",
    paciente: { id: "10000000-0000-0000-0000-000000000003", nomeCompleto: "Juliana Santos" },
    medico:   { id: "00000000-0000-0000-0000-000000000011", nomeCompleto: "Dra. Marina Costa" },
    agendadoPara: "2026-06-24T14:00:00",
    duracaoMinutos: 45,
    status: "Confirmado",
  },
  {
    id: "20000000-0000-0000-0000-000000000013",
    paciente: { id: "10000000-0000-0000-0000-000000000004", nomeCompleto: "Marcos Almeida" },
    medico:   { id: "00000000-0000-0000-0000-000000000012", nomeCompleto: "Dr. Rafael Souza" },
    agendadoPara: "2026-06-25T10:00:00",
    duracaoMinutos: 30,
    status: "Agendado",
  },
  {
    id: "20000000-0000-0000-0000-000000000014",
    paciente: { id: "10000000-0000-0000-0000-000000000006", nomeCompleto: "Rodrigo Nascimento" },
    medico:   { id: "00000000-0000-0000-0000-000000000010", nomeCompleto: "Dr. Lucas Andrade" },
    agendadoPara: "2026-06-25T15:30:00",
    duracaoMinutos: 30,
    status: "Agendado",
  },
  {
    id: "20000000-0000-0000-0000-000000000015",
    paciente: { id: "10000000-0000-0000-0000-000000000007", nomeCompleto: "Camila Ribeiro" },
    medico:   { id: "00000000-0000-0000-0000-000000000011", nomeCompleto: "Dra. Marina Costa" },
    agendadoPara: "2026-06-26T09:00:00",
    duracaoMinutos: 60,
    status: "Agendado",
  },
];

// ── Grade de horários ─────────────────────────────────────────────────────────

export const MOCK_GRADE_HORARIOS: GradeHorarioDto[] = [
  {
    id: "30000000-0000-0000-0000-000000000001",
    idMedico: "00000000-0000-0000-0000-000000000010",
    diaSemana: 1, horarioInicio: "08:00", horarioFim: "12:00", duracaoSlotMinutos: 30, ativo: true,
    criadoEm: "2026-01-10T00:00:00",
  },
  {
    id: "30000000-0000-0000-0000-000000000002",
    idMedico: "00000000-0000-0000-0000-000000000010",
    diaSemana: 3, horarioInicio: "08:00", horarioFim: "12:00", duracaoSlotMinutos: 30, ativo: true,
    criadoEm: "2026-01-10T00:00:00",
  },
  {
    id: "30000000-0000-0000-0000-000000000003",
    idMedico: "00000000-0000-0000-0000-000000000010",
    diaSemana: 5, horarioInicio: "14:00", horarioFim: "18:00", duracaoSlotMinutos: 30, ativo: true,
    criadoEm: "2026-01-10T00:00:00",
  },
  {
    id: "30000000-0000-0000-0000-000000000004",
    idMedico: "00000000-0000-0000-0000-000000000011",
    diaSemana: 2, horarioInicio: "09:00", horarioFim: "13:00", duracaoSlotMinutos: 45, ativo: true,
    criadoEm: "2026-01-12T00:00:00",
  },
  {
    id: "30000000-0000-0000-0000-000000000005",
    idMedico: "00000000-0000-0000-0000-000000000011",
    diaSemana: 4, horarioInicio: "14:00", horarioFim: "17:00", duracaoSlotMinutos: 45, ativo: true,
    criadoEm: "2026-01-12T00:00:00",
  },
  {
    id: "30000000-0000-0000-0000-000000000006",
    idMedico: "00000000-0000-0000-0000-000000000012",
    diaSemana: 1, horarioInicio: "07:00", horarioFim: "12:00", duracaoSlotMinutos: 30, ativo: true,
    criadoEm: "2026-01-15T00:00:00",
  },
  {
    id: "30000000-0000-0000-0000-000000000007",
    idMedico: "00000000-0000-0000-0000-000000000012",
    diaSemana: 3, horarioInicio: "07:00", horarioFim: "11:00", duracaoSlotMinutos: 30, ativo: false,
    criadoEm: "2026-01-15T00:00:00",
  },
];

// ── Prontuários ───────────────────────────────────────────────────────────────

export const MOCK_PRONTUARIOS: Record<string, ProntuarioDto> = {
  "10000000-0000-0000-0000-000000000001": {
    idPaciente: "10000000-0000-0000-0000-000000000001",
    versao: 3,
    entradas: [
      {
        id: "e0000001",
        tipo: "NotaConsulta",
        conteudo: "Paciente relata dor de cabeça frequente há duas semanas, principalmente pela manhã. Pressão arterial 120/80. Orientada sobre hidratação e sono.",
        ocorreuEm: "2026-06-22T08:30:00",
      },
      {
        id: "e0000002",
        tipo: "Diagnostico",
        conteudo: "Cefaleia tensional. CID-10: G44.2",
        ocorreuEm: "2026-06-22T08:45:00",
      },
      {
        id: "e0000003",
        tipo: "Prescricao",
        conteudo: "Dipirona 500mg — tomar 1 comprimido a cada 6 horas em caso de dor. Usar por no máximo 5 dias.",
        ocorreuEm: "2026-06-22T08:50:00",
      },
    ],
  },
  "10000000-0000-0000-0000-000000000002": {
    idPaciente: "10000000-0000-0000-0000-000000000002",
    versao: 2,
    entradas: [
      {
        id: "e0000010",
        tipo: "NotaConsulta",
        conteudo: "Retorno para avaliação de colesterol. Exames do mês passado mostraram LDL 160. Paciente relatou dificuldade de aderir à dieta.",
        ocorreuEm: "2026-06-10T09:00:00",
      },
      {
        id: "e0000011",
        tipo: "SolicitacaoExame",
        conteudo: "Solicitar: hemograma completo, perfil lipídico, glicemia em jejum, TSH. Retornar em 30 dias com resultados.",
        ocorreuEm: "2026-06-10T09:20:00",
      },
    ],
  },
  "10000000-0000-0000-0000-000000000003": {
    idPaciente: "10000000-0000-0000-0000-000000000003",
    versao: 1,
    entradas: [
      {
        id: "e0000020",
        tipo: "NotaConsulta",
        conteudo: "Primeira consulta. Paciente de 30 anos sem histórico relevante. Queixa de cansaço excessivo e queda de cabelo nos últimos 3 meses.",
        ocorreuEm: "2026-06-21T10:30:00",
      },
    ],
  },
};

// ── Interceptor ───────────────────────────────────────────────────────────────

export function getMockResponse(path: string, options?: RequestInit): unknown {
  const [pathname, queryString] = path.split("?");
  const params = new URLSearchParams(queryString ?? "");

  if (pathname === "/usuarios/me")    return MOCK_ME;
  if (pathname === "/usuarios")       return MOCK_USUARIOS;
  if (pathname === "/pacientes")      return MOCK_PACIENTES;
  if (pathname === "/disponibilidade") return MOCK_SLOTS;
  if (pathname === "/consultas")      return { itens: MOCK_CONSULTAS_LISTA, total: MOCK_CONSULTAS_LISTA.length };
  if (pathname === "/consultas/proximas") return MOCK_PROXIMAS;

  // Grade de horários — filtra por idMedico se informado
  if (pathname === "/grade-horarios") {
    const idMedico = params.get("idMedico");
    const result = idMedico
      ? MOCK_GRADE_HORARIOS.filter(g => g.idMedico === idMedico)
      : MOCK_GRADE_HORARIOS;
    return result;
  }

  // Prontuário por paciente
  const prontuarioMatch = pathname.match(/^\/prontuarios\/([^/]+)$/);
  if (prontuarioMatch) {
    const idPaciente = prontuarioMatch[1];
    return MOCK_PRONTUARIOS[idPaciente] ?? { idPaciente, versao: 0, entradas: [] };
  }

  // POST /prontuarios/:id/entradas — retorna entrada criada mock
  const entradaMatch = pathname.match(/^\/prontuarios\/([^/]+)\/entradas$/);
  if (entradaMatch && options?.method === "POST") {
    const body = options.body ? JSON.parse(options.body as string) : {};
    return { id: `mock-${Date.now()}`, ...body, ocorreuEm: new Date().toISOString() };
  }

  if (pathname === "/auth/login")     return {};
  if (pathname === "/auth/refresh")   return {};

  return {};
}
