type Conversation = {
    id: string;
    title: string;
    ticket_text: string;
    reply: string;
    sources: string[];
    status: string;
    created_at: string;
};

type Props = {
    conversations: Conversation[];
    selectedId: string | null;
    onSelect: (conv: Conversation) => void;
};

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { color: string; label: string }> = {
        resolved: { color: "bg-emerald-500", label: "Resolved" },
        pending: { color: "bg-amber-400", label: "Pending" },
        escalated: { color: "bg-red-500", label: "Escalated" },
    };
    const { color, label } = config[status] ?? config.pending;

    return (
        <span className="flex items-center gap-1.5">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />
            <span>{label}</span>
        </span>
    );
}

export default function ConversationSidebar({
    conversations,
    selectedId,
    onSelect,
}: Props) {
    return (
        <div className="space-y-1">
            <h2 className="mb-3 px-2 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">
                Conversation History
            </h2>

            {conversations.length === 0 ? (
                <div className="px-2 py-6 text-center">
                    <div className="mb-2 mx-auto flex h-8 w-8 items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#1A2233]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-slate-500">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
                        No conversations yet.
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-400 dark:text-slate-500">
                        Start by generating your first AI response.
                    </p>
                </div>
            ) : (
                conversations.map((conv) => (
                    <button
                        key={conv.id}
                        onClick={() => onSelect(conv)}
                        className={`w-full rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${selectedId === conv.id
                                ? "bg-[#6366F1]/10 text-[#6366F1] dark:text-indigo-400"
                                : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1A2233]"
                            }`}
                    >
                        <div className="truncate text-xs font-medium">{conv.title}</div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400 dark:text-slate-500">
                            <StatusBadge status={conv.status} />
                            <span>·</span>
                            <span>
                                {new Date(conv.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    </button>
                ))
            )}
        </div>
    );
}
