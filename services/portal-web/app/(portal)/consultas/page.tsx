"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, UserPlus, ChevronRight, CheckCircle2, XCircle, Clock, CalendarDays, Filter } from "lucide-react";
import Link from "next/link";
import { bff } from "@/lib/api";
import { toast } from "@/lib/toast-store";
import { useUser } from "@/components/providers/user-provider";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ConsultaListItem, ConsultaListResponseEnriquecida, StatusConsulta } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDataHora(iso: string) {
  const d = new Date(iso);
  const data = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return { data, hora };
}

function toStatusBadge(s: StatusConsulta) {
  const map: Record<StatusConsulta, "confirmada" | "agendada" | "cancelada" | "concluida" | "no_show"> = {
    Confirmado: "confirmada", Agendado: "agendada",
    Cancelado: "cancelada",   Concluido: "concluida", NoShow: "no_show",
  };
  return map[s];
}

function getInitials(nome: string) {
  return nome.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

const FILTROS: { label: string; value: StatusConsulta | "Todos" }[] = [
  { label: "Todos",      value: "Todos"      },
  { label: "Agendado",   value: "Agendado"   },
  { label: "Confirmado", value: "Confirmado" },
  { label: "Concluído",  value: "Concluido"  },
  { label: "Cancelado",  value: "Cancelado"  },
  { label: "Não veio",   value: "NoShow"     },
];

// ── Página ────────────────────────────────────────────────────────────────────

export default function ConsultasPage() {
  const { user }                    = useUser();
  const [consultas, setConsultas]   = useState<ConsultaListItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [busca, setBusca]           = useState("");
  const [filtro, setFiltro]         = useState<StatusConsulta | "Todos">("Todos");
  const [processando, setProcessando] = useState<string | null>(null); // id em ação

  useEffect(() => {
    bff<ConsultaListResponseEnriquecida>("/consultas")
      .then(r => setConsultas(r.itens))
      .catch(() => setConsultas([]))
      .finally(() => setLoading(false));
  }, []);

  async function confirmar(id: string) {
    if (processando) return;
    setProcessando(id);
    try {
      await bff(`/consultas/${id}/confirmar`, { method: "PATCH" });
      setConsultas(prev => prev.map(c => c.id === id ? { ...c, status: "Confirmado" as StatusConsulta } : c));
      toast({ title: "Consulta confirmada", variant: "success" });
    } catch {
      toast({ title: "Erro ao confirmar consulta", variant: "error" });
    } finally {
      setProcessando(null);
    }
  }

  async function cancelar(id: string) {
    if (processando) return;
    setProcessando(id);
    try {
      await bff(`/consultas/${id}/cancelar`, { method: "PATCH", body: JSON.stringify({ motivo: "" }) });
      setConsultas(prev => prev.map(c => c.id === id ? { ...c, status: "Cancelado" as StatusConsulta } : c));
      toast({ title: "Consulta cancelada", variant: "warning" });
    } catch {
      toast({ title: "Erro ao cancelar consulta", variant: "error" });
    } finally {
      setProcessando(null);
    }
  }

  const filtradas = useMemo(() => {
    let lista = consultas;
    if (filtro !== "Todos") lista = lista.filter(c => c.status === filtro);
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(c =>
        c.nomePaciente.toLowerCase().includes(q) ||
        c.nomeMedico.toLowerCase().includes(q)
      );
    }
    return lista;
  }, [consultas, filtro, busca]);

  const ativas     = consultas.filter(c => c.status === "Agendado" || c.status === "Confirmado").length;
  const concluidas = consultas.filter(c => c.status === "Concluido").length;
  const canceladas = consultas.filter(c => c.status === "Cancelado" || c.status === "NoShow").length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-pm-warm">

      {/* Header */}
      <header
        className="px-10 pt-8 pb-5 border-b flex-shrink-0 transition-colors duration-300"
        style={{ backgroundColor: "var(--pm-sidebar-bg)", borderBottomColor: "var(--pm-sidebar-border)" }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1
              className="text-[22px] font-semibold tracking-tight leading-none transition-colors duration-300"
              style={{ color: "var(--pm-sidebar-text)" }}
            >
              Consultas
            </h1>
            <p className="text-[13px] mt-1.5 transition-colors duration-300" style={{ color: "var(--pm-sidebar-muted)" }}>
              {loading ? "Carregando..." : `${consultas.length} consultas no período`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-pm-faint" />
              <input
                placeholder="Paciente ou médico..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="pl-9 pr-4 py-2 text-[13px] bg-white border border-pm-line rounded-full w-[220px] placeholder:text-pm-faint text-pm-text focus:outline-none focus:border-pm-green transition-colors"
              />
            </div>
            <Link
              href="/agendar"
              className="flex items-center gap-1.5 px-4 py-2 text-white text-[13px] font-medium rounded-full hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--pm-green)" }}
            >
              <UserPlus size={14} strokeWidth={2} />
              Nova Consulta
            </Link>
          </div>
        </div>

        {/* Filtros de status */}
        <div className="flex items-center gap-1.5">
          <Filter size={12} className="text-pm-faint mr-1" />
          {FILTROS.map(f => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors"
              style={
                filtro === f.value
                  ? { backgroundColor: "var(--pm-green)", color: "white" }
                  : { backgroundColor: "transparent", color: "var(--pm-sidebar-muted)", border: "1px solid var(--pm-sidebar-line)" }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total",      value: consultas.length, sub: "no período",              icon: CalendarDays  },
            { label: "Ativas",     value: ativas,           sub: "agendadas + confirmadas",  icon: Clock         },
            { label: "Concluídas", value: concluidas,       sub: "atendimentos realizados",  icon: CheckCircle2  },
            { label: "Canceladas", value: canceladas,       sub: "canceladas + não compareceu", icon: XCircle    },
          ].map(s => {
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

        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-pm-line shadow-subtle overflow-hidden">

          {/* Cabeçalho */}
          <div className="px-6 py-4 border-b border-pm-line grid grid-cols-[1fr_130px_170px_70px_120px_150px] gap-4 items-center">
            {["Paciente", "Data / Hora", "Médico", "Dur.", "Status", "Ações"].map(h => (
              <p key={h} className="text-[11px] font-semibold uppercase tracking-[0.07em] text-pm-faint">{h}</p>
            ))}
          </div>

          {loading ? (
            <SkeletonRows />
          ) : filtradas.length === 0 ? (
            <EmptyState busca={busca} filtro={filtro} />
          ) : (
            <div className="divide-y divide-pm-line">
              {filtradas.map(c => (
                <ConsultaRow
                  key={c.id}
                  consulta={c}
                  onConfirmar={confirmar}
                  onCancelar={cancelar}
                  processando={processando === c.id}
                  podeAgir={user?.perfil === "Receptionist" || user?.perfil === "Admin"}
                />
              ))}
            </div>
          )}
        </div>

        {!loading && filtradas.length > 0 && (
          <p className="text-[12px] text-pm-faint text-center mt-4">
            {filtradas.length !== consultas.length
              ? `${filtradas.length} de ${consultas.length} consultas`
              : `${consultas.length} consultas`}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function ConsultaRow({
  consulta: c,
  onConfirmar,
  onCancelar,
  processando,
  podeAgir,
}: {
  consulta: ConsultaListItem;
  onConfirmar: (id: string) => Promise<void>;
  onCancelar:  (id: string) => Promise<void>;
  processando: boolean;
  podeAgir: boolean;
}) {
  const { data, hora } = formatDataHora(c.agendadoPara);

  return (
    <div className="px-6 py-3.5 grid grid-cols-[1fr_130px_170px_70px_120px_150px] gap-4 items-center hover:bg-pm-surface transition-colors duration-100 group">

      {/* Paciente */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
          style={{ backgroundColor: "var(--pm-green-soft)", color: "var(--pm-green)" }}
        >
          {getInitials(c.nomePaciente)}
        </div>
        <p className="text-[13px] font-medium text-pm-text truncate">{c.nomePaciente}</p>
      </div>

      {/* Data / Hora */}
      <div>
        <p className="text-[13px] text-pm-text font-mono-data">{hora}</p>
        <p className="text-[11px] text-pm-faint font-mono-data">{data}</p>
      </div>

      {/* Médico */}
      <p className="text-[13px] text-pm-muted truncate">{c.nomeMedico}</p>

      {/* Duração */}
      <p className="text-[13px] text-pm-muted font-mono-data">{c.duracaoMinutos}min</p>

      {/* Status */}
      <StatusBadge status={toStatusBadge(c.status)} />

      {/* Ações */}
      <div className="flex items-center gap-1.5">
        {podeAgir && c.status === "Agendado" && (
          <button
            onClick={() => void onConfirmar(c.id)}
            disabled={processando}
            className="px-2.5 py-1 rounded-lg text-[11.5px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            {processando ? "..." : "Confirmar"}
          </button>
        )}
        {podeAgir && (c.status === "Agendado" || c.status === "Confirmado") && (
          <button
            onClick={() => void onCancelar(c.id)}
            disabled={processando}
            className="px-2.5 py-1 rounded-lg text-[11.5px] font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        {(c.status === "Concluido" || c.status === "Cancelado" || c.status === "NoShow") && (
          <ChevronRight size={14} className="text-pm-faint opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  );
}

// ── Estados ───────────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div className="divide-y divide-pm-line">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-6 py-3.5 grid grid-cols-[1fr_130px_170px_70px_120px_150px] gap-4 items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-pm-surface animate-pulse" />
            <div className="h-3.5 w-36 rounded-full bg-pm-surface animate-pulse" />
          </div>
          <div className="h-3.5 w-20 rounded-full bg-pm-surface animate-pulse" />
          <div className="h-3.5 w-32 rounded-full bg-pm-surface animate-pulse" />
          <div className="h-3.5 w-10 rounded-full bg-pm-surface animate-pulse" />
          <div className="h-5 w-20 rounded-full bg-pm-surface animate-pulse" />
          <div className="h-6 w-20 rounded-lg bg-pm-surface animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ busca, filtro }: { busca: string; filtro: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="text-[14px] font-medium text-pm-text">
        {busca ? `Nenhuma consulta encontrada para "${busca}"` : `Nenhuma consulta ${filtro !== "Todos" ? `com status "${filtro}"` : "no período"}`}
      </p>
      <p className="text-[13px] text-pm-muted mt-1.5">
        Tente ajustar os filtros ou buscar por outro nome.
      </p>
    </div>
  );
}
