create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid())
$$;
revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

create policy "admin users read" on public.admin_users for select using (public.is_admin());
create policy "admin profiles read" on public.profiles for select using (public.is_admin());
create policy "admin referrals read" on public.referrals for select using (public.is_admin());
create policy "admin rewards read" on public.reward_transactions for select using (public.is_admin());
create policy "admin withdrawals read" on public.withdrawals for select using (public.is_admin());
create policy "admin fraud read" on public.fraud_events for select using (public.is_admin());
create policy "admin audit read" on public.audit_logs for select using (public.is_admin());
create policy "admin settings all" on public.settings for all using (public.is_admin()) with check (public.is_admin());
