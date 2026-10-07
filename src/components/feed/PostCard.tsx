"use client"

import { useState } from "react"
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send } from "lucide-react"
import { feedService } from "@/lib/feed-service"
import type { Post, Comment } from "@/lib/feed-service"

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return "gerade eben"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `vor ${minutes} Min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `vor ${hours} Std`
  const days = Math.floor(hours / 24)
  return `vor ${days} Tagen`
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-2.5 py-1.5">
      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
        {comment.author.charAt(0)}
      </div>
      <div className="bg-slate-100 rounded-xl rounded-tl-none px-3 py-2 flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-slate-800">{comment.author}</span>
          <span className="text-[10px] text-slate-400">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{comment.text}</p>
      </div>
    </div>
  )
}

interface PostCardProps {
  post: Post
  onUpdate: () => void
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")

  const handleComment = () => {
    const trimmed = newComment.trim()
    if (!trimmed) return
    feedService.addComment(post.id, trimmed)
    setNewComment("")
    onUpdate()
  }

  return (
    <article className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <img src={post.avatar} alt={post.author} className="w-11 h-11 rounded-full bg-slate-100" />
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">{post.author}</h3>
            <p className="text-xs text-slate-400">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="px-4 pb-3">
          <img
            src={post.image}
            alt="Post image"
            className="w-full rounded-lg border border-slate-100 object-cover max-h-[420px]"
          />
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-500 border-b border-slate-100">
        <span className="flex items-center gap-1">
          <Heart className={`w-3.5 h-3.5 ${post.liked ? "fill-red-500 text-red-500" : "fill-slate-200 text-slate-200"}`} />
          {post.likes}
        </span>
        <span>
          {post.comments.length > 0 && `${post.comments.length} Kommentare`} · {post.shares} geteilt
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-around px-2 py-1">
        <button
          onClick={() => { feedService.toggleLike(post.id); onUpdate() }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            post.liked ? "text-red-600 bg-red-50" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Heart className={`w-4.5 h-4.5 ${post.liked ? "fill-red-500" : ""}`} />
          Gefällt mir
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <MessageCircle className="w-4.5 h-4.5" />
          Kommentieren
        </button>

        <button
          onClick={() => { feedService.share(post.id); onUpdate() }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Share2 className="w-4.5 h-4.5" />
          Teilen
        </button>

        <button
          onClick={() => { feedService.toggleSave(post.id); onUpdate() }}
          className={`p-2 rounded-lg transition-colors ${
            post.saved ? "text-amber-600 bg-amber-50" : "text-slate-400 hover:bg-slate-100"
          }`}
        >
          <Bookmark className={`w-4.5 h-4.5 ${post.saved ? "fill-amber-500" : ""}`} />
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-slate-100 p-4 space-y-1">
          {post.comments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}

          <div className="flex items-center gap-2.5 pt-2 mt-1">
            <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {feedService.getCurrentUser().name.charAt(0)}
            </div>
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              placeholder="Kommentar schreiben..."
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 placeholder:text-slate-400"
            />
            <button
              onClick={handleComment}
              disabled={!newComment.trim()}
              className="p-2 text-amber-600 hover:bg-amber-50 rounded-full disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
