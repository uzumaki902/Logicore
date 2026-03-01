import { Router } from "express";
import { supabase } from "../db/supabase";

const router = Router();

router.get("/stats", async (req, res) => {
  const user = req.user!;

  // Get user's org
  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!member) {
    return res.json({
      totalQueries: 0,
      resolvedByAi: 0,
      escalated: 0,
    });
  }

  const orgId = member.org_id;

  // Total conversations
  const { count: totalQueries } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId);

  // Resolved by AI
  const { count: resolvedByAi } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("status", "resolved");

  // Escalated (tickets)
  const { count: escalated } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId);

  // Feedback stats
  const { count: totalFeedback } = await supabase
    .from("feedback")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId);

  const { count: positiveFeedback } = await supabase
    .from("feedback")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("rating", 1);

  const aiSatisfaction =
    totalFeedback && totalFeedback > 0
      ? Math.round(((positiveFeedback || 0) / totalFeedback) * 100)
      : null;

  // Recent conversations for activity feed
  const { data: recentConversations } = await supabase
    .from("conversations")
    .select("title, status, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(5);

  // KB resolved count
  const { count: kbResolved } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("used_kb", true);

  return res.json({
    totalQueries: totalQueries || 0,
    resolvedByAi: resolvedByAi || 0,
    escalated: escalated || 0,
    aiSatisfaction,
    totalFeedback: totalFeedback || 0,
    kbResolved: kbResolved || 0,
    recentActivity: recentConversations || [],
  });
});

export default router;
