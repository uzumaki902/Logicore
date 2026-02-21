import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { BACKEND_URL } from "@/lib/api";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/images/logilogo.png";

export default function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/support", { replace: true });
    }
  }, [loading, user, navigate]);

  function onLogin() {
    window.location.href = `${BACKEND_URL}/auth/login`;
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-400 dark:text-slate-400">Checking session...</p>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex min-h-[70vh] items-center">
      <div className="grid w-full gap-16 lg:grid-cols-2 lg:items-center">
        {/* LEFT: Brand story */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 ring-1 ring-gray-200 dark:ring-slate-700">
              <img
                src={logo}
                alt="Logicore"
                className="h-6 w-6 object-contain"
              />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Logicore</span>
          </div>

          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-gray-900 dark:text-white md:text-5xl">
              <span className="block">Automate support</span>
              <span className="block text-gray-400 dark:text-slate-400">with intelligent AI agents</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-gray-500 dark:text-slate-400">
              Triage tickets, draft replies, and escalate issues — all powered by agentic AI infrastructure.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Structured Output</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                Category, reply, sources & next actions
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Multi-source AI</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                Web search + knowledge base reasoning
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Login card */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sign in to Logicore
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              Access your AI support workspace
            </p>

            <div className="mt-8">
              <Button
                data-testid="login-btn"
                onClick={onLogin}
                className="h-11 w-full cursor-pointer bg-indigo-600 text-white hover:bg-indigo-500 transition-all hover:scale-[1.01]"
              >
                Sign in with SSO
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-gray-400 dark:text-slate-500">
              Powered by Agentic AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
