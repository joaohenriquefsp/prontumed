"use client";

import { useEffect } from "react";
import { getStoredTheme, applyTheme, getStoredSidebar, applySidebar } from "@/lib/themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(getStoredTheme());
    applySidebar(getStoredSidebar());
  }, []);

  return <>{children}</>;
}
