"use client";

import { useState } from "react";
import { Mail, Shield, CheckCircle2, Eye, EyeOff, Lock, Edit3 } from "lucide-react";
import { useUser } from "@/components/providers/user-provider";
import { bff } from "@/lib/api";
import { toast } from "@/lib/toast-store";

const perfilLabel: Record<string, string> = {
  Doctor:       "Médico",
  Receptionist: "Recepcionista",
  Admin:        "Administrador",
  Patient:      "Paciente",
};

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export default function PerfilPage() {
  const { user, loading } = useUser();

  const [editMode,    setEditMode]    = useState(false);
  const [primeiroNome, setPrimeiroNome] = useState("");
  const [sobrenome,   setSobrenome]   = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [senhaAtual,    setSenhaAtual]    = useState("");
  const [novaSenha,     setNovaSenha]     = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha,  setShowNovaSenha]  = useState(false);
  const [senhaSuccess, setSenhaSuccess] = useState(false);
  const [senhaError,   setSenhaError]   = useState("");

  function handleEditStart() {
    if (!user) return;
    setPrimeiroNome(user.primeiroNome);
    setSobrenome(user.sobrenome);
    setSaveSuccess(false);
    setEditMode(true);
  }

  async function handleSave() {
    if (!user) return;
    try {
      await bff(`/usuarios/${user.id}/perfil`, {
        method: "PATCH",
        body: JSON.stringify({ primeiroNome, sobrenome }),
      });
      setSaveSuccess(true);
      setEditMode(false);
      toast({ title: "Perfil atualizado", variant: "success" });
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar perfil.";
      toast({ title: msg, variant: "error" });
    }
  }

  async function handleAlterarSenha() {
    setSenhaError("");
    if (!senhaAtual || !novaSenha || !confirmaSenha) {
      setSenhaError("Preencha todos os campos.");
      return;
    }
    if (novaSenha !== confirmaSenha) {
      setSenhaError("Nova senha e confirmação não coincidem.");
      return;
    }
    if (novaSenha.length < 6) {
      setSenhaError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    try {
      await bff("/auth/alterar-senha", {
        method: "POST",
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
      setSenhaAtual(""); setNovaSenha(""); setConfirmaSenha("");
      setSenhaSuccess(true);
      toast({ title: "Senha alterada com sucesso", variant: "success" });
      setTimeout(() => setSenhaSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar senha.";
      setSenhaError(msg);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-pm-warm">
        <header
          className="px-10 pt-8 pb-6 border-b flex-shrink-0 transition-colors duration-300 space-y-2"
          style={{ backgroundColor: "var(--pm-sidebar-bg)", borderBottomColor: "var(--pm-sidebar-border)" }}
        >
          <div className="h-6 w-36 bg-pm-surface rounded animate-pulse" />
          <div className="h-4 w-64 bg-pm-surface rounded animate-pulse" />
        </header>
        <div className="flex-1 overflow-y-auto px-10 py-8">
          <div className="max-w-2xl bg-white rounded-2xl border border-pm-line p-8 animate-pulse space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-pm-surface" />
            <div className="h-5 w-40 bg-pm-surface rounded" />
            <div className="h-4 w-56 bg-pm-surface rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials     = getInitials(user.primeiroNome, user.sobrenome);
  const nomeCompleto = editMode
    ? `${primeiroNome} ${sobrenome}`.trim()
    : `${user.primeiroNome} ${user.sobrenome}`;

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
            Meu Perfil
          </h1>
          <p
            className="text-[13px] mt-1.5 transition-colors duration-300"
            style={{ color: "var(--pm-sidebar-muted)" }}
          >
            Gerencie seus dados pessoais e configurações de acesso
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8">
        <div className="max-w-2xl space-y-5">

          {/* ── Card de perfil ── */}
          <div className="bg-white rounded-2xl border border-pm-line shadow-subtle overflow-hidden">

            {/* Avatar + nome + ações */}
            <div className="px-8 py-6 border-b border-pm-line flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-[18px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: "var(--pm-green)" }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-pm-text leading-tight">{nomeCompleto}</p>
                  <p className="text-[13px] text-pm-muted mt-0.5">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-emerald-100"
                      style={{ backgroundColor: "var(--pm-green-soft)", color: "var(--pm-green)" }}
                    >
                      {perfilLabel[user.perfil] ?? user.perfil}
                    </span>
                    {user.ativo && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
                        Ativo
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {saveSuccess ? (
                <div className="flex items-center gap-1.5 text-emerald-600 text-[13px] font-medium">
                  <CheckCircle2 size={15} />
                  Salvo!
                </div>
              ) : !editMode ? (
                <button
                  onClick={handleEditStart}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-pm-line text-pm-muted text-[13px] rounded-xl hover:bg-pm-surface transition-colors"
                >
                  <Edit3 size={13} strokeWidth={1.5} />
                  Editar
                </button>
              ) : null}
            </div>

            {/* Campos */}
            <div className="px-8 py-6">
              <div className="grid grid-cols-2 gap-5">

                <div>
                  <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">
                    Primeiro Nome
                  </label>
                  {editMode ? (
                    <input
                      value={primeiroNome}
                      onChange={e => setPrimeiroNome(e.target.value)}
                      className="w-full px-3 py-2.5 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text focus:outline-none focus:border-pm-green transition-colors"
                    />
                  ) : (
                    <p className="text-[13.5px] text-pm-text font-medium">{user.primeiroNome}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">
                    Sobrenome
                  </label>
                  {editMode ? (
                    <input
                      value={sobrenome}
                      onChange={e => setSobrenome(e.target.value)}
                      className="w-full px-3 py-2.5 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text focus:outline-none focus:border-pm-green transition-colors"
                    />
                  ) : (
                    <p className="text-[13.5px] text-pm-text font-medium">{user.sobrenome}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">
                    E-mail
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-pm-faint flex-shrink-0" />
                    <p className="text-[13.5px] text-pm-muted">{user.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">
                    Perfil de Acesso
                  </label>
                  <div className="flex items-center gap-2">
                    <Shield size={13} className="text-pm-faint flex-shrink-0" />
                    <p className="text-[13.5px] text-pm-muted">{perfilLabel[user.perfil] ?? user.perfil}</p>
                  </div>
                </div>

              </div>

              {editMode && (
                <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-pm-line">
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 text-[13px] text-pm-muted border border-pm-line rounded-xl hover:bg-pm-surface transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => void handleSave()}
                    className="px-4 py-2 text-[13px] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "var(--pm-green)" }}
                  >
                    Salvar Alterações
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Card de segurança ── */}
          <div className="bg-white rounded-2xl border border-pm-line shadow-subtle overflow-hidden">
            <div className="px-8 py-5 border-b border-pm-line flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-pm-surface border border-pm-line flex items-center justify-center">
                <Lock size={13} className="text-pm-faint" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-pm-text">Segurança</p>
                <p className="text-[11.5px] text-pm-muted">Altere sua senha de acesso</p>
              </div>
            </div>

            <div className="px-8 py-6 space-y-4">

              <div>
                <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    type={showSenhaAtual ? "text" : "password"}
                    value={senhaAtual}
                    onChange={e => setSenhaAtual(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pr-10 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text focus:outline-none focus:border-pm-green transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenhaAtual(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pm-faint hover:text-pm-muted transition-colors"
                  >
                    {showSenhaAtual ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showNovaSenha ? "text" : "password"}
                      value={novaSenha}
                      onChange={e => setNovaSenha(e.target.value)}
                      placeholder="Mín. 8 caracteres"
                      className="w-full px-3 py-2.5 pr-10 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text focus:outline-none focus:border-pm-green transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNovaSenha(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-pm-faint hover:text-pm-muted transition-colors"
                    >
                      {showNovaSenha ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-pm-muted uppercase tracking-wider mb-1.5">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    value={confirmaSenha}
                    onChange={e => setConfirmaSenha(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full px-3 py-2.5 text-[13px] bg-pm-surface border border-pm-line rounded-xl text-pm-text focus:outline-none focus:border-pm-green transition-colors"
                  />
                </div>
              </div>

              {senhaError && (
                <p className="text-[12px] text-rose-500">{senhaError}</p>
              )}
              {senhaSuccess && (
                <div className="flex items-center gap-1.5 text-emerald-600 text-[12px] font-medium">
                  <CheckCircle2 size={14} />
                  Senha alterada com sucesso!
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => void handleAlterarSenha()}
                  className="px-4 py-2 text-[13px] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "var(--pm-green)" }}
                >
                  Alterar Senha
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
