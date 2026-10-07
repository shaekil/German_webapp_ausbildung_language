// Lightweight feed data access layer
// Uses Supabase client when available, falls back to in-memory mock for preview mode

type Language = 'en' | 'de' | 'bn'

interface Comment {
  id: string
  author: string
  text: string
  createdAt: string
  likes: number
}

interface Post {
  id: string
  author: string
  avatar: string
  content: string
  image?: string
  likes: number
  liked?: boolean
  saved?: boolean
  comments: Comment[]
  shares: number
  createdAt: string
}

// Try to load Supabase client dynamically to avoid errors when not configured
let supabase: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const supabaseMod = require('@/lib/supabase/client')
  supabase = supabaseMod.createClient()
} catch {
  // Supabase not configured or not available
}

const CURRENT_USER = {
  id: 'current-user-mock',
  name: 'Sahammad',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sahammad',
}

const SEED_POSTS: Post[] = [
  {
    id: '1',
    author: 'Anna Müller',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    content:
      "Endlich geschafft! 🎉 Mein B1-Zertifikat liegt vor. Nach 6 Monaten Lernen endlich bereit für den Sprachkurs zur Ausbildung. Tipps: jeden Tag 30 Minuten Vokabeln + täglich deutsche Medien lesen. Viel Erfolg an alle! #Ausbildung #Deutschlernen",
    likes: 42,
    comments: [
      {
        id: 'c1',
        author: 'Mohammad Raza',
        text: "Großartig! Wie hast du gelernt? Habe selbst vor 2 Monaten angefangen.",
        createdAt: '2026-10-02T10:30:00Z',
        likes: 3,
      },
      {
        id: 'c2',
        author: 'Lisa Weber',
        text: 'Super gemacht! Die Goethe-Institut App hat mir auch sehr geholfen.',
        createdAt: '2026-10-02T11:15:00Z',
        likes: 1,
      },
    ],
    shares: 8,
    createdAt: '2026-10-02T09:00:00Z',
  },
  {
    id: '2',
    author: 'TechJobs Deutschland',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TechJobs',
    content:
      '🔥 IT-Ausbildungen im Herbst 2026: Wir haben über 200 freie Plätze in München, Berlin und Hamburg für die folgenden Rollen zusammengestellt: Systemadministrator, Softwareentwicklung, Webentwicklung, Data Analytics. Alle mit Visumsupport für Bewerber außerhalb der EU.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
    likes: 127,
    comments: [
      {
        id: 'c3',
        author: 'Klaus Schmidt',
        text: 'Gibt es auch Plätze in Leipzig?',
        createdAt: '2026-10-01T14:20:00Z',
        likes: 0,
      },
    ],
    shares: 34,
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: '3',
    author: 'Fatima Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
    content:
      'Frage an die Community: Wie läuft das mit der Unterkunftssuche in Deutschland? Ich habe einen Ausbildungsplatz als Pflegefachfrau in Köln bekommen, aber die Wohnungssuche ist unglaublich schwer. Hat jemand Tipps oder kennt seriöse Anbieter?',
    likes: 56,
    comments: [
      {
        id: 'c4',
        author: 'Thomas Braun',
        text: "Schau mal auf WG-Gesucht.de — für eine eigene Wohnung brauchst du meistens eine Schufa-Auskunft und Mietschuldenfreiheitsbescheinigung. Ich empfehle, direkt nach der Ankunft eine Wohnungsbesichtigungstermine zu machen.",
        createdAt: '2026-10-01T09:45:00Z',
        likes: 12,
      },
      {
        id: 'c5',
        author: 'Anna Müller',
        text: 'Viele Arbeitgeber bieten auch Wohnheime an, besonders in der Pflege. Frag direkt deinen zukünftigen Arbeitgeber nach! Und Wohngebiet.de ist auch gut.',
        createdAt: '2026-10-01T10:00:00Z',
        likes: 8,
      },
    ],
    shares: 15,
    createdAt: '2026-09-30T16:30:00Z',
  },
  {
    id: '4',
    author: 'Sarah Koch',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content:
      'Mein erster Tag als Auszubildende zur Industriemechanikerin war heute! 😊 Total aufregend und ein bisschen gruselig, aber die Ausbilder waren super nett. Wer hatte ähnliche Erfahrungen? Habt ihr Tipps für den Start?',
    likes: 89,
    comments: [],
    shares: 6,
    createdAt: '2026-09-29T18:00:00Z',
  },
]

let localPosts = [...SEED_POSTS]

// Helper to check if user is logged in (mock always returns true in preview mode)
export function isLoggedIn(): boolean {
  return !!localStorage.getItem('user')
}

// Feed access layer
export const feedService = {
  // Get all posts with user interaction state
  getPosts: (userId?: string): Post[] => {
    const currentUserId = userId || (supabase?.auth?.getUser?.() ?? CURRENT_USER.id)
    return posts.map((p) => ({
      ...p,
      liked: p.likes > 0, // mock: assume liked if user has any likes
      saved: false,
    }))
  },

  // Create a new post
  createPost: async (content: string, image?: string): Promise<Post> => {
    if (supabase) {
      const { data, error } = await supabase.from('feed_posts').insert({ content, image_url: image }).select().single()
      if (error) throw error
      return data
    }

    // Mock fallback
    const newPost: Post = {
      id: crypto.randomUUID ?? String(Date.now()),
      author: CURRENT_USER.name,
      avatar: CURRENT_USER.avatar,
      content,
      image,
      likes: 0,
      comments: [],
      shares: 0,
      createdAt: new Date().toISOString(),
    }
    localPosts.unshift(newPost)
    return newPost
  },

  // Toggle like
  toggleLike: async (postId: string): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.from('feed_likes').upsert({ post_id: postId, user_id: CURRENT_USER.id })
      if (error) throw error
      return
    }

    // Mock falllback
    const post = localPosts.find((p) => p.id === postId)
    if (post) post.likes += 1
  },

  // Add comment
  addComment: async (postId: string, text: string): Promise<Comment> => {
    if (supabase) {
      const { data, error } = await supabase.from('feed_comments').insert({ post_id: postId, content: text }).select().single()
      if (error) throw error
      return data
    }

    const comment: Comment = {
      id: 'c' + Date.now(),
      author: CURRENT_USER.name,
      text,
      createdAt: new Date().toISOString(),
      likes: 0,
    }
    const post = localPosts.find((p) => p.id === postId)
    if (post) post.comments.push(comment)
    return comment
  },

  // Share post
  share: async (postId: string): Promise<number> => {
    if (supabase) {
      const { data, error } = await supabase.from('feed_shares').insert({ post_id: postId, shared_by: CURRENT_USER.id }).select().single()
      if (error) throw error
      return data?.shares ?? 1
    }

    const post = localPosts.find((p) => p.id === postId)
    if (post) post.shares += 1
    return post?.shares ?? 0
  },

  getCurrentUser: () => CURRENT_USER,
}

export type { Post, Comment }