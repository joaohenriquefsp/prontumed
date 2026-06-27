"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search, User, Calendar, Clock, FileText,
  CheckCircle2, X, AlertCircle, ChevronRight, Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { bff, ApiError } from "@/lib/api";
import type { PacienteResumoDto, PacienteListResponse, UsuarioDto, SlotDisponivel, DisponibilidadeResponse } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function initiais(nome: string, sob: string) {
  return `${nome[0]}${sob[0]}`.toUpperCase();
}

function formatCpf(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatData(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function slotParaHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface FormState {
  paciente: PacienteResumoDto | null;
  medico: UsuarioDto | null;
  data: string;           // YYYY-MM-DD
  slot: string | null;    // HH:mm
  observacoes: string;
}

const FORM_VAZIO: FormState = {
  paciente: null,
  medico: null,
  data: "",
  slot: null,
  observacoes: "",
};

// ── Página ────────────────────────────────────────────────────────────────────

export default function AgendarPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(FORM_VAZIO);
  const [buscaPac, setBuscaPac] = useState("");

  const [pacientes, setPacientes] = useState<PacienteResumoDto[]>([]);
  const [medicos, setMedicos] = useState<UsuarioDto[]>([]);
  const [slots, setSlots] = useState<SlotDisponivel[]>([]);

  const [loadingPac, setLoadingPac] = useState(true);
  const [loadingMed, setLoadingMed] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [semPermissaoMedico, setSemPermissaoMedico] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Carga inicial
  useEffect(() => {
    bff<PacienteListResponse>("/pacientes")
      .then((r) => setPacientes(r.itens))
      .catch(() => setPacientes([]))
      .finally(() => setLoadingPac(false));

    bff<UsuarioDto[]>("/usuarios")
      .then((all) => setMedicos(all.filter((u) => u.perfil === "Doctor" && u.ativo)))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) setSemPermissaoMedico(true);
        setMedicos([]);
      })
      .finally(() => setLoadingMed(false));
  }, []);

  // Busca slots ao mudar médico ou data
  useEffect(() => {
    if (!form.medico || !form.data) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setSlots([]);
    setForm((prev) => ({ ...prev, slot: null }));

    bff<DisponibilidadeResponse>(`/disponibilidade?idMedico=${form.medico.id}&data=${form.data}`)
      .then((r) => setSlots(r.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [form.medico?.id, form.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const pacFiltrados = useMemo(() => {
    if (!buscaPac.trim()) return pacientes;
    const q = buscaPac.toLowerCase();
    return pacientes.filter(
      (p) =>
        `${p.primeiroNome} ${p.sobrenome}`.toLowerCase().includes(q) ||
        p.cpf.includes(q.replace(/\D/g, ""))
    );
  }, [pacientes, buscaPac]);

  const pronto = !!(form.paciente && form.medico && form.data && form.slot);
  const hoje = new Date().toISOString().split("T")[0];

  async function handleSubmit() {
    if (!pronto) return;
    setSubmitting(true);
    setErro(null);

    try {
      await bff("/consultas", {
        method: "POST",
        body: JSON.stringify({
          idPaciente: form.paciente!.id,
          idMedico: form.medico!.id,
          agendadoPara: form.slot!,
          duracaoMinutos: 30,
          observacoes: form.observacoes.trim() || undefined,
        }),
      });
      setSucesso(true);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro ao agendar consulta.");
    } finally {
      setSubmitting(false);
    }
  }

  function reiniciar() {
    setForm(FORM_VAZIO);
    setBuscaPac("");
    setSucesso(false);
    setErro(null);
  }

  if (sucesso) {
    return (
      <TelaSuccesso
        form={form}
        onNovo={reiniciar}
        onVoltar={() => router.push("/agenda")}
      />
    );
  }

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
            Agendar Consulta
          </h1>
          <p
            className="text-[13px] mt-1.5 transition-colors duration-300"
            style={{ color: "var(--pm-sidebar-muted)" }}
          >
            Preencha os campos abaixo para criar um novo agendamento
          </p>
        </div>
        <button
          onClick={() => router.push("/agenda")}
          className="flex items-center gap-1.5 px-4 py-2 text-[13px] text-pm-muted hover:text-pm-text border border-pm-line rounded-full bg-white transition-colors"
        >
          Voltar à Agenda
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8">
        <div className="max-w-[900px] mx-auto grid grid-cols-[1fr_280px] gap-8 items-start">

          {/* ─── Formulário ─────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Passo 1 — Paciente */}
            <Passo numero={1} titulo="Paciente" ativo>
              {form.paciente ? (
                <CartaoPaciente
                  paciente={form.paciente}
                  onRemover={() =>
                    setForm((prev) => ({
                      ...prev,
                      paciente: null,
                      medico: null,
                      data: "",
                      slot: null,
                    }))
                  }
                />
              ) : (
                <>
                  <div className="relative mb-3">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-pm-faint" />
                    <input
                      placeholder="Buscar por nome ou CPF..."
                      value={buscaPac}
                      onChange={(e) => setBuscaPac(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-pm-surface border border-pm-line rounded-xl placeholder:text-pm-faint text-pm-text focus:outline-none focus:border-pm-green transition-colors"
                    />
                  </div>
                  <div className="max-h-[240px] overflow-y-auto rounded-xl border border-pm-line bg-white divide-y divide-pm-line">
                    {loadingPac ? (
                      <SkeletonLista linhas={4} />
                    ) : pacFiltrados.length === 0 ? (
                      <p className="px-4 py-8 text-center text-[13px] text-pm-muted">
                        {buscaPac
                          ? `Nenhum paciente encontrado para "${buscaPac}"`
                          : "Nenhum paciente cadastrado"}
                      </p>
                    ) : (
                      pacFiltrados.slice(0, 20).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setForm((prev) => ({ ...prev, paciente: p }))}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-pm-surface transition-colors text-left"
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                            style={{
                              backgroundColor: "var(--pm-green-soft)",
                              color: "var(--pm-green)",
                            }}
                          >
                            {initiais(p.primeiroNome, p.sobrenome)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-pm-text truncate">
                              {p.primeiroNome} {p.sobrenome}
                            </p>
                            <p className="text-[11.5px] text-pm-faint">{formatCpf(p.cpf)}</p>
                          </div>
                          <ChevronRight size={13} className="text-pm-faint flex-shrink-0" />
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </Passo>

            {/* Passo 2 — Médico e Data */}
            <Passo numero={2} titulo="Médico e Data" ativo={!!form.paciente}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11.5px] font-medium text-pm-muted mb-1.5">
                    Médico
                  </label>
                  {semPermissaoMedico ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                      <AlertCircle size={13} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-[12px] text-amber-700">
                        Seu perfil não tem permissão para listar médicos. Contate um administrador.
                      </p>
                    </div>
                  ) : (
                    <select
                      disabled={!form.paciente || loadingMed}
                      value={form.medico?.id ?? ""}
                      onChange={(e) => {
                        const med = medicos.find((m) => m.id === e.target.value) ?? null;
                        setForm((prev) => ({ ...prev, medico: med, slot: null }));
                      }}
                      className="w-full px-3 py-2.5 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text focus:outline-none focus:border-pm-green disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <option value="">
                        {loadingMed
                          ? "Carregando..."
                          : medicos.length === 0
                          ? "Nenhum médico ativo"
                          : "Selecione um médico"}
                      </option>
                      {medicos.map((m) => (
                        <option key={m.id} value={m.id}>
                          Dr(a). {m.primeiroNome} {m.sobrenome}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[11.5px] font-medium text-pm-muted mb-1.5">
                    Data
                  </label>
                  <input
                    type="date"
                    min={hoje}
                    disabled={!form.paciente}
                    value={form.data}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, data: e.target.value, slot: null }))
                    }
                    className="w-full px-3 py-2.5 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text focus:outline-none focus:border-pm-green disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  />
                </div>
              </div>
            </Passo>

            {/* Passo 3 — Horário */}
            <Passo numero={3} titulo="Horário" ativo={!!(form.medico && form.data)}>
              {!form.medico || !form.data ? (
                <p className="text-[13px] text-pm-faint">
                  Selecione um médico e uma data para ver os horários disponíveis.
                </p>
              ) : loadingSlots ? (
                <div className="flex items-center gap-2 text-[13px] text-pm-muted py-2">
                  <Loader2 size={14} className="animate-spin" />
                  Buscando horários disponíveis...
                </div>
              ) : slots.length === 0 ? (
                <p className="text-[13px] text-pm-muted">
                  Nenhum horário disponível para esta data.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => {
                      const hora = slotParaHora(s.inicio);
                      return (
                      <button
                        key={s.inicio}
                        onClick={() => setForm((prev) => ({ ...prev, slot: s.inicio }))}
                        className={`px-4 py-2 text-[13px] rounded-xl border font-medium transition-all ${
                          form.slot === s.inicio
                            ? "text-white border-transparent"
                            : "bg-white border-pm-line text-pm-text hover:border-pm-green"
                        }`}
                        style={
                          form.slot === s.inicio
                            ? { backgroundColor: "var(--pm-green)" }
                            : {}
                        }
                      >
                        {hora}
                      </button>
                      );
                    })}
                </div>
              )}
            </Passo>

            {/* Passo 4 — Observações (opcional) */}
            <Passo numero={4} titulo="Observações" ativo={!!form.slot} opcional>
              <textarea
                disabled={!form.slot}
                value={form.observacoes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, observacoes: e.target.value }))
                }
                placeholder="Motivo da consulta, histórico relevante, informações adicionais..."
                rows={4}
                className="w-full px-3 py-2.5 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text placeholder:text-pm-faint focus:outline-none focus:border-pm-green resize-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              />
            </Passo>

            {/* Erro */}
            {erro && (
              <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-red-700">{erro}</p>
              </div>
            )}

            {/* Botão principal */}
            <button
              disabled={!pronto || submitting}
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--pm-green)" }}
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Agendando...
                </>
              ) : (
                "Confirmar Agendamento"
              )}
            </button>
          </div>

          {/* ─── Painel de resumo ────────────────────────────────────────── */}
          <div className="sticky top-0">
            <div className="bg-white rounded-2xl border border-pm-line shadow-subtle p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-pm-faint mb-5">
                Resumo
              </p>

              <div className="space-y-4">
                <ResumoItem
                  icon={<User size={13} />}
                  label="Paciente"
                  valor={
                    form.paciente
                      ? `${form.paciente.primeiroNome} ${form.paciente.sobrenome}`
                      : null
                  }
                />
                <ResumoItem
                  icon={<User size={13} />}
                  label="Médico"
                  valor={
                    form.medico
                      ? `Dr(a). ${form.medico.primeiroNome} ${form.medico.sobrenome}`
                      : null
                  }
                />
                <ResumoItem
                  icon={<Calendar size={13} />}
                  label="Data"
                  valor={form.data ? formatData(form.data) : null}
                />
                <ResumoItem
                  icon={<Clock size={13} />}
                  label="Horário"
                  valor={form.slot ? slotParaHora(form.slot) : null}
                />
                {form.observacoes.trim() && (
                  <ResumoItem
                    icon={<FileText size={13} />}
                    label="Observações"
                    valor={form.observacoes.trim()}
                  />
                )}
              </div>

              {pronto && (
                <div className="mt-6 pt-5 border-t border-pm-line">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-700">
                    <CheckCircle2 size={13} className="flex-shrink-0" />
                    Pronto para agendar
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Tela de sucesso ───────────────────────────────────────────────────────────

function TelaSuccesso({
  form,
  onNovo,
  onVoltar,
}: {
  form: FormState;
  onNovo: () => void;
  onVoltar: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center bg-pm-warm p-10">
      <div className="bg-white rounded-3xl border border-pm-line shadow-card p-10 max-w-[400px] w-full text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "var(--pm-green-soft)" }}
        >
          <CheckCircle2 size={28} style={{ color: "var(--pm-green)" }} />
        </div>

        <h2 className="text-[20px] font-bold text-pm-text tracking-tight">
          Consulta Agendada!
        </h2>
        <p className="text-[13px] text-pm-muted mt-1.5 mb-8">
          O agendamento foi registrado com sucesso.
        </p>

        <div className="text-left space-y-3.5 bg-pm-surface rounded-2xl p-5 mb-8">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-pm-faint">
              Paciente
            </p>
            <p className="text-[14px] font-semibold text-pm-text mt-0.5">
              {form.paciente?.primeiroNome} {form.paciente?.sobrenome}
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-pm-faint">
              Médico
            </p>
            <p className="text-[14px] font-semibold text-pm-text mt-0.5">
              Dr(a). {form.medico?.primeiroNome} {form.medico?.sobrenome}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wide text-pm-faint">
                Data
              </p>
              <p className="text-[14px] font-semibold text-pm-text mt-0.5">
                {form.data ? formatData(form.data) : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wide text-pm-faint">
                Horário
              </p>
              <p className="text-[14px] font-semibold text-pm-text mt-0.5">
                {form.slot ? slotParaHora(form.slot) : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onVoltar}
            className="flex-1 py-2.5 text-[13px] font-medium text-pm-muted border border-pm-line rounded-xl hover:text-pm-text transition-colors"
          >
            Ver Agenda
          </button>
          <button
            onClick={onNovo}
            className="flex-1 py-2.5 text-[13px] font-semibold text-white rounded-xl transition-colors"
            style={{ backgroundColor: "var(--pm-green)" }}
          >
            Novo Agendamento
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function Passo({
  numero,
  titulo,
  ativo,
  opcional,
  children,
}: {
  numero: number;
  titulo: string;
  ativo: boolean;
  opcional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-pm-line shadow-subtle p-6 transition-opacity duration-200 ${
        ativo ? "opacity-100" : "opacity-50 pointer-events-none select-none"
      }`}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-colors duration-300"
          style={
            ativo
              ? { backgroundColor: "var(--pm-green)", color: "#fff" }
              : { backgroundColor: "var(--pm-green-soft)", color: "var(--pm-green)" }
          }
        >
          {numero}
        </div>
        <p className="text-[14px] font-semibold text-pm-text">{titulo}</p>
        {opcional && (
          <span className="text-[11px] text-pm-faint bg-pm-surface px-2 py-0.5 rounded-full">
            opcional
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function CartaoPaciente({
  paciente: p,
  onRemover,
}: {
  paciente: PacienteResumoDto;
  onRemover: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border-2 transition-colors"
      style={{ borderColor: "var(--pm-green)", backgroundColor: "var(--pm-green-subtle)" }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0"
        style={{ backgroundColor: "var(--pm-green-soft)", color: "var(--pm-green)" }}
      >
        {initiais(p.primeiroNome, p.sobrenome)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-pm-text">
          {p.primeiroNome} {p.sobrenome}
        </p>
        <p className="text-[11.5px] text-pm-muted">{formatCpf(p.cpf)}</p>
      </div>
      <button
        onClick={onRemover}
        className="p-1.5 rounded-lg text-pm-faint hover:text-pm-text hover:bg-white transition-colors"
        title="Remover paciente"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function ResumoItem({
  icon,
  label,
  valor,
}: {
  icon: React.ReactNode;
  label: string;
  valor: string | null;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 text-pm-faint flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-pm-faint">
          {label}
        </p>
        <p
          className={`text-[13px] mt-0.5 break-words ${
            valor ? "text-pm-text font-medium" : "text-pm-faint"
          }`}
        >
          {valor ?? "—"}
        </p>
      </div>
    </div>
  );
}

function SkeletonLista({ linhas }: { linhas: number }) {
  return (
    <div className="divide-y divide-pm-line">
      {Array.from({ length: linhas }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-pm-surface animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-32 rounded-full bg-pm-surface animate-pulse" />
            <div className="h-2.5 w-20 rounded-full bg-pm-surface animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
