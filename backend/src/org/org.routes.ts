import { Router } from "express";
import { supabase } from "../db/supabase";

const router = Router();

// Create a new organization
router.post("/", async (req, res) => {
  const user = req.user!;
  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "Organization name is required" });
  }

  // Create org
  const { data: org, error: orgErr } = await supabase
    .from("organizations")
    .insert({ name: name.trim() })
    .select()
    .single();

  if (orgErr || !org) {
    return res.status(500).json({ error: "Failed to create organization" });
  }

  // Add current user as owner
  const { error: memberErr } = await supabase.from("org_members").insert({
    org_id: org.id,
    user_id: user.id,
    user_email: user.email,
    user_name: user.name || null,
    role: "owner",
  });

  if (memberErr) {
    return res.status(500).json({ error: "Failed to add member" });
  }

  return res.json({ org });
});

// Get user's organization
router.get("/", async (req, res) => {
  const user = req.user!;

  const { data: membership, error } = await supabase
    .from("org_members")
    .select("org_id, role, organizations(id, name, created_at)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (error || !membership) {
    return res.json({ org: null });
  }

  return res.json({
    org: membership.organizations,
    role: membership.role,
  });
});

// Join an existing organization
router.post("/join", async (req, res) => {
  const user = req.user!;
  const { orgId } = req.body;

  if (!orgId || typeof orgId !== "string") {
    return res.status(400).json({ error: "Organization ID is required" });
  }

  // Check org exists
  const { data: org, error: orgErr } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("id", orgId)
    .single();

  if (orgErr || !org) {
    return res.status(404).json({ error: "Organization not found" });
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from("org_members")
    .select("id")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return res.json({ org });
  }

  // Add as member
  const { error: memberErr } = await supabase.from("org_members").insert({
    org_id: orgId,
    user_id: user.id,
    user_email: user.email,
    user_name: user.name || null,
    role: "member",
  });

  if (memberErr) {
    return res.status(500).json({ error: "Failed to join organization" });
  }

  return res.json({ org });
});

export default router;
