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
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/30 p-3 transition-colors">
          <ConversationSidebar
            conversations={conversations}
            selectedId={selectedConvId}
            onSelect={handleSelectConversation}
          />
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">
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
  );
}
