create or replace function public.admin_adjust_student_xp(
    p_user_id uuid,
    p_amount integer
)
returns table (
    total_xp integer,
    daily_xp integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_new_total integer;
    v_new_daily integer;
begin
    if p_user_id is null or p_amount is null or p_amount = 0 then
        raise exception 'Enter a valid non-zero XP adjustment amount';
    end if;

    update public.student_progress
    set total_xp = greatest(0, total_xp + p_amount),
        daily_xp = greatest(0, daily_xp + case when p_amount > 0 then p_amount else 0 end),
        updated_at = now()
    where user_id = p_user_id
    returning student_progress.total_xp, student_progress.daily_xp into v_new_total, v_new_daily;

    if not found then
        raise exception 'Student progress record not found';
    end if;

    return query select v_new_total, v_new_daily;
end;
$$;

revoke all on function public.admin_adjust_student_xp(uuid, integer) from public, anon, authenticated;
grant execute on function public.admin_adjust_student_xp(uuid, integer) to service_role;
