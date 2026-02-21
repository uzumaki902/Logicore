import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth";

export default function OrgSetup() {
    const navigate = useNavigate();
    const { refreshOrg } = useAuth();
    const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
    const [name, setName] = useState("");
    const [orgId, setOrgId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleCreate() {
        if (!name.trim()) return;
        setLoading(true);
        setError("");

        const res = await apiPost("/api/org", { name: name.trim() });

        if (res.ok) {
            await refreshOrg();
            navigate("/support", { replace: true });
        } else {
            setError("Failed to create organization");
        }
        setLoading(false);
    }

    async function handleJoin() {
        if (!orgId.trim()) return;
        setLoading(true);
        setError("");

        const res = await apiPost("/api/org/join", { orgId: orgId.trim() });

        if (res.ok) {
            await refreshOrg();
            navigate("/support", { replace: true });
        } else {
            setError("Organization not found");
        }
        setLoading(false);
    }

    return (
        <div className="flex min-h-[60vh] items-center justify-center fade-in">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                        Set up your workspace
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                        Each organization manages its own AI support workspace
                    </p>
                </div>

                {mode === "choose" && (
                    <div className="grid gap-4">
                        <button
                            onClick={() => setMode("create")}
                            className="rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-6 text-left transition-all duration-200 hover:border-[#6366F1]/50 hover:bg-gray-50 dark:hover:bg-[#1A2233] hover-lift"
                        >
                            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]/10 text-[#6366F1]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Create Organization
                            </h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                                Start a new workspace for your team
                            </p>
                        </button>

                        <button
                            onClick={() => setMode("join")}
                            className="rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-6 text-left transition-all duration-200 hover:border-[#6366F1]/50 hover:bg-gray-50 dark:hover:bg-[#1A2233] hover-lift"
                        >
                            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]/10 text-[#6366F1]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <line x1="20" y1="8" x2="20" y2="14" />
                                    <line x1="23" y1="11" x2="17" y2="11" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Join Organization
                            </h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                                Join an existing workspace with an invite code
                            </p>
                        </button>
                    </div>
                )}

                {mode === "create" && (
                    <div className="rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-6 space-y-4 transition-colors duration-200">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Create Organization
                        </h3>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 dark:text-slate-400">
                                Organization name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Acme Inc."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                className="h-10 w-full rounded-lg border border-gray-200 dark:border-[#1F2937] bg-gray-50 dark:bg-[#0B0F14] px-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all duration-200 disabled:opacity-50"
                            />
                        </div>
                        {error && <p className="text-xs text-red-400">{error}</p>}
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setMode("choose")}
                                disabled={loading}
                                className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white rounded-xl"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={loading}
                                className="flex-1 rounded-xl bg-[#6366F1] text-white font-medium hover:bg-[#7C83FF] transition-all duration-200 press-scale disabled:opacity-60"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                        Creating...
                                    </span>
                                ) : (
                                    "Create"
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {mode === "join" && (
                    <div className="rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-6 space-y-4 transition-colors duration-200">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Join Organization
                        </h3>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 dark:text-slate-400">
                                Organization ID
                            </label>
                            <input
                                type="text"
                                placeholder="Paste organization ID"
                                value={orgId}
                                onChange={(e) => setOrgId(e.target.value)}
                                disabled={loading}
                                className="h-10 w-full rounded-lg border border-gray-200 dark:border-[#1F2937] bg-gray-50 dark:bg-[#0B0F14] px-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all duration-200 disabled:opacity-50"
                            />
                        </div>
                        {error && <p className="text-xs text-red-400">{error}</p>}
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setMode("choose")}
                                disabled={loading}
                                className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white rounded-xl"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleJoin}
                                disabled={loading}
                                className="flex-1 rounded-xl bg-[#6366F1] text-white font-medium hover:bg-[#7C83FF] transition-all duration-200 press-scale disabled:opacity-60"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                        Joining...
                                    </span>
                                ) : (
                                    "Join"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
