drop policy if exists "methods own all" on public.payment_methods;
create policy "methods own read" on public.payment_methods for select using (auth.uid() = user_id);
create policy "methods own insert" on public.payment_methods for insert with check (auth.uid() = user_id and is_verified = false);
create policy "methods own delete" on public.payment_methods for delete using (auth.uid() = user_id and is_verified = false);
revoke all on public.payment_methods from authenticated;
grant select (id, user_id, provider, account_reference, is_verified, created_at) on public.payment_methods to authenticated;
grant insert (user_id, provider, account_reference) on public.payment_methods to authenticated;
grant delete on public.payment_methods to authenticated;
