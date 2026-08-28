alter type public.reward_kind add value if not exists 'WITHDRAWAL';

create or replace function public.request_withdrawal(amount_value bigint, payment_method_value uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare current_user_id uuid := auth.uid(); current_balance bigint; withdrawal_id uuid;
begin
  if current_user_id is null or coalesce(current_setting('request.jwt.claim.role', true), '') <> 'authenticated' then raise exception 'authentication required'; end if;
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

drop policy if exists "withdrawals own insert" on public.withdrawals;
revoke all on function public.request_withdrawal(bigint, uuid) from public, anon;
grant execute on function public.request_withdrawal(bigint, uuid) to authenticated;
