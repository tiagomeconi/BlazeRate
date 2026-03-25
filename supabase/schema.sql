-- ============================================================
-- BlazeRate – Supabase Schema
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- Profiles (criado automaticamente ao registrar)
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  display_name text,
  email       text,
  photo_url   text,
  created_at  timestamptz default now() not null
);

-- Ratings
create table if not exists public.ratings (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete cascade not null,
  movie_id   text not null,
  movie_type text not null default 'movie',
  rating     integer not null check (rating between 1 and 5),
  note       text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, movie_id, movie_type)
);

-- Comments
create table if not exists public.comments (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  movie_id    text not null,
  movie_type  text not null default 'movie',
  comment     text not null,
  user_name   text,
  user_avatar text,
  created_at  timestamptz default now() not null
);

-- ── Row Level Security ──────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.ratings  enable row level security;
alter table public.comments enable row level security;

-- Profiles
create policy "Profiles visíveis por todos"       on public.profiles for select using (true);
create policy "Usuário cria próprio perfil"        on public.profiles for insert with check (auth.uid() = id);
create policy "Usuário atualiza próprio perfil"    on public.profiles for update using (auth.uid() = id);

-- Ratings
create policy "Ratings visíveis por todos"         on public.ratings for select using (true);
create policy "Usuário cria própria avaliação"     on public.ratings for insert with check (auth.uid() = user_id);
create policy "Usuário atualiza própria avaliação" on public.ratings for update using (auth.uid() = user_id);
create policy "Usuário deleta própria avaliação"   on public.ratings for delete using (auth.uid() = user_id);

-- Comments
create policy "Comentários visíveis por todos"     on public.comments for select using (true);
create policy "Usuário cria próprio comentário"    on public.comments for insert with check (auth.uid() = user_id);
create policy "Usuário deleta próprio comentário"  on public.comments for delete using (auth.uid() = user_id);
