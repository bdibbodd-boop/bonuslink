insert into public.settings(key, value) values
  ('signup_bonus', '1000'), ('referral_bonus', '500'), ('withdrawal_threshold', '15000'), ('qualification_days', '0')
on conflict (key) do nothing;

create or replace function public.setting_amount(setting_key text, fallback bigint) returns bigint
language sql stable security definer set search_path = public as $$
  select coalesce((select (value #>> '{}')::bigint from public.settings where key = setting_key), fallback)
$$;

create or replace function public.credit_reward(target_user uuid, reward_amount bigint, reward_kind public.reward_kind, reward_key text, reward_note text default null, source_referral uuid default null)
returns boolean language plpgsql security definer set search_path = public as $$
declare inserted_count integer;
begin
  if reward_amount = 0 then return false; end if;
  insert into public.reward_transactions(user_id, amount, kind, referral_id, idempotency_key, note)
  values (target_user, reward_amount, reward_kind, source_referral, reward_key, reward_note)
  on conflict (idempotency_key) do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count > 0 then
    update public.wallets set balance = balance + reward_amount, updated_at = now() where user_id = target_user;
  end if;
  return inserted_count > 0;
end; $$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare sponsor uuid; referral uuid;
begin
  insert into public.profiles(id, full_name) values (new.id, nullif(new.raw_user_meta_data->>'full_name','')) on conflict (id) do nothing;
  insert into public.wallets(user_id) values (new.id) on conflict (user_id) do nothing;
  perform public.credit_reward(new.id, public.setting_amount('signup_bonus', 1000), 'SIGNUP_BONUS', 'signup:' || new.id::text, 'Bonus de bienvenue');
  select id into sponsor from public.profiles where referral_code = upper(nullif(new.raw_user_meta_data->>'referral_code','')) and id <> new.id;
  if sponsor is not null then
    insert into public.referrals(sponsor_id, referred_id, referral_code) values (sponsor, new.id, upper(new.raw_user_meta_data->>'referral_code')) on conflict (referred_id) do nothing returning id into referral;
    if referral is not null then
      insert into public.referral_events(referral_code, visitor_id, event_type) values (upper(new.raw_user_meta_data->>'referral_code'), new.id, 'SIGNUP');
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.qualify_referral(target_referral uuid, visitor_key_value text)
returns boolean language plpgsql security definer set search_path = public as $$
declare sponsor uuid; referred uuid; inserted_count integer;
begin
  insert into public.qualified_visits(referral_id, visitor_key) values (target_referral, visitor_key_value) on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;
  select sponsor_id, referred_id into sponsor, referred from public.referrals where id = target_referral and qualified_at is null for update;
  if sponsor is null then return false; end if;
  update public.referrals set qualified_at = now() where id = target_referral;
  insert into public.referral_events(referral_code, visitor_id, event_type) select referral_code, referred, 'QUALIFIED' from public.referrals where id = target_referral;
  return public.credit_reward(sponsor, public.setting_amount('referral_bonus', 500), 'REFERRAL_BONUS', 'referral:' || target_referral::text, 'Bonus de parrainage', target_referral);
end; $$;

create or replace function public.track_referral_visit(referral_code_value text, visitor_key_value text, ip_hash_value text, user_agent_hash_value text)
returns boolean language plpgsql security definer set search_path = public as $$
declare tracked_count integer;
begin
  if not exists (select 1 from public.profiles where referral_code = referral_code_value) then return false; end if;
  if (select count(*) from public.referral_events where ip_hash = ip_hash_value and created_at > now() - interval '1 hour') >= 60 then return false; end if;
  insert into public.referral_events(referral_code, ip_hash, user_agent_hash, event_type)
  select referral_code_value, ip_hash_value, user_agent_hash_value, 'VISIT'
  where not exists (select 1 from public.referral_events where referral_code = referral_code_value and ip_hash = ip_hash_value and user_agent_hash = user_agent_hash_value and created_at > now() - interval '24 hours');
  get diagnostics tracked_count = row_count;
  return tracked_count > 0;
end; $$;

revoke all on function public.credit_reward(uuid,bigint,public.reward_kind,text,text,uuid) from public, anon, authenticated;
revoke all on function public.qualify_referral(uuid,text) from public, anon, authenticated;
revoke all on function public.track_referral_visit(text,text,text,text) from public, anon, authenticated;
grant execute on function public.track_referral_visit(text,text,text,text) to anon, authenticated;

drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

drop policy if exists "withdrawals own insert" on public.withdrawals;
create policy "withdrawals own insert" on public.withdrawals for insert with check (
  auth.uid() = user_id and exists (select 1 from public.payment_methods method where method.id = payment_method_id and method.user_id = auth.uid())
);
