"use client"

import { useState, useEffect } from "react"
import { PostComposer } from "./PostComposer"
import { PostCard } from "./PostCard"
import { feedService } from "@/lib/feed-service"
import type { Post } from "@/lib/feed-service"

export function FeedList() {
  const [posts, setPosts] = useState<Post[]>([])

  const loadPosts = () => {
    const fetched = feedService.getPosts()
    setPosts(fetched)
  }

  useEffect(() => {
    loadPosts()
    // Optionally poll for updates every 30 seconds
    const interval = setInterval(loadPosts, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleNewPost = (newPost: Post) => {
    setPosts([newPost, ...posts])
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Dein Feed</h2>
        <PostComposer onCreated={handleNewPost} />
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onUpdate={loadPosts} />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
          <p className="text-slate-500">Keine Beiträge vorhanden. Sei der Erste, der etwas teilt!</p>
        </div>
      )}
    </div>
  )
}