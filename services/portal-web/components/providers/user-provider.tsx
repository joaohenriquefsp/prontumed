"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { bff } from "@/lib/api";
import type { UsuarioDto } from "@/lib/types";

interface UserContextValue {
  user: UsuarioDto | null;
  loading: boolean;
}

const UserContext = createContext<UserContextValue>({ user: null, loading: true });

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bff<UsuarioDto>("/usuarios/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}
