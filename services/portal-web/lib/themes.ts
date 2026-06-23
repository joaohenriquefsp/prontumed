export type ThemeKey = "teal" | "indigo" | "blue" | "violet" | "amber" | "rose";

export interface ThemePalette {
  key: ThemeKey;
  name: string;
  green: string;       // cor principal (logo, botão, dot da timeline)
  greenHover: string;  // hover do botão — mais escuro ~10%
  greenSoft: string;   // fundo suave de cards/badges — muito claro
  greenSubtle: string; // hover de linhas — 8% opacity
}

export const themes: ThemePalette[] = [
  {
    key: "teal",
    name: "Teal Médico",
    green: "#22C7A8",
    greenHover: "#1AAF93",
    greenSoft: "#F0FDF9",
    greenSubtle: "rgba(34,199,168,0.08)",
  },
  {
    key: "indigo",
    name: "Índigo",
    green: "#6366F1",
    greenHover: "#4F46E5",
    greenSoft: "#EEF2FF",
    greenSubtle: "rgba(99,102,241,0.08)",
  },
  {
    key: "blue",
    name: "Azul",
    green: "#3B82F6",
    greenHover: "#2563EB",
    greenSoft: "#EFF6FF",
    greenSubtle: "rgba(59,130,246,0.08)",
  },
  {
    key: "violet",
    name: "Violeta",
    green: "#8B5CF6",
    greenHover: "#7C3AED",
    greenSoft: "#F5F3FF",
    greenSubtle: "rgba(139,92,246,0.08)",
  },
  {
    key: "amber",
    name: "Âmbar",
    green: "#F59E0B",
    greenHover: "#D97706",
    greenSoft: "#FFFBEB",
    greenSubtle: "rgba(245,158,11,0.08)",
  },
  {
    key: "rose",
    name: "Rosa",
    green: "#F43F5E",
    greenHover: "#E11D48",
    greenSoft: "#FFF1F2",
    greenSubtle: "rgba(244,63,94,0.08)",
  },
];

export const defaultTheme = themes[0];

export function applyTheme(palette: ThemePalette) {
  const root = document.documentElement;
  root.style.setProperty("--pm-green", palette.green);
  root.style.setProperty("--pm-green-hover", palette.greenHover);
  root.style.setProperty("--pm-green-soft", palette.greenSoft);
  root.style.setProperty("--pm-green-subtle", palette.greenSubtle);
  localStorage.setItem("prontumed-theme", palette.key);
}

export function getStoredTheme(): ThemePalette {
  if (typeof window === "undefined") return defaultTheme;
  const key = localStorage.getItem("prontumed-theme") as ThemeKey | null;
  return themes.find((t) => t.key === key) ?? defaultTheme;
}

// --- Sidebar ---

export type SidebarKey = "branco" | "escuro" | "grafite";

export interface SidebarPreset {
  key: SidebarKey;
  name: string;
  description: string;
  bg: string;
  border: string;
  text: string;
  muted: string;
  faint: string;
  surface: string;
  line: string;
  isDark: boolean;
}

export const sidebarPresets: SidebarPreset[] = [
  {
    key: "branco",
    name: "Branco",
    description: "Padrão claro e limpo",
    bg: "#FFFFFF",
    border: "#EBEBEB",
    text: "#0D1117",
    muted: "#6B7280",
    faint: "#9CA3AF",
    surface: "#F6F7F8",
    line: "#EBEBEB",
    isDark: false,
  },
  {
    key: "escuro",
    name: "Verde escuro",
    description: "Clássico de clínica — #001E27",
    bg: "#001E27",
    border: "rgba(255,255,255,0.07)",
    text: "#F1F5F9",
    muted: "#94A3B8",
    faint: "rgba(255,255,255,0.35)",
    surface: "rgba(255,255,255,0.07)",
    line: "rgba(255,255,255,0.07)",
    isDark: true,
  },
  {
    key: "grafite",
    name: "Grafite",
    description: "Dark sóbrio e neutro",
    bg: "#111827",
    border: "rgba(255,255,255,0.07)",
    text: "#F1F5F9",
    muted: "#94A3B8",
    faint: "rgba(255,255,255,0.35)",
    surface: "rgba(255,255,255,0.07)",
    line: "rgba(255,255,255,0.07)",
    isDark: true,
  },
];

export const defaultSidebar = sidebarPresets[0];

export function applySidebar(preset: SidebarPreset) {
  const r = document.documentElement;
  r.style.setProperty("--pm-sidebar-bg", preset.bg);
  r.style.setProperty("--pm-sidebar-border", preset.border);
  r.style.setProperty("--pm-sidebar-text", preset.text);
  r.style.setProperty("--pm-sidebar-muted", preset.muted);
  r.style.setProperty("--pm-sidebar-faint", preset.faint);
  r.style.setProperty("--pm-sidebar-surface", preset.surface);
  r.style.setProperty("--pm-sidebar-line", preset.line);
  localStorage.setItem("prontumed-sidebar", preset.key);
}

export function getStoredSidebar(): SidebarPreset {
  if (typeof window === "undefined") return defaultSidebar;
  const key = localStorage.getItem("prontumed-sidebar") as SidebarKey | null;
  return sidebarPresets.find((s) => s.key === key) ?? defaultSidebar;
}
