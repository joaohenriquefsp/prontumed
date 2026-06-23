"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, UserPlus, ChevronRight } from "lucide-react";
import { bff } from "@/lib/api";
import type { PacienteResumoDto } from "@/lib/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  const [pacientes, setPacientes] = useState<PacienteResumoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    bff<PacienteResumoDto[]>("/pacientes")
      .then(setPacientes)
      .catch(() => setPacientes([]))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = useMemo(() => {
    if (!busca.trim()) return pacientes;
    const q = busca.toLowerCase();
    return pacientes.filter(
      (p) =>
        `${p.primeiroNome} ${p.sobrenome}`.toLowerCase().includes(q) ||
        p.cpf.includes(q.replace(/\D/g, ""))
    );
  }, [pacientes, busca]);

  const ativos = pacientes.filter((p) => p.ativo).length;
  const inativos = pacientes.length - ativos;

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
            Pacientes
          </h1>
          <p
            className="text-[13px] mt-1.5 transition-colors duration-300"
            style={{ color: "var(--pm-sidebar-muted)" }}
          >
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
          <button className="flex items-center gap-1.5 px-4 py-2 text-white text-[13px] font-medium rounded-full transition-colors" style={{ backgroundColor: "var(--pm-green)" }}>
            <UserPlus size={14} strokeWidth={2} />
            Novo Paciente
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total cadastrado",   value: pacientes.length, sub: "pacientes no sistema"    },
            { label: "Ativos",             value: ativos,           sub: "com cadastro ativo"       },
            { label: "Inativos",           value: inativos,         sub: "cadastros desativados"    },
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

          {/* Cabeçalho da tabela */}
          <div className="px-6 py-4 border-b border-pm-line grid grid-cols-[1fr_160px_120px_160px_100px_40px] gap-4 items-center">
            {["Paciente", "CPF", "Nascimento", "Telefone", "Status", ""].map((h) => (
              <p key={h} className="text-[11px] font-semibold uppercase tracking-[0.07em] text-pm-faint">{h}</p>
            ))}
          </div>

          {/* Linhas */}
          {loading ? (
            <SkeletonRows />
          ) : filtrados.length === 0 ? (
            <EmptyState busca={busca} />
          ) : (
            <div className="divide-y divide-pm-line">
              {filtrados.map((p) => (
                <PacienteRow key={p.id} paciente={p} />
              ))}
            </div>
          )}
        </div>

        {/* Rodapé com contagem */}
        {!loading && filtrados.length > 0 && (
          <p className="text-[12px] text-pm-faint text-center mt-4">
            {busca ? `${filtrados.length} de ${pacientes.length} pacientes` : `${pacientes.length} pacientes`}
          </p>
        )}

      </div>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function PacienteRow({ paciente: p }: { paciente: PacienteResumoDto }) {
  const age = calcAge(p.dataNascimento);

  return (
    <div className="px-6 py-3.5 grid grid-cols-[1fr_160px_120px_160px_100px_40px] gap-4 items-center hover:bg-pm-surface transition-colors duration-100 cursor-pointer group">
      {/* Nome + avatar */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 transition-colors duration-300"
          style={{ backgroundColor: "var(--pm-green-soft)", color: "var(--pm-green)" }}
        >
          {initials(p)}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-pm-text truncate">
            {p.primeiroNome} {p.sobrenome}
          </p>
        </div>
      </div>

      {/* CPF */}
      <p className="text-[13px] font-mono-data text-pm-muted">{formatCpf(p.cpf)}</p>

      {/* Nascimento */}
      <div>
        <p className="text-[13px] text-pm-text">{formatDate(p.dataNascimento)}</p>
        <p className="text-[11px] text-pm-faint">{age} anos</p>
      </div>

      {/* Telefone */}
      <p className="text-[13px] text-pm-muted">{p.telefone}</p>

      {/* Status */}
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium w-fit ${
        p.ativo
          ? "bg-emerald-50 text-emerald-700"
          : "bg-pm-surface text-pm-faint"
      }`}>
        {p.ativo ? "Ativo" : "Inativo"}
      </span>

      {/* Ação */}
      <div className="flex justify-end">
        <ChevronRight
          size={15}
          strokeWidth={1.5}
          className="text-pm-faint group-hover:text-pm-muted transition-colors"
        />
      </div>
    </div>
  );
}

// ── Estados ───────────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div className="divide-y divide-pm-line">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="px-6 py-3.5 grid grid-cols-[1fr_160px_120px_160px_100px_40px] gap-4 items-center">
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

function EmptyState({ busca }: { busca: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="text-[14px] font-medium text-pm-text">
        {busca ? `Nenhum paciente encontrado para "${busca}"` : "Nenhum paciente cadastrado"}
      </p>
      <p className="text-[13px] text-pm-muted mt-1.5">
        {busca ? "Tente buscar pelo nome completo ou CPF sem pontuação." : "Cadastre o primeiro paciente clicando em Novo Paciente."}
      </p>
    </div>
  );
}
