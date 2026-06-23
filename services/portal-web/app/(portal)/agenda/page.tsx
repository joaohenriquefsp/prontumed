import { Search, Plus, CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";

const consultas = [
  { id: "CNS-001", time: "14:00", patient: "Ana Clara Lima",          status: "confirmada" as const },
  { id: "CNS-002", time: "14:30", patient: "Carlos Eduardo Souza",    status: "agendada"   as const },
  { id: "CNS-003", time: "15:00", patient: "Maria Aparecida Santos",  status: "confirmada" as const },
  { id: "CNS-004", time: "15:30", patient: "João Victor Pereira",     status: "concluida"  as const },
  { id: "CNS-005", time: "16:00", patient: "Beatriz Helena Costa",    status: "confirmada" as const },
  { id: "CNS-006", time: "16:30", patient: "Rafael Henrique Alves",   status: "no_show"    as const },
  { id: "CNS-007", time: "17:00", patient: "Fernanda Cristina Rocha", status: "confirmada" as const },
  { id: "CNS-008", time: "17:30", patient: "Paulo Roberto Mendes",    status: "agendada"   as const },
];

const stats = [
  { label: "Total hoje",  value: "8", sub: "consultas agendadas", icon: CalendarDays },
  { label: "Confirmadas", value: "5", sub: "pacientes confirmaram", icon: CheckCircle2 },
  { label: "Pendentes",   value: "2", sub: "aguardando confirmação", icon: Clock },
  { label: "Concluídas",  value: "1", sub: "finalizadas hoje", icon: XCircle },
];

export default function AgendaPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-pm-warm">

      {/* Header — mesma cor do menu lateral */}
      <header
        className="px-10 pt-8 pb-6 border-b flex items-start justify-between flex-shrink-0 transition-colors duration-300"
        style={{
          backgroundColor: "var(--pm-sidebar-bg)",
          borderBottomColor: "var(--pm-sidebar-border)",
        }}
      >
        <div>
          <h1
            className="text-[22px] font-semibold tracking-tight leading-none transition-colors duration-300"
            style={{ color: "var(--pm-sidebar-text)" }}
          >
            Agenda de Hoje
          </h1>
          <p
            className="text-[13px] mt-1.5 transition-colors duration-300"
            style={{ color: "var(--pm-sidebar-muted)" }}
          >
            Segunda-feira, 23 de junho
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-pm-faint" />
            <input
              placeholder="Buscar paciente..."
              className="pl-9 pr-4 py-2 text-[13px] bg-white border border-pm-line rounded-full w-[200px] placeholder:text-pm-faint text-pm-text focus:outline-none focus:border-pm-green transition-colors"
            />
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-pm-green text-white text-[13px] font-medium rounded-full hover:bg-pm-green-hover transition-colors">
            <Plus size={14} strokeWidth={2.5} />
            Nova Consulta
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-pm-line p-5 shadow-subtle">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 rounded-full border border-pm-line flex items-center justify-center">
                    <Icon size={14} strokeWidth={1.5} className="text-pm-faint" />
                  </div>
                </div>
                <p className="text-[32px] font-bold tracking-tight text-pm-text leading-none">
                  {s.value}
                </p>
                <p className="text-[12px] text-pm-muted mt-2 leading-snug">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-pm-line shadow-subtle overflow-hidden">
          <div className="px-8 py-5 border-b border-pm-line flex items-center justify-between">
            <p className="text-[13px] font-medium text-pm-text">Hoje · 8 consultas</p>
            <p className="text-[12px] text-pm-faint font-mono-data">23 jun. 2025</p>
          </div>

          <div className="px-8 py-6">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[52px] top-2 bottom-2 w-px bg-pm-line" />

              {consultas.map((c) => (
                <div key={c.id} className="relative flex items-start gap-0 mb-1 group">
                  {/* Time */}
                  <div className="w-[52px] pt-3 flex-shrink-0 text-right pr-4">
                    <span className="text-[11.5px] font-mono-data text-pm-faint">{c.time}</span>
                  </div>

                  {/* Dot */}
                  <div className="flex-shrink-0 pt-[14px] z-10">
                    <div
                      className="w-[7px] h-[7px] rounded-full bg-pm-green"
                      style={{ boxShadow: "0 0 0 3px rgba(34,199,168,0.15)" }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 ml-5 rounded-xl px-4 py-3 group-hover:bg-pm-surface transition-colors duration-150 cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[13.5px] font-medium text-pm-text leading-snug">
                          {c.patient}
                        </p>
                        <p className="text-[11px] font-mono-data text-pm-faint mt-0.5 tracking-wide">
                          {c.id}
                        </p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dica do dia */}
        <div className="mt-4 rounded-2xl border border-emerald-100 bg-pm-green-soft px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-semibold text-pm-green uppercase tracking-widest mb-1">
              Dica do dia
            </p>
            <p className="text-[13px] text-emerald-800">
              Você tem 3 pacientes aguardando confirmação para hoje.
            </p>
          </div>
          <button className="text-[12px] font-medium text-pm-green hover:underline underline-offset-2 whitespace-nowrap">
            Ver pendentes →
          </button>
        </div>

      </div>
    </div>
  );
}
