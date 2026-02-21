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

export default function ConversationSidebar({
    conversations,
    selectedId,
    onSelect,
}: Props) {
    return (
        <div className="space-y-1">
            <h2 className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">
                History
            </h2>
            {conversations.length === 0 ? (
                <p className="px-2 text-xs text-gray-400 dark:text-slate-500">No conversations yet</p>
            ) : (
                conversations.map((conv) => (
                    <button
                        key={conv.id}
                        onClick={() => onSelect(conv)}
                        className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${selectedId === conv.id
                            ? "bg-indigo-600/10 text-indigo-400"
                            : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/50"
                            }`}
                    >
                        <div className="truncate text-xs font-medium">{conv.title}</div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400 dark:text-slate-500">
                            <span
                                className={`inline-block h-1.5 w-1.5 rounded-full ${conv.status === "escalated"
                                    ? "bg-amber-400"
                                    : "bg-emerald-400"
                                    }`}
                            />
                            {conv.status === "escalated" ? "Escalated" : "Resolved"}
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
