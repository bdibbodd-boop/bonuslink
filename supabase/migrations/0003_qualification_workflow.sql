insert into public.settings(key, value) values
  ('qualification_require_email', 'true'), ('qualification_min_visits', '1')
on conflict (key) do nothing;

create or replace function public.setting_bool(setting_key text, fallback boolean) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select (value #>> '{}')::boolean from public.settings where key = setting_key), fallback)
$$;

create or replace function public.qualify_current_user()
returns boolean language plpgsql security definer set search_path = public as $$
declare target_referral uuid; sponsor uuid; referred uuid; code text; min_visits bigint; reward_created boolean;
begin
  if auth.uid() is null or coalesce(current_setting('request.jwt.claim.role', true), '') <> 'authenticated' then return false; end if;
  if public.setting_bool('qualification_require_email', true) and not exists (select 1 from auth.users where id = auth.uid() and email_confirmed_at is not null) then return false; end if;
  select r.id, r.sponsor_id, r.referred_id, r.referral_code into target_referral, sponsor, referred, code from public.referrals r where r.referred_id = auth.uid() and r.qualified_at is null;
  if target_referral is null or referred <> auth.uid() then return false; end if;
  if not exists (select 1 from public.referral_events where visitor_id = auth.uid() and referral_code = code and event_type = 'SIGNUP') then return false; end if;
  min_visits := public.setting_amount('qualification_min_visits', 1);
  if (select count(*) from public.referral_events where referral_code = code and event_type = 'VISIT') < min_visits then return false; end if;
  reward_created := public.qualify_referral(target_referral, 'qualified-user:' || auth.uid()::text);
  if reward_created then
    insert into public.notifications(user_id, title, body) values
      (sponsor, 'Un filleul est qualifié', 'Votre filleul a rempli les conditions de qualification.'),
      (referred, 'Qualification confirmée', 'Votre inscription et votre session sont confirmées.');
  end if;
  return reward_created;
end; $$;

revoke all on function public.qualify_current_user() from public, anon;
grant execute on function public.qualify_current_user() to authenticated;
