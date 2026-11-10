-- Run once in Supabase: SQL Editor > New query > paste > Run.
create table if not exists profiles(id uuid primary key references auth.users on delete cascade,email text,name text,phone text,address text,role text not null default 'customer',account_id text unique,created_at timestamptz default now());
create or replace function is_admin() returns boolean language sql security definer stable set search_path=public as $$select exists(select 1 from profiles where id=auth.uid() and role='admin')$$;
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare b text; a text; n text;
begin n:=coalesce(new.raw_user_meta_data->>'name',split_part(new.email,'@',1));
  b:=upper(left(regexp_replace(n,'[^A-Za-z0-9]','','g'),8)); if b='' then b:='CUST'; end if; a:=b;
  while exists(select 1 from profiles where account_id=a) loop a:=b||'-'||upper(substr(md5(random()::text),1,3)); end loop;
  insert into profiles(id,email,name,phone,account_id) values(new.id,new.email,n,nullif(new.raw_user_meta_data->>'phone',''),a); return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
create or replace function protect_profile() returns trigger language plpgsql as $$
begin if auth.uid() is not null and not is_admin() then new.role:=old.role; new.account_id:=old.account_id; new.email:=old.email; end if; return new; end $$;
drop trigger if exists protect on profiles; create trigger protect before update on profiles for each row execute function protect_profile();

create table if not exists requests(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users,
  status text not null default 'new', name text, source text, links text[], files text[], options jsonb, est jsonb, est_price numeric,
  quoted_price numeric, admin_note text, due date, delivery_method text, delivery_where text, notes text, bill_id text, paid boolean default false, contact jsonb, accepted_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now());
-- safe to re-run on an existing project:
alter table profiles add column if not exists phone text; alter table profiles add column if not exists address text;
alter table requests add column if not exists contact jsonb; alter table requests add column if not exists accepted_at timestamptz;
create table if not exists app_state(id text primary key,data jsonb not null,version bigint not null default 1,updated_at timestamptz default now());

alter table profiles enable row level security; alter table requests enable row level security; alter table app_state enable row level security;
drop policy if exists p_sel on profiles; create policy p_sel on profiles for select using(id=auth.uid() or is_admin());
drop policy if exists p_upd on profiles; create policy p_upd on profiles for update using(id=auth.uid() or is_admin());
drop policy if exists r_sel on requests; create policy r_sel on requests for select using(user_id=auth.uid() or is_admin());
drop policy if exists r_ins on requests; create policy r_ins on requests for insert with check(user_id=auth.uid() and status='new' and quoted_price is null and bill_id is null);
drop policy if exists r_adm on requests; create policy r_adm on requests for all using(is_admin()) with check(is_admin());
drop policy if exists s_adm on app_state; create policy s_adm on app_state for all using(is_admin()) with check(is_admin());

create or replace function respond_to_quote(rid uuid, accept boolean) returns void language sql security definer set search_path=public as $$
  update requests set status=case when accept then 'accepted' else 'declined' end, updated_at=now(),
    contact=case when accept then (select jsonb_build_object('name',p.name,'email',p.email,'phone',p.phone,'address',p.address) from profiles p where p.id=auth.uid()) else contact end,
    accepted_at=case when accept then now() else accepted_at end
  where id=rid and user_id=auth.uid() and status='quoted' $$;
create or replace function cancel_request(rid uuid) returns void language sql security definer set search_path=public as $$
  update requests set status='cancelled', updated_at=now() where id=rid and user_id=auth.uid() and status in('new','quoted') $$;

