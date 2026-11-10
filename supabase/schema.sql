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
    completed_topics text[] not null default '{}',
    activity_dates date[] not null default '{}',
    updated_at timestamptz not null default now()
);
alter table public.student_progress
    add column if not exists learning_progress jsonb not null default '{}'::jsonb;

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
    created_at timestamptz not null default now(),
    finished_at timestamptz
);

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

revoke all on function public.award_quiz_xp(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.finish_quiz_session(uuid) from public, anon, authenticated;
revoke all on function public.award_learning_xp(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.initialize_student_progress() from public, anon, authenticated;
revoke all on function public.sync_leaderboard_score() from public, anon, authenticated;
grant execute on function public.award_quiz_xp(uuid, uuid, uuid) to service_role;
grant execute on function public.finish_quiz_session(uuid) to service_role;
grant execute on function public.award_learning_xp(uuid, text, integer) to service_role;

alter table public.profiles enable row level security;
alter table public.student_progress enable row level security;
alter table public.learning_awards enable row level security;
alter table public.question_bank enable row level security;
alter table public.quiz_sessions enable row level security;
alter table public.quiz_session_answers enable row level security;
alter table public.question_awards enable row level security;
alter table public.leaderboard_scores enable row level security;

drop policy if exists profiles_read_self on public.profiles;
create policy profiles_read_self on public.profiles
for select to authenticated using (id = (select auth.uid()) and is_active);

drop policy if exists progress_read_self on public.student_progress;
create policy progress_read_self on public.student_progress
for select to authenticated using (user_id = (select auth.uid()) and private.is_active_student());

drop policy if exists leaderboard_read_authorized on public.leaderboard_scores;
create policy leaderboard_read_authorized on public.leaderboard_scores
for select to authenticated using (private.is_active_student());

revoke all on public.profiles, public.student_progress, public.question_bank,
    public.learning_awards, public.quiz_sessions, public.quiz_session_answers, public.question_awards,
    public.leaderboard_scores from anon, authenticated;
grant select on public.profiles, public.student_progress, public.leaderboard_scores to authenticated;
grant all on public.profiles, public.student_progress, public.question_bank,
    public.learning_awards, public.quiz_sessions, public.quiz_session_answers, public.question_awards,
    public.leaderboard_scores to service_role;

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
