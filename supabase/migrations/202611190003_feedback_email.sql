create table if not exists public.feedback (
 id uuid primary key default gen_random_uuid(),
 email text,
 type text not null check(type in ('feature','bug')),
 message text not null check(char_length(message) between 10 and 3000),
 created_at timestamptz not null default now()
);
alter table public.feedback add column if not exists email text;
alter table public.feedback enable row level security;
-- No public read or write policies. Submissions are validated server-side and inserted with service role.
revoke all on public.feedback from anon,authenticated;
create index if not exists feedback_created_at_idx on public.feedback(created_at desc);
