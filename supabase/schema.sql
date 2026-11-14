create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    student_id text not null unique check (
        student_id = lower(student_id)
        and student_id ~ '^[a-z0-9][a-z0-9._-]{1,30}[a-z0-9]$'
        and position('..' in student_id) = 0
    ),
    display_name text not null check (length(btrim(display_name)) between 1 and 60),
    role text not null default 'student' check (role in ('student', 'admin')),
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists public.student_progress (
    user_id uuid primary key references public.profiles(id) on delete cascade,
    total_xp integer not null default 0 check (total_xp >= 0),
    daily_xp integer not null default 0 check (daily_xp >= 0),
    daily_date date not null default current_date,
    game_xp_multiplier numeric(2, 1) not null default 1.0 check (game_xp_multiplier between 1.0 and 1.5),
    completed_topics text[] not null default '{}',
    activity_dates date[] not null default '{}',
    updated_at timestamptz not null default now()
);
alter table public.student_progress
    add column if not exists learning_progress jsonb not null default '{}'::jsonb;
alter table public.student_progress
    add column if not exists game_xp_multiplier numeric(2, 1) not null default 1.0
    check (game_xp_multiplier between 1.0 and 1.5);

with lesson_counts as (
    select p.user_id, count(distinct completed.slug) as completed_count
    from public.student_progress p
    cross join lateral jsonb_array_elements_text(
        case
            when jsonb_typeof(p.learning_progress -> 'completed_lessons') = 'array'
                then p.learning_progress -> 'completed_lessons'
            else '[]'::jsonb
        end
    ) as completed(slug)
    where completed.slug = any(array[
        'measurements', 'atomic-structure', 'periodic-table', 'chemical-bonding',
        'intermolecular-forces', 'states-of-matter', 'chemical-equations',
        'chemical-reactions', 'gas-laws', 'solutions', 'acids-and-bases',
        'thermochemistry'
    ]::text[])
    group by p.user_id
)
update public.student_progress p
set game_xp_multiplier = case
    when lesson_counts.completed_count >= 11 then 1.5
    when lesson_counts.completed_count >= 8 then 1.4
    when lesson_counts.completed_count >= 5 then 1.3
    when lesson_counts.completed_count >= 3 then 1.2
    when lesson_counts.completed_count >= 1 then 1.1
    else 1.0
end
from lesson_counts
where lesson_counts.user_id = p.user_id;

create table if not exists public.learning_awards (
    user_id uuid not null references public.profiles(id) on delete cascade,
    activity_id text not null check (length(activity_id) between 1 and 160),
    xp integer not null check (xp in (3, 5, 10, 15)),
    awarded_at timestamptz not null default now(),
    primary key (user_id, activity_id)
);

create table if not exists public.question_bank (
    id uuid primary key default gen_random_uuid(),
    topic text not null,
    word text not null,
    clue text not null,
    active boolean not null default true,
    unique (topic, word)
);

create table if not exists public.quiz_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    topic text,
    question_ids uuid[] not null,
    game_type text not null default 'quiz' check (game_type in ('quiz', 'crossword')),
    created_at timestamptz not null default now(),
    finished_at timestamptz
);
alter table public.quiz_sessions
    add column if not exists game_type text not null default 'quiz'
    check (game_type in ('quiz', 'crossword'));

