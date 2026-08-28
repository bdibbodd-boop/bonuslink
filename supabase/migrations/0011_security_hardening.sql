create or replace function public.user_is_suspended(target_user uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = target_user and suspended_at is not null)
$$;

create or replace function public.request_withdrawal(amount_value bigint, payment_method_value uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare current_user_id uuid := auth.uid(); current_balance bigint; withdrawal_id uuid;
begin
  if current_user_id is null or coalesce(current_setting('request.jwt.claim.role', true), '') <> 'authenticated' then raise exception 'authentication required'; end if;
  if public.user_is_suspended(current_user_id) then raise exception 'account suspended'; end if;
  if amount_value < public.setting_amount('withdrawal_threshold', 15000) then raise exception 'minimum withdrawal not reached'; end if;
  if not exists (select 1 from public.payment_methods where id = payment_method_value and user_id = current_user_id and is_verified = true) then raise exception 'payment method is not verified'; end if;
  if exists (select 1 from public.withdrawals where user_id = current_user_id and status in ('PENDING','PROCESSING','APPROVED')) then raise exception 'withdrawal already pending'; end if;
  select balance into current_balance from public.wallets where user_id = current_user_id for update;
  if current_balance is null or current_balance < amount_value then raise exception 'insufficient balance'; end if;
  insert into public.withdrawals(user_id, payment_method_id, amount) values (current_user_id, payment_method_value, amount_value) returning id into withdrawal_id;
  update public.wallets set balance = balance - amount_value, updated_at = now() where user_id = current_user_id;
  insert into public.reward_transactions(user_id, amount, kind, idempotency_key, note) values (current_user_id, -amount_value, 'WITHDRAWAL', 'withdrawal:' || withdrawal_id::text, 'Demande de retrait');
  return withdrawal_id;
end; $$;

create or replace function public.qualify_current_user()
returns boolean language plpgsql security definer set search_path = public as $$
declare target_referral uuid; sponsor uuid; referred uuid; code text; min_visits bigint; reward_created boolean;
begin
  if auth.uid() is null or coalesce(current_setting('request.jwt.claim.role', true), '') <> 'authenticated' or public.user_is_suspended() then return false; end if;
  if public.setting_bool('qualification_require_email', true) and not exists (select 1 from auth.users where id = auth.uid() and email_confirmed_at is not null) then return false; end if;
  select r.id, r.sponsor_id, r.referred_id, r.referral_code into target_referral, sponsor, referred, code from public.referrals r where r.referred_id = auth.uid() and r.qualified_at is null;
  if target_referral is null or referred <> auth.uid() then return false; end if;
  if not exists (select 1 from public.referral_events where visitor_id = auth.uid() and referral_code = code and event_type = 'SIGNUP') then return false; end if;
  min_visits := public.setting_amount('qualification_min_visits', 1);
  if (select count(*) from public.referral_events where referral_code = code and event_type = 'VISIT') < min_visits then return false; end if;
  reward_created := public.qualify_referral(target_referral, 'qualified-user:' || auth.uid()::text);
  if reward_created then insert into public.notifications(user_id, title, body) values (sponsor, 'Un filleul est qualifié', 'Votre filleul a rempli les conditions de qualification.'), (referred, 'Qualification confirmée', 'Votre inscription et votre session sont confirmées.'); end if;
  return reward_created;
end; $$;

revoke all on function public.user_is_suspended(uuid) from public, anon;
revoke all on function public.request_withdrawal(bigint, uuid) from public, anon;
revoke all on function public.qualify_current_user() from public, anon;
grant execute on function public.request_withdrawal(bigint, uuid) to authenticated;
grant execute on function public.qualify_current_user() to authenticated;
