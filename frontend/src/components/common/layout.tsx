import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import logo from "@/assets/images/logilogo.png";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/context/theme";

export default function CommonLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, logout, user, org } = useAuth();
  const { theme, toggleTheme } = useTheme();

  async function onlogout() {
    await logout();
    navigate("/login");
  }

  const showNav = !loading && user && org;

  function navClass(path: string) {
    const active = location.pathname === path;
    return `rounded-lg px-3 py-1.5 text-sm font-medium transition ${active
      ? "bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-white"
      : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800/50"
      }`;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F14] transition-colors duration-300">
      <header className="sticky top-0 z-20 border-b border-gray-200 dark:border-slate-800 bg-white/90 dark:bg-[#0B0F14]/90 backdrop-blur-md transition-colors duration-300">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link to="/" className="no-underline">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 ring-1 ring-gray-200 dark:ring-slate-700">
                <img
                  src={logo}
                  alt="Logicore"
                  className="h-5 w-5 object-contain"
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Logicore
              </span>
            </div>
          </Link>

          {showNav && (
            <nav className="ml-6 flex items-center gap-1">
              <Link to="/support" className={`${navClass("/support")} no-underline`}>
                Support
              </Link>
              <Link to="/dashboard" className={`${navClass("/dashboard")} no-underline`}>
                Dashboard
              </Link>
            </nav>
          )}

          <div className="ml-auto flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {showNav && (
              <span className="hidden text-xs text-gray-400 dark:text-slate-500 sm:inline">
                {org.name}
              </span>
            )}
            {!loading && user ? (
              <Button
                onClick={onlogout}
                className="h-8 text-xs bg-black text-white hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
              >
                Logout
              </Button>
            ) : null}
          </div>
        </div>
      </header>
      <main className="relative mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
