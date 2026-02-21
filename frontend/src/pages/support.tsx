import SupportAgentUi from "@/components/support/support-agent-ui";
import ConversationSidebar from "@/components/support/conversation-sidebar";
import { apiGet, apiPost } from "@/lib/api";
import {
  ResponseSchema,
  type CallAgentPayload,
  type ResultState,
  type SupportResponse,
} from "@/lib/support.types";
import { useEffect, useState } from "react";

type Conversation = {
  id: string;
  title: string;
  ticket_text: string;
  reply: string;
  sources: string[];
  status: string;
  created_at: string;
};

export default function Support() {
  const [ticket, setTicket] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    const res = await apiGet<{ conversations: Conversation[] }>(
      "/api/support/history"
    );
    if (res.ok) {
      setConversations(res.data.conversations);
    }
  }

  async function callAgent(payload: CallAgentPayload) {
    setLoading(true);
    const res = await apiPost<SupportResponse & { conversationId: string }>(
      "/api/support/run",
      payload
    );
    setLoading(false);

    if (!res.ok) return null;

    const parsed = ResponseSchema.safeParse(res.data);
    if (!parsed.success) return null;

    return {
      ...parsed.data,
      conversationId: (res.data as any).conversationId || null,
    };
  }

  async function startAgentRun() {
    setResult(null);
    setConversationId(null);
    setSelectedConvId(null);

    const getTicket = ticket.trim();
    if (!getTicket) return;

    const data = await callAgent({ text: getTicket });
    if (!data) return;

    setResult({ reply: data.reply, sources: data.sources });
    setConversationId(data.conversationId);
    fetchHistory();
  }

  function handleSelectConversation(conv: Conversation) {
    setSelectedConvId(conv.id);
    setTicket(conv.ticket_text);
    setResult({
      reply: conv.reply,
      sources: conv.sources || [],
    });
    setConversationId(conv.id);
  }

  async function handleCreateTicket() {
    if (!conversationId) return;

    const title = ticket.slice(0, 60) + (ticket.length > 60 ? "..." : "");

    const res = await apiPost("/api/support/ticket", {
      conversationId,
      title,
      priority: "medium",
    });

    if (res.ok) {
      fetchHistory();
      alert("Ticket created successfully!");
    }
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
            AI Support Workspace
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Paste a customer request and let Logicore generate an intelligent response.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] px-3 py-1.5 text-[11px] font-medium text-gray-400 dark:text-slate-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#6366F1] pulse-dot" />
          AI Model • Gemini
        </div>
      </div>

      {/* Main Grid: History | Input | Response */}
      <div className="grid gap-6 lg:grid-cols-[220px_1fr_1fr]">
        {/* LEFT: History Panel */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-gray-200 dark:border-[#1F2937] bg-white dark:bg-[#111827] p-4 transition-colors duration-200">
            <ConversationSidebar
              conversations={conversations}
              selectedId={selectedConvId}
              onSelect={handleSelectConversation}
            />
          </div>
        </aside>

        {/* CENTER + RIGHT: Agent UI */}
        <div className="lg:col-span-2">
          <SupportAgentUi
            ticket={ticket}
            onTicketChange={setTicket}
            loading={loading}
            result={result}
            onAgentRun={startAgentRun}
            onCreateTicket={handleCreateTicket}
          />
        </div>
      </div>
    </div>
  );
}
