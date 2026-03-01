import { z } from "zod";

export const ResponseSchema = z.object({
  reply: z.string(),
  sources: z.array(z.string()).default([]),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  category: z.enum(["billing", "technical", "account", "general"]).optional(),
  confidence: z.number().optional(),
  autoEscalated: z.boolean().optional(),
});

export type SupportResponse = z.infer<typeof ResponseSchema>;

export type ResultState = {
  reply: string;
  sources: string[];
  priority?: "low" | "medium" | "high" | "critical";
  category?: "billing" | "technical" | "account" | "general";
  confidence?: number;
  autoEscalated?: boolean;
};

export type CallAgentPayload = {
  text: string;
};
