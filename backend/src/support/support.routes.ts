import { Router } from "express";
import { DraftSchema, RequestSchema } from "./support.schema";
import { createAgent } from "langchain";
import { MessagesValue, StateSchema } from "@langchain/langgraph";
import { TavilyResult, tavilySearch } from "./tavily";
import { supabase } from "../db/supabase";

const router = Router();

const GEMINI_MODEL = "google-genai:gemini-2.5-flash-lite";

const AgentState = new StateSchema({ messages: MessagesValue });

function makeAgent() {
  return createAgent({
    model: GEMINI_MODEL,
    stateSchema: AgentState,
    tools: [],
    responseFormat: DraftSchema,
    systemPrompt: "Return strict JSON only. No Markdown. No extra keys",
  });
}

function shouldWebSearch(ticket: string) {
  const ticketLowerCase = ticket.toLowerCase();

  if (/\b(non-?docs?|no\s+docs?)\b/.test(ticketLowerCase)) return false;

  const technicalSignals =
    /\b(docs?|documentation|oauth|oidc|redirect_uri|callback|webhook|signature|hmac|idempotenc(y|e)|integration|sdk|api|sso|saml|okta|scim)\b/;

  return technicalSignals.test(ticketLowerCase);
}

function formatSearchResults(results: TavilyResult[]) {
  if (!results.length) return "none";

  return results
    .map((res, index) => {
      const snip = res.snippet?.trim() ? res.snippet.trim() : "no snippet";

      return `#${index + 1} ${res.title}\n${res.url}\n${snip}`;
    })
    .join("\n\n");
}

function createPrompt(args: { ticket: string; searchResults: TavilyResult[] }) {
  const hasSearchResult = args.searchResults.length > 0;

  return [
    "You are a B2B support desk agent.",
    "Write a customer-ready reply.",
    "",
    "Output ONLY strict JSON with this exact shape:",
    '{ "reply": string, "sources": string[] }',
    "",
    "Rules:",
    "- Be polite, clear, short paragraphs.",
    "- Ask for missing info if needed.",
    "- Do NOT make strong promises (no guarantees).",
    hasSearchResult
      ? "- If you used any webSearch result, sources[] MUST contain 1–3 URLs FROM the provided webSearch results."
      : "- sources[] MUST be [].",
    "",
    "webSearch results:",
    formatSearchResults(args.searchResults),
    "",
    "Ticket:",
    args.ticket,
  ].join("\n");
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

function isHttpUrl(input: string) {
  try {
    const check = new URL(input);
    return check.protocol === "http:" || check.protocol === "https:";
  } catch {
    return false;
  }
}

router.post("/run", async (req, res) => {
  const parsed = RequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { text } = parsed.data;
  const ticket = text.trim();

  // set some rules -> web search ? or dont ?

  const doWebSearch = shouldWebSearch(ticket);

  let searchResults: TavilyResult[] = [];

  try {
    if (doWebSearch) {
      const ticket = text.trim();
      searchResults = await tavilySearch({ query: ticket.slice(0, 200) });
    }
  } catch {
    searchResults = [];
  }

  try {
    const agent = makeAgent();
    const prompt = createPrompt({ ticket, searchResults });

    const out = await agent.invoke({
      messages: [{ role: "user", content: prompt }],
    });

    const draft = DraftSchema.parse(out.structuredResponse);

    let sources = uniq(draft.sources).filter(
      (source) => typeof source === "string",
    );
    sources = sources.filter(isHttpUrl).slice(0, 3);

    if (doWebSearch && searchResults.length > 0) {
      const allowed = uniq(
        searchResults
          .map((searchRes) =>
            typeof searchRes.url === "string" ? searchRes.url.trim() : "",
          )
          .filter(Boolean),
      );

      if (sources.length === 0) {
        return res.status(422).json({
          error: "sources are empty",
        });
      }

      const badSources = sources.filter((source) => !allowed.includes(source));

      if (badSources.length > 0) {
        return res.status(422).json({
          error: "sources not allowed",
          badSources,
          allowedSources: allowed.slice(0, 3),
        });
      }

      // Save conversation to DB
      let conversationId: string | null = null;
      const { data: member } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", req.user!.id)
        .limit(1)
        .single();

      if (member) {
        const title = ticket.slice(0, 60) + (ticket.length > 60 ? "..." : "");
        const { data: conv } = await supabase
          .from("conversations")
          .insert({
            org_id: member.org_id,
            user_id: req.user!.id,
            title,
            ticket_text: ticket,
            reply: draft.reply,
            sources,
            status: "resolved",
          })
          .select("id")
          .single();
        conversationId = conv?.id || null;
      }

      return res.json({ reply: draft.reply, sources, conversationId });
    }

    return res.json({ reply: draft.reply, sources: [], conversationId: null });
  } catch (err: any) {
    return res.status(500).json({
      error: "Source agent failed",
      details: err?.message || String(err),
    });
  }
});

// Get conversation history for user's org
router.get("/history", async (req, res) => {
  const user = req.user!;

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!member) {
    return res.json({ conversations: [] });
  }

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return res.status(500).json({ error: "Failed to fetch history" });
  }

  return res.json({ conversations: conversations || [] });
});

export default router;
