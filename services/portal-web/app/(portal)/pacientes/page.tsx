"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, UserPlus, X } from "lucide-react";
import { bff } from "@/lib/api";
import { toast } from "@/lib/toast-store";
import { useUser } from "@/components/providers/user-provider";
import type { PacienteResumoDto, CriarPacientePayload } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCpf(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

function calcAge(iso: string) {
  const birth = new Date(iso);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function initials(p: PacienteResumoDto) {
  return `${p.primeiroNome[0]}${p.sobrenome[0]}`.toUpperCase();
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function PacientesPage() {
  const { user }                        = useUser();
  const [pacientes, setPacientes]       = useState<PacienteResumoDto[]>([]);
  const [loading, setLoading]           = useState(true);
  const [busca, setBusca]               = useState("");
  const [showModal, setShowModal]       = useState(false);

  useEffect(() => {
    bff<PacienteResumoDto[]>("/pacientes")
      .then(setPacientes)
      .catch(() => setPacientes([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleCriar(payload: CriarPacientePayload) {
    try {
      const novo = await bff<PacienteResumoDto>("/pacientes", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setPacientes((prev) => [novo, ...prev]);
      setShowModal(false);
      toast({ title: "Paciente cadastrado", variant: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao cadastrar paciente.";
      toast({ title: msg, variant: "error" });
    }
  }

  async function handleDesativar(id: string) {
    try {
      await bff(`/pacientes/${id}/desativar`, { method: "PATCH" });
      setPacientes((prev) => prev.map((p) => (p.id === id ? { ...p, ativo: false } : p)));
      toast({ title: "Paciente desativado", variant: "warning" });
    } catch {
      toast({ title: "Erro ao desativar paciente", variant: "error" });
    }
  }

  const filtrados = useMemo(() => {
    if (!busca.trim()) return pacientes;
    const q = busca.toLowerCase();
    return pacientes.filter(
      (p) =>
        `${p.primeiroNome} ${p.sobrenome}`.toLowerCase().includes(q) ||
        p.cpf.includes(q.replace(/\D/g, ""))
    );
  }, [pacientes, busca]);

  const ativos   = pacientes.filter((p) => p.ativo).length;
  const inativos = pacientes.length - ativos;

  const podeGerenciar = user?.perfil === "Receptionist" || user?.perfil === "Admin";
  const podeDesativar = user?.perfil === "Admin";

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
            Pacientes
          </h1>
          <p className="text-[13px] mt-1.5 transition-colors duration-300" style={{ color: "var(--pm-sidebar-muted)" }}>
            {loading ? "Carregando..." : `${pacientes.length} pacientes cadastrados`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-pm-faint" />
            <input
              placeholder="Nome ou CPF..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 pr-4 py-2 text-[13px] bg-white border border-pm-line rounded-full w-[220px] placeholder:text-pm-faint text-pm-text focus:outline-none focus:border-pm-green transition-colors"
            />
          </div>
          {podeGerenciar && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-[13px] font-medium rounded-full transition-colors"
              style={{ backgroundColor: "var(--pm-green)" }}
            >
              <UserPlus size={14} strokeWidth={2} />
              Novo Paciente
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total cadastrado", value: pacientes.length, sub: "pacientes no sistema"   },
            { label: "Ativos",           value: ativos,           sub: "com cadastro ativo"      },
            { label: "Inativos",         value: inativos,         sub: "cadastros desativados"   },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-pm-line p-5 shadow-subtle">
              <p className="text-[11.5px] font-medium text-pm-faint uppercase tracking-wide">{s.label}</p>
              <p className="text-[32px] font-bold tracking-tight text-pm-text leading-none mt-2">
                {loading ? "—" : s.value}
              </p>
              <p className="text-[12px] text-pm-muted mt-1.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-pm-line shadow-subtle overflow-hidden">
          <div className="px-6 py-4 border-b border-pm-line grid grid-cols-[1fr_160px_120px_160px_100px_100px] gap-4 items-center">
            {["Paciente", "CPF", "Nascimento", "Telefone", "Status", ""].map((h) => (
              <p key={h} className="text-[11px] font-semibold uppercase tracking-[0.07em] text-pm-faint">{h}</p>
            ))}
          </div>

          {loading ? (
            <SkeletonRows />
          ) : filtrados.length === 0 ? (
            <EmptyState busca={busca} onAdicionar={podeGerenciar ? () => setShowModal(true) : undefined} />
          ) : (
            <div className="divide-y divide-pm-line">
              {filtrados.map((p) => (
                <PacienteRow
                  key={p.id}
                  paciente={p}
                  podeDesativar={podeDesativar}
                  onDesativar={() => void handleDesativar(p.id)}
                />
              ))}
            </div>
          )}
        </div>

        {!loading && filtrados.length > 0 && (
          <p className="text-[12px] text-pm-faint text-center mt-4">
            {busca ? `${filtrados.length} de ${pacientes.length} pacientes` : `${pacientes.length} pacientes`}
          </p>
        )}
      </div>

      {showModal && (
        <NovoPacienteModal onClose={() => setShowModal(false)} onSalvar={handleCriar} />
      )}
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function PacienteRow({
  paciente: p,
  podeDesativar,
  onDesativar,
}: {
  paciente: PacienteResumoDto;
  podeDesativar: boolean;
  onDesativar: () => void;
}) {
  const age = calcAge(p.dataNascimento);

  return (
    <div className="px-6 py-3.5 grid grid-cols-[1fr_160px_120px_160px_100px_100px] gap-4 items-center hover:bg-pm-surface transition-colors duration-100 group">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
          style={{ backgroundColor: "var(--pm-green-soft)", color: "var(--pm-green)" }}
        >
          {initials(p)}
        </div>
        <p className="text-[13px] font-medium text-pm-text truncate">{p.primeiroNome} {p.sobrenome}</p>
      </div>

      <p className="text-[13px] font-mono-data text-pm-muted">{formatCpf(p.cpf)}</p>

      <div>
        <p className="text-[13px] text-pm-text">{formatDate(p.dataNascimento)}</p>
        <p className="text-[11px] text-pm-faint">{age} anos</p>
      </div>

      <p className="text-[13px] text-pm-muted">{p.telefone}</p>

      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium w-fit ${
        p.ativo ? "bg-emerald-50 text-emerald-700" : "bg-pm-surface text-pm-faint"
      }`}>
        {p.ativo ? "Ativo" : "Inativo"}
      </span>

      <div className="flex justify-end">
        {podeDesativar && p.ativo ? (
          <button
            onClick={onDesativar}
            className="px-2.5 py-1 rounded-lg text-[11.5px] font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            Desativar
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ── Modal Novo Paciente ───────────────────────────────────────────────────────

function NovoPacienteModal({
  onClose,
  onSalvar,
}: {
  onClose: () => void;
  onSalvar: (p: CriarPacientePayload) => Promise<void>;
}) {
  const [form, setForm] = useState<CriarPacientePayload>({
    primeiroNome: "", sobrenome: "", cpf: "", dataNascimento: "",
    telefone: "", email: "", logradouro: "", cidade: "", uf: "", cep: "",
  });
  const [erro, setErro]       = useState("");
  const [saving, setSaving]   = useState(false);

  function set(key: keyof CriarPacientePayload, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setErro("");
    const { primeiroNome, sobrenome, cpf, dataNascimento, telefone, email, logradouro, cidade, uf, cep } = form;

    if (!primeiroNome || !sobrenome || !cpf || !dataNascimento || !telefone || !email) {
      setErro("Preencha todos os campos obrigatórios."); return;
    }
    if (!/^\d{11}$/.test(cpf)) { setErro("CPF deve ter 11 dígitos numéricos."); return; }
    if (!email.includes("@")) { setErro("Informe um e-mail válido."); return; }
    if (uf && uf.length !== 2) { setErro("UF deve ter 2 caracteres."); return; }
    if (cep && !/^\d{8}$/.test(cep)) { setErro("CEP deve ter 8 dígitos numéricos."); return; }

    setSaving(true);
    try {
      await onSalvar(form);
    } finally {
      setSaving(false);
    }
  }

  const field = (label: string, key: keyof CriarPacientePayload, opts?: { type?: string; placeholder?: string; required?: boolean }) => (
    <div>
      <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">
        {label}{(opts?.required ?? true) && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      <input
        type={opts?.type ?? "text"}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={opts?.placeholder ?? ""}
        className="w-full px-3 py-2.5 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text focus:outline-none focus:border-pm-green transition-colors"
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl border border-pm-line shadow-card w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden">

        <div className="px-7 py-5 border-b border-pm-line flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-[15px] font-semibold text-pm-text">Novo Paciente</p>
            <p className="text-[12px] text-pm-muted mt-0.5">Preencha os dados cadastrais</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-pm-faint hover:bg-pm-surface transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="px-7 py-6 space-y-4 overflow-y-auto">

          {/* Dados pessoais */}
          <p className="text-[11px] font-semibold text-pm-faint uppercase tracking-widest">Dados pessoais</p>
          <div className="grid grid-cols-2 gap-3">
            {field("Primeiro Nome", "primeiroNome", { placeholder: "Ex: Maria" })}
            {field("Sobrenome", "sobrenome", { placeholder: "Ex: Silva" })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field("CPF", "cpf", { placeholder: "11 dígitos sem pontuação" })}
            {field("Data de Nascimento", "dataNascimento", { type: "date" })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field("Telefone", "telefone", { placeholder: "(11) 99999-9999" })}
            {field("E-mail", "email", { type: "email", placeholder: "paciente@email.com" })}
          </div>

          {/* Endereço */}
          <p className="text-[11px] font-semibold text-pm-faint uppercase tracking-widest pt-2">Endereço</p>
          {field("Logradouro", "logradouro", { placeholder: "Rua, Av., etc.", required: false })}
          <div className="grid grid-cols-[1fr_80px_100px] gap-3">
            {field("Cidade", "cidade", { placeholder: "Cidade", required: false })}
            {field("UF", "uf", { placeholder: "SP", required: false })}
            {field("CEP", "cep", { placeholder: "8 dígitos", required: false })}
          </div>

          {erro && <p className="text-[12px] text-rose-500">{erro}</p>}
        </div>

        <div className="px-7 py-4 border-t border-pm-line flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-pm-muted border border-pm-line rounded-xl hover:bg-pm-surface transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={saving}
            className="px-4 py-2 text-[13px] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "var(--pm-green)" }}
          >
            {saving ? "Salvando..." : "Cadastrar Paciente"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Estados ───────────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div className="divide-y divide-pm-line">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="px-6 py-3.5 grid grid-cols-[1fr_160px_120px_160px_100px_100px] gap-4 items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-pm-surface animate-pulse" />
            <div className="h-3.5 w-36 rounded-full bg-pm-surface animate-pulse" />
          </div>
          <div className="h-3.5 w-28 rounded-full bg-pm-surface animate-pulse" />
          <div className="h-3.5 w-20 rounded-full bg-pm-surface animate-pulse" />
          <div className="h-3.5 w-32 rounded-full bg-pm-surface animate-pulse" />
          <div className="h-5 w-12 rounded-full bg-pm-surface animate-pulse" />
          <div />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ busca, onAdicionar }: { busca: string; onAdicionar?: () => void }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="text-[14px] font-medium text-pm-text">
        {busca ? `Nenhum paciente encontrado para "${busca}"` : "Nenhum paciente cadastrado"}
      </p>
      <p className="text-[13px] text-pm-muted mt-1.5 mb-5">
        {busca ? "Tente buscar pelo nome completo ou CPF sem pontuação." : "Cadastre o primeiro paciente clicando abaixo."}
      </p>
      {!busca && onAdicionar && (
        <button
          onClick={onAdicionar}
          className="px-5 py-2.5 text-[13px] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--pm-green)" }}
        >
          Novo Paciente
        </button>
      )}
    </div>
  );
}
