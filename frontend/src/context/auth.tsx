import { apiGet, apiPost } from "@/lib/api";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type User = {
  id: string;
  email: string;
  name?: string;
};

type Org = {
  id: string;
  name: string;
} | null;

type MeResponse = {
  user: User;
};

type OrgResponse = {
  org: Org;
};

type AuthContextVal = {
  user: User | null;
  org: Org;
  loading: boolean;
  logout: () => Promise<void>;
  refreshOrg: () => Promise<void>;
};

const AuthContext = createContext<AuthContextVal | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [org, setOrg] = useState<Org>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const res = await apiGet<MeResponse>("/auth/me");

      if (res.ok) {
        setUser(res.data.user);
        // Also fetch org
        const orgRes = await apiGet<OrgResponse>("/api/org");
        if (orgRes.ok) {
          setOrg(orgRes.data.org);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    }

    fetchUser();
  }, []);

  async function refreshOrg() {
    const orgRes = await apiGet<OrgResponse>("/api/org");
    if (orgRes.ok) {
      setOrg(orgRes.data.org);
    }
  }

  async function logout() {
    await apiPost("/auth/logout");
    setUser(null);
    setOrg(null);
  }

  return (
    <AuthContext.Provider value={{ user, org, loading, logout, refreshOrg }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contextVal = useContext(AuthContext);

  if (!contextVal) throw new Error("useAuth must be used inside provider");

  return contextVal;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, org, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }

    // If user is logged in but has no org, redirect to org-setup
    // (unless already on org-setup page)
    if (!org && location.pathname !== "/org-setup") {
      navigate("/org-setup", { replace: true });
    }
  }, [loading, navigate, user, org, location.pathname]);

  if (loading) return <div>Checking session...</div>;
  if (!user) return null;

  return <>{children}</>;
}