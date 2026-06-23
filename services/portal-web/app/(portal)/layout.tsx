import { Sidebar } from "@/components/layout/sidebar";
import { UserProvider } from "@/components/providers/user-provider";
import { SidebarWrapper } from "@/components/layout/sidebar-wrapper";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="flex h-screen overflow-hidden bg-pm-warm">
        <SidebarWrapper />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </UserProvider>
  );
}
