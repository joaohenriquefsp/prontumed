import { Construction } from "lucide-react";

export function EmConstrucao({ titulo, descricao }: { titulo: string; descricao?: string }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-pm-warm">
      <header
        className="px-10 pt-8 pb-6 border-b flex-shrink-0 transition-colors duration-300"
        style={{ backgroundColor: "var(--pm-sidebar-bg)", borderBottomColor: "var(--pm-sidebar-border)" }}
      >
        <h1
          className="text-[22px] font-semibold tracking-tight leading-none"
          style={{ color: "var(--pm-sidebar-text)" }}
        >
          {titulo}
        </h1>
      </header>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-pm-surface border border-pm-line flex items-center justify-center mx-auto mb-4">
            <Construction size={20} className="text-pm-faint" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] font-medium text-pm-text">Em construção</p>
          <p className="text-[13px] text-pm-muted mt-1">
            {descricao ?? "Esta tela será implementada em breve."}
          </p>
        </div>
      </div>
    </div>
  );
}
