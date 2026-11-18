-- Push notifications. Safe to re-run. Run in the Supabase SQL Editor.
create table if not exists push_subscriptions(
  endpoint text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  p256dh text not null,
  auth_key text not null,
  ua text,
  created_at timestamptz not null default now()
);
alter table push_subscriptions enable row level security;   -- no policies: only the functions below and the Edge Function (service role) touch it

create or replace function save_push_subscription(p_endpoint text,p_p256dh text,p_auth text,p_ua text)
returns void language sql security definer set search_path=public as $$
  insert into push_subscriptions(endpoint,user_id,p256dh,auth_key,ua)
  select p_endpoint,auth.uid(),p_p256dh,p_auth,p_ua where auth.uid() is not null
  on conflict(endpoint) do update set user_id=excluded.user_id,p256dh=excluded.p256dh,auth_key=excluded.auth_key,ua=excluded.ua;
$$;
create or replace function remove_push_subscription(p_endpoint text)
returns void language sql security definer set search_path=public as $$
  delete from push_subscriptions where endpoint=p_endpoint and user_id=auth.uid();
$$;
revoke all on function save_push_subscription(text,text,text,text) from public,anon;
revoke all on function remove_push_subscription(text) from public,anon;
grant execute on function save_push_subscription(text,text,text,text) to authenticated;
grant execute on function remove_push_subscription(text) to authenticated;
