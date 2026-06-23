"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, EyeOff } from "lucide-react";
import { bff, ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Mock mode: qualquer credencial funciona
    if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
      router.push("/agenda");
      return;
    }

    try {
      await bff("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
      });
      router.push("/agenda");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("E-mail ou senha incorretos.");
      } else {
        setError("Não foi possível conectar ao servidor. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full">
      {/* ── Painel esquerdo ── */}
      <div
        className="hidden lg:flex w-[42%] flex-col justify-between p-12"
        style={{ backgroundColor: "#001E27" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-pm-green flex items-center justify-center flex-shrink-0">
            <Plus size={16} color="white" strokeWidth={2.5} />
          </div>
          <span className="text-white text-[15px] font-semibold tracking-tight">ProntuMed</span>
        </div>

        {/* Tagline */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-pm-green mb-4">
            Sistema de gestão clínica
          </p>
          <h1 className="text-[34px] font-semibold text-white leading-[1.15] tracking-tight">
            Cuidado com<br />precisão clínica.
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            Agendamentos, prontuários e notificações em um só lugar — seguro, rastreável e em conformidade com a LGPD.
          </p>
        </div>

        {/* Rodapé */}
        <p className="text-[11.5px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          © {new Date().getFullYear()} ProntuMed · TCC
        </p>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div className="flex-1 flex items-center justify-center bg-pm-warm px-8">
        <div className="w-full max-w-[360px]">
          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-pm-green flex items-center justify-center">
              <Plus size={14} color="white" strokeWidth={2.5} />
            </div>
            <span className="text-pm-text text-[14px] font-semibold tracking-tight">ProntuMed</span>
          </div>

          <h2 className="text-[22px] font-semibold text-pm-text tracking-tight leading-none">
            Entrar
          </h2>
          <p className="text-[13px] text-pm-muted mt-1.5 mb-8">
            Acesse com suas credenciais institucionais.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-mail */}
            <div>
              <label className="block text-[12px] font-medium text-pm-text mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="medico@clinica.com.br"
                className="w-full px-4 py-2.5 text-[13px] bg-white border border-pm-line rounded-xl text-pm-text placeholder:text-pm-faint focus:outline-none focus:border-pm-green transition-colors"
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-[12px] font-medium text-pm-text mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 text-[13px] bg-white border border-pm-line rounded-xl text-pm-text placeholder:text-pm-faint focus:outline-none focus:border-pm-green transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pm-faint hover:text-pm-muted transition-colors"
                >
                  {showSenha
                    ? <EyeOff size={15} strokeWidth={1.5} />
                    : <Eye size={15} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-[12.5px] text-red-600">
                {error}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-[13px] font-medium text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: "var(--pm-green)" }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
