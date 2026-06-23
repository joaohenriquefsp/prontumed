import { cn } from "@/lib/utils";

type Status = "confirmada" | "agendada" | "concluida" | "cancelada" | "no_show" | "ativo" | "inativo";

const config: Record<Status, { label: string; className: string }> = {
  confirmada: { label: "Confirmada",      className: "bg-emerald-50 text-emerald-700" },
  agendada:   { label: "Agendada",        className: "bg-blue-50 text-blue-600" },
  concluida:  { label: "Concluída",       className: "bg-violet-50 text-violet-600" },
  cancelada:  { label: "Cancelada",       className: "bg-rose-50 text-rose-500" },
  no_show:    { label: "Não compareceu",  className: "bg-red-50 text-red-500" },
  ativo:      { label: "Ativo",           className: "bg-emerald-50 text-emerald-700" },
  inativo:    { label: "Inativo",         className: "bg-red-50 text-red-500" },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = config[status] ?? config.agendada;
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap tracking-wide",
      className
    )}>
      {label}
    </span>
  );
}
