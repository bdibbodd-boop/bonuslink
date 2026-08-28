create or replace function public.track_referral_visit(referral_code_value text, visitor_key_value text, ip_hash_value text, user_agent_hash_value text)
returns boolean language plpgsql security definer set search_path = public as $$
declare tracked_count integer;
begin
  if not exists (select 1 from public.profiles where referral_code = referral_code_value) then return false; end if;
  if (select count(*) from public.referral_events where ip_hash = ip_hash_value and created_at > now() - interval '1 hour') >= 60 then
    insert into public.fraud_events(event_type, severity, metadata) values ('REFERRAL_RATE_LIMIT', 3, jsonb_build_object('ip_hash', ip_hash_value, 'referral_code', referral_code_value));
    return false;
  end if;
  insert into public.referral_events(referral_code, ip_hash, user_agent_hash, event_type)
  select referral_code_value, ip_hash_value, user_agent_hash_value, 'VISIT'
  where not exists (select 1 from public.referral_events where referral_code = referral_code_value and ip_hash = ip_hash_value and user_agent_hash = user_agent_hash_value and created_at > now() - interval '24 hours');
  get diagnostics tracked_count = row_count;
  return tracked_count > 0;
end; $$;

revoke all on public.fraud_events from authenticated;
create policy "fraud own read" on public.fraud_events for select using (auth.uid() = user_id);
grant select (id, user_id, event_type, severity, metadata, resolved_at, created_at) on public.fraud_events to authenticated;
