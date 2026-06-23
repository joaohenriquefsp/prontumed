"use client";

import { useSSE } from "@/hooks/use-sse";
import { toast } from "@/lib/toast-store";
import { useUser } from "@/components/providers/user-provider";
import type { EventoSSE } from "@/lib/types";

const MENSAGENS: Record<string, { title: string; variant: "success" | "info" | "warning" | "error" }> = {
  ConsultaAgendadaEvent:   { title: "Nova consulta agendada",   variant: "info" },
  ConsultaConfirmadaEvent: { title: "Consulta confirmada",      variant: "success" },
  ConsultaCanceladaEvent:  { title: "Consulta cancelada",       variant: "warning" },
  ConsultaConcluidaEvent:  { title: "Consulta concluída",       variant: "success" },
  ConsultaNoShowEvent:     { title: "Paciente não compareceu",  variant: "error" },
};

function handleEvento(ev: EventoSSE) {
  const config = MENSAGENS[ev.tipo] ?? { title: ev.tipo, variant: "info" as const };
  toast({
    title: config.title,
    description: `Consulta #${ev.idConsulta.slice(0, 8)}`,
    variant: config.variant,
  });
}

export function SseProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  // SSE só conecta após usuário autenticado e fora de mock mode
  const enabled =
    !loading &&
    user !== null &&
    process.env.NEXT_PUBLIC_MOCK_AUTH !== "true";

  useSSE(handleEvento, enabled);

  return <>{children}</>;
}
