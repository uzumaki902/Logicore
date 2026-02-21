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

/* ── Agent Activity Indicator ── */
function AgentThinking({ loading }: { loading: boolean }) {
    const [steps, setSteps] = useState<AgentStep[]>([]);

    useEffect(() => {
        if (!loading) {
            setSteps([]);
            return;
        }

        const sequence = [
            { icon: "🔎", label: "Analyzing request...", delay: 0 },
            { icon: "🌐", label: "Searching knowledge sources...", delay: 1200 },
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
        <div className="mt-4 space-y-2.5 rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-4 transition-colors duration-200">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">
                Agent Activity
            </p>
            {steps.map((step, i) => (
                <div
                    key={i}
                    className={`flex items-center gap-2.5 text-xs transition-all duration-300 ${step.done
                            ? "text-gray-400 dark:text-slate-500"
                            : "text-gray-700 dark:text-slate-200"
                        }`}
                    style={{ animationDelay: `${i * 100}ms` }}
                >
                    <span className="text-sm">{step.icon}</span>
                    <span className="font-medium">{step.label}</span>
                    {!step.done && (
                        <span className="ml-auto inline-block h-1.5 w-1.5 rounded-full bg-[#6366F1] pulse-dot" />
                    )}
                    {step.done && (
                        <span className="ml-auto text-emerald-500 text-xs font-medium">✓</span>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ── Support Agent UI ── */
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
        <div className="grid gap-6 lg:grid-cols-2">
            {/* LEFT: Input Area */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-slate-400">
                        Customer Ticket / Email
                    </label>
                    <textarea
                        value={ticket}
                        disabled={loading}
                        onChange={(e) => onTicketChange(e.target.value)}
                        placeholder="Paste customer issue or support request..."
                        className="min-h-44 w-full rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] px-4 py-3 text-sm text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all duration-200 resize-none disabled:opacity-50"
                    />
                    <p className="text-[11px] text-gray-400 dark:text-slate-500">
                        Logicore analyzes context before drafting a reply.
                    </p>
                </div>

                <Button
                    onClick={onAgentRun}
                    disabled={loading}
                    className="h-10 w-full rounded-xl bg-[#6366F1] text-white font-medium hover:bg-[#7C83FF] transition-all duration-200 hover:scale-[1.01] press-scale disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            Generating...
                        </span>
                    ) : (
                        "Generate Response"
                    )}
                </Button>

                <AgentThinking loading={loading} />
            </div>

            {/* RIGHT: Response Panel */}
            <div className="space-y-4">
                {!result ? (
                    <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-[#1F2937] p-8 text-center">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#1A2233]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-slate-500">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                            Generated response will appear here.
                        </p>
                        <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                            Logicore analyzes the request before drafting a reply.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 fade-in">
                        {result.sources.length > 0 && (
                            <div className="rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-4 transition-colors duration-200">
                                <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">
                                    Sources
                                </h3>
                                <ul className="space-y-1.5">
                                    {result.sources.map((source, i) => (
                                        <li key={i} className="break-all text-xs">
                                            <a
                                                href={source}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[#6366F1] hover:text-[#7C83FF] no-underline hover:underline transition-colors"
                                            >
                                                {source}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-5 transition-colors duration-200">
                            <h3 className="mb-3 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">
                                Generated Reply
                            </h3>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-slate-200">
                                {result.reply}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={onCreateTicket}
                                className="flex-1 h-9 rounded-xl border-gray-200 dark:border-[#1F2937] text-xs font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1A2233] hover:text-gray-900 dark:hover:text-white transition-all duration-200 press-scale"
                            >
                                📋 Create Ticket
                            </Button>
                            <Button
                                onClick={onCreateTicket}
                                className="flex-1 h-9 rounded-xl bg-amber-600/80 text-xs font-medium text-white hover:bg-amber-500 transition-all duration-200 press-scale"
                            >
                                🚨 Escalate
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SupportAgentUi;
