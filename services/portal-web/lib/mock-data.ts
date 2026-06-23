import type { UsuarioDto, PacienteResumoDto, ConsultaResumoDto, SlotDisponivel } from "./types";

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

// ── Interceptor ───────────────────────────────────────────────────────────────

export function getMockResponse(path: string): unknown {
  const pathname = path.split("?")[0];

  if (pathname === "/usuarios/me")    return MOCK_ME;
  if (pathname === "/usuarios")       return MOCK_USUARIOS;
  if (pathname === "/pacientes")      return MOCK_PACIENTES;
  if (pathname === "/disponibilidade") return MOCK_SLOTS;
  if (pathname === "/consultas")      return { itens: MOCK_CONSULTAS, total: MOCK_CONSULTAS.length };

  if (pathname === "/auth/login")     return {}; // mock: qualquer credencial funciona
  if (pathname === "/auth/refresh")   return {};

  // Qualquer POST retorna objeto vazio (201-like)
  return {};
}
