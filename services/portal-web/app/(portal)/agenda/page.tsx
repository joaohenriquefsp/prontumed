"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Plus, CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { useUser } from "@/components/providers/user-provider";
import { bff } from "@/lib/api";
import type { ConsultaListResponseEnriquecida, StatusConsulta } from "@/lib/types";

// Backend usa PascalCase; StatusBadge espera lowercase
function toLocalStatus(s: StatusConsulta): "agendada" | "confirmada" | "concluida" | "cancelada" | "no_show" {
  const map: Record<StatusConsulta, "agendada" | "confirmada" | "concluida" | "cancelada" | "no_show"> = {
    Agendado:   "agendada",
    Confirmado: "confirmada",
    Concluido:  "concluida",
    Cancelado:  "cancelada",
    NoShow:     "no_show",
  };
  return map[s] ?? "agendada";
}

function toHHmm(iso: string) {
  return iso.slice(11, 16); // "2026-06-23T14:00:00" → "14:00"
}

function dataExtenso(date: Date) {
  return date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

export default function AgendaPage() {
  const { user } = useUser();
  const [data, setData] = useState<ConsultaListResponseEnriquecida | null>(null);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const hoje = new Date();
  const dataParam = hoje.toISOString().slice(0, 10); // "YYYY-MM-DD"

  const carregar = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let qs = `data=${dataParam}`;
      if (user.perfil === "Doctor") qs += `&idMedico=${user.id}`;
      const res = await bff<ConsultaListResponseEnriquecida>(`/consultas?${qs}`);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user, dataParam]);

  useEffect(() => { void carregar(); }, [carregar]);

  const itens = data?.itens ?? [];

  const filtrados = busca.trim()
    ? itens.filter((c) => c.nomePaciente.toLowerCase().includes(busca.toLowerCase()))
    : itens;

  // stats
  const total      = itens.length;
  const confirmadas = itens.filter((c) => c.status === "Confirmado").length;
  const pendentes  = itens.filter((c) => c.status === "Agendado").length;
  const concluidas  = itens.filter((c) => c.status === "Concluido").length;

  const stats = [
    { label: "Total hoje",  value: String(total),      sub: "consultas agendadas",     icon: CalendarDays },
    { label: "Confirmadas", value: String(confirmadas), sub: "pacientes confirmaram",   icon: CheckCircle2 },
    { label: "Pendentes",   value: String(pendentes),   sub: "aguardando confirmação",  icon: Clock },
    { label: "Concluídas",  value: String(concluidas),  sub: "finalizadas hoje",        icon: XCircle },
  ];

  const ordenados = [...filtrados].sort((a, b) =>
    a.agendadoPara.localeCompare(b.agendadoPara),
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-pm-warm">

      <header
        className="px-10 pt-8 pb-6 border-b flex items-start justify-between flex-shrink-0 transition-colors duration-300"
        style={{ backgroundColor: "var(--pm-sidebar-bg)", borderBottomColor: "var(--pm-sidebar-border)" }}
      >
        <div>
          <h1
            className="text-[22px] font-semibold tracking-tight leading-none transition-colors duration-300"
            style={{ color: "var(--pm-sidebar-text)" }}
          >
            Agenda de Hoje
          </h1>
          <p
            className="text-[13px] mt-1.5 capitalize transition-colors duration-300"
            style={{ color: "var(--pm-sidebar-muted)" }}
          >
            {dataExtenso(hoje)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-pm-faint" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar paciente..."
              className="pl-9 pr-4 py-2 text-[13px] bg-white border border-pm-line rounded-full w-[200px] placeholder:text-pm-faint text-pm-text focus:outline-none focus:border-pm-green transition-colors"
            />
          </div>
          {(user?.perfil === "Receptionist" || user?.perfil === "Admin") && (
            <Link
              href="/agendar"
              className="flex items-center gap-1.5 px-4 py-2 bg-pm-green text-white text-[13px] font-medium rounded-full hover:bg-pm-green-hover transition-colors"
            >
              <Plus size={14} strokeWidth={2.5} />
              Nova Consulta
            </Link>
          )}
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
                  {loading ? "—" : s.value}
                </p>
                <p className="text-[12px] text-pm-muted mt-2 leading-snug">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-pm-line shadow-subtle overflow-hidden">
          <div className="px-8 py-5 border-b border-pm-line flex items-center justify-between">
            <p className="text-[13px] font-medium text-pm-text">
              Hoje · {loading ? "..." : `${total} consulta${total !== 1 ? "s" : ""}`}
            </p>
            <p className="text-[12px] text-pm-faint font-mono-data">
              {hoje.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>

          <div className="px-8 py-6">
            {loading ? (
              <p className="text-[13px] text-pm-faint text-center py-8">Carregando agenda...</p>
            ) : ordenados.length === 0 ? (
              <p className="text-[13px] text-pm-faint text-center py-8">
                {busca ? "Nenhum resultado para a busca." : "Nenhuma consulta agendada para hoje."}
              </p>
            ) : (
              <div className="relative">
                <div className="absolute left-[52px] top-2 bottom-2 w-px bg-pm-line" />
                {ordenados.map((c) => (
                  <div key={c.id} className="relative flex items-start gap-0 mb-1 group">
                    <div className="w-[52px] pt-3 flex-shrink-0 text-right pr-4">
                      <span className="text-[11.5px] font-mono-data text-pm-faint">
                        {toHHmm(c.agendadoPara)}
                      </span>
                    </div>
                    <div className="flex-shrink-0 pt-[14px] z-10">
                      <div
                        className="w-[7px] h-[7px] rounded-full bg-pm-green"
                        style={{ boxShadow: "0 0 0 3px rgba(34,199,168,0.15)" }}
                      />
                    </div>
                    <div className="flex-1 ml-5 rounded-xl px-4 py-3 group-hover:bg-pm-surface transition-colors duration-150 cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[13.5px] font-medium text-pm-text leading-snug">
                            {c.nomePaciente}
                          </p>
                          <p className="text-[11px] font-mono-data text-pm-faint mt-0.5 tracking-wide">
                            {c.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <StatusBadge status={toLocalStatus(c.status)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dica dinâmica */}
        {!loading && pendentes > 0 && (
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-pm-green-soft px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold text-pm-green uppercase tracking-widest mb-1">
                Atenção
              </p>
              <p className="text-[13px] text-emerald-800">
                {pendentes === 1
                  ? "1 paciente ainda não confirmou a consulta."
                  : `${pendentes} pacientes aguardando confirmação para hoje.`}
              </p>
            </div>
            <Link
              href="/consultas"
              className="text-[12px] font-medium text-pm-green hover:underline underline-offset-2 whitespace-nowrap"
            >
              Ver pendentes →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
