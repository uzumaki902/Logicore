import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { BACKEND_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/images/logilogo.png";

export default function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/support", { replace: true });
    }
  }, [loading, user, navigate]);

  function onLogin() {
    setBtnLoading(true);
    window.location.href = `${BACKEND_URL}/auth/login`;
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded-full border-2 border-[#6366F1] border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400 dark:text-slate-400">Checking session...</p>
        </div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex min-h-[70vh] items-center fade-in">
      <div className="grid w-full gap-16 lg:grid-cols-2 lg:items-center">
        {/* LEFT: Brand story */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#111827] ring-1 ring-gray-200 dark:ring-[#1F2937]">
              <img src={logo} alt="Logicore" className="h-6 w-6 object-contain" />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
              Logicore
            </span>
          </div>

          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-gray-900 dark:text-white md:text-5xl">
              <span className="block">AI agents that handle</span>
              <span className="block text-gray-400 dark:text-slate-400">
                support — intelligently.
              </span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-gray-500 dark:text-slate-400">
              Resolve queries, draft responses, and escalate issues automatically
              using AI agents built for real workflows.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5 hover-lift transition-all duration-200">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]/10 text-[#6366F1]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Structured AI Responses
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                Clear replies with actions and next steps.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5 hover-lift transition-all duration-200">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]/10 text-[#6366F1]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Context-Aware Intelligence
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                Combines live web data and internal knowledge.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Login card */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-8 shadow-lg hover-lift">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Welcome back to Logicore
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              Access your organization's AI support workspace.
            </p>

            <div className="mt-8">
              <Button
                data-testid="login-btn"
                onClick={onLogin}
                disabled={btnLoading}
                className="h-11 w-full cursor-pointer rounded-xl bg-[#6366F1] text-white font-medium hover:bg-[#7C83FF] transition-all duration-200 hover:scale-[1.01] press-scale disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {btnLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Redirecting...
                  </span>
                ) : (
                  "Continue to Logicore"
                )}
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-gray-400 dark:text-slate-500">
              AI-powered support infrastructure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
