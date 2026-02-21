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
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Set up your workspace
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                        Each organization manages its own AI support workspace
                    </p>
                </div>

                {mode === "choose" && (
                    <div className="grid gap-3">
                        <button
                            onClick={() => setMode("create")}
                            className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 p-5 text-left transition hover:border-indigo-500/50 hover:bg-gray-100 dark:hover:bg-slate-800/50"
                        >
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Create Organization
                            </h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                                Start a new workspace for your team
                            </p>
                        </button>

                        <button
                            onClick={() => setMode("join")}
                            className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 p-5 text-left transition hover:border-indigo-500/50 hover:bg-gray-100 dark:hover:bg-slate-800/50"
                        >
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
                    <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 p-6 space-y-4 transition-colors">
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
                                className="h-10 w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                        </div>
                        {error && <p className="text-xs text-red-400">{error}</p>}
                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setMode("choose")}
                                disabled={loading}
                                className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={loading}
                                className="flex-1 bg-indigo-600 text-white hover:bg-indigo-500"
                            >
                                {loading ? "Creating..." : "Create"}
                            </Button>
                        </div>
                    </div>
                )}

                {mode === "join" && (
                    <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 p-6 space-y-4 transition-colors">
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
                                className="h-10 w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                            />
                        </div>
                        {error && <p className="text-xs text-red-400">{error}</p>}
                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setMode("choose")}
                                disabled={loading}
                                className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleJoin}
                                disabled={loading}
                                className="flex-1 bg-indigo-600 text-white hover:bg-indigo-500"
                            >
                                {loading ? "Joining..." : "Join"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
