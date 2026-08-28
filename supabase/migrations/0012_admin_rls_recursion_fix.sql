create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid())
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "admin users read" on public.admin_users;
create policy "admin users read" on public.admin_users for select using (public.is_admin());
