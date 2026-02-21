import { apiGet } from "@/lib/api";
import { useEffect, useState } from "react";

type Stats = {
    totalQueries: number;
    resolvedByAi: number;
    escalated: number;
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

    if (loading) {
        return (
            <div className="text-sm text-gray-400 dark:text-slate-500">Loading analytics...</div>
        );
    }

    const cards = [
        {
            label: "Total Queries",
            value: stats?.totalQueries ?? 0,
            border: "border-indigo-500/20",
            bg: "bg-indigo-500/5",
            text: "text-indigo-400",
            dot: "bg-indigo-500",
        },
        {
            label: "Resolved by AI",
            value: stats?.resolvedByAi ?? 0,
            border: "border-emerald-500/20",
            bg: "bg-emerald-500/5",
            text: "text-emerald-400",
            dot: "bg-emerald-500",
        },
        {
            label: "Escalated",
            value: stats?.escalated ?? 0,
            border: "border-amber-500/20",
            bg: "bg-amber-500/5",
            text: "text-amber-400",
            dot: "bg-amber-500",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    Overview of your support desk activity
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className={`rounded-xl border p-6 ${card.border} ${card.bg}`}
                    >
                        <div className={`flex items-center gap-2 text-xs font-medium ${card.text}`}>
                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${card.dot}`} />
                            {card.label}
                        </div>
                        <div className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                            {card.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
