# Germany Gateway — Ausbildung & Relocation Platform

Next.js 15 + Supabase (mock mode) + Gemini RAG chatbot.

## Getting Started

```bash
npm install          # install dependencies
npm run dev          # start development server
```

Open http://localhost:3000 — the app runs fully in mock mode (no backend required).

## Features

- **Dashboard** (`/dashboard`) — Facebook-style feed with posts, likes, comments, shares
- **Chatbot** — Gemini-powered German expert in the right sidebar with RAG
- **Ausbildung Directory** (`/ausbildung`)
- **Language Hub** (`/language-hub`)
- **Community** (`/community`)
- i18n: English / Deutsch / বাংলা

## RAG Chatbot Setup (optional, for full AI mode)

1. Get a free Gemini API key: https://aistudio.google.com/app/apikey
2. Start ChromaDB: `docker run -p 8000:8000 chromadb/chroma`
3. Set env vars in `.env.local`:
   ```
   GOOGLE_API_KEY=your-key
   CHROMA_HOST=http://localhost:8000
   ```
4. Ingest website content: `npm run rag:ingest`
5. The chatbot now answers from your site's content via RAG.

Without these, the chatbot runs in demo mode with a local fallback search.

## Supabase (optional)

To use a real backend instead of the in-memory mock:

1. Create a Supabase project, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
2. Run the migration in `supabase/migrations/0001_create_posts_schema.sql`.
3. Replace the mock client in `src/lib/supabase/client.ts` with a real `@supabase/supabase-js` client.

## Project Structure

- `src/app/` — Next.js pages and API routes
- `src/components/feed/` — PostComposer, PostCard, FeedList
- `src/lib/` — feed-service, rag utilities, language context
- `scripts/ingest_content.py` — RAG ingestion pipeline
