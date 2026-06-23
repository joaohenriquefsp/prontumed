import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["ui-monospace", "Cascadia Code", "Consolas", "monospace"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        pm: {
          green: "var(--pm-green)",
          "green-hover": "var(--pm-green-hover)",
          "green-soft": "var(--pm-green-soft)",
          "green-subtle": "var(--pm-green-subtle)",
          warm: "#FCFCFB",
          surface: "#F6F7F8",
          line: "#EBEBEB",
          text: "#0D1117",
          muted: "#6B7280",
          faint: "#9CA3AF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0,0,0,0.04), 0 1px 6px rgba(0,0,0,0.03)",
        card: "0 1px 3px rgba(0,0,0,0.05), 0 1px 8px rgba(0,0,0,0.03)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
