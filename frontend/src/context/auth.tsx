import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "@/lib/api";

export type User = {
  id: string;
  email: string;
  name?: string;
};

type MeResponse = {
  user: User;
};

type AuthContextVal = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextVal | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        const res = await apiGet<MeResponse>("/auth/me");
        if (!mounted) return;

        if (res.ok) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  async function logout() {
    await apiPost("/auth/logout");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contextVal = useContext(AuthContext);
  if (!contextVal) throw new Error("useAuth must be used inside AuthProvider");
  return contextVal;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }
  }, [loading, navigate, user, location.pathname]);

  if (loading) return <div>Checking session...</div>;
  if (!user) return null;

  return <>{children}</>;
}
