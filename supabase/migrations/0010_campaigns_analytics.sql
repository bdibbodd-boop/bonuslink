create policy "admin campaigns read" on public.campaigns for select using (public.is_admin());

create or replace function public.admin_upsert_campaign(campaign_id uuid, campaign_name text, campaign_description text, campaign_active boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare saved_id uuid;
begin
  if not public.is_admin() then raise exception 'admin required'; end if;
  if length(trim(campaign_name)) < 2 or length(trim(campaign_name)) > 120 then raise exception 'invalid campaign name'; end if;
  if campaign_id is null then
    insert into public.campaigns(name, description, active) values (trim(campaign_name), nullif(trim(campaign_description), ''), campaign_active) returning id into saved_id;
  else
    update public.campaigns set name = trim(campaign_name), description = nullif(trim(campaign_description), ''), active = campaign_active where id = campaign_id returning id into saved_id;
    if saved_id is null then raise exception 'campaign not found'; end if;
  end if;
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata) values (auth.uid(), 'CAMPAIGN_UPDATED', 'campaign', saved_id, jsonb_build_object('active', campaign_active));
  return saved_id;
end; $$;

create or replace function public.admin_analytics()
returns jsonb language plpgsql security definer set search_path = public as $$
declare result jsonb;
begin
  if not public.is_admin() then raise exception 'admin required'; end if;
  select jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'suspended_users', (select count(*) from public.profiles where suspended_at is not null),
    'referrals', (select count(*) from public.referrals),
    'qualified_referrals', (select count(*) from public.referrals where qualified_at is not null),
    'reward_transactions', (select count(*) from public.reward_transactions),
    'withdrawals', (select count(*) from public.withdrawals),
    'paid_withdrawals', (select count(*) from public.withdrawals where status = 'PAID'),
    'paid_withdrawal_amount', coalesce((select sum(amount) from public.withdrawals where status = 'PAID'), 0),
    'open_fraud_events', (select count(*) from public.fraud_events where resolved_at is null)
  ) into result;
  return result;
end; $$;

revoke all on function public.admin_upsert_campaign(uuid,text,text,boolean) from public, anon, authenticated;
revoke all on function public.admin_analytics() from public, anon, authenticated;
grant execute on function public.admin_upsert_campaign(uuid,text,text,boolean) to authenticated;
grant execute on function public.admin_analytics() to authenticated;