create table if not exists public.game_attempt_awards (
    session_id uuid primary key references public.quiz_sessions(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    score integer not null check (score >= 0),
    total integer not null check (total > 0 and score <= total),
    awarded_xp integer not null check (awarded_xp >= 0),
    multiplier numeric(2, 1) not null check (multiplier between 1.0 and 1.5),
    awarded_at timestamptz not null default now()
);
create index if not exists game_attempt_awards_user_date_idx
    on public.game_attempt_awards (user_id, awarded_at);

create table if not exists public.quiz_session_answers (
    session_id uuid not null references public.quiz_sessions(id) on delete cascade,
    question_id uuid not null references public.question_bank(id) on delete cascade,
    selected_word text not null,
    is_correct boolean not null,
    answered_at timestamptz not null default now(),
    primary key (session_id, question_id)
);

create table if not exists public.question_awards (
    user_id uuid not null references public.profiles(id) on delete cascade,
    question_id uuid not null references public.question_bank(id) on delete cascade,
    awarded_at timestamptz not null default now(),
    primary key (user_id, question_id)
);

create table if not exists public.leaderboard_scores (
    user_id uuid primary key references public.profiles(id) on delete cascade,
    display_name text not null,
    total_xp integer not null default 0 check (total_xp >= 0)
);

create or replace function private.is_active_student()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
    select exists (
        select 1 from public.profiles
        where id = (select auth.uid()) and is_active = true
    );
$$;
revoke all on function private.is_active_student() from public, anon;
grant execute on function private.is_active_student() to authenticated;

create or replace function public.sync_leaderboard_score()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_user_id uuid;
    v_name text;
    v_role text;
    v_active boolean;
    v_xp integer;
begin
    if tg_table_name = 'profiles' then
        v_user_id := coalesce(new.id, old.id);
        if tg_op = 'DELETE' then
            delete from public.leaderboard_scores where user_id = v_user_id;
            return old;
        end if;
        v_name := new.display_name;
        v_role := new.role;
        v_active := new.is_active;
        select total_xp into v_xp from public.student_progress where user_id = v_user_id;
    else
        v_user_id := new.user_id;
        select display_name, role, is_active
        into v_name, v_role, v_active
        from public.profiles where id = v_user_id;
        v_xp := new.total_xp;
    end if;

    if v_role = 'student' and v_active then
        insert into public.leaderboard_scores (user_id, display_name, total_xp)
        values (v_user_id, v_name, coalesce(v_xp, 0))
        on conflict (user_id) do update
        set display_name = excluded.display_name, total_xp = excluded.total_xp;
    else
        delete from public.leaderboard_scores where user_id = v_user_id;
    end if;
    if tg_op = 'DELETE' then
        return old;
    end if;
    return new;
end;
$$;

create or replace function public.initialize_student_progress()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
    insert into public.student_progress (user_id) values (new.id)
    on conflict (user_id) do nothing;
    return new;
end;
$$;

create or replace function public.unlock_all_student_lessons(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
    update public.student_progress as progress
    set learning_progress = jsonb_set(
        case
            when jsonb_typeof(progress.learning_progress) = 'object'
                then progress.learning_progress
            else '{}'::jsonb
        end,
        '{all_lessons_unlocked}',
        'true'::jsonb,
        true
    ),
    updated_at = now()
    where progress.user_id = p_user_id
      and exists (
          select 1
          from public.profiles
          where id = p_user_id and role = 'student'
      );

    if not found then
        raise exception 'Student progress is not available';
    end if;
end;
$$;

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
            progress.learning_progress ->> 'all_lessons_unlocked' = 'true'
            or p_learning_progress ->> 'all_lessons_unlocked' = 'true'
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

drop trigger if exists profiles_initialize_progress on public.profiles;
create trigger profiles_initialize_progress
after insert on public.profiles
for each row execute function public.initialize_student_progress();

drop trigger if exists profiles_sync_leaderboard on public.profiles;
create trigger profiles_sync_leaderboard
after insert or update or delete on public.profiles
for each row execute function public.sync_leaderboard_score();

drop trigger if exists progress_sync_leaderboard on public.student_progress;
create trigger progress_sync_leaderboard
after insert or update of total_xp on public.student_progress
for each row execute function public.sync_leaderboard_score();

insert into public.student_progress (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

create or replace function public.award_quiz_xp(
    p_user_id uuid,
    p_session_id uuid,
    p_question_id uuid
)
returns table (
    awarded boolean,
    total_xp integer,
    daily_xp integer,
    daily_date date,
    completed_topics text[],
    activity_dates date[]
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_rows integer;
begin
    if not exists (
        select 1
        from public.quiz_sessions s
        join public.quiz_session_answers a on a.session_id = s.id
        join public.question_bank q on q.id = a.question_id
        where s.id = p_session_id
          and s.user_id = p_user_id
          and p_question_id = any(s.question_ids)
          and a.question_id = p_question_id
          and a.is_correct = true
          and lower(btrim(a.selected_word)) = lower(btrim(q.word))
    ) then
        raise exception 'No validated correct answer exists for this session';
    end if;

    insert into public.question_awards (user_id, question_id)
    values (p_user_id, p_question_id)
    on conflict (user_id, question_id) do nothing;
    get diagnostics v_rows = row_count;

    if v_rows = 1 then
        insert into public.student_progress (user_id, total_xp, daily_xp, daily_date, activity_dates)
        values (p_user_id, 10, 10, current_date, array[current_date])
        on conflict (user_id) do update
        set total_xp = public.student_progress.total_xp + 10,
            daily_xp = case
                when public.student_progress.daily_date = current_date
                    then public.student_progress.daily_xp + 10
                else 10
            end,
            daily_date = current_date,
            activity_dates = array(
                select distinct d
                from unnest(public.student_progress.activity_dates || current_date) as dates(d)
                order by d
            ),
            updated_at = now();
    end if;

    return query
    select v_rows = 1, p.total_xp, p.daily_xp, p.daily_date, p.completed_topics, p.activity_dates
    from public.student_progress p where p.user_id = p_user_id;
end;
$$;

create or replace function public.finish_quiz_session(p_session_id uuid)
returns table (finished boolean, passed boolean, completed_topic text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_session public.quiz_sessions%rowtype;
    v_answer_count integer;
    v_correct_count integer;
    v_passed boolean;
begin
    select * into v_session
    from public.quiz_sessions where id = p_session_id
    for update;
    if not found or v_session.finished_at is not null then
        return query select false, false, null::text;
        return;
    end if;

    select count(*), count(*) filter (where is_correct)
    into v_answer_count, v_correct_count
    from public.quiz_session_answers where session_id = p_session_id;

    if v_answer_count < cardinality(v_session.question_ids) then
        return query select false, false, null::text;
        return;
    end if;

    v_passed := v_correct_count >= ceil(cardinality(v_session.question_ids) * 0.6);
    update public.quiz_sessions set finished_at = now() where id = p_session_id;
    if v_passed and v_session.topic is not null then
        update public.student_progress
        set completed_topics = array(
                select distinct t
                from unnest(completed_topics || v_session.topic) as topics(t)
                order by t
            ),
            updated_at = now()
        where user_id = v_session.user_id;
    end if;
    return query select true, v_passed, case when v_passed then v_session.topic else null end;
end;
$$;

create or replace function public.award_learning_xp(
    p_user_id uuid,
    p_activity_id text,
    p_xp integer
)
returns table (awarded boolean, total_xp integer, daily_xp integer, daily_date date, activity_dates date[])
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_rows integer;
begin
    if p_activity_id is null or length(p_activity_id) not between 1 and 160
       or p_xp not in (3, 5, 10, 15)
       or not exists (
           select 1 from public.profiles
           where id = p_user_id and role = 'student' and is_active = true
       ) then
        raise exception 'Invalid learning award';
    end if;

    insert into public.learning_awards (user_id, activity_id, xp)
    values (p_user_id, p_activity_id, p_xp)
    on conflict (user_id, activity_id) do nothing;
    get diagnostics v_rows = row_count;

    if v_rows = 1 then
        update public.student_progress p
        set total_xp = p.total_xp + p_xp,
            daily_xp = case
                when p.daily_date = current_date then p.daily_xp + p_xp
                else p_xp
            end,
            daily_date = current_date,
            activity_dates = array(
                select distinct d
                from unnest(p.activity_dates || current_date) as dates(d)
                order by d
            ),
            updated_at = now()
        where p.user_id = p_user_id;
    end if;

    return query
    select v_rows = 1, p.total_xp, p.daily_xp, p.daily_date, p.activity_dates
    from public.student_progress p where p.user_id = p_user_id;
end;
$$;

create or replace function private.award_game_attempt(
    p_user_id uuid,
    p_session_id uuid,
    p_score integer,
    p_total integer,
    p_difficulty numeric
)
returns table (awarded_xp integer, multiplier numeric)
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
    v_learning_progress jsonb;
    v_lesson_count integer;
    v_attempt_count integer;
    v_daily_awarded integer;
    v_base_xp integer;
    v_xp integer;
    v_multiplier numeric(2, 1);
begin
    if p_total < 1 or p_score < 0 or p_score > p_total
       or p_difficulty not in (1.0, 1.2)
       or not exists (
           select 1 from public.quiz_sessions
           where id = p_session_id and user_id = p_user_id and finished_at is not null
       )
       or not exists (
           select 1 from public.profiles
           where id = p_user_id and role = 'student' and is_active = true
       ) then
        raise exception 'Invalid game result';
    end if;

    select learning_progress into v_learning_progress
    from public.student_progress
    where user_id = p_user_id
    for update;
    if not found then
        raise exception 'Student progress is not available';
    end if;

    select count(distinct lesson_slug)
    into v_lesson_count
    from jsonb_array_elements_text(
        case
            when jsonb_typeof(v_learning_progress -> 'completed_lessons') = 'array'
                then v_learning_progress -> 'completed_lessons'
            else '[]'::jsonb
        end
    ) as lessons(lesson_slug)
    where lesson_slug = any(array[
        'measurements', 'atomic-structure', 'periodic-table', 'chemical-bonding',
        'intermolecular-forces', 'states-of-matter', 'chemical-equations',
        'chemical-reactions', 'gas-laws', 'solutions', 'acids-and-bases',
        'thermochemistry'
    ]::text[]);

    v_multiplier := case
        when v_lesson_count >= 11 then 1.5
        when v_lesson_count >= 8 then 1.4
        when v_lesson_count >= 5 then 1.3
        when v_lesson_count >= 3 then 1.2
        when v_lesson_count >= 1 then 1.1
        else 1.0
    end;

    update public.student_progress
    set game_xp_multiplier = v_multiplier
    where user_id = p_user_id
      and game_xp_multiplier is distinct from v_multiplier;

    select count(*), coalesce(sum(awards.awarded_xp), 0)
    into v_attempt_count, v_daily_awarded
    from public.game_attempt_awards as awards
    where awards.user_id = p_user_id
      and awards.awarded_at >= current_date::timestamptz
      and awards.awarded_at < (current_date + 1)::timestamptz;

    v_base_xp := p_score * 4 + case
        when p_score = p_total then 8
        when p_score >= ceil(p_total * 0.8) then 5
        when p_score >= ceil(p_total * 0.6) then 2
        else 0
    end;
    v_xp := case
        when v_attempt_count >= 5 then 0
        else least(
            round(v_base_xp * v_multiplier * p_difficulty)::integer,
            greatest(100 - v_daily_awarded, 0)
        )
    end;

    insert into public.game_attempt_awards (
        session_id, user_id, score, total, awarded_xp, multiplier
    ) values (
        p_session_id, p_user_id, p_score, p_total, v_xp, v_multiplier
    );

    if v_xp > 0 then
        update public.student_progress
        set total_xp = total_xp + v_xp,
            daily_xp = case when daily_date = current_date then daily_xp + v_xp else v_xp end,
            daily_date = current_date,
            activity_dates = array(
                select distinct activity_date
                from unnest(activity_dates || current_date) as dates(activity_date)
                order by activity_date
            ),
            updated_at = now()
        where user_id = p_user_id;
    end if;

    return query select v_xp, v_multiplier;
end;
$$;

create or replace function public.submit_quiz_answer(
    p_user_id uuid,
    p_session_id uuid,
    p_question_id uuid,
    p_selected_word text
)
returns table (
    correct boolean,
    correct_answer text,
    awarded boolean,
    awarded_xp integer,
    complete boolean,
    passed boolean,
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
    v_question_word text;
    v_saved_word text;
    v_is_correct boolean;
    v_answer_count integer;
    v_correct_count integer;
    v_complete boolean;
    v_passed boolean;
    v_awarded_xp integer := 0;
begin
    if p_selected_word is null or length(p_selected_word) > 120 then
        raise exception 'That quiz answer is not valid';
    end if;

    select * into v_session
    from public.quiz_sessions
    where id = p_session_id and user_id = p_user_id and game_type = 'quiz'
    for update;
    if not found or now() - v_session.created_at > interval '2 hours'
       or not (p_question_id = any(v_session.question_ids)) then
        raise exception 'This quiz has expired or is no longer available';
    end if;

    select word into v_question_word
    from public.question_bank
    where id = p_question_id and active = true;
    if not found then
        raise exception 'That quiz question is no longer available';
    end if;

    select selected_word into v_saved_word
    from public.quiz_session_answers
    where session_id = p_session_id and question_id = p_question_id;
    if found then
        if v_saved_word <> btrim(p_selected_word) then
            raise exception 'This question has already been answered';
        end if;
    else
        if v_session.finished_at is not null then
            raise exception 'This quiz has already been completed';
        end if;
        v_is_correct := lower(btrim(p_selected_word)) = lower(btrim(v_question_word));
        insert into public.quiz_session_answers (
            session_id, question_id, selected_word, is_correct
        ) values (
            p_session_id, p_question_id, btrim(p_selected_word), v_is_correct
        );
    end if;

    select count(*), count(*) filter (where is_correct)
    into v_answer_count, v_correct_count
    from public.quiz_session_answers
    where session_id = p_session_id;
    v_complete := v_session.finished_at is not null
        or v_answer_count = cardinality(v_session.question_ids);
    v_passed := v_complete
        and v_correct_count >= ceil(cardinality(v_session.question_ids) * 0.6);

    if v_session.finished_at is null and v_complete then
        update public.quiz_sessions set finished_at = now() where id = p_session_id;
        if v_passed and v_session.topic is not null then
            update public.student_progress as progress
            set completed_topics = array(
                    select distinct topic_name
                    from unnest(progress.completed_topics || v_session.topic) as topics(topic_name)
                    order by topic_name
                ),
                updated_at = now()
            where progress.user_id = p_user_id;
        end if;
        select result.awarded_xp into v_awarded_xp
        from private.award_game_attempt(
            p_user_id,
            p_session_id,
            v_correct_count,
            cardinality(v_session.question_ids),
            case when v_session.topic is null then 1.0 else 1.2 end
        ) as result;
    else
        select awards.awarded_xp into v_awarded_xp
        from public.game_attempt_awards as awards
        where awards.session_id = p_session_id;
        v_awarded_xp := coalesce(v_awarded_xp, 0);
    end if;

    select a.is_correct into v_is_correct
    from public.quiz_session_answers a
    where a.session_id = p_session_id and a.question_id = p_question_id;

    return query
    select
        v_is_correct,
        v_question_word,
        v_awarded_xp > 0,
        v_awarded_xp,
        v_complete,
        v_passed,
        p.game_xp_multiplier,
        case when v_complete then p.total_xp end,
        case when v_complete then p.daily_xp end,
        case when v_complete then p.daily_date end,
        case when v_complete then p.completed_topics end,
        case when v_complete then p.activity_dates end,
        case when v_complete then p.learning_progress end
    from public.student_progress p
    where p.user_id = p_user_id;
end;
$$;

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
    if jsonb_object_length(p_answers) <> v_total then
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

revoke all on function public.award_quiz_xp(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.finish_quiz_session(uuid) from public, anon, authenticated;
revoke all on function public.award_learning_xp(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.award_quiz_xp(uuid, uuid, uuid) from service_role;
revoke all on function public.finish_quiz_session(uuid) from service_role;
revoke all on function public.award_learning_xp(uuid, text, integer) from service_role;
revoke all on function public.initialize_student_progress() from public, anon, authenticated;
revoke all on function public.unlock_all_student_lessons(uuid) from public, anon, authenticated;
revoke all on function public.save_student_learning_progress(uuid, jsonb, text[], numeric) from public, anon, authenticated;
revoke all on function public.sync_leaderboard_score() from public, anon, authenticated;
revoke all on function private.award_game_attempt(uuid, uuid, integer, integer, numeric) from public, anon, authenticated;
revoke all on function public.submit_quiz_answer(uuid, uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.submit_crossword_attempt(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function private.award_game_attempt(uuid, uuid, integer, integer, numeric) to service_role;
grant execute on function public.unlock_all_student_lessons(uuid) to service_role;
grant execute on function public.save_student_learning_progress(uuid, jsonb, text[], numeric) to service_role;
grant execute on function public.submit_quiz_answer(uuid, uuid, uuid, text) to service_role;
grant execute on function public.submit_crossword_attempt(uuid, uuid, jsonb) to service_role;

alter table public.profiles enable row level security;
alter table public.student_progress enable row level security;
alter table public.learning_awards enable row level security;
alter table public.question_bank enable row level security;
alter table public.quiz_sessions enable row level security;
alter table public.quiz_session_answers enable row level security;
alter table public.question_awards enable row level security;
alter table public.leaderboard_scores enable row level security;
alter table public.game_attempt_awards enable row level security;

drop policy if exists profiles_read_self on public.profiles;
create policy profiles_read_self on public.profiles
for select to authenticated using (id = (select auth.uid()) and is_active);

drop policy if exists profiles_update_self_display_name on public.profiles;
create policy profiles_update_self_display_name on public.profiles
for update to authenticated
using (id = (select auth.uid()) and is_active)
with check (id = (select auth.uid()) and is_active);

drop policy if exists progress_read_self on public.student_progress;
create policy progress_read_self on public.student_progress
for select to authenticated using (user_id = (select auth.uid()) and private.is_active_student());

drop policy if exists leaderboard_read_authorized on public.leaderboard_scores;
create policy leaderboard_read_authorized on public.leaderboard_scores
for select to authenticated using (private.is_active_student());

revoke all on public.profiles, public.student_progress, public.question_bank,
    public.learning_awards, public.quiz_sessions, public.quiz_session_answers, public.question_awards,
    public.leaderboard_scores, public.game_attempt_awards from anon, authenticated;
grant select on public.profiles, public.student_progress, public.leaderboard_scores to authenticated;
revoke update (display_name) on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;
grant all on public.profiles, public.student_progress, public.question_bank,
    public.learning_awards, public.quiz_sessions, public.quiz_session_answers, public.question_awards,
    public.leaderboard_scores, public.game_attempt_awards to service_role;

do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'leaderboard_scores'
    ) then
        alter publication supabase_realtime add table public.leaderboard_scores;
    end if;
end;
$$;
