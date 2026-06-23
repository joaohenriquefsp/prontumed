"use client";

import { useUser } from "@/components/providers/user-provider";
import { Sidebar } from "@/components/layout/sidebar";

export function SidebarWrapper() {
  const { user } = useUser();

  const userName = user
    ? `${user.primeiroNome} ${user.sobrenome}`
    : "Carregando...";

  const userRole = user?.perfil ?? "Doctor";

  const initials = user
    ? `${user.primeiroNome[0]}${user.sobrenome[0]}`.toUpperCase()
    : "..";

  return (
    <Sidebar
      userName={userName}
      userRole={userRole}
      userInitials={initials}
    />
  );
}
