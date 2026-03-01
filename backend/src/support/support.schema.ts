import z from "zod";

export const RequestSchema = z.object({
  text: z.string().min(1),
});

export const DraftSchema = z.object({
  reply: z.string().min(1),
  sources: z.array(z.string().min(1)).max(3),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  category: z
    .enum(["billing", "technical", "account", "general"])
    .default("general"),
  confidence: z.number().min(0).max(100).default(80),
});

export type SupportResponse = z.infer<typeof DraftSchema>;
