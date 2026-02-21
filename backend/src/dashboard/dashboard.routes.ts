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

  return res.json({
    totalQueries: totalQueries || 0,
    resolvedByAi: resolvedByAi || 0,
    escalated: escalated || 0,
  });
});

export default router;
