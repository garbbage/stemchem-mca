create or replace function public.submit_crossword_attempt(
    p_user_id uuid,
    p_session_id uuid,
    p_answers jsonb
)
returns table (
    score integer,
    total integer,
    awarded_xp integer,
    game_xp_multiplier numeric,
    total_xp integer,
    daily_xp integer,
    daily_date date,
    completed_topics text[],
    activity_dates date[],
    learning_progress jsonb
)
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
    v_session public.quiz_sessions%rowtype;
    v_question record;
    v_score integer := 0;
    v_total integer;
    v_awarded_xp integer := 0;
begin
    if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
        raise exception 'The crossword answers are not valid';
    end if;

    select * into v_session
    from public.quiz_sessions
    where id = p_session_id and user_id = p_user_id and game_type = 'crossword'
    for update;
    if not found or now() - v_session.created_at > interval '2 hours' then
        raise exception 'This crossword has expired or is no longer available';
    end if;

    v_total := cardinality(v_session.question_ids);
    if (select count(*) from jsonb_object_keys(p_answers)) <> v_total then
        raise exception 'Submit every word in this crossword';
    end if;

    if v_session.finished_at is not null then
        select a.score, a.total, a.awarded_xp
        into v_score, v_total, v_awarded_xp
        from public.game_attempt_awards a
        where a.session_id = p_session_id;
        if not found then
            raise exception 'The completed crossword has no saved reward record';
        end if;
    else
        for v_question in
            select id, word
            from public.question_bank
            where id = any(v_session.question_ids) and active = true
        loop
            if not (p_answers ? v_question.id::text)
               or jsonb_typeof(p_answers -> v_question.id::text) <> 'string' then
                raise exception 'Every crossword answer must be text';
            end if;
            if upper(regexp_replace(p_answers ->> v_question.id::text, '[^A-Za-z]', '', 'g'))
                = upper(regexp_replace(v_question.word, '[^A-Za-z]', '', 'g')) then
                v_score := v_score + 1;
            end if;
        end loop;

        if (select count(*) from public.question_bank
            where id = any(v_session.question_ids) and active = true) <> v_total then
            raise exception 'The crossword questions are no longer available';
        end if;

        update public.quiz_sessions set finished_at = now() where id = p_session_id;
        select result.awarded_xp into v_awarded_xp
        from private.award_game_attempt(
            p_user_id, p_session_id, v_score, v_total, 1.0
        ) as result;
    end if;

    return query
    select
        v_score,
        v_total,
        v_awarded_xp,
        p.game_xp_multiplier,
        p.total_xp,
        p.daily_xp,
        p.daily_date,
        p.completed_topics,
        p.activity_dates,
        p.learning_progress
    from public.student_progress p
    where p.user_id = p_user_id;
end;
$$;
