create or replace function public.admin_update_withdrawal(withdrawal_value uuid, next_status public.withdrawal_status, reason text default null)
returns boolean language plpgsql security definer set search_path = public as $$
declare current_row public.withdrawals; admin_id uuid := auth.uid();
begin
  if not public.is_admin() then raise exception 'admin required'; end if;
  select * into current_row from public.withdrawals where id = withdrawal_value for update;
  if current_row.id is null then raise exception 'withdrawal not found'; end if;
  if current_row.status in ('PAID','REJECTED','CANCELLED') then raise exception 'withdrawal is final'; end if;
  if next_status not in ('PROCESSING','APPROVED','PAID','REJECTED','CANCELLED') then raise exception 'invalid transition'; end if;
  if next_status = 'PAID' and current_row.status not in ('APPROVED','PROCESSING') then raise exception 'withdrawal must be approved'; end if;
  if next_status = 'APPROVED' and current_row.status not in ('PENDING','PROCESSING') then raise exception 'invalid approval transition'; end if;
  if next_status = 'PROCESSING' and current_row.status <> 'PENDING' then raise exception 'invalid processing transition'; end if;
  if next_status in ('REJECTED','CANCELLED') then
    perform public.credit_reward(current_row.user_id, current_row.amount, 'REVERSAL', 'withdrawal-reversal:' || current_row.id::text, coalesce(reason, 'Remboursement du retrait'), current_row.id);
  end if;
  update public.withdrawals set status = next_status, reviewed_by = admin_id, rejection_reason = case when next_status in ('REJECTED','CANCELLED') then reason else rejection_reason end, updated_at = now() where id = current_row.id;
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata) values (admin_id, 'WITHDRAWAL_' || next_status::text, 'withdrawal', current_row.id, jsonb_build_object('previous_status', current_row.status, 'reason', reason));
  insert into public.notifications(user_id, title, body) values (current_row.user_id, 'Mise à jour de votre retrait', 'Votre demande est maintenant au statut ' || next_status::text || '.');
  return true;
end; $$;

create or replace function public.admin_set_setting(setting_key text, setting_value jsonb)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'admin required'; end if;
  if setting_key not in ('signup_bonus','referral_bonus','withdrawal_threshold','qualification_min_visits','qualification_require_email') then raise exception 'unknown setting'; end if;
  if setting_value #>> '{}' is null or (setting_key <> 'qualification_require_email' and (setting_value #>> '{}')::bigint < 0) then raise exception 'invalid setting'; end if;
  insert into public.settings(key, value, updated_by) values (setting_key, setting_value, auth.uid()) on conflict (key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = now();
  insert into public.audit_logs(actor_id, action, entity_type, metadata) values (auth.uid(), 'SETTING_UPDATED', 'setting', jsonb_build_object('key', setting_key, 'value', setting_value));
  return true;
end; $$;

create or replace function public.admin_set_suspension(target_user uuid, suspend boolean)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'admin required'; end if;
  if target_user = auth.uid() then raise exception 'cannot suspend self'; end if;
  update public.profiles set suspended_at = case when suspend then now() else null end, updated_at = now() where id = target_user;
  if not found then raise exception 'user not found'; end if;
  insert into public.audit_logs(actor_id, action, entity_type, entity_id) values (auth.uid(), case when suspend then 'USER_SUSPENDED' else 'USER_REACTIVATED' end, 'profile', target_user);
  return true;
end; $$;

revoke all on function public.admin_update_withdrawal(uuid,public.withdrawal_status,text) from public, anon, authenticated;
revoke all on function public.admin_set_setting(text,jsonb) from public, anon, authenticated;
revoke all on function public.admin_set_suspension(uuid,boolean) from public, anon, authenticated;
grant execute on function public.admin_update_withdrawal(uuid,public.withdrawal_status,text) to authenticated;
grant execute on function public.admin_set_setting(text,jsonb) to authenticated;
grant execute on function public.admin_set_suspension(uuid,boolean) to authenticated;
