import { Router } from "express";
import { supabase } from "../db/supabase";
import z from "zod";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require("pdf-parse");

const router = Router();

// Chunk text into smaller pieces
function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 20) {
      chunks.push(chunk);
    }
    start += chunkSize - overlap;
  }

  return chunks;
}

// Generate embeddings using Gemini Embedding API
async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No Gemini API key configured");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: {
          parts: [{ text: text.slice(0, 2000) }],
        },
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Embedding API failed: ${err}`);
  }

  const data = await response.json();
  return data.embedding.values;
}

// Search knowledge base using vector similarity
export async function knowledgeBaseSearch(
  query: string,
  orgId: string,
  limit = 3,
): Promise<{ chunk_text: string; filename: string; similarity: number }[]> {
  try {
    // Check if org has any documents
    const { count } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("status", "ready");

    if (!count || count === 0) return [];

    const queryEmbedding = await generateEmbedding(query);

    // Use Supabase RPC for vector similarity search
    const { data, error } = await supabase.rpc("match_document_chunks", {
      query_embedding: queryEmbedding,
      match_org_id: orgId,
      match_count: limit,
      match_threshold: 0.3,
    });

    if (error || !data) return [];

    return data.map((item: any) => ({
      chunk_text: item.chunk_text,
      filename: item.filename || "document",
      similarity: item.similarity,
    }));
  } catch {
    return [];
  }
}

const UploadSchema = z.object({
  filename: z.string().min(1),
  content: z.string().min(10),
});

// Upload a document (accepts raw text)
router.post("/upload", async (req, res) => {
  const user = req.user!;
  const parsed = UploadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  const { filename, content } = parsed.data;

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

  // Create document record
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .insert({
      org_id: member.org_id,
      filename,
      file_size: content.length,
      status: "processing",
    })
    .select()
    .single();

  if (docError || !doc) {
    return res.status(500).json({ error: "Failed to create document" });
  }

  // Process in background (chunk + embed)
  processDocument(doc.id, member.org_id, content).catch(console.error);

  return res.json({ document: doc, message: "Document is being processed" });
});

// Upload from URL (fetch content from a link, supports PDF + text + HTML)
const UrlUploadSchema = z.object({
  url: z.string().url(),
});

router.post("/upload-url", async (req, res) => {
  const user = req.user!;
  const parsed = UrlUploadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const { url } = parsed.data;

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

  try {
    // Fetch the URL
    const response = await fetch(url, {
      headers: { "User-Agent": "Logicore-KB/1.0" },
    });

    if (!response.ok) {
      return res
        .status(400)
        .json({ error: `Failed to fetch URL: ${response.status}` });
    }

    const contentType = response.headers.get("content-type") || "";
    let textContent = "";
    const filename = url.split("/").pop()?.split("?")[0] || "document";

    if (contentType.includes("application/pdf")) {
      // Handle PDF
      const buffer = Buffer.from(await response.arrayBuffer());
      const pdfData = await pdf(buffer);
      textContent = pdfData.text;
    } else if (contentType.includes("text/html")) {
      // Handle HTML - strip tags
      const html = await response.text();
      textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    } else {
      // Plain text, markdown, etc.
      textContent = await response.text();
    }

    if (!textContent || textContent.length < 10) {
      return res
        .status(400)
        .json({ error: "No readable content found at URL" });
    }

    // Create document record
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({
        org_id: member.org_id,
        filename,
        file_size: textContent.length,
        status: "processing",
      })
      .select()
      .single();

    if (docError || !doc) {
      return res.status(500).json({ error: "Failed to create document" });
    }

    // Process in background
    processDocument(doc.id, member.org_id, textContent).catch(console.error);

    return res.json({
      document: doc,
      message: "Document fetched and is being processed",
      extractedLength: textContent.length,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to process URL",
      details: err?.message || String(err),
    });
  }
});

// Background processing: chunk text and generate embeddings
async function processDocument(
  documentId: string,
  orgId: string,
  content: string,
) {
  const chunks = chunkText(content);

  for (let i = 0; i < chunks.length; i++) {
    try {
      const embedding = await generateEmbedding(chunks[i]);

      await supabase.from("document_chunks").insert({
        document_id: documentId,
        org_id: orgId,
        chunk_text: chunks[i],
        embedding: JSON.stringify(embedding),
        chunk_index: i,
      });
    } catch (err) {
      console.error(`Failed to process chunk ${i}:`, err);
    }
  }

  // Update document status
  await supabase
    .from("documents")
    .update({ chunk_count: chunks.length, status: "ready" })
    .eq("id", documentId);
}

// List documents for user's org
router.get("/documents", async (req, res) => {
  const user = req.user!;

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!member) {
    return res.json({ documents: [] });
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false });

  return res.json({ documents: documents || [] });
});

// Delete a document
router.delete("/documents/:id", async (req, res) => {
  const user = req.user!;
  const { id } = req.params;

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!member) {
    return res.status(400).json({ error: "No organization found" });
  }

  // Delete document (chunks cascade)
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("org_id", member.org_id);

  if (error) {
    return res.status(500).json({ error: "Failed to delete document" });
  }

  return res.json({ ok: true });
});

// Test search endpoint
router.post("/search", async (req, res) => {
  const user = req.user!;
  const { query } = req.body;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query is required" });
  }

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!member) {
    return res.json({ results: [] });
  }

  const results = await knowledgeBaseSearch(query, member.org_id);
  return res.json({ results });
});

export default router;
