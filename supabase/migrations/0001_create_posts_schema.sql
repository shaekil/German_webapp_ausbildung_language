-- Migration: Feed posts / likes / comments / shares
-- Enable realtime for all feed tables (great for live updates)
alter publication supabase_realtime add table feed_posts;
alter publication supabase_realtime add table feed_likes;
alter publication supabase_realtime add table feed_comments;
alter publication supabase_realtime add table feed_shares;

-- Add a shares counter column for fast reads (if table already exists)
alter table feed_posts add column if not exists shares integer not null default 0;

-- feed_posts: the social feed items
create table if not exists feed_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  shares integer not null default 0
);

alter table feed_posts enable row level security;
create policy "Users can view all posts" on feed_posts for select
  using (true);
create policy "Users can insert posts" on feed_posts for insert
  with check (auth.uid() = author_id);
create policy "Users can update own posts" on feed_posts for update
  using (auth.uid() = author_id);
create policy "Users can delete own posts" on feed_posts for delete
  using (auth.uid() = author_id);

-- feed_likes: who liked what (enforces unique like per user)
create table if not exists feed_likes (
  post_id uuid references feed_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table feed_likes enable row level security;
create policy "Allow public read of likes" on feed_likes for select using (true);
create policy "Users can like posts" on feed_likes for insert
  with check (auth.uid() = user_id);
create policy "Users can remove own likes" on feed_likes for delete
  using (auth.uid() = user_id);

-- feed_comments: comments on posts
create table if not exists feed_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references feed_posts(id) on delete cascade not null,
  author_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table feed_comments enable row level security;
create policy "Users can view all comments" on feed_comments for select
  using (true);
create policy "Users can post comments" on feed_comments for insert
  with check (auth.uid() = author_id);
create policy "Users can update own comments" on feed_comments for update
  using (auth.uid() = author_id);
create policy "Users can delete own comments" on feed_comments for delete
  using (auth.uid() = author_id);

-- feed_shares: track shares (author_id for analytics; post_id for cascade)
create table if not exists feed_shares (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references feed_posts(id) on delete cascade not null,
  shared_by uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, shared_by)
);

alter table feed_shares enable row level security;
create policy "Users can view shares" on feed_shares for select using (true);
create policy "Users can share posts" on feed_shares for insert
  with check (auth.uid() = shared_by);
create policy "Users can remove own shares" on feed_shares for delete
  using (auth.uid() = shared_by);

-- Helper: increment share count after insert (for feed_posts.shares count)
create or replace function increment_share_count() returns trigger as $$
begin
  update feed_posts set shares = shares + 1 where id = new.post_id;
  return new;
end;
$$ language plpgsql security definer;
alter function increment_share_count() owner to postgres;
