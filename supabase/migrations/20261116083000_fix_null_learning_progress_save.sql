create or replace function public.save_student_learning_progress(
    p_user_id uuid,
    p_learning_progress jsonb,
    p_completed_topics text[],
    p_multiplier numeric
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
    if p_learning_progress is null
       or jsonb_typeof(p_learning_progress) <> 'object'
       or p_multiplier is null
       or p_multiplier < 1.0 or p_multiplier > 1.5
       or p_multiplier * 10 <> trunc(p_multiplier * 10) then
        raise exception 'Invalid learning progress';
    end if;

    update public.student_progress as progress
    set learning_progress = jsonb_set(
        p_learning_progress,
        '{all_lessons_unlocked}',
        to_jsonb(
            coalesce(progress.learning_progress ->> 'all_lessons_unlocked' = 'true', false)
            or coalesce(p_learning_progress ->> 'all_lessons_unlocked' = 'true', false)
        ),
        true
    ),
    completed_topics = coalesce(p_completed_topics, progress.completed_topics),
    game_xp_multiplier = p_multiplier,
    updated_at = now()
    where progress.user_id = p_user_id;

    if not found then
        raise exception 'Student progress is not available';
    end if;
end;
$$;
