create table if not exists public.feedback (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete set null,
 type text not null check (type in ('feature','bug')),
 message text not null check (char_length(message) between 10 and 3000),
 created_at timestamptz not null default now()
);
create index if not exists feedback_created_at_idx on public.feedback(created_at desc);
alter table public.feedback enable row level security;
-- Feedback is submitted only through the server with the service role; no public SELECT policy.
