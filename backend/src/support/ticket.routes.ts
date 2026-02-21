import { Router } from "express";
import { supabase } from "../db/supabase";

const router = Router();

// Create a ticket from a conversation
router.post("/ticket", async (req, res) => {
  const user = req.user!;
  const { conversationId, title, priority } = req.body;

  if (!conversationId || !title) {
    return res.status(400).json({ error: "conversationId and title required" });
  }

  // Get user's org
  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!member) {
    return res.status(400).json({ error: "No organization found" });
  }

  const { data: ticket, error } = await supabase
    .from("tickets")
    .insert({
      org_id: member.org_id,
      conversation_id: conversationId,
      user_id: user.id,
      title: title.trim(),
      priority: priority || "medium",
      status: "open",
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: "Failed to create ticket" });
  }

  // Update conversation status to escalated
  await supabase
    .from("conversations")
    .update({ status: "escalated" })
    .eq("id", conversationId);

  return res.json({ ticket });
});

// List tickets for user's org
router.get("/tickets", async (req, res) => {
  const user = req.user!;

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!member) {
    return res.json({ tickets: [] });
  }

  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: "Failed to fetch tickets" });
  }

  return res.json({ tickets: tickets || [] });
});

export default router;
