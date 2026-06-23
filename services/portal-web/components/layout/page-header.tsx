import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  showLive?: boolean;
}

export function PageHeader({ title, children, showLive }: PageHeaderProps) {
  return (
    <header className="h-14 flex items-center gap-4 px-6 bg-white border-b border-border flex-shrink-0">
      <h1 className="text-[15px] font-bold text-foreground tracking-tight flex-1">{title}</h1>
      {showLive && (
        <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
          <span className="w-[7px] h-[7px] rounded-full bg-green-500 animate-pulse-dot" />
          Ao vivo
        </div>
      )}
      {children}
    </header>
  );
}
