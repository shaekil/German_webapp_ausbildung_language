"use client"

import { useState } from "react"
import { Image, Send } from "lucide-react"
import { feedService } from "@/lib/feed-service"
import type { Post } from "@/lib/feed-service"

interface PostComposerProps {
  onCreated: (post: Post) => void
}

export function PostComposer({ onCreated }: PostComposerProps) {
  const [content, setContent] = useState("")
  const [showImage, setShowImage] = useState(false)
  const [image, setImage] = useState<string | undefined>()
  const user = feedService.getCurrentUser()

  const handlePost = async () => {
    const trimmed = content.trim()
    if (!trimmed && !image) return
    const post = await feedService.createPost(trimmed, image)
    onCreated(post)
    setContent("")
    setImage(undefined)
    setShowImage(false)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
      <div className="flex items-start gap-3">
        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-slate-100" />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Wie geht es dir?"
          rows={showImage ? 3 : 2}
          className="flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 placeholder:text-slate-400"
        />
      </div>

      {showImage && (
        <div className="flex items-center gap-2 pl-13 text-sm text-slate-600">
          <Image className="w-4 h-4 text-slate-400" />
          <input
            type="url"
            placeholder="Bild-URL einfügen"
            value={image ?? ""}
            onChange={(e) => setImage(e.target.value || undefined)}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <button
          onClick={() => setShowImage(!showImage)}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          <Image className="w-4 h-4" />
          Bild
        </button>
        <button
          onClick={handlePost}
          disabled={!content.trim() && !image}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          Teilen
        </button>
      </div>
    </div>
  )
}