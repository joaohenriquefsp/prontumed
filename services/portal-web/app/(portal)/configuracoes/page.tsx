"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import {
  themes, applyTheme, getStoredTheme, type ThemeKey,
  sidebarPresets, applySidebar, getStoredSidebar, type SidebarKey,
} from "@/lib/themes";

export default function ConfiguracoesPage() {
  const [active, setActive] = useState<ThemeKey>("teal");
  const [activeSidebar, setActiveSidebar] = useState<SidebarKey>("branco");

  useEffect(() => {
    setActive(getStoredTheme().key);
    setActiveSidebar(getStoredSidebar().key);
  }, []);

  function handleSelect(key: ThemeKey) {
    const palette = themes.find((t) => t.key === key)!;
    applyTheme(palette);
    setActive(key);
  }

  function handleSelectSidebar(key: SidebarKey) {
    const preset = sidebarPresets.find((s) => s.key === key)!;
    applySidebar(preset);
    setActiveSidebar(key);
  }

  return (
    <div className="flex-1 overflow-y-auto bg-pm-warm">
      <header
        className="px-10 pt-8 pb-6 border-b flex-shrink-0 transition-colors duration-300"
        style={{
          backgroundColor: "var(--pm-sidebar-bg)",
          borderBottomColor: "var(--pm-sidebar-border)",
        }}
      >
        <h1
          className="text-[22px] font-semibold tracking-tight transition-colors duration-300"
          style={{ color: "var(--pm-sidebar-text)" }}
        >
          Configurações
        </h1>
        <p
          className="text-[13px] mt-1.5 transition-colors duration-300"
          style={{ color: "var(--pm-sidebar-muted)" }}
        >
          Personalize a aparência do sistema
        </p>
      </header>

      <div className="px-10 py-8 max-w-2xl">

        {/* Cor do tema */}
        <section>
          <SectionHeader
            title="Cor do tema"
            sub="Altera a cor primária — logo, botões, indicadores e destaques."
          />

          <div className="grid grid-cols-3 gap-3">
            {themes.map((t) => {
              const isActive = active === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => handleSelect(t.key)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all duration-150 bg-white ${
                    isActive ? "border-pm-line shadow-card" : "border-pm-line hover:shadow-subtle"
                  }`}
                >
                  <div className="flex-shrink-0 relative w-9 h-9">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: t.greenSoft, border: `1.5px solid ${t.green}22` }}
                    />
                    <div
                      className="absolute inset-[6px] rounded-full"
                      style={{ backgroundColor: t.green }}
                    />
                    <div
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                      style={{ backgroundColor: t.greenHover }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium text-pm-text">{t.name}</p>
                    <p className="text-[11px] font-mono-data text-pm-faint mt-0.5">{t.green}</p>
                  </div>

                  {isActive && (
                    <Check size={14} className="flex-shrink-0" style={{ color: t.green }} />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Menu lateral */}
        <section className="mt-10">
          <SectionHeader
            title="Menu lateral"
            sub="Cor de fundo da barra de navegação lateral."
          />

          <div className="grid grid-cols-3 gap-3">
            {sidebarPresets.map((s) => {
              const isActive = activeSidebar === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => handleSelectSidebar(s.key)}
                  className={`flex flex-col gap-3 px-4 py-4 rounded-2xl border text-left transition-all duration-150 bg-white ${
                    isActive ? "border-pm-line shadow-card" : "border-pm-line hover:shadow-subtle"
                  }`}
                >
                  {/* Mini sidebar preview */}
                  <div className="w-full h-[52px] rounded-xl overflow-hidden border border-pm-line flex">
                    {/* sidebar strip */}
                    <div
                      className="w-[38px] flex flex-col gap-1.5 px-2 pt-2.5 transition-colors duration-300 flex-shrink-0"
                      style={{ backgroundColor: s.bg }}
                    >
                      <div
                        className="h-[5px] rounded-full"
                        style={{ backgroundColor: s.isDark ? "rgba(255,255,255,0.55)" : "#D1D5DB" }}
                      />
                      <div
                        className="h-[3.5px] rounded-full"
                        style={{ backgroundColor: s.isDark ? "rgba(255,255,255,0.25)" : "#E5E7EB" }}
                      />
                      <div
                        className="h-[3.5px] rounded-full"
                        style={{ backgroundColor: s.isDark ? "rgba(255,255,255,0.25)" : "#E5E7EB" }}
                      />
                    </div>
                    {/* content strip */}
                    <div className="flex-1 bg-pm-warm flex flex-col gap-1.5 px-2.5 pt-2.5 border-l border-pm-line">
                      <div className="h-[5px] rounded-full bg-pm-line w-3/4" />
                      <div className="h-[3.5px] rounded-full bg-pm-line w-1/2" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-[12.5px] font-medium text-pm-text">{s.name}</p>
                      {isActive && <Check size={13} style={{ color: "var(--pm-green)" }} />}
                    </div>
                    <p className="text-[11px] text-pm-faint mt-0.5 leading-snug">{s.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Preview ao vivo */}
        <section className="mt-10">
          <SectionHeader title="Preview" sub="Como os elementos principais ficam com as configurações atuais." />

          <div className="bg-white rounded-2xl border border-pm-line p-6 space-y-4">
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 rounded-full text-[13px] font-medium text-white transition-colors"
                style={{ backgroundColor: "var(--pm-green)" }}
              >
                Nova Consulta
              </button>
              <button className="px-4 py-2 rounded-full text-[13px] font-medium border border-pm-line text-pm-muted">
                Cancelar
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                style={{ backgroundColor: "var(--pm-green-soft)", color: "var(--pm-green)" }}
              >
                Confirmada
              </span>
              <div className="flex items-center gap-1.5 text-[12px] text-pm-muted">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--pm-green)" }} />
                Timeline dot
              </div>
            </div>

            <div>
              <p className="text-[11.5px] text-pm-muted mb-1.5">5 de 8 confirmadas</p>
              <div className="h-1.5 bg-pm-surface rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: "62.5%", backgroundColor: "var(--pm-green)" }}
                />
              </div>
            </div>

            {/* Mini sidebar preview inline */}
            <div>
              <p className="text-[11.5px] text-pm-muted mb-2">Menu lateral selecionado</p>
              <div className="h-14 rounded-xl border border-pm-line overflow-hidden flex">
                <div
                  className="w-[60px] flex-shrink-0 flex flex-col gap-2 px-3 pt-3 transition-colors duration-300"
                  style={{ backgroundColor: "var(--pm-sidebar-bg)" }}
                >
                  <div
                    className="h-[5px] rounded-full transition-colors duration-300"
                    style={{ backgroundColor: "var(--pm-sidebar-text)", opacity: 0.6 }}
                  />
                  <div
                    className="h-[4px] rounded-full transition-colors duration-300"
                    style={{ backgroundColor: "var(--pm-sidebar-muted)", opacity: 0.4 }}
                  />
                  <div
                    className="h-[4px] rounded-full w-3/4 transition-colors duration-300"
                    style={{ backgroundColor: "var(--pm-sidebar-muted)", opacity: 0.4 }}
                  />
                </div>
                <div className="flex-1 bg-pm-warm flex flex-col gap-2 px-4 pt-3 border-l border-pm-line">
                  <div className="h-[5px] rounded-full bg-pm-line w-2/3" />
                  <div className="h-[4px] rounded-full bg-pm-line w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-[13px] font-semibold text-pm-text">{title}</h2>
      <p className="text-[12.5px] text-pm-muted mt-0.5">{sub}</p>
    </div>
  );
}
