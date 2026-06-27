"use client";

import { useState, useEffect } from "react";
import { Search, Plus, FileText, Stethoscope, Pill, FlaskConical, ChevronDown, ChevronUp, X, AlertCircle } from "lucide-react";
import { bff } from "@/lib/api";
import { toast } from "@/lib/toast-store";
import type { PacienteResumoDto, PacienteListResponse, ProntuarioDto, EntradaProntuarioDto, TipoEntrada, AdicionarEntradaPayload } from "@/lib/types";

// ── Constantes ────────────────────────────────────────────────────────────────

const TIPO_CONFIG: Record<TipoEntrada, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  NotaConsulta: { label: "Nota de Consulta",    icon: FileText,     color: "text-blue-600",    bg: "bg-blue-50"   },
  Diagnostico:  { label: "Diagnóstico",          icon: Stethoscope,  color: "text-violet-600",  bg: "bg-violet-50" },
  Prescricao:   { label: "Prescrição",           icon: Pill,         color: "text-emerald-600", bg: "bg-emerald-50"},
  Exame:        { label: "Exame",                icon: FlaskConical, color: "text-amber-600",   bg: "bg-amber-50"  },
};

const TIPOS: TipoEntrada[] = ["NotaConsulta", "Diagnostico", "Prescricao", "Exame"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getInitials(nome: string) {
  return nome.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function ProntuariosPage() {
  const [pacientes,  setPacientes]   = useState<PacienteResumoDto[]>([]);
  const [buscaPac,   setBuscaPac]    = useState("");
  const [pacSel,     setPacSel]      = useState<PacienteResumoDto | null>(null);
  const [prontuario, setProntuario]  = useState<ProntuarioDto | null>(null);
  const [loadingPac, setLoadingPac]  = useState(true);
  const [loadingPro, setLoadingPro]  = useState(false);
  const [showModal,  setShowModal]   = useState(false);

  // Carrega lista de pacientes
  useEffect(() => {
    bff<PacienteListResponse>("/pacientes")
      .then((r) => setPacientes(r.itens))
      .catch(() => setPacientes([]))
      .finally(() => setLoadingPac(false));
  }, []);

  // Carrega prontuário quando paciente é selecionado
  useEffect(() => {
    if (!pacSel) { setProntuario(null); return; }
    setLoadingPro(true);
    bff<ProntuarioDto>(`/prontuarios/${pacSel.id}`)
      .then(setProntuario)
      .catch(() => setProntuario(null))
      .finally(() => setLoadingPro(false));
  }, [pacSel]);

  async function handleAdicionarEntrada(payload: AdicionarEntradaPayload) {
    if (!prontuario || !pacSel) return;
    try {
      const nova = await bff<EntradaProntuarioDto>(
        `/prontuarios/${pacSel.id}/entradas`,
        { method: "POST", body: JSON.stringify(payload) },
      );
      setProntuario(prev =>
        prev ? { ...prev, versao: prev.versao + 1, entradas: [nova, ...prev.entradas] } : prev
      );
      setShowModal(false);
      toast({ title: "Entrada adicionada ao prontuário", variant: "success" });
    } catch {
      toast({ title: "Erro ao adicionar entrada", variant: "error" });
    }
  }

  const pacientesFiltrados = buscaPac.trim()
    ? pacientes.filter(p =>
        `${p.primeiroNome} ${p.sobrenome}`.toLowerCase().includes(buscaPac.toLowerCase()) ||
        p.cpf.includes(buscaPac)
      )
    : pacientes;

  return (
    <div className="flex-1 flex overflow-hidden bg-pm-warm">

      {/* Painel esquerdo — lista de pacientes */}
      <aside className="w-72 flex-shrink-0 border-r border-pm-line bg-white flex flex-col">
        <div
          className="px-5 pt-7 pb-4 border-b flex-shrink-0 transition-colors duration-300"
          style={{ borderBottomColor: "var(--pm-sidebar-border)" }}
        >
          <p
            className="text-[15px] font-semibold leading-none transition-colors duration-300"
            style={{ color: "var(--pm-sidebar-text)" }}
          >
            Prontuários
          </p>
          <div className="relative mt-3">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-pm-faint" />
            <input
              placeholder="Buscar paciente..."
              value={buscaPac}
              onChange={e => setBuscaPac(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-[12.5px] bg-pm-surface border border-pm-line rounded-xl placeholder:text-pm-faint text-pm-text focus:outline-none focus:border-pm-green transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {loadingPac ? (
            <div className="px-5 py-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pm-surface animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 rounded-full bg-pm-surface animate-pulse" />
                    <div className="h-2.5 w-20 rounded-full bg-pm-surface animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : pacientesFiltrados.length === 0 ? (
            <p className="px-5 py-8 text-center text-[12.5px] text-pm-faint">
              Nenhum paciente encontrado.
            </p>
          ) : (
            pacientesFiltrados.map(p => (
              <button
                key={p.id}
                onClick={() => setPacSel(p)}
                className={`w-full px-5 py-3 flex items-center gap-3 text-left transition-colors ${
                  pacSel?.id === p.id ? "bg-pm-green-soft" : "hover:bg-pm-surface"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                  style={
                    pacSel?.id === p.id
                      ? { backgroundColor: "var(--pm-green-soft)", color: "var(--pm-green)" }
                      : { backgroundColor: "#f1f5f9", color: "#94a3b8" }
                  }
                >
                  {getInitials(`${p.primeiroNome} ${p.sobrenome}`)}
                </div>
                <div className="min-w-0">
                  <p className={`text-[12.5px] font-medium truncate ${pacSel?.id === p.id ? "text-pm-green" : "text-pm-text"}`}>
                    {p.primeiroNome} {p.sobrenome}
                  </p>
                  <p className="text-[11.5px] text-pm-faint">{p.cpf}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Painel direito — prontuário */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {!pacSel ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
            <div className="w-12 h-12 rounded-full border border-pm-line flex items-center justify-center">
              <FileText size={20} className="text-pm-faint" />
            </div>
            <p className="text-[14px] font-medium text-pm-text">Selecione um paciente</p>
            <p className="text-[13px] text-pm-muted max-w-xs">
              Escolha um paciente na lista ao lado para visualizar e editar o prontuário.
            </p>
          </div>
        ) : (
          <>
            {/* Cabeçalho do prontuário */}
            <header
              className="px-8 pt-7 pb-5 border-b flex-shrink-0 flex items-start justify-between transition-colors duration-300"
              style={{ borderBottomColor: "var(--pm-sidebar-border)", backgroundColor: "var(--pm-sidebar-bg)" }}
            >
              <div>
                <p
                  className="text-[18px] font-semibold leading-none transition-colors duration-300"
                  style={{ color: "var(--pm-sidebar-text)" }}
                >
                  {pacSel.primeiroNome} {pacSel.sobrenome}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[12px] transition-colors duration-300" style={{ color: "var(--pm-sidebar-muted)" }}>
                    CPF {pacSel.cpf}
                  </span>
                  {prontuario && (
                    <span className="text-[12px] transition-colors duration-300" style={{ color: "var(--pm-sidebar-muted)" }}>
                      · versão {prontuario.versao} · {prontuario.entradas.length} entrada{prontuario.entradas.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                disabled={loadingPro}
                className="flex items-center gap-1.5 px-4 py-2 text-white text-[13px] font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "var(--pm-green)" }}
              >
                <Plus size={14} strokeWidth={2} />
                Adicionar Entrada
              </button>
            </header>

            {/* Entradas */}
            <div className="flex-1 overflow-y-auto px-8 py-7">
              {loadingPro ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-pm-line p-5 animate-pulse space-y-3">
                      <div className="h-4 w-40 rounded-full bg-pm-surface" />
                      <div className="h-3 w-full rounded-full bg-pm-surface" />
                      <div className="h-3 w-3/4 rounded-full bg-pm-surface" />
                    </div>
                  ))}
                </div>
              ) : !prontuario || prontuario.entradas.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-[14px] font-medium text-pm-text">Prontuário sem entradas</p>
                  <p className="text-[13px] text-pm-muted mt-1.5 mb-5">
                    Adicione a primeira entrada clínica para este paciente.
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-5 py-2.5 text-[13px] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "var(--pm-green)" }}
                  >
                    Adicionar Entrada
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {prontuario.entradas.map(e => (
                    <EntradaCard key={e.id} entrada={e} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {showModal && pacSel && (
        <AdicionarEntradaModal
          onClose={() => setShowModal(false)}
          onSalvar={(p) => void handleAdicionarEntrada(p)}
        />
      )}
    </div>
  );
}

// ── Entrada Card ──────────────────────────────────────────────────────────────

function EntradaCard({ entrada: e }: { entrada: EntradaProntuarioDto }) {
  const [aberto, setAberto] = useState(true);
  const cfg = TIPO_CONFIG[e.tipo];
  const Icon = cfg.icon;

  return (
    <div className="bg-white rounded-2xl border border-pm-line shadow-subtle overflow-hidden">
      <button
        onClick={() => setAberto(v => !v)}
        className="w-full px-6 py-4 flex items-center gap-3 hover:bg-pm-surface transition-colors"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
          <Icon size={14} className={cfg.color} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-[13px] font-semibold text-pm-text">{cfg.label}</p>
          <p className="text-[11.5px] text-pm-faint">{formatDateTime(e.ocorreuEm)}</p>
        </div>
        {aberto ? <ChevronUp size={14} className="text-pm-faint" /> : <ChevronDown size={14} className="text-pm-faint" />}
      </button>

      {aberto && (
        <div className="px-6 pb-5 border-t border-pm-line">
          <p className="text-[13px] text-pm-text leading-relaxed whitespace-pre-wrap pt-4">
            {e.conteudo}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Modal Adicionar Entrada ───────────────────────────────────────────────────

function AdicionarEntradaModal({
  onClose,
  onSalvar,
}: {
  onClose: () => void;
  onSalvar: (p: AdicionarEntradaPayload) => void;
}) {
  const [tipo,     setTipo]     = useState<TipoEntrada>("NotaConsulta");
  const [conteudo, setConteudo] = useState("");
  const [erro,     setErro]     = useState("");

  function handleSubmit() {
    setErro("");
    if (conteudo.trim().length < 3) {
      setErro("O conteúdo deve ter pelo menos 3 caracteres.");
      return;
    }
    onSalvar({ tipoEntrada: tipo, conteudo: conteudo.trim() });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl border border-pm-line shadow-card w-full max-w-lg mx-4">

        <div className="px-7 py-5 border-b border-pm-line flex items-center justify-between">
          <div>
            <p className="text-[15px] font-semibold text-pm-text">Nova Entrada</p>
            <p className="text-[12px] text-pm-muted mt-0.5">Registre uma ocorrência no prontuário</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-pm-faint hover:bg-pm-surface transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-7 py-6 space-y-4">

          {/* Tipo */}
          <div>
            <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-2">
              Tipo de Entrada
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS.map(t => {
                const cfg = TIPO_CONFIG[t];
                const Icon = cfg.icon;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors ${
                      tipo === t
                        ? "border-pm-green bg-pm-green-soft"
                        : "border-pm-line bg-pm-surface hover:border-pm-green"
                    }`}
                  >
                    <Icon size={13} className={tipo === t ? "text-pm-green" : "text-pm-faint"} />
                    <span className={`text-[12px] font-medium ${tipo === t ? "text-pm-green" : "text-pm-muted"}`}>
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conteúdo */}
          <div>
            <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">
              Conteúdo
            </label>
            <textarea
              value={conteudo}
              onChange={e => setConteudo(e.target.value)}
              rows={5}
              placeholder={`Descreva ${TIPO_CONFIG[tipo].label.toLowerCase()}...`}
              className="w-full px-3 py-2.5 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text placeholder:text-pm-faint focus:outline-none focus:border-pm-green transition-colors resize-none leading-relaxed"
            />
          </div>

          {erro && (
            <div className="flex items-center gap-2 text-rose-500">
              <AlertCircle size={13} />
              <p className="text-[12px]">{erro}</p>
            </div>
          )}
        </div>

        <div className="px-7 py-4 border-t border-pm-line flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-pm-muted border border-pm-line rounded-xl hover:bg-pm-surface transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-[13px] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--pm-green)" }}
          >
            Salvar Entrada
          </button>
        </div>
      </div>
    </div>
  );
}
