import { Sidebar } from "@/components/layout/sidebar";
import { UserProvider } from "@/components/providers/user-provider";
import { SseProvider } from "@/components/providers/sse-provider";
import { SidebarWrapper } from "@/components/layout/sidebar-wrapper";
import { ToastContainer } from "@/components/shared/toast-container";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <SseProvider>
        <div className="flex h-screen overflow-hidden bg-pm-warm">
          <SidebarWrapper />
          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
        </div>
        <ToastContainer />
      </SseProvider>
    </UserProvider>
  );
}
