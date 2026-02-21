import type { ResultState } from "@/lib/support.types";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";

type AgentStep = {
    icon: string;
    label: string;
    done: boolean;
};

type Props = {
    ticket: string;
    onTicketChange: (val: string) => void;
    loading: boolean;
    result: ResultState | null;
    onAgentRun: () => void;
    onCreateTicket: () => void;
};

function AgentThinking({ loading }: { loading: boolean }) {
    const [steps, setSteps] = useState<AgentStep[]>([]);

    useEffect(() => {
        if (!loading) {
            setSteps([]);
            return;
        }

        const sequence = [
            { icon: "🔎", label: "Analyzing ticket...", delay: 0 },
            { icon: "🌐", label: "Searching knowledge base...", delay: 1200 },
            { icon: "✨", label: "Generating response...", delay: 2400 },
        ];

        const timeouts: ReturnType<typeof setTimeout>[] = [];

        sequence.forEach((step) => {
            const t = setTimeout(() => {
                setSteps((prev) => [
                    ...prev.map((s) => ({ ...s, done: true })),
                    { icon: step.icon, label: step.label, done: false },
                ]);
            }, step.delay);
            timeouts.push(t);
        });

        return () => timeouts.forEach(clearTimeout);
    }, [loading]);

    if (!loading && steps.length === 0) return null;

    return (
        <div className="mt-4 space-y-2 rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 p-4 transition-colors">
            {steps.map((step, i) => (
                <div
                    key={i}
                    className={`flex items-center gap-2 text-xs transition-opacity duration-300 ${step.done ? "text-gray-400 dark:text-slate-500" : "text-gray-600 dark:text-slate-300"
                        }`}
                >
                    <span>{step.icon}</span>
                    <span>{step.label}</span>
                    {!step.done && (
                        <span className="ml-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
                    )}
                    {step.done && <span className="ml-1 text-emerald-400 text-[10px]">✓</span>}
                </div>
            ))}
        </div>
    );
}

function SupportAgentUi(props: Props) {
    const {
        result,
        loading,
        ticket,
        onTicketChange,
        onAgentRun,
        onCreateTicket,
    } = props;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Support Agent
                    </h1>
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                        Paste a ticket and let AI draft the reply
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 px-2.5 py-1 text-[10px] font-medium text-gray-400 dark:text-slate-400 transition-colors">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    Powered by Gemini
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                {/* Left: Input */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 dark:text-slate-400">
                            Client Ticket / Email
                        </label>
                        <textarea
                            value={ticket}
                            disabled={loading}
                            onChange={(e) => onTicketChange(e.target.value)}
                            placeholder="Paste the customer's support request..."
                            className="min-h-40 w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 px-3 py-3 text-sm text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
                        />
                    </div>

                    <Button
                        onClick={onAgentRun}
                        disabled={loading}
                        className="h-10 w-full bg-indigo-600 text-white hover:bg-indigo-500 transition-all hover:scale-[1.01]"
                    >
                        {loading ? "Running..." : "Run Agent"}
                    </Button>

                    <AgentThinking loading={loading} />
                </div>

                {/* Right: Results */}
                <div className="lg:col-span-3 space-y-4">
                    {!result ? (
                        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-slate-800 text-xs text-gray-400 dark:text-slate-500">
                            Run the agent to generate a reply
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {result.sources.length > 0 && (
                                <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 p-4 transition-colors">
                                    <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">
                                        Sources
                                    </h3>
                                    <ul className="space-y-1">
                                        {result.sources.map((source, i) => (
                                            <li key={i} className="break-all text-xs">
                                                <a
                                                    href={source}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-indigo-400 hover:text-indigo-300 no-underline hover:underline"
                                                >
                                                    {source}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 p-4 transition-colors">
                                <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">
                                    Generated Reply
                                </h3>
                                <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-slate-200">
                                    {result.reply}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={onCreateTicket}
                                    className="flex-1 h-9 border-gray-300 dark:border-slate-700 text-xs text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                                >
                                    📋 Create Ticket
                                </Button>
                                <Button
                                    onClick={onCreateTicket}
                                    className="flex-1 h-9 bg-amber-600/80 text-xs text-white hover:bg-amber-500"
                                >
                                    🚨 Escalate
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SupportAgentUi;
