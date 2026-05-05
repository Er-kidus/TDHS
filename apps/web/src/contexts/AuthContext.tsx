import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { apiFetch, getErrorMessage, readJson } from "@/lib/api";

export type UserRole = "reception" | "doctor" | "nurse" | "admin" | "superadmin" | "pharmacist" | "lab" | "patient";

export type LoginMode = "org" | "patient";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, mode: LoginMode) => Promise<void>;
  registerPatient: (input: { fullName: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type OrgLoginResponse = {
  token: string;
  data: { id: string; full_name: string; email: string; role: string };
};

type PatientAuthResponse = {
  token: string;
  data: { id: string; full_name: string; email: string };
};

const STORAGE_KEY = "tenadam_auth";

function mapOrgRole(role: string): UserRole {
  const normalized = role.toLowerCase().trim();
  if (
    normalized === "reception" ||
    normalized === "doctor" ||
    normalized === "nurse" ||
    normalized === "admin" ||
    normalized === "superadmin" ||
    normalized === "pharmacist" ||
    normalized === "lab"
  ) {
    return normalized;
  }
  return "admin";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { user: User; token: string };
      if (parsed?.token && parsed?.user) {
        setUser(parsed.user);
        setToken(parsed.token);
        console.info("[Auth] Restored actor token on refresh", {
          actor: parsed.user.role === "patient" ? "patient" : "org",
          role: parsed.user.role,
          token: parsed.token,
        });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persist = useCallback((nextUser: User | null, nextToken: string | null) => {
    if (!nextUser || !nextToken) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }));
  }, []);

  const login = useCallback(async (email: string, password: string, mode: LoginMode) => {
    const endpoint = mode === "patient" ? "/auth/login" : "/org/auth/login";
    const res = await apiFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error(await getErrorMessage(res));

    if (mode === "patient") {
      const payload = await readJson<PatientAuthResponse>(res);
      const nextUser: User = {
        id: payload.data.id,
        name: payload.data.full_name,
        email: payload.data.email,
        role: "patient",
      };
      setUser(nextUser);
      setToken(payload.token);
      persist(nextUser, payload.token);
      console.info("[Auth] Logged in actor token", {
        actor: "patient",
        role: nextUser.role,
        token: payload.token,
      });
      return;
    }

    const payload = await readJson<OrgLoginResponse>(res);
    const nextUser: User = {
      id: payload.data.id,
      name: payload.data.full_name,
      email: payload.data.email,
      role: mapOrgRole(payload.data.role),
    };
    setUser(nextUser);
    setToken(payload.token);
    persist(nextUser, payload.token);
    console.info("[Auth] Logged in actor token", {
      actor: "org",
      role: nextUser.role,
      token: payload.token,
    });
  }, [persist]);

  const registerPatient = useCallback(
    async (input: { fullName: string; email: string; phone: string; password: string }) => {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) throw new Error(await getErrorMessage(res));

      const payload = await readJson<PatientAuthResponse>(res);
      const nextUser: User = {
        id: payload.data.id,
        name: payload.data.full_name,
        email: payload.data.email,
        role: "patient",
      };
      setUser(nextUser);
      setToken(payload.token);
      persist(nextUser, payload.token);
      console.info("[Auth] Logged in actor token", {
        actor: "patient",
        role: nextUser.role,
        token: payload.token,
      });
    },
    [persist]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    persist(null, null);
  }, [persist]);

  const value = useMemo(
    () => ({ user, token, isAuthenticated: !!user && !!token, login, registerPatient, logout }),
    [user, token, login, registerPatient, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
