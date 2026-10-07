"use client"

import { useState, useEffect, useRef } from "react"
import { Bot, Send, Loader2, Sparkles } from "lucide-react"
import { feedService } from "@/lib/feed-service"

export default function DashboardPage() {
  const [posts, setPosts] = useState(feedService.getPosts())
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hallo! Ich bin dein deutscher Ausbildung-Experte 🤖. Frag mich zu Ausbildung, Sprache oder dem Leben in Deutschland!" },
  ])
  const chatEndRef = useRef<HTMLDivElement>(null)

  const refresh = () => setPosts(feedService.getPosts())

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleSend = async () => {
    if (!chatInput.trim() || loading) return

    const userMessage = chatInput.trim()
    setMessages((prev) => [...prev, { role: "user", text: userMessage }])
    setChatInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.response || "Entschuldigung, ich konnte keine Antwort finden." },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Fehler: Der Chatbot ist derzeit offline. Bitte stelle sicher, dass ChromaDB läuft und dein API-Schlüssel gesetzt ist." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20">
      {/* Header strip */}
      <div className="bg-brand-slate py-10 text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Dein Tor zu einer <span className="text-brand-amber">Karriere</span> in Deutschland
          </h1>
          <p className="text-slate-300 mt-2 text-lg max-w-2xl">Ausbildung entdecken, Deutsch lernen und dich mit einer Community verbinden, die dich unterstützt.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main feed */}
        <main className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <img src={feedService.getCurrentUser().avatar} alt="You" className="w-10 h-10 rounded-full bg-slate-100" />
            <input
              placeholder="Wie geht es dir, Sahammad?"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              onKeyDown={(e) => { if (e.key === "Enter") { feedService.createPost((e.target as any).value); (e.target as any).value = ""; refresh() } }}
            />
          </div>

          <div className="space-y-4">
            {posts.map((p) => (
              <article key={p.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <img src={p.avatar} alt={p.author} className="w-10 h-10 rounded-full bg-slate-100" />
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">{p.author}</h3>
                    <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleString("de-DE")}</p>
                  </div>
                </div>
                <div className="px-4 pb-3"><p className="text-sm text-slate-700 whitespace-pre-wrap">{p.content}</p></div>
                {p.image && <img src={p.image} alt="post" className="w-full h-64 object-cover" />}
                <div className="flex justify-between px-4 py-2 text-xs text-slate-500 border-t border-slate-100">
                  <span>❤️ {p.likes}</span><span>💬 {p.comments.length} · 🔄 {p.shares}</span>
                </div>
                <div className="flex gap-2 px-4 py-2 border-t border-slate-100">
                  <button onClick={() => { feedService.toggleLike(p.id); refresh() }} className={`flex-1 py-1.5 rounded-md text-sm font-medium ${p.liked ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>Gefällt mir</button>
                  <button onClick={() => { feedService.share(p.id); refresh() }} className="flex-1 py-1.5 bg-slate-50 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-100">Teilen</button>
                  <button className="flex-1 py-1.5 bg-slate-50 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-100">Kommentieren</button>
                </div>
              </article>
            ))}
          </div>
        </main>

        {/* Right sidebar: Chat */}
        <aside className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h2 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2"><Bot className="w-5 h-5 text-amber-500" /> Chat mit deutschen Experten</h2>

            {/* Mini chat UI */}
            <div className="h-80 overflow-y-auto bg-slate-50 rounded-lg p-3 space-y-3 border border-slate-100 mb-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "bot" && <Bot className="w-6 h-6 text-amber-500 shrink-0" />}
                  <div className={`px-3 py-2 rounded-xl text-xs max-w-[90% whitespace-pre-wrap ${m.role === "bot" ? "bg-white border border-slate-200 text-slate-700" : "bg-brand-amber text-white"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 items-center">
                  <Bot className="w-6 h-6 text-amber-500 shrink-0" />
                  <div className="px-3 py-2 rounded-xl text-xs bg-white border border-slate-200 text-slate-500 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Durchsuche Website-Inhalte...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Frag etwas..."
                className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
              <button onClick={handleSend} className="p-2 bg-brand-amber text-white rounded-full hover:bg-amber-600 transition"><Send className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="bg-brand-slate rounded-xl p-4 text-white">
            <h3 className="font-bold mb-2 flex items-center gap-2"><Wander className="w-5 h-5 text-amber-400" /> Coming Soon</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>✓ Gemini LLM + ChromaDB RAG</li>
              <li>✓ Website content ingestion</li>
              <li>✓ Full German expert mode</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
