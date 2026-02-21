import z from "zod";

export const RequestSchema = z.object({
  text: z.string().min(1),
});

export const DraftSchema = z.object({
  reply: z.string().min(1),
  sources: z.array(z.string().min(1)).max(3),
});

export type SupportResponse = z.infer<typeof DraftSchema>;
