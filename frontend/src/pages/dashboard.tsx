import { apiGet } from "@/lib/api";
import { useEffect, useState } from "react";

type Stats = {
    totalQueries: number;
    resolvedByAi: number;
    escalated: number;
};

type ActivityItem = {
    title: string;
    status: "resolved" | "pending" | "drafted";
};

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            const res = await apiGet<Stats>("/api/dashboard/stats");
            if (res.ok) {
                setStats(res.data);
            }
            setLoading(false);
        }
        fetchStats();
    }, []);

    const activeThreads = stats
        ? Math.max(0, stats.totalQueries - stats.resolvedByAi - stats.escalated)
        : 0;

    const cards = [
        {
            label: "Total Support Requests",
            value: stats?.totalQueries ?? 0,
            trend: "+3 today",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            ),
            accent: "#6366F1",
        },
        {
            label: "AI Resolved Requests",
            value: stats?.resolvedByAi ?? 0,
            trend: "Automated",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            ),
            accent: "#10B981",
        },
        {
            label: "Escalated to Human",
            value: stats?.escalated ?? 0,
            trend: "Requires review",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            ),
            accent: "#F59E0B",
        },
        {
            label: "Active Support Threads",
            value: activeThreads,
            trend: "In progress",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                </svg>
            ),
            accent: "#8B5CF6",
        },
    ];

    /* Mock recent activity derived from stats */
    const recentActivity: ActivityItem[] = [
        { title: "Login issue — password reset", status: "resolved" },
        { title: "Webhook failure — endpoint timeout", status: "pending" },
        { title: "Billing request — plan upgrade", status: "drafted" },
    ];

    const statusConfig: Record<string, { color: string; label: string }> = {
        resolved: { color: "bg-emerald-500", label: "Resolved" },
        pending: { color: "bg-amber-400", label: "Pending" },
        drafted: { color: "bg-[#6366F1]", label: "AI Drafted" },
    };

    /* Skeleton loader */
    if (loading) {
        return (
            <div className="space-y-8 fade-in">
                <div>
                    <div className="skeleton h-7 w-40 mb-2" />
                    <div className="skeleton h-4 w-72" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-6">
                            <div className="skeleton h-8 w-8 rounded-lg mb-4" />
                            <div className="skeleton h-8 w-16 mb-2" />
                            <div className="skeleton h-4 w-32" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    Monitor AI support performance across your organization.
                </p>
            </div>

            {/* Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className="rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-6 hover-lift transition-all duration-200"
                    >
                        <div
                            className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${card.accent}15`, color: card.accent }}
                        >
                            {card.icon}
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {card.value}
                        </div>
                        <p className="mt-1 text-xs font-medium text-gray-500 dark:text-slate-400">
                            {card.label}
                        </p>
                        <p className="mt-0.5 text-[10px] text-gray-400 dark:text-slate-500">
                            {card.trend}
                        </p>
                    </div>
                ))}
            </div>

            {/* Recent Support Activity */}
            <div className="rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-6 transition-colors duration-200">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Recent Support Activity
                </h2>
                {stats && stats.totalQueries > 0 ? (
                    <div className="space-y-3">
                        {recentActivity.map((item, i) => {
                            const sc = statusConfig[item.status] ?? statusConfig.pending;
                            return (
                                <div
                                    key={i}
                                    className="flex items-center justify-between rounded-lg px-4 py-3 bg-gray-50 dark:bg-[#0B0F14]/50 transition-colors duration-200"
                                >
                                    <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                                        {item.title}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-slate-400">
                                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${sc.color}`} />
                                        {sc.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                            Activity will appear as support requests are processed.
                        </p>
                    </div>
                )}
            </div>

            {/* AI Performance Overview */}
            <div className="rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-6 transition-colors duration-200">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    AI Performance Overview
                </h2>
                {stats && stats.totalQueries > 0 ? (
                    <div className="space-y-3">
                        {[
                            {
                                label: "AI Resolution Rate",
                                value: stats.totalQueries > 0
                                    ? `${Math.round((stats.resolvedByAi / stats.totalQueries) * 100)}%`
                                    : "0%",
                            },
                            {
                                label: "Escalation Rate",
                                value: stats.totalQueries > 0
                                    ? `${Math.round((stats.escalated / stats.totalQueries) * 100)}%`
                                    : "0%",
                            },
                            {
                                label: "Average Response Time",
                                value: "< 3s",
                            },
                            {
                                label: "Knowledge Sources Used",
                                value: "Web + Internal KB",
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between rounded-lg px-4 py-3 bg-gray-50 dark:bg-[#0B0F14]/50 transition-colors duration-200"
                            >
                                <span className="text-sm text-gray-600 dark:text-slate-300">
                                    {item.label}
                                </span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                            Performance data will appear after processing support requests.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
