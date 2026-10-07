"use client"

import { useState } from "react"
import { MessageSquare, ArrowUp, Plus } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

const posts = [
  { id: 1, title: "How long did it take to get your visa appointment in Delhi?", category: "Visa & Bureaucracy", author: "Rajesh K.", rules: "B2 Nursing", upvotes: 45, comments: 12, time: "2 hours ago" },
  { id: 2, title: "Is B1 enough for IT Ausbildung or should I aim for B2?", category: "Ausbildung", author: "Sarah M.", rules: "A2 IT", upvotes: 32, comments: 28, time: "5 hours ago" },
  { id: 3, title: "Finding a WG in Munich before arriving - Tips?", category: "Housing", author: "Liam T.", rules: "B1 Mechatronics", upvotes: 18, comments: 5, time: "1 day ago" },
]

export default function CommunityPage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("All")
  const tabs = ["All", "Ausbildung", "Visa & Bureaucracy", "Housing", "Language Practice"]

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 py-10">
        <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-brand-slate">Community Forum</h1>
            <p className="text-slate-600 mt-2">Connect, ask questions, and share your experiences.</p>
          </div>
          <button className="flex items-center justify-center px-4 py-2 bg-brand-slate text-white rounded-lg hover:bg-slate-800 transition shadow-sm w-full md:w-auto">
            <Plus className="w-5 h-5 mr-1" /> New Discussion
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl mt-8">
        <div className="flex overflow-x-auto space-x-2 pb-4 mb-4 custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab ? "bg-brand-amber text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {posts.filter(p => activeTab === "All" || p.category === activeTab).map(post => (
            <div key={post.id} className="bg-white border border-slate-200 rounded-xl p-5 flex gap-4 hover:shadow-md transition cursor-pointer">
              <div className="flex flex-col items-center shrink-0 w-12 pt-1">
                <button className="text-slate-400 hover:text-brand-amber transition">
                  <ArrowUp className="w-6 h-6" />
                </button>
                <span className="font-bold text-slate-700 mt-1">{post.upvotes}</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {post.category}
                  </span>
                  <span className="text-xs text-slate-500">• Posted by {post.author} • {post.time}</span>
                </div>
                <h3 className="text-lg font-bold text-brand-slate leading-tight mb-2">
                  {post.title}
                </h3>
                <div className="flex items-center text-sm text-slate-500">
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  {post.comments} comments
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
