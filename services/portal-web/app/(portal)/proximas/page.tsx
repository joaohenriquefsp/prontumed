"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, CheckCircle2, CalendarDays, UserPlus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { bff } from "@/lib/api";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ConsultaDetalheDto, StatusConsulta } from "@/lib/types";

function toStatusBadge(status: StatusConsulta) {
  const map: Record<StatusConsulta, "confirmada" | "agendada" | "cancelada" | "concluida" | "no_show"> = {
    Confirmado: "confirmada",
    Agendado:   "agendada",
    Cancelado:  "cancelada",
    Concluido:  "concluida",
    NoShow:     "no_show",
  };
  return map[status];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function groupByDate(items: ConsultaDetalheDto[]): [string, ConsultaDetalheDto[]][] {
  const map = new Map<string, ConsultaDetalheDto[]>();
  for (const c of items) {
    const key = c.agendadoPara.split("T")[0];
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function getDayLabel(dateKey: string) {
  const today    = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const todayKey    = today.toISOString().split("T")[0];
  const tomorrowKey = tomorrow.toISOString().split("T")[0];
  if (dateKey === todayKey)    return "Hoje";
  if (dateKey === tomorrowKey) return "Amanhã";
  return new Date(dateKey + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "short",
  });
}

function getInitials(nome: string) {
  return nome.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export default function ProximasPage() {
  const [consultas, setConsultas] = useState<ConsultaDetalheDto[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    bff<ConsultaDetalheDto[]>("/consultas/proximas")
      .then(setConsultas)
      .catch(() => setConsultas([]))
      .finally(() => setLoading(false));
  }, []);

  const total       = consultas.length;
  const confirmadas = consultas.filter(c => c.status === "Confirmado").length;
  const pendentes   = consultas.filter(c => c.status === "Agendado").length;
  const groups      = groupByDate(consultas);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-pm-warm">

      {/* Header */}
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
            Próximas Consultas
          </h1>
          <p
            className="text-[13px] mt-1.5 transition-colors duration-300"
            style={{ color: "var(--pm-sidebar-muted)" }}
          >
            Consultas agendadas para os próximos dias
          </p>
        </div>
        <Link
          href="/agendar"
          className="flex items-center gap-1.5 px-4 py-2 text-white text-[13px] font-medium rounded-full hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--pm-green)" }}
        >
          <UserPlus size={14} strokeWidth={2.5} />
          Agendar Nova
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Próximas",    value: loading ? "—" : String(total),       sub: "próximos 7 dias",         icon: CalendarDays },
            { label: "Confirmadas", value: loading ? "—" : String(confirmadas),  sub: "paciente confirmou",       icon: CheckCircle2 },
            { label: "Aguardando",  value: loading ? "—" : String(pendentes),    sub: "pendente de confirmação",  icon: Clock        },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-pm-line p-5 shadow-subtle">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 rounded-full border border-pm-line flex items-center justify-center">
                    <Icon size={14} strokeWidth={1.5} className="text-pm-faint" />
                  </div>
                </div>
                <p className="text-[32px] font-bold tracking-tight text-pm-text leading-none">{s.value}</p>
                <p className="text-[12px] text-pm-muted mt-2 leading-snug">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-white rounded-2xl border border-pm-line shadow-subtle overflow-hidden">
            <div className="px-8 py-5 border-b border-pm-line">
              <div className="h-4 w-28 bg-pm-surface rounded animate-pulse" />
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-pm-line last:border-0">
                <div className="h-8 w-12 bg-pm-surface rounded animate-pulse" />
                <div className="w-px h-8 bg-pm-line flex-shrink-0" />
                <div className="w-8 h-8 rounded-full bg-pm-surface animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-44 bg-pm-surface rounded animate-pulse" />
                  <div className="h-3 w-28 bg-pm-surface rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && consultas.length === 0 && (
          <div className="bg-white rounded-2xl border border-pm-line shadow-subtle p-16 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-pm-surface flex items-center justify-center mb-4">
              <Calendar size={20} className="text-pm-faint" />
            </div>
            <p className="text-[14px] font-medium text-pm-text mb-1">Nenhuma consulta agendada</p>
            <p className="text-[13px] text-pm-muted mb-6">Não há consultas nos próximos dias.</p>
            <Link
              href="/agendar"
              className="flex items-center gap-1.5 px-4 py-2 text-white text-[13px] font-medium rounded-full hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--pm-green)" }}
            >
              <UserPlus size={14} strokeWidth={2.5} />
              Agendar Consulta
            </Link>
          </div>
        )}

        {/* Grupos por data */}
        {!loading && groups.map(([dateKey, items]) => (
          <div key={dateKey} className="mb-6">

            {/* Cabeçalho do dia */}
            <div className="flex items-center gap-3 mb-3">
              <p className="text-[13px] font-semibold text-pm-text capitalize">
                {getDayLabel(dateKey)}
              </p>
              <span className="text-[12px] text-pm-faint font-mono-data">
                {new Date(dateKey + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
              </span>
              <div className="flex-1 h-px bg-pm-line" />
              <span className="text-[11px] text-pm-faint">
                {items.length} consulta{items.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Cards */}
            <div className="bg-white rounded-2xl border border-pm-line shadow-subtle overflow-hidden">
              {items.map((c, idx) => (
                <div
                  key={c.id}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-pm-surface transition-colors cursor-pointer group ${idx < items.length - 1 ? "border-b border-pm-line" : ""}`}
                >
                  {/* Horário */}
                  <div className="w-14 flex-shrink-0 text-center">
                    <div className="text-[13px] font-semibold font-mono-data" style={{ color: "var(--pm-green)" }}>
                      {formatTime(c.agendadoPara)}
                    </div>
                    <div className="text-[10px] text-pm-faint mt-0.5">{c.duracaoMinutos}min</div>
                  </div>

                  <div className="w-px h-8 bg-pm-line flex-shrink-0" />

                  {/* Paciente + médico */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full border border-emerald-100 flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                      style={{ backgroundColor: "var(--pm-green-soft)", color: "var(--pm-green)" }}
                    >
                      {getInitials(c.paciente.nomeCompleto)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-pm-text truncate">{c.paciente.nomeCompleto}</p>
                      <p className="text-[11.5px] text-pm-faint truncate">{c.medico.nomeCompleto}</p>
                    </div>
                  </div>

                  <StatusBadge status={toStatusBadge(c.status)} />

                  <ChevronRight
                    size={14}
                    className="text-pm-faint flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