insert into storage.buckets(id,name,public,file_size_limit) values('uploads','uploads',false,104857600) on conflict do nothing;
drop policy if exists u_ins on storage.objects; create policy u_ins on storage.objects for insert to authenticated with check(bucket_id='uploads' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists u_sel on storage.objects; create policy u_sel on storage.objects for select to authenticated using(bucket_id='uploads' and ((storage.foldername(name))[1]=auth.uid()::text or is_admin()));

-- Settings the shop may read (available colours); only admins write
create table if not exists public_settings(key text primary key,value jsonb not null,updated_at timestamptz default now());
alter table public_settings enable row level security;
drop policy if exists ps_read on public_settings; create policy ps_read on public_settings for select using(true);
drop policy if exists ps_adm on public_settings; create policy ps_adm on public_settings for all using(is_admin()) with check(is_admin());

-- ESP32 light box: counts only, protected by a secret device key
create table if not exists app_secrets(key text primary key, value text not null);
alter table app_secrets enable row level security;
drop policy if exists sec_adm on app_secrets; create policy sec_adm on app_secrets for all using(is_admin()) with check(is_admin());
insert into app_secrets(key,value) values('device_key',replace(gen_random_uuid()::text,'-','')) on conflict do nothing;
create or replace function device_status(k text, soon_days int default 2) returns json language plpgsql security definer set search_path=public as $$
declare r json;
begin
  if k is distinct from (select value from app_secrets where key='device_key') then raise exception 'bad key'; end if;
  select json_build_object(
    'new_orders',count(*) filter (where status='new'),
    'accepted',count(*) filter (where status='accepted'),
    'paid_open',count(*) filter (where paid is true and status in('accepted','in_queue','printing')),
    'due_soon',count(*) filter (where due is not null and due>=current_date and due<=current_date+soon_days and status in('accepted','in_queue','printing')),
    'overdue',count(*) filter (where due is not null and due<current_date and status in('accepted','in_queue','printing','ready'))
  ) into r from requests;
  return r;
end $$;
revoke all on function device_status(text,int) from public;
grant execute on function device_status(text,int) to anon, authenticated;
-- Read your device key with:  select value from app_secrets where key='device_key';

-- After creating YOUR account (via the shop sign-up), make it admin:
-- update profiles set role='admin' where email='you@example.com';

-- Wallet (credit + points) and vouchers. The admin app mirrors them here; customers can only read their own wallet
-- and check ONE voucher code at a time (they can never list vouchers). Balances are changed only by the admin app.
create table if not exists wallets(user_id uuid primary key references auth.users on delete cascade,account_id text,points int not null default 0,credit numeric not null default 0,updated_at timestamptz default now());
alter table wallets enable row level security;
drop policy if exists w_sel on wallets; create policy w_sel on wallets for select using(user_id=auth.uid() or is_admin());
drop policy if exists w_adm on wallets; create policy w_adm on wallets for all using(is_admin()) with check(is_admin());
create table if not exists vouchers(serial text primary key,pct numeric not null,label text,unlimited boolean default false,used boolean default false,updated_at timestamptz default now());
alter table vouchers enable row level security;
drop policy if exists v_adm on vouchers; create policy v_adm on vouchers for all using(is_admin()) with check(is_admin());
create or replace function check_voucher(code text) returns json language plpgsql security definer set search_path=public as $$
declare v vouchers;
begin select * into v from vouchers where serial=upper(trim(code)) and (unlimited or not used);
  if not found then raise exception 'Voucher not found or already used'; end if;
  return json_build_object('serial',v.serial,'pct',v.pct,'label',v.label); end $$;
revoke all on function check_voucher(text) from public; grant execute on function check_voucher(text) to authenticated;

-- ===== Order emails =====
-- Needs the Edge Function `notify` (see README, "Emails"). The trigger posts to it with pg_net; nothing is sent until notify_url is filled in.
create extension if not exists pg_net with schema extensions;
alter table profiles add column if not exists email_updates boolean not null default true;
insert into app_secrets(key,value) values('notify_key',replace(gen_random_uuid()::text,'-','')) on conflict do nothing;
insert into app_secrets(key,value) values('notify_url','') on conflict do nothing;
-- read the key with:  select value from app_secrets where key='notify_key';
-- set the URL with:   update app_secrets set value='https://YOUR-PROJECT.supabase.co/functions/v1/notify' where key='notify_url';
-- What was already mailed for each request. The Edge Function compares this with the current row, so a change is mailed exactly once
-- even though both this trigger and the shop/admin pages ask it to.
alter table requests add column if not exists notified jsonb;
update requests set notified=jsonb_build_object('status',status,'paid',coalesce(paid,false),'quoted_price',quoted_price,'admin_note',admin_note) where notified is null;
create or replace function claim_notify(rid uuid, snap jsonb, expected jsonb) returns boolean language plpgsql security definer set search_path=public as $$
declare n int;
begin update requests set notified=snap where id=rid and notified is not distinct from expected; get diagnostics n=row_count; return n>0; end $$;
revoke all on function claim_notify(uuid,jsonb,jsonb) from public, anon, authenticated;
grant execute on function claim_notify(uuid,jsonb,jsonb) to service_role;
create or replace function notify_request() returns trigger language plpgsql security definer set search_path=public,extensions,net as $$
declare u text; k text; who text;
begin
  select value into u from app_secrets where key='notify_url'; select value into k from app_secrets where key='notify_key';
  if coalesce(u,'')='' then return new; end if;
  who:=case when auth.uid() is not null and not is_admin() then 'customer' else 'admin' end;
  perform net.http_post(url:=u,headers:=jsonb_build_object('Content-Type','application/json','x-notify-key',coalesce(k,'')),body:=jsonb_build_object('id',new.id,'actor',who));
  return new;
exception when others then
  raise warning 'notify_request failed: %',sqlerrm;   -- an email problem must never block an order (the page also asks the function directly)
  return new;
end $$;
drop trigger if exists notify_req on requests;
create trigger notify_req after insert or update of status,paid,quoted_price,admin_note on requests for each row execute function notify_request();
