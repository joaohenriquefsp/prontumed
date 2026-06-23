"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Clock, Calendar } from "lucide-react";
import { bff } from "@/lib/api";
import type { GradeHorarioDto, CriarGradeHorarioPayload, UsuarioDto } from "@/lib/types";

// ── Constantes ────────────────────────────────────────────────────────────────

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DIAS_FULL = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const DIAS_SEMANA = [1, 2, 3, 4, 5]; // segunda a sexta por padrão

// ── Helpers ───────────────────────────────────────────────────────────────────

function slotsCount(horaInicio: string, horaFim: string, duracao: number) {
  const [hI, mI] = horaInicio.split(":").map(Number);
  const [hF, mF] = horaFim.split(":").map(Number);
  const totalMin = (hF * 60 + mF) - (hI * 60 + mI);
  return Math.floor(totalMin / duracao);
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function GradePage() {
  const [medicos, setMedicos]     = useState<UsuarioDto[]>([]);
  const [idMedico, setIdMedico]   = useState<string>("");
  const [grade, setGrade]         = useState<GradeHorarioDto[]>([]);
  const [loading, setLoading]     = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Carrega médicos ao montar
  useEffect(() => {
    bff<UsuarioDto[]>("/usuarios")
      .then(u => {
        const drs = u.filter(x => x.perfil === "Doctor");
        setMedicos(drs);
        if (drs.length > 0) setIdMedico(drs[0].id);
      })
      .catch(() => {});
  }, []);

  // Carrega grade quando médico muda
  useEffect(() => {
    if (!idMedico) return;
    setLoading(true);
    bff<GradeHorarioDto[]>(`/grade-horarios?idMedico=${idMedico}`)
      .then(setGrade)
      .catch(() => setGrade([]))
      .finally(() => setLoading(false));
  }, [idMedico]);

  function handleExcluir(id: string) {
    setGrade(prev => prev.filter(g => g.id !== id));
  }

  function handleCriar(payload: CriarGradeHorarioPayload) {
    const nova: GradeHorarioDto = {
      id: `mock-${Date.now()}`,
      idMedico: payload.idMedico,
      diaSemana: payload.diaSemana,
      horarioInicio: payload.horaInicio,
      horarioFim: payload.horaFim,
      duracaoSlotMinutos: payload.duracaoMinutos,
      ativo: true,
      criadoEm: new Date().toISOString(),
    };
    setGrade(prev => [...prev, nova]);
    setShowModal(false);
  }

  const medicoSelecionado = medicos.find(m => m.id === idMedico);
  const totalSlots = grade.reduce((acc, g) => {
    if (!g.ativo) return acc;
    return acc + slotsCount(g.horarioInicio, g.horarioFim, g.duracaoSlotMinutos);
  }, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-pm-warm">

      {/* Header */}
      <header
        className="px-10 pt-8 pb-6 border-b flex items-start justify-between flex-shrink-0 transition-colors duration-300"
        style={{ backgroundColor: "var(--pm-sidebar-bg)", borderBottomColor: "var(--pm-sidebar-border)" }}
      >
        <div>
          <h1
            className="text-[22px] font-semibold tracking-tight leading-none transition-colors duration-300"
            style={{ color: "var(--pm-sidebar-text)" }}
          >
            Grade Horária
          </h1>
          <p className="text-[13px] mt-1.5 transition-colors duration-300" style={{ color: "var(--pm-sidebar-muted)" }}>
            Configure os horários de atendimento dos médicos
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Seletor de médico */}
          <select
            value={idMedico}
            onChange={e => setIdMedico(e.target.value)}
            className="px-3 py-2 text-[13px] bg-white border border-pm-line rounded-xl text-pm-text focus:outline-none focus:border-pm-green transition-colors"
          >
            {medicos.map(m => (
              <option key={m.id} value={m.id}>
                Dr(a). {m.primeiroNome} {m.sobrenome}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-white text-[13px] font-medium rounded-full hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--pm-green)" }}
          >
            <Plus size={14} strokeWidth={2} />
            Novo Horário
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Faixas cadastradas",  value: grade.length,                              sub: "períodos de atendimento",     icon: Calendar },
            { label: "Faixas ativas",        value: grade.filter(g => g.ativo).length,         sub: "disponíveis para agendamento", icon: Clock    },
            { label: "Slots semanais",       value: totalSlots,                               sub: "consultas possíveis por semana", icon: Clock   },
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

        {/* Grade visual por dia */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-pm-line shadow-subtle p-10 text-center">
            <p className="text-[13px] text-pm-faint">Carregando grade...</p>
          </div>
        ) : grade.length === 0 ? (
          <EmptyState onAdicionar={() => setShowModal(true)} />
        ) : (
          <div className="space-y-4">
            {DIAS_SEMANA.map(dia => {
              const faixas = grade.filter(g => g.diaSemana === dia);
              return (
                <div key={dia} className="bg-white rounded-2xl border border-pm-line shadow-subtle overflow-hidden">
                  <div className="px-6 py-3 border-b border-pm-line flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-semibold"
                      style={{ backgroundColor: "var(--pm-green-soft)", color: "var(--pm-green)" }}
                    >
                      {DIAS[dia]}
                    </div>
                    <p className="text-[13px] font-semibold text-pm-text">{DIAS_FULL[dia]}</p>
                    <span className="ml-auto text-[12px] text-pm-faint">
                      {faixas.length === 0 ? "Sem atendimento" : `${faixas.length} faixa${faixas.length > 1 ? "s" : ""}`}
                    </span>
                  </div>

                  {faixas.length === 0 ? (
                    <div className="px-6 py-4 text-[12.5px] text-pm-faint italic">
                      Nenhum horário configurado para este dia.
                    </div>
                  ) : (
                    <div className="divide-y divide-pm-line">
                      {faixas.map(f => (
                        <FaixaRow key={f.id} faixa={f} onExcluir={handleExcluir} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Fins de semana se houver */}
            {[0, 6].map(dia => {
              const faixas = grade.filter(g => g.diaSemana === dia);
              if (faixas.length === 0) return null;
              return (
                <div key={dia} className="bg-white rounded-2xl border border-pm-line shadow-subtle overflow-hidden">
                  <div className="px-6 py-3 border-b border-pm-line flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-semibold bg-amber-50 text-amber-600">
                      {DIAS[dia]}
                    </div>
                    <p className="text-[13px] font-semibold text-pm-text">{DIAS_FULL[dia]}</p>
                  </div>
                  <div className="divide-y divide-pm-line">
                    {faixas.map(f => (
                      <FaixaRow key={f.id} faixa={f} onExcluir={handleExcluir} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <NovoHorarioModal
          medicos={medicos}
          idMedicoInicial={idMedico}
          onClose={() => setShowModal(false)}
          onSalvar={handleCriar}
        />
      )}
    </div>
  );
}

// ── Faixa Row ─────────────────────────────────────────────────────────────────

function FaixaRow({ faixa: f, onExcluir }: { faixa: GradeHorarioDto; onExcluir: (id: string) => void }) {
  const slots = slotsCount(f.horarioInicio, f.horarioFim, f.duracaoSlotMinutos);
  return (
    <div className="px-6 py-3 flex items-center gap-6 hover:bg-pm-surface transition-colors group">
      <div className="flex items-center gap-2 w-40">
        <Clock size={13} className="text-pm-faint flex-shrink-0" />
        <span className="text-[13px] font-mono-data text-pm-text">
          {f.horarioInicio} – {f.horarioFim}
        </span>
      </div>
      <span className="text-[12.5px] text-pm-muted">{f.duracaoSlotMinutos} min/slot</span>
      <span className="text-[12.5px] text-pm-faint">{slots} slots</span>
      <span className={`ml-auto inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
        f.ativo ? "bg-emerald-50 text-emerald-700" : "bg-pm-surface text-pm-faint"
      }`}>
        {f.ativo ? "Ativo" : "Inativo"}
      </span>
      <button
        onClick={() => onExcluir(f.id)}
        className="p-1.5 rounded-lg text-pm-faint hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function NovoHorarioModal({
  medicos,
  idMedicoInicial,
  onClose,
  onSalvar,
}: {
  medicos: UsuarioDto[];
  idMedicoInicial: string;
  onClose: () => void;
  onSalvar: (p: CriarGradeHorarioPayload) => void;
}) {
  const [idMedico,   setIdMedico]   = useState(idMedicoInicial);
  const [diaSemana,  setDiaSemana]  = useState(1);
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFim,    setHoraFim]    = useState("12:00");
  const [duracao,    setDuracao]    = useState(30);
  const [erro,       setErro]       = useState("");

  function handleSubmit() {
    setErro("");
    if (!horaInicio || !horaFim) { setErro("Informe horário de início e fim."); return; }
    const [hI, mI] = horaInicio.split(":").map(Number);
    const [hF, mF] = horaFim.split(":").map(Number);
    if (hF * 60 + mF <= hI * 60 + mI) { setErro("Horário de fim deve ser após o início."); return; }
    if (duracao < 10) { setErro("Duração mínima é 10 minutos."); return; }
    onSalvar({ idMedico, diaSemana, horaInicio, horaFim, duracaoMinutos: duracao });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl border border-pm-line shadow-card w-full max-w-md mx-4">

        <div className="px-7 py-5 border-b border-pm-line">
          <p className="text-[15px] font-semibold text-pm-text">Novo Horário</p>
          <p className="text-[12px] text-pm-muted mt-0.5">Adicione uma faixa de atendimento</p>
        </div>

        <div className="px-7 py-6 space-y-4">

          <div>
            <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">Médico</label>
            <select
              value={idMedico}
              onChange={e => setIdMedico(e.target.value)}
              className="w-full px-3 py-2.5 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text focus:outline-none focus:border-pm-green transition-colors"
            >
              {medicos.map(m => (
                <option key={m.id} value={m.id}>{m.primeiroNome} {m.sobrenome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">Dia da Semana</label>
            <div className="grid grid-cols-7 gap-1">
              {DIAS.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDiaSemana(i)}
                  className={`py-2 rounded-lg text-[12px] font-medium transition-colors ${
                    diaSemana === i
                      ? "text-white"
                      : "bg-pm-surface text-pm-muted hover:text-pm-text"
                  }`}
                  style={diaSemana === i ? { backgroundColor: "var(--pm-green)" } : {}}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">Início</label>
              <input
                type="time"
                value={horaInicio}
                onChange={e => setHoraInicio(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text focus:outline-none focus:border-pm-green transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">Fim</label>
              <input
                type="time"
                value={horaFim}
                onChange={e => setHoraFim(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text focus:outline-none focus:border-pm-green transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">
              Duração do slot (minutos)
            </label>
            <div className="flex gap-2">
              {[15, 20, 30, 45, 60].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuracao(d)}
                  className={`flex-1 py-2 rounded-xl text-[12.5px] font-medium border transition-colors ${
                    duracao === d
                      ? "border-pm-green text-pm-green"
                      : "border-pm-line bg-pm-surface text-pm-muted hover:border-pm-green hover:text-pm-green"
                  }`}
                  style={duracao === d ? { backgroundColor: "var(--pm-green-soft)" } : {}}
                >
                  {d}min
                </button>
              ))}
            </div>
          </div>

          {erro && <p className="text-[12px] text-rose-500">{erro}</p>}
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
            Salvar Horário
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onAdicionar }: { onAdicionar: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-pm-line shadow-subtle px-6 py-16 text-center">
      <p className="text-[14px] font-medium text-pm-text">Nenhum horário cadastrado</p>
      <p className="text-[13px] text-pm-muted mt-1.5 mb-5">
        Configure as faixas de atendimento para este médico.
      </p>
      <button
        onClick={onAdicionar}
        className="px-5 py-2.5 text-[13px] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
        style={{ backgroundColor: "var(--pm-green)" }}
      >
        Adicionar Horário
      </button>
    </div>
  );
}
