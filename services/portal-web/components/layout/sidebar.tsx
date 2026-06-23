"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays, Clock, FileText, Users, UserPlus,
  ClipboardList, LayoutDashboard, LogOut, User, Plus,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ElementType };

const navByRole: Record<string, NavItem[]> = {
  Doctor: [
    { href: "/agenda",      label: "Agenda de Hoje",     icon: CalendarDays },
    { href: "/proximas",    label: "Próximas Consultas", icon: Clock },
    { href: "/prontuarios", label: "Prontuários",        icon: FileText },
    { href: "/perfil",      label: "Meu Perfil",         icon: User },
  ],
  Receptionist: [
    { href: "/pacientes",   label: "Pacientes",          icon: Users },
    { href: "/agendar",     label: "Agendar Consulta",   icon: UserPlus },
    { href: "/consultas",   label: "Consultas",          icon: CalendarDays },
    { href: "/perfil",      label: "Meu Perfil",         icon: User },
  ],
  Admin: [
    { href: "/agenda",      label: "Agenda de Hoje",     icon: CalendarDays },
    { href: "/pacientes",   label: "Pacientes",          icon: Users },
    { href: "/agendar",     label: "Agendar Consulta",   icon: UserPlus },
    { href: "/consultas",   label: "Consultas",          icon: ClipboardList },
    { href: "/usuarios",    label: "Usuários",           icon: Users },
    { href: "/grade",       label: "Grade Horária",      icon: LayoutDashboard },
  ],
  Patient: [
    { href: "/consultas",   label: "Minhas Consultas",   icon: CalendarDays },
    { href: "/perfil",      label: "Meu Perfil",         icon: User },
  ],
};

interface SidebarProps {
  userName: string;
  userRole: string;
  userInitials: string;
}

export function Sidebar({ userName, userRole, userInitials }: SidebarProps) {
  const pathname = usePathname();
  const items = navByRole[userRole] ?? navByRole.Doctor;

  return (
    <aside
      className="w-[220px] flex-shrink-0 flex flex-col overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: "var(--pm-sidebar-bg)",
        borderRadius: "0 20px 20px 0",
        boxShadow: "1px 0 0 0 var(--pm-sidebar-border), 0 4px 20px rgba(0,0,0,0.06)",
        zIndex: 10,
        position: "relative",
      }}
    >
      {/* Logo */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-pm-green flex items-center justify-center flex-shrink-0">
            <Plus size={14} color="white" strokeWidth={2.5} />
          </div>
          <span
            className="text-[14px] font-semibold tracking-tight transition-colors duration-300"
            style={{ color: "var(--pm-sidebar-text)" }}
          >
            ProntuMed
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 overflow-y-auto">
        <p
          className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors duration-300"
          style={{ color: "var(--pm-sidebar-faint)" }}
        >
          Menu
        </p>
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-150 mb-0.5"
              )}
              style={
                active
                  ? {
                      backgroundColor: "var(--pm-sidebar-surface)",
                      color: "var(--pm-sidebar-text)",
                      fontWeight: 500,
                    }
                  : {
                      color: "var(--pm-sidebar-muted)",
                    }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--pm-sidebar-surface)";
                  (e.currentTarget as HTMLElement).style.color = "var(--pm-sidebar-text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "";
                  (e.currentTarget as HTMLElement).style.color = "var(--pm-sidebar-muted)";
                }
              }}
            >
              <Icon
                size={15}
                strokeWidth={active ? 2 : 1.5}
                style={active ? { color: "var(--pm-green)" } : {}}
              />
              {item.label}
            </Link>
          );
        })}

        {/* Divider */}
        <div
          className="my-3 mx-3 border-t transition-colors duration-300"
          style={{ borderColor: "var(--pm-sidebar-line)" }}
        />

        <Link
          href="/configuracoes"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-150 mb-0.5"
          style={
            pathname === "/configuracoes"
              ? {
                  backgroundColor: "var(--pm-sidebar-surface)",
                  color: "var(--pm-sidebar-text)",
                  fontWeight: 500,
                }
              : { color: "var(--pm-sidebar-muted)" }
          }
          onMouseEnter={(e) => {
            if (pathname !== "/configuracoes") {
              (e.currentTarget as HTMLElement).style.backgroundColor = "var(--pm-sidebar-surface)";
              (e.currentTarget as HTMLElement).style.color = "var(--pm-sidebar-text)";
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== "/configuracoes") {
              (e.currentTarget as HTMLElement).style.backgroundColor = "";
              (e.currentTarget as HTMLElement).style.color = "var(--pm-sidebar-muted)";
            }
          }}
        >
          <Settings
            size={15}
            strokeWidth={pathname === "/configuracoes" ? 2 : 1.5}
            style={pathname === "/configuracoes" ? { color: "var(--pm-green)" } : {}}
          />
          Configurações
        </Link>
      </nav>

      {/* User */}
      <div
        className="px-4 py-4 border-t transition-colors duration-300"
        style={{ borderTopColor: "var(--pm-sidebar-line)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-pm-green-soft border border-emerald-100 flex items-center justify-center text-[10px] font-semibold text-pm-green flex-shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[12px] font-medium truncate transition-colors duration-300"
              style={{ color: "var(--pm-sidebar-text)" }}
            >
              {userName}
            </p>
            <p
              className="text-[11px] transition-colors duration-300"
              style={{ color: "var(--pm-sidebar-faint)" }}
            >
              {userRole}
            </p>
          </div>
          <button
            className="p-1 rounded-md transition-colors"
            style={{ color: "var(--pm-sidebar-faint)" }}
          >
            <LogOut size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
