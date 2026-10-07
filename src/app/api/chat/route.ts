"use server"

import { NextRequest, NextResponse } from "next/server"
import { generateEmbedding, searchContent } from "@/lib/rag"

// Simple in-memory chat history (for demo purposes)
const chatHistory = new Map<string, Array<{ role: "user" | "assistant"; content: string }>>()

// Generate a session ID from IP or fallback
function getSessionId(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown"
  return Buffer.from(ip).toString("base64")
}

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const sid = sessionId || getSessionId(req)
    const history = chatHistory.get(sid) || []

    // Get relevant content using RAG
    const relevantDocs = await searchContent(message)

    // Build the system prompt for the "German expert" persona
    const systemPrompt = `
You are a German career and language expert for the Germany Gateway platform.

CONTEXT FROM THE WEBSITE:
${relevantDocs.map((doc) => doc.text).join("\n\n")}

PERSONALITY:
- Answer as a knowledgeable German career expert
- Be concise but thorough
- Use natural German phrasing when helpful
- Focus on practical advice for Ausbildung, language learning, and German life
- If you don't know something specific, say "Ich bin mir nicht sicher" rather than making up information

RESPONSE GUIDELINES:
- Base answers on the provided context from the website
- Include relevant section names (e.g. "Ausbildung requirements", "Language Hub")
- Use examples from the website when applicable
- Be helpful for global users trying to relocate to Germany

Previous conversation:
${history.map((m) => `${m.role}: ${m.content}`).join("\n")}

User: ${message}
Assistant:
    `

    // For now, provide a simulated response that references the context
    // In a full implementation, you'd call the Gemini API here
    const response = generateRAGResponse(message, relevantDocs)

    // Store in history
    history.push({ role: "user", content: message })
    history.push({ role: "assistant", content: response })
    chatHistory.set(sid, history)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateRAGResponse(query: string, docs: Array<{ text: string; metadata: any }>): string {
  // Simple response generation that references website content
  const topDoc = docs[0]?.text || ""
  const source = docs[0]?.metadata?.source || ""

  if (!topDoc) {
    return "I don't have specific information about that in my knowledge base. For detailed questions about Ausbildung, German language courses, or community support, please check our platform directly."
  }

  // Extract a relevant snippet from the top document
  const sentences = topDoc.split(".")
  const relevantSentence = sentences.find((s) => {
    const lower = s.toLowerCase()
    return query.split(" ").some((word) => word.length > 3 && lower.includes(word.toLowerCase()))
  }) || sentences[0]

  return `Based on our Germany Gateway content, here's what I found:

${relevantSentence.trim()}.

For more detailed information on "${query}", you can visit our ${source} section or explore other resources on the platform.`
}

export async function GET() {
  return NextResponse.json({ status: "ok", mode: "rag-chatbot" })
}