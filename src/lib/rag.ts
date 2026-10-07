// RAG utilities for the Gemini-powered German expert chatbot

import { createClient } from "@/lib/supabase/client"

export interface Chunk {
  text: string
  metadata: {
    source: string
    key?: string
    language?: string
    chunk?: number
    total_chunks?: number
  }
  embedding?: number[]
}

// Local fallback chunks file path is set at build time
const FALLBACK_FILE = "content_chunks.json"

// ─── ChromaDB client (HTTP mode) ──────────────────────────────────────────────
const CHROMA_HOST = process.env.CHROMA_HOST || "http://localhost:8000"

async function queryCollection(query: string, topN = 5, filter?: any): Promise<Chunk[]> {
  try {
    const parsed = new URL(CHROMA_HOST)
    const host = parsed.hostname
    const port = parsed.port || 8000

    // Embed the query using Gemini
    const embedding = await getEmbedding(query)

    // Query ChromaDB HTTP API
    const response = await fetch(`${CHROMA_HOST}/api/v1/collections/${encodeURIComponent("germany_gateway_content")}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        where: filter,
        where_document: filter?.where_document,
        query_embeddings: [embedding],
        n_results: topN,
      }),
    })

    if (!response.ok) {
      throw new Error(`ChromaDB query failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return (data.documents || []).map((doc: string, i: number) => ({
      text: doc,
      metadata: {
        source: data.metadatas?.[i]?.source || "unknown",
        key: data.metadatas?.[i]?.key,
        language: data.metadatas?.[i]?.language,
        chunk: data.metadatas?.[i]?.chunk,
        total_chunks: data.metadatas?.[i]?.total_chunks,
      },
    }))
  } catch (error) {
    console.warn("ChromaDB unavailable, falling back to local search:", error)
    return searchLocalFallback(query, topN)
  }
}

// ─── Simple local fallback (JSON file) ────────────────────────────────────────
let localChunks: Chunk[] | null = null

async function loadLocalFallback(): Promise<Chunk[]> {
  if (localChunks) return localChunks

  try {
    const fs = await import("fs")
    const path = await import("path")
    const filePath = path.join(process.cwd(), FALLBACK_FILE)

    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"))
      localChunks = data.map((item: any) => ({
        text: item.text,
        metadata: { source: item.source, key: item.key, language: item.language },
        embedding: item.embedding,
      }))
      return localChunks
    }
  } catch (error) {
    console.warn("Failed to load local fallback:", error)
  }

  return []
}

async function searchLocalFallback(query: string, topN = 5): Promise<Chunk[]> {
  const chunks = await loadLocalFallback()
  if (!chunks.length) return []

  const queryTerms = new Set(query.toLowerCase().split(" ").filter((w) => w.length >= 3))
  const scored = chunks
    .map((chunk) => {
      let score = 0
      for (const term of queryTerms) {
        score += chunk.text.toLowerCase().split(term).length - 1
      }
      return { ...chunk, score }
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, topN)
}

// ─── Gemini embeddings ────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY

async function getEmbedding(text: string): Promise<number[]> {
  if (!GEMINI_API_KEY) {
    // Return a deterministic pseudo-embedding for demo mode
    return new Array(768).fill(0).map((_, i) => ((i * 23 + text.length) % 1000) / 1000)
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        taskType: "RETRIEVAL_DOCUMENT",
      }),
    })

    if (!response.ok) throw new Error(`Gemini embedding failed: ${response.status}`)

    const data = await response.json()
    return data.embedding.values
  } catch (error) {
    console.warn("Gemini embedding failed, using pseudo-embedding:", error)
    return new Array(768).fill(0).map((_, i) => ((i * 23 + text.length) % 1000) / 1000)
  }
}

// ─── Supabase fallback ────────────────────────────────────────────────────────
async function searchSupabase(query: string, topN = 5): Promise<Chunk[]> {
  // Fallback for users who have Supabase pgvector set up
  try {
    const client = createClient()
    const embedding = await getEmbedding(query)

    const embeddingStr = `[${embedding.join(",")}]`

    // Supabase pgvector search
    const { data, error } = await client.rpc("vector_search", { query_text: query, top_n: topN })

    if (error) throw error

    return (data || []).map((row: any) => ({
      text: row.document,
      metadata: { source: row.metadata?.source || "supabase" },
    }))
  } catch (error) {
    console.warn("Supabase pgvector unavailable:", error)
    return []
  }
}

// ─── Main search function ─────────────────────────────────────────────────────
export async function searchContent(query: string, topN = 5): Promise<Chunk[]> {
  const results: Chunk[] = []

  // 1. Try ChromaDB first
  const chromaResults = await queryCollection(query, topN)
  results.push(...chromaResults)

  // 2. Try Supabase pgvector as additional source
  const supabaseResults = await searchSupabase(query, topN)
  results.push(...supabaseResults)

  // Deduplicate by text
  const seen = new Set<string>()
  return results.filter((chunk) => {
    if (seen.has(chunk.text)) return false
    seen.add(chunk.text)
    return true
  })
}

// ─── Gemini API response generation ───────────────────────────────────────────
export async function generateGeminiResponse(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY

  if (!apiKey) {
    // Demo mode response
    return "In der vollständigen Version antworte ich mit Gemini über die Website-Inhalte. Diese Antwort wird generiert, solange keine API-Key konfiguriert ist."
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!response.ok) throw new Error(`Gemini API failed: ${response.status}`)

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Entschuldigung, ich konnte die Antwort nicht generieren."
  } catch (error) {
    console.error("Gemini API error:", error)
    return "Es gab einen Fehler beim Verbinden mit dem KI-Service. Bitte versuche es später erneut."
  }
}
