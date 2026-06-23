"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, UserPlus, X, Eye, EyeOff, CheckCircle2, Users, Shield, ChevronRight } from "lucide-react";
import { bff } from "@/lib/api";
import type { UsuarioDto, CriarUsuarioPayload, Perfil } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

const perfilLabel: Record<Perfil, string> = {
  Doctor:       "Médico",
  Receptionist: "Recepcionista",
  Admin:        "Administrador",
  Patient:      "Paciente",
};

const perfilBadge: Record<Perfil, string> = {
  Doctor:       "bg-blue-50 text-blue-600",
  Receptionist: "bg-violet-50 text-violet-600",
  Admin:        "bg-amber-50 text-amber-600",
  Patient:      "bg-emerald-50 text-emerald-700",
};

function getInitials(u: UsuarioDto) {
  return `${u.primeiroNome[0]}${u.sobrenome[0]}`.toUpperCase();
}

const PERFIS: Perfil[] = ["Doctor", "Receptionist", "Admin", "Patient"];

// ── Página ────────────────────────────────────────────────────────────────────

export default function UsuariosPage() {
  const [usuarios, setUsuarios]     = useState<UsuarioDto[]>([]);
  const [loading, setLoading]       = useState(true);
  const [busca, setBusca]           = useState("");
  const [showModal, setShowModal]   = useState(false);

  useEffect(() => {
    bff<UsuarioDto[]>("/usuarios")
      .then(setUsuarios)
      .catch(() => setUsuarios([]))
      .finally(() => setLoading(false));
  }, []);

  function handleDesativar(id: string) {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ativo: false } : u));
  }

  function handleCriar(payload: CriarUsuarioPayload) {
    const novo: UsuarioDto = {
      id: `mock-${Date.now()}`,
      email: payload.email,
      primeiroNome: payload.primeiroNome,
      sobrenome: payload.sobrenome,
      perfil: payload.perfil,
      ativo: true,
    };
    setUsuarios(prev => [novo, ...prev]);
    setShowModal(false);
  }

  const filtrados = useMemo(() => {
    if (!busca.trim()) return usuarios;
    const q = busca.toLowerCase();
    return usuarios.filter(u =>
      `${u.primeiroNome} ${u.sobrenome}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }, [usuarios, busca]);

  const medicos        = usuarios.filter(u => u.perfil === "Doctor").length;
  const recepcionistas = usuarios.filter(u => u.perfil === "Receptionist").length;
  const ativos         = usuarios.filter(u => u.ativo).length;

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
            Usuários
          </h1>
          <p className="text-[13px] mt-1.5 transition-colors duration-300" style={{ color: "var(--pm-sidebar-muted)" }}>
            {loading ? "Carregando..." : `${usuarios.length} usuários cadastrados`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-pm-faint" />
            <input
              placeholder="Nome ou e-mail..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="pl-9 pr-4 py-2 text-[13px] bg-white border border-pm-line rounded-full w-[220px] placeholder:text-pm-faint text-pm-text focus:outline-none focus:border-pm-green transition-colors"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-white text-[13px] font-medium rounded-full hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--pm-green)" }}
          >
            <UserPlus size={14} strokeWidth={2} />
            Novo Usuário
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total",          value: usuarios.length, sub: "usuários no sistema",    icon: Users  },
            { label: "Médicos",        value: medicos,          sub: "profissionais de saúde", icon: Shield },
            { label: "Recepcionistas", value: recepcionistas,   sub: "atendimento",            icon: Users  },
            { label: "Ativos",         value: ativos,           sub: "com acesso ativo",        icon: CheckCircle2 },
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

          <div className="px-6 py-4 border-b border-pm-line grid grid-cols-[1fr_220px_130px_90px_80px] gap-4 items-center">
            {["Usuário", "E-mail", "Perfil", "Status", ""].map(h => (
              <p key={h} className="text-[11px] font-semibold uppercase tracking-[0.07em] text-pm-faint">{h}</p>
            ))}
          </div>

          {loading ? (
            <SkeletonRows />
          ) : filtrados.length === 0 ? (
            <EmptyState busca={busca} />
          ) : (
            <div className="divide-y divide-pm-line">
              {filtrados.map(u => (
                <UsuarioRow key={u.id} usuario={u} onDesativar={handleDesativar} />
              ))}
            </div>
          )}
        </div>

        {!loading && filtrados.length > 0 && (
          <p className="text-[12px] text-pm-faint text-center mt-4">
            {filtrados.length !== usuarios.length
              ? `${filtrados.length} de ${usuarios.length} usuários`
              : `${usuarios.length} usuários`}
          </p>
        )}
      </div>

      {/* Modal — Novo Usuário */}
      {showModal && (
        <NovoUsuarioModal onClose={() => setShowModal(false)} onSalvar={handleCriar} />
      )}
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function UsuarioRow({ usuario: u, onDesativar }: { usuario: UsuarioDto; onDesativar: (id: string) => void }) {
  return (
    <div className="px-6 py-3.5 grid grid-cols-[1fr_220px_130px_90px_80px] gap-4 items-center hover:bg-pm-surface transition-colors duration-100 group">

      {/* Avatar + nome */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
          style={{ backgroundColor: "var(--pm-green-soft)", color: "var(--pm-green)" }}
        >
          {getInitials(u)}
        </div>
        <p className="text-[13px] font-medium text-pm-text truncate">
          {u.primeiroNome} {u.sobrenome}
        </p>
      </div>

      {/* E-mail */}
      <p className="text-[13px] text-pm-muted truncate">{u.email}</p>

      {/* Perfil */}
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium w-fit ${perfilBadge[u.perfil]}`}>
        {perfilLabel[u.perfil]}
      </span>

      {/* Status */}
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium w-fit ${
        u.ativo ? "bg-emerald-50 text-emerald-700" : "bg-pm-surface text-pm-faint"
      }`}>
        {u.ativo ? "Ativo" : "Inativo"}
      </span>

      {/* Ação */}
      <div className="flex justify-end">
        {u.ativo ? (
          <button
            onClick={() => onDesativar(u.id)}
            className="px-2.5 py-1 rounded-lg text-[11.5px] font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            Desativar
          </button>
        ) : (
          <ChevronRight size={14} className="text-pm-faint opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function NovoUsuarioModal({
  onClose,
  onSalvar,
}: {
  onClose: () => void;
  onSalvar: (p: CriarUsuarioPayload) => void;
}) {
  const [primeiroNome, setPrimeiroNome] = useState("");
  const [sobrenome,    setSobrenome]    = useState("");
  const [email,        setEmail]        = useState("");
  const [senha,        setSenha]        = useState("");
  const [perfil,       setPerfil]       = useState<Perfil>("Doctor");
  const [showSenha,    setShowSenha]    = useState(false);
  const [erro,         setErro]         = useState("");

  function handleSubmit() {
    setErro("");
    if (!primeiroNome.trim() || !sobrenome.trim() || !email.trim() || !senha.trim()) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (!email.includes("@")) {
      setErro("Informe um e-mail válido.");
      return;
    }
    onSalvar({ primeiroNome, sobrenome, email, senha, perfil });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl border border-pm-line shadow-card w-full max-w-md mx-4 overflow-hidden">

        {/* Cabeçalho do modal */}
        <div className="px-7 py-5 border-b border-pm-line flex items-center justify-between">
          <div>
            <p className="text-[15px] font-semibold text-pm-text">Novo Usuário</p>
            <p className="text-[12px] text-pm-muted mt-0.5">Crie um novo acesso ao sistema</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-pm-faint hover:bg-pm-surface transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Formulário */}
        <div className="px-7 py-6 space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">
                Primeiro Nome
              </label>
              <input
                value={primeiroNome}
                onChange={e => setPrimeiroNome(e.target.value)}
                placeholder="Ex: Lucas"
                className="w-full px-3 py-2.5 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text focus:outline-none focus:border-pm-green transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">
                Sobrenome
              </label>
              <input
                value={sobrenome}
                onChange={e => setSobrenome(e.target.value)}
                placeholder="Ex: Andrade"
                className="w-full px-3 py-2.5 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text focus:outline-none focus:border-pm-green transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@prontumed.com"
              className="w-full px-3 py-2.5 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text focus:outline-none focus:border-pm-green transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">
              Senha inicial
            </label>
            <div className="relative">
              <input
                type={showSenha ? "text" : "password"}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="Mín. 6 caracteres"
                className="w-full px-3 py-2.5 pr-10 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text focus:outline-none focus:border-pm-green transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowSenha(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-pm-faint hover:text-pm-muted transition-colors"
              >
                {showSenha ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">
              Perfil de Acesso
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PERFIS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPerfil(p)}
                  className={`px-3 py-2 rounded-xl text-[12.5px] font-medium text-left border transition-colors ${
                    perfil === p
                      ? "border-pm-green bg-pm-green-soft text-pm-green"
                      : "border-pm-line bg-pm-surface text-pm-muted hover:border-pm-green hover:text-pm-green"
                  }`}
                >
                  {perfilLabel[p]}
                </button>
              ))}
            </div>
          </div>

          {erro && <p className="text-[12px] text-rose-500">{erro}</p>}
        </div>

        {/* Rodapé */}
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
            Criar Usuário
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
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-6 py-3.5 grid grid-cols-[1fr_220px_130px_90px_80px] gap-4 items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-pm-surface animate-pulse" />
            <div className="h-3.5 w-36 rounded-full bg-pm-surface animate-pulse" />
          </div>
          <div className="h-3.5 w-44 rounded-full bg-pm-surface animate-pulse" />
          <div className="h-5 w-24 rounded-full bg-pm-surface animate-pulse" />
          <div className="h-5 w-14 rounded-full bg-pm-surface animate-pulse" />
          <div />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ busca }: { busca: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="text-[14px] font-medium text-pm-text">
        {busca ? `Nenhum usuário encontrado para "${busca}"` : "Nenhum usuário cadastrado"}
      </p>
      <p className="text-[13px] text-pm-muted mt-1.5">
        {busca ? "Tente buscar pelo nome completo ou e-mail." : "Clique em Novo Usuário para começar."}
      </p>
    </div>
  );
}
