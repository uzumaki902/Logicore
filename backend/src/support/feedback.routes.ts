import { Router } from "express";
import { supabase } from "../db/supabase";
import z from "zod";

const router = Router();

const FeedbackSchema = z.object({
  conversationId: z.string().uuid(),
  rating: z.number().refine((v) => v === 1 || v === -1, {
    message: "Rating must be 1 (thumbs up) or -1 (thumbs down)",
  }),
});

// Submit feedback for a conversation
router.post("/feedback", async (req, res) => {
  const user = req.user!;
  const parsed = FeedbackSchema.safeParse(req.body);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  const { conversationId, rating } = parsed.data;

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

  // Verify conversation belongs to user's org
  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("org_id", member.org_id)
    .single();

  if (!conv) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  // Upsert feedback (update if exists, insert if not)
  const { data: feedback, error } = await supabase
    .from("feedback")
    .upsert(
      {
        conversation_id: conversationId,
        org_id: member.org_id,
        user_id: user.id,
        rating,
      },
      { onConflict: "conversation_id,user_id" },
    )
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: "Failed to save feedback" });
  }

  return res.json({ feedback });
});

// Get feedback for a specific conversation
router.get("/feedback/:conversationId", async (req, res) => {
  const user = req.user!;
  const { conversationId } = req.params;

  const { data: feedback } = await supabase
    .from("feedback")
    .select("rating")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .single();

  return res.json({ rating: feedback?.rating ?? null });
});

export default router;
