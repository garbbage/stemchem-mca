create table if not exists private.jeopardy_pvp_question_bank (
    question_id text primary key,
    category text not null,
    points integer not null check (points in (200, 400, 600, 800, 1000)),
    clue text not null,
    accepted_answers text[] not null,
    correct_answer text not null,
    unique (category, points)
);

insert into private.jeopardy_pvp_question_bank
    (question_id, category, points, clue, accepted_answers, correct_answer)
values
    ('atomic-200-1', 'Atomic Structure', 200, 'This is the smallest unit of an element that retains its chemical properties.', array['atom','atoms'], 'atom'),
    ('atomic-400-1', 'Atomic Structure', 400, 'This subatomic particle has no electrical charge and is found in the nucleus.', array['neutron','neutrons'], 'neutron'),
    ('atomic-600-1', 'Atomic Structure', 600, 'This term describes an atom or group of atoms that has gained or lost electrons, resulting in an electrical charge', array['ion','ions'], 'ion'),
    ('atomic-800-1', 'Atomic Structure', 800, 'These are atoms of the same element that have equal numbers of protons but different numbers of neutrons.', array['isotopes','isotope'], 'isotopes'),
    ('atomic-1000-1', 'Atomic Structure', 1000, 'This type of ion forms when an atom loses electrons and becomes positively charged. ', array['cation','cations'], 'cation'),
    ('periodictable-200-1', 'Periodic Table', 200, 'This organized chart arranges all known chemical elements according to their atomic numbers and recurring chemical properties.', array['periodic table','periodic table of elements'], 'periodic table'),
    ('periodictable-400-1', 'Periodic Table', 400, 'These elements are generally shiny, malleable, ductile, and good conductors of heat and electricity.', array['metals','metal'], 'metals'),
    ('periodictable-600-1', 'Periodic Table', 600, 'Located in Group 18, these elements are known for their low chemical reactivity because their outer electron shells are generally full. One example of this is Xenon', array['noble gases','noble gas'], 'noble gases'),
    ('periodictable-800-1', 'Periodic Table', 800, 'This group of elements occupies Group 1 of the periodic table, excluding hydrogen, and is known for reacting vigorously with water.', array['alkali metals','alkali metal','alkali'], 'alkali metals'),
    ('periodictable-1000-1', 'Periodic Table', 1000, 'This scientist is widely credited with developing the first widely recognized periodic table based on atomic mass and recurring chemical properties.', array['Dmitri Mendeleev','Mendeleev'], 'Dmitri Mendeleev'),
    ('bonding-200-1', 'Chemical Bonding', 200, 'This type of chemical bond forms when one atom transfers electrons to another, resulting in oppositely charged ions.', array['ionic bond','ionic bonds','ionic'], 'ionic bond'),
    ('bonding-400-1', 'Chemical Bonding', 400, 'This type of bonding involves metal atoms held together by the attraction between positive metal ions and a sea of delocalized electrons.', array['metallic bond','metallic bonds','metallic bonding','metallic'], 'metallic bond'),
    ('bonding-600-1', 'Chemical Bonding', 600, 'This type of covalent bond occurs when electrons are shared unequally between two atoms because of a difference in electronegativity.', array['polar covalent bond','polar covalent bonds','polar'], 'polar covalent bond'),
    ('bonding-800-1', 'Chemical Bonding', 800, 'This type of bond usually occurs between a metal and a nonmetal, producing oppositely charged ions that attract each other. One example is Sodium Chloride.', array['ionic bond','ionic bonds','ionic'], 'ionic bond'),
    ('bonding-1000-1', 'Chemical Bonding', 1000, 'This chemical principle describes the tendency of atoms to gain, lose, or share electrons to achieve eight electrons in their outermost shell.', array['octet rule','octet'], 'octet rule'),
    ('reactions-200-1', 'Chemical Reactions', 200, 'This type of reaction occurs when two or more reactants combine to form a single product.', array['synthesis','synthesis reaction','synthesis reactions'], 'synthesis'),
    ('reactions-400-1', 'Chemical Reactions', 400, 'This substance speeds up a chemical reaction without being consumed in the process.', array['catalyst','catalysts'], 'catalyst'),
    ('reactions-600-1', 'Chemical Reactions', 600, 'This type of chemical reaction occurs when a substance reacts with oxygen, releasing energy.', array['combustion','combustion reaction','combustion reactions'], 'combustion'),
    ('reactions-800-1', 'Chemical Reactions', 800, 'In this type of reaction, one element replaces another element in a compound.', array['single displacement','single displacement reaction','single displacement reactions','single replacement','single replacement reaction','single replacement reactions'], 'single displacement'),
    ('reactions-1000-1', 'Chemical Reactions', 1000, 'This type of reaction occurs when an acid reacts with a base, producing salt and water.', array['acid-base neutralization','acid-base neutralization reaction','acid-base neutralization reactions','acid base neutralization','acid base neutralization reaction','acid base neutralization reactions','acidbase neutralization','acidbase neutralization reaction','acidbase neutralization reactions'], 'acid-base neutralization'),
    ('acids-200-1', 'Acids and Bases', 200, 'This substance donates hydrogen ions when dissolved in water.', array['acid','acids'], 'acid'),
    ('acids-400-1', 'Acids and Bases', 400, 'This ionic compound is one of the products formed when an acid reacts with a base during neutralization.', array['salt'], 'salt'),
    ('acids-600-1', 'Acids and Bases', 600, 'This type of reaction occurs when an acid and a base react to produce salt and water.', array['neutralization'], 'neutralization'),
    ('acids-800-1', 'Acids and Bases', 800, 'This type of acid completely ionizes in water, producing a high concentration of hydrogen ions.', array['strong acid','strong acids','strong'], 'strong acid'),
    ('acids-1000-1', 'Acids and Bases', 1000, 'This positively charged ion is represented by the symbol H⁺ and is formed when a hydrogen atom loses an electron.', array['hydrogen ion','hydrogen ions'], 'hydrogen ion')
on conflict (question_id) do update set
    category = excluded.category,
    points = excluded.points,
    clue = excluded.clue,
    accepted_answers = excluded.accepted_answers,
    correct_answer = excluded.correct_answer;

create table if not exists private.jeopardy_pvp_queue (
    user_id uuid primary key references public.profiles(id) on delete cascade,
    queued_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    status text not null check (status in ('waiting', 'matched')),
    match_id uuid
);
create index if not exists jeopardy_pvp_queue_waiting_idx
    on private.jeopardy_pvp_queue (queued_at) where status = 'waiting';

create table if not exists public.jeopardy_pvp_matches (
    id uuid primary key default gen_random_uuid(),
    status text not null check (status in ('ready', 'in_progress', 'finished', 'cancelled', 'abandoned')),
    public_state jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    started_at timestamptz,
    finished_at timestamptz
);

create table if not exists private.jeopardy_pvp_match_members (
    match_id uuid not null references public.jeopardy_pvp_matches(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    slot text not null check (slot in ('one', 'two')),
    primary key (match_id, user_id),
    unique (match_id, slot)
);
create index if not exists jeopardy_pvp_match_members_user_idx
    on private.jeopardy_pvp_match_members (user_id, match_id);

create table if not exists private.jeopardy_pvp_match_clues (
    match_id uuid not null references public.jeopardy_pvp_matches(id) on delete cascade,
    position integer not null check (position between 0 and 24),
    question_id text not null references private.jeopardy_pvp_question_bank(question_id),
    primary key (match_id, position),
    unique (match_id, question_id)
);

create table if not exists private.jeopardy_pvp_awards (
    match_id uuid not null references public.jeopardy_pvp_matches(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    final_score integer not null,
    base_xp integer not null check (base_xp >= 0),
    match_multiplier numeric(2, 1) not null check (match_multiplier in (0.5, 1.0, 2.5)),
    lesson_multiplier numeric(2, 1) not null check (lesson_multiplier between 1.0 and 1.5),
    awarded_xp integer not null check (awarded_xp >= 0),
    correct_count integer not null,
    incorrect_count integer not null,
    awarded_at timestamptz not null default now(),
    primary key (match_id, user_id)
);
create index if not exists jeopardy_pvp_awards_daily_idx
    on private.jeopardy_pvp_awards (user_id, awarded_at);

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

    select v_attempt_count + count(*), v_daily_awarded + coalesce(sum(awards.awarded_xp), 0)
    into v_attempt_count, v_daily_awarded
    from private.jeopardy_pvp_awards as awards
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

create or replace function private.is_jeopardy_pvp_participant(p_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
    select exists (
        select 1 from private.jeopardy_pvp_match_members
        where match_id = p_match_id and user_id = (select auth.uid())
    );
$$;
revoke all on function private.is_jeopardy_pvp_participant(uuid) from public, anon;
grant execute on function private.is_jeopardy_pvp_participant(uuid) to authenticated;

alter table public.jeopardy_pvp_matches enable row level security;
drop policy if exists jeopardy_pvp_match_read_participants on public.jeopardy_pvp_matches;
create policy jeopardy_pvp_match_read_participants on public.jeopardy_pvp_matches
for select to authenticated using (
    private.is_jeopardy_pvp_participant(id)
    and private.is_active_student()
);
revoke all on public.jeopardy_pvp_matches from anon, authenticated;
grant select on public.jeopardy_pvp_matches to authenticated;
revoke all on private.jeopardy_pvp_queue, private.jeopardy_pvp_question_bank,
    private.jeopardy_pvp_match_clues, private.jeopardy_pvp_awards,
    private.jeopardy_pvp_match_members from public, anon, authenticated;
grant all on private.jeopardy_pvp_queue, private.jeopardy_pvp_question_bank,
    private.jeopardy_pvp_match_clues, private.jeopardy_pvp_awards,
    private.jeopardy_pvp_match_members to service_role;

do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public'
          and tablename = 'jeopardy_pvp_matches'
    ) then
        alter publication supabase_realtime add table public.jeopardy_pvp_matches;
    end if;
end;
$$;

create or replace function private.jeopardy_pvp_award_match(p_match_id uuid, p_state jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
    v_one uuid;
    v_two uuid;
    v_one_score integer;
    v_two_score integer;
    v_user uuid;
    v_slot text;
    v_player jsonb;
    v_rank_multiplier numeric(2, 1);
    v_base integer;
    v_lesson numeric(2, 1);
    v_count integer;
    v_daily integer;
    v_awarded integer;
    v_daily_xp integer;
    v_total_xp integer;
    v_results jsonb := '[]'::jsonb;
begin
    select one.user_id, two.user_id
    into v_one, v_two
    from public.jeopardy_pvp_matches m
    join private.jeopardy_pvp_match_members one on one.match_id = m.id and one.slot = 'one'
    join private.jeopardy_pvp_match_members two on two.match_id = m.id and two.slot = 'two'
    where m.id = p_match_id and m.status = 'in_progress'
    for update of m;
    if not found then
        raise exception 'This match is not eligible for completion rewards';
    end if;

    v_one_score := coalesce((p_state #>> '{players,one,score}')::integer, 0);
    v_two_score := coalesce((p_state #>> '{players,two,score}')::integer, 0);

    foreach v_user in array array[v_one, v_two] loop
        v_slot := case when v_user = v_one then 'one' else 'two' end;
        v_player := p_state #> array['players', v_slot];
        v_base := coalesce((v_player ->> 'base_xp')::integer, 0) + case
            when coalesce((v_player ->> 'correct')::integer, 0) = 25 then 8
            when coalesce((v_player ->> 'correct')::integer, 0) >= 20 then 5
            when coalesce((v_player ->> 'correct')::integer, 0) >= 15 then 2
            else 0
        end;
        v_rank_multiplier := case
            when v_one_score = v_two_score then 1.0
            when (v_slot = 'one' and v_one_score > v_two_score)
              or (v_slot = 'two' and v_two_score > v_one_score) then 2.5
            else 0.5
        end;

        select game_xp_multiplier into v_lesson
        from public.student_progress where user_id = v_user for update;
        if not found then
            raise exception 'Player progress is unavailable';
        end if;

        select
            (select count(*) from public.game_attempt_awards a
             where a.user_id = v_user and a.awarded_at >= current_date::timestamptz
               and a.awarded_at < (current_date + 1)::timestamptz)
            + (select count(*) from private.jeopardy_pvp_awards a
               where a.user_id = v_user and a.awarded_at >= current_date::timestamptz
                 and a.awarded_at < (current_date + 1)::timestamptz),
            (select coalesce(sum(a.awarded_xp), 0) from public.game_attempt_awards a
             where a.user_id = v_user and a.awarded_at >= current_date::timestamptz
               and a.awarded_at < (current_date + 1)::timestamptz)
            + (select coalesce(sum(a.awarded_xp), 0) from private.jeopardy_pvp_awards a
               where a.user_id = v_user and a.awarded_at >= current_date::timestamptz
                 and a.awarded_at < (current_date + 1)::timestamptz)
        into v_count, v_daily;

        v_awarded := case when v_count >= 5 then 0 else least(
            round(v_base * v_rank_multiplier * v_lesson)::integer,
            greatest(100 - v_daily, 0)
        ) end;

        insert into private.jeopardy_pvp_awards (
            match_id, user_id, final_score, base_xp, match_multiplier,
            lesson_multiplier, awarded_xp, correct_count, incorrect_count
        ) values (
            p_match_id, v_user,
            coalesce((v_player ->> 'score')::integer, 0),
            v_base, v_rank_multiplier, v_lesson, v_awarded,
            coalesce((v_player ->> 'correct')::integer, 0),
            coalesce((v_player ->> 'incorrect')::integer, 0)
        ) on conflict (match_id, user_id) do nothing;

        if v_awarded > 0 then
            update public.student_progress
            set total_xp = total_xp + v_awarded,
                daily_xp = case when daily_date = current_date then daily_xp + v_awarded else v_awarded end,
                daily_date = current_date,
                activity_dates = array(
                    select distinct d from unnest(activity_dates || current_date) as dates(d) order by d
                ),
                updated_at = now()
            where user_id = v_user;
        end if;

        select daily_xp, total_xp into v_daily_xp, v_total_xp
        from public.student_progress where user_id = v_user;
        v_results := v_results || jsonb_build_array(jsonb_build_object(
            'slot', v_slot,
            'displayName', v_player ->> 'name',
            'score', coalesce((v_player ->> 'score')::integer, 0),
            'correct', coalesce((v_player ->> 'correct')::integer, 0),
            'incorrect', coalesce((v_player ->> 'incorrect')::integer, 0),
            'baseXp', v_base,
            'matchMultiplier', v_rank_multiplier,
            'lessonMultiplier', v_lesson,
            'awardedXp', v_awarded,
            'totalXp', v_total_xp,
            'dailyXp', v_daily_xp
        ));
    end loop;
    return v_results;
end;
$$;
revoke all on function private.jeopardy_pvp_award_match(uuid, jsonb) from public, anon, authenticated;

create or replace function public.jeopardy_pvp_action(p_user_id uuid, p_action text, p_payload jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
    v_profile public.profiles%rowtype;
    v_other public.profiles%rowtype;
    v_match public.jeopardy_pvp_matches%rowtype;
    v_queue private.jeopardy_pvp_queue%rowtype;
    v_question private.jeopardy_pvp_question_bank%rowtype;
    v_state jsonb;
    v_active jsonb;
    v_answer text;
    v_normalized text;
    v_position integer;
    v_other_player uuid;
    v_slot text;
    v_buzzer_slot text;
    v_done integer;
    v_awards jsonb;
    v_attempt_count integer;
begin
    if p_user_id is null or p_action not in (
        'queue', 'poll', 'ready', 'decline', 'select', 'buzz', 'answer', 'next', 'sync'
    ) then
        raise exception 'Invalid Jeopardy PvP request';
    end if;
    perform pg_advisory_xact_lock(hashtext('jeopardy-pvp-matchmaking'));

    select * into v_profile from public.profiles
    where id = p_user_id and role = 'student' and is_active = true;
    if not found then raise exception 'This account is not eligible for PvP'; end if;

    for v_match in
        select * from public.jeopardy_pvp_matches m
        where m.status = 'ready' and m.updated_at < now() - interval '3 minutes'
        for update
    loop
        update public.jeopardy_pvp_matches set status = 'cancelled',
            public_state = jsonb_set(public_state, '{status}', '"cancelled"'::jsonb),
            updated_at = now()
        where id = v_match.id;
        update private.jeopardy_pvp_queue set status = 'waiting', match_id = null,
            queued_at = now(), updated_at = now()
        where match_id = v_match.id and status = 'matched';
    end loop;
    for v_match in
        select * from public.jeopardy_pvp_matches m
        where m.status = 'in_progress' and m.updated_at < now() - interval '5 minutes'
        for update
    loop
        update public.jeopardy_pvp_matches set status = 'abandoned',
            public_state = jsonb_set(public_state, '{status}', '"abandoned"'::jsonb),
            updated_at = now()
        where id = v_match.id;
        delete from private.jeopardy_pvp_queue
        where user_id in (
            select user_id from private.jeopardy_pvp_match_members where match_id = v_match.id
        );
    end loop;
    delete from private.jeopardy_pvp_queue
    where status = 'waiting' and updated_at < now() - interval '3 minutes';

    if p_action in ('queue', 'poll', 'sync') then
        select * into v_queue from private.jeopardy_pvp_queue where user_id = p_user_id;
        if p_action = 'queue' then
            select * into v_match from public.jeopardy_pvp_matches
            where status in ('ready', 'in_progress')
              and exists (select 1 from private.jeopardy_pvp_match_members mm
                          where mm.match_id = id and mm.user_id = p_user_id)
            order by created_at desc limit 1;
            if found then
                select slot into v_slot from private.jeopardy_pvp_match_members
                where match_id = v_match.id and user_id = p_user_id;
                return jsonb_build_object('queueStatus', 'matched', 'matchId', v_match.id,
                    'status', v_match.status, 'state', v_match.public_state, 'playerSlot', v_slot);
            end if;
            if v_queue.user_id is not null and v_queue.status = 'matched' then
                select * into v_match from public.jeopardy_pvp_matches where id = v_queue.match_id;
                if found and v_match.status = 'ready' then
                    select slot into v_slot from private.jeopardy_pvp_match_members
                    where match_id = v_match.id and user_id = p_user_id;
                    update private.jeopardy_pvp_queue set updated_at = now() where user_id = p_user_id;
                    return jsonb_build_object('queueStatus', 'matched', 'matchId', v_match.id,
                        'status', v_match.status, 'state', v_match.public_state, 'playerSlot', v_slot);
                end if;
            end if;
            insert into private.jeopardy_pvp_queue(user_id, status)
            values (p_user_id, 'waiting')
            on conflict (user_id) do update set
                queued_at = case when private.jeopardy_pvp_queue.status = 'waiting'
                    then private.jeopardy_pvp_queue.queued_at else now() end,
                updated_at = now(),
                status = 'waiting',
                match_id = null;
            select q.* into v_queue from private.jeopardy_pvp_queue q
            where q.status = 'waiting' and q.user_id <> p_user_id
              and not exists (
                  select 1 from public.jeopardy_pvp_matches m
                  where m.status in ('ready', 'in_progress')
                    and exists (select 1 from private.jeopardy_pvp_match_members mm
                                where mm.match_id = m.id and mm.user_id = q.user_id)
              )
            order by q.queued_at for update skip locked limit 1;
            if found then
                select * into v_other from public.profiles
                where id = v_queue.user_id and role = 'student' and is_active = true;
                if found then
                    insert into public.jeopardy_pvp_matches (status, public_state)
                    values (
                        'ready',
                        jsonb_build_object(
                            'status', 'ready',
                            'players', jsonb_build_object(
                                'one', jsonb_build_object('name', v_other.display_name, 'ready', false, 'score', 0, 'correct', 0, 'incorrect', 0, 'base_xp', 0),
                                'two', jsonb_build_object('name', v_profile.display_name, 'ready', false, 'score', 0, 'correct', 0, 'incorrect', 0, 'base_xp', 0)
                            ),
                            'answered_positions', '[]'::jsonb,
                            'active', null,
                            'next_turn', 'one',
                            'unanswered', 0
                        )
                    ) returning * into v_match;
                    insert into private.jeopardy_pvp_match_members(match_id, user_id, slot)
                    values (v_match.id, v_queue.user_id, 'one'), (v_match.id, p_user_id, 'two');
                    insert into private.jeopardy_pvp_match_clues(match_id, position, question_id)
                    select v_match.id, row_number() over (order by p.points, cat.sort_order) - 1, q.question_id
                    from (values
                        ('Atomic Structure', 1), ('Periodic Table', 2), ('Chemical Bonding', 3),
                        ('Chemical Reactions', 4), ('Acids and Bases', 5)
                    ) as cat(category, sort_order)
                    cross join (values (200), (400), (600), (800), (1000)) as p(points)
                    join lateral (
                        select b.* from private.jeopardy_pvp_question_bank b
                        where b.category = cat.category and b.points = p.points
                        order by random() limit 1
                    ) q on true;
                    if (select count(*) from private.jeopardy_pvp_match_clues where match_id = v_match.id) <> 25 then
                        raise exception 'The PvP question board is incomplete';
                    end if;
                    update private.jeopardy_pvp_queue
                    set status = 'matched', match_id = v_match.id, updated_at = now()
                    where user_id in (v_queue.user_id, p_user_id);
                    return jsonb_build_object('queueStatus', 'matched', 'matchId', v_match.id,
                        'status', v_match.status, 'state', v_match.public_state, 'playerSlot',
                        case when p_user_id = v_queue.user_id then 'one' else 'two' end);
                end if;
            end if;
            return jsonb_build_object('queueStatus', 'searching');
        end if;

        if p_action in ('poll', 'sync') and p_payload ? 'matchId' then
            select * into v_match from public.jeopardy_pvp_matches
            where id = (p_payload ->> 'matchId')::uuid
              and exists (select 1 from private.jeopardy_pvp_match_members mm
                          where mm.match_id = id and mm.user_id = p_user_id);
            if found then
                select slot into v_slot from private.jeopardy_pvp_match_members
                where match_id = v_match.id and user_id = p_user_id;
                v_queue.match_id := v_match.id;
                v_queue.status := 'matched';
                v_queue.user_id := p_user_id;
            end if;
        end if;
        if v_queue.user_id is null then
            return jsonb_build_object('queueStatus', 'idle');
        end if;
        update private.jeopardy_pvp_queue set updated_at = now() where user_id = p_user_id;
        if v_queue.status = 'waiting' then
            return jsonb_build_object('queueStatus', 'searching');
        end if;
        select * into v_match from public.jeopardy_pvp_matches where id = v_queue.match_id;
        if not found then return jsonb_build_object('queueStatus', 'idle'); end if;
        if v_match.status in ('cancelled', 'abandoned') then
            select * into v_queue from private.jeopardy_pvp_queue where user_id = p_user_id;
            return jsonb_build_object('queueStatus', case when v_queue.status = 'waiting' then 'searching' else 'idle' end);
        end if;
        select slot into v_slot from private.jeopardy_pvp_match_members
        where match_id = v_match.id and user_id = p_user_id;
        v_state := v_match.public_state;
        if v_match.status = 'in_progress' and v_state ->> 'phase' in ('buzz', 'answer', 'steal')
           and jsonb_typeof(v_state -> 'active') = 'object'
           and (v_state #>> '{active,deadline}')::timestamptz < now() then
            v_active := v_state -> 'active';
            if v_state ->> 'phase' = 'answer' then
                v_buzzer_slot := v_state #>> '{active,buzzed_by}';
                v_state := jsonb_set(v_state, array['players', v_buzzer_slot, 'incorrect'],
                    to_jsonb(coalesce((v_state #>> array['players',v_buzzer_slot,'incorrect'])::integer,0)+1), true);
                v_state := jsonb_set(v_state, array['players', v_buzzer_slot, 'score'],
                    to_jsonb(coalesce((v_state #>> array['players',v_buzzer_slot,'score'])::integer,0) - (v_active ->> 'points')::integer), true);
                v_state := jsonb_set(v_state, '{active,attempts}', '1'::jsonb, true);
                v_state := jsonb_set(v_state, '{active,buzzed_by}', 'null'::jsonb, true);
                v_state := jsonb_set(v_state, '{phase}', '"steal"'::jsonb, true);
                v_state := jsonb_set(v_state, '{active,deadline}', to_jsonb((now() + interval '10 seconds')::text), true);
                v_state := jsonb_set(v_state, '{feedback}', '"Opponent can steal!"'::jsonb, true);
            elsif v_state ->> 'phase' = 'steal' then
                v_position := (v_active ->> 'position')::integer;
                select q.* into v_question
                from private.jeopardy_pvp_match_clues mc
                join private.jeopardy_pvp_question_bank q on q.question_id = mc.question_id
                where mc.match_id = v_match.id and mc.position = v_position;
                v_state := jsonb_set(v_state, '{active,correct_answer}', to_jsonb(v_question.correct_answer), true);
                v_state := jsonb_set(v_state, '{active,revealed}', 'true'::jsonb, true);
                v_state := jsonb_set(v_state, '{phase}', '"result"'::jsonb, true);
                v_state := jsonb_set(v_state, '{unanswered}',
                    to_jsonb(coalesce((v_state ->> 'unanswered')::integer,0)+1), true);
                v_state := jsonb_set(v_state, '{answered_positions}',
                    case when coalesce(v_state -> 'answered_positions','[]'::jsonb) @> to_jsonb(v_position)
                         then coalesce(v_state -> 'answered_positions','[]'::jsonb)
                         else coalesce(v_state -> 'answered_positions','[]'::jsonb) || to_jsonb(v_position) end, true);
            else
                v_position := (v_active ->> 'position')::integer;
                select q.* into v_question
                from private.jeopardy_pvp_match_clues mc
                join private.jeopardy_pvp_question_bank q on q.question_id = mc.question_id
                where mc.match_id = v_match.id and mc.position = v_position;
                v_state := jsonb_set(v_state, '{active,correct_answer}', to_jsonb(v_question.correct_answer), true);
                v_state := jsonb_set(v_state, '{active,revealed}', 'true'::jsonb, true);
                v_state := jsonb_set(v_state, '{phase}', '"result"'::jsonb, true);
                v_state := jsonb_set(v_state, '{unanswered}',
                    to_jsonb(coalesce((v_state ->> 'unanswered')::integer,0)+1), true);
                v_state := jsonb_set(v_state, '{answered_positions}',
                    case when coalesce(v_state -> 'answered_positions','[]'::jsonb) @> to_jsonb(v_position)
                         then coalesce(v_state -> 'answered_positions','[]'::jsonb)
                         else coalesce(v_state -> 'answered_positions','[]'::jsonb) || to_jsonb(v_position) end, true);
            end if;
            update public.jeopardy_pvp_matches set public_state = v_state, updated_at = now()
            where id = v_match.id returning * into v_match;
        end if;
        return jsonb_build_object('queueStatus', 'matched', 'matchId', v_match.id,
            'status', v_match.status, 'state', v_match.public_state,
            'awards', v_match.public_state -> 'awards', 'playerSlot', v_slot);
    end if;

    if p_action = 'decline' then
        select * into v_queue from private.jeopardy_pvp_queue where user_id = p_user_id for update;
        if v_queue.match_id is not null then
            select * into v_match from public.jeopardy_pvp_matches where id = v_queue.match_id for update;
            if found and v_match.status = 'ready' then
                select user_id into v_other_player from private.jeopardy_pvp_match_members
                where match_id = v_match.id and user_id <> p_user_id limit 1;
                update public.jeopardy_pvp_matches set status = 'cancelled',
                    public_state = jsonb_set(public_state, '{status}', '"cancelled"'::jsonb), updated_at = now()
                where id = v_match.id;
                update private.jeopardy_pvp_queue set status = 'waiting', match_id = null,
                    queued_at = now(), updated_at = now() where user_id = v_other_player;
            elsif found and v_match.status = 'in_progress' then
                update public.jeopardy_pvp_matches set status = 'abandoned',
                    public_state = jsonb_set(public_state, '{status}', '"abandoned"'::jsonb), updated_at = now()
                where id = v_match.id;
            end if;
        end if;
        delete from private.jeopardy_pvp_queue where user_id = p_user_id;
        return jsonb_build_object('queueStatus', 'idle');
    end if;

    if not (p_payload ? 'matchId') then raise exception 'Match identifier is required'; end if;
    select * into v_match from public.jeopardy_pvp_matches
    where id = (p_payload ->> 'matchId')::uuid
      and exists (select 1 from private.jeopardy_pvp_match_members mm
                  where mm.match_id = id and mm.user_id = p_user_id)
    for update;
    if not found then raise exception 'This match is no longer available'; end if;
    select slot into v_slot from private.jeopardy_pvp_match_members
    where match_id = v_match.id and user_id = p_user_id;

    v_state := v_match.public_state;
    if p_action = 'ready' then
        if v_match.status <> 'ready' then raise exception 'This match is no longer waiting for readiness'; end if;
        v_state := jsonb_set(v_state, array['players', v_slot, 'ready'], 'true'::jsonb, true);
        if coalesce((v_state #>> '{players,one,ready}')::boolean,false)
           and coalesce((v_state #>> '{players,two,ready}')::boolean,false) then
            v_state := jsonb_set(v_state, '{status}', '"in_progress"'::jsonb, true);
            v_state := jsonb_set(v_state, '{start_at}', to_jsonb((now() + interval '3 seconds')::text), true);
            update public.jeopardy_pvp_matches set status = 'in_progress', started_at = now() + interval '3 seconds',
                public_state = v_state, updated_at = now() where id = v_match.id returning * into v_match;
        else
            update public.jeopardy_pvp_matches set public_state = v_state, updated_at = now()
            where id = v_match.id returning * into v_match;
        end if;
        return jsonb_build_object('queueStatus', 'matched', 'matchId', v_match.id,
            'status', v_match.status, 'state', v_match.public_state, 'playerSlot', v_slot);
    end if;

    if p_action = 'select' then
        if v_match.status <> 'in_progress' or v_match.started_at > now() then raise exception 'The game has not started yet'; end if;
        if v_state -> 'active' is not null and v_state -> 'active' <> 'null'::jsonb then raise exception 'Finish the current clue first'; end if;
        if v_state ->> 'next_turn' is not null and v_state ->> 'next_turn' <> v_slot then
            raise exception 'It is not your turn to choose a clue';
        end if;
        v_position := (p_payload ->> 'position')::integer;
        select q.* into v_question
        from private.jeopardy_pvp_match_clues mc
        join private.jeopardy_pvp_question_bank q on q.question_id = mc.question_id
        where mc.match_id = v_match.id and mc.position = v_position;
        if not found then raise exception 'That clue is not on this board'; end if;
        if coalesce(v_state -> 'answered_positions','[]'::jsonb) @> to_jsonb(array[v_position]) then raise exception 'That clue has already been completed'; end if;
        v_active := jsonb_build_object(
            'position', v_position, 'category', v_question.category, 'points', v_question.points,
            'clue', v_question.clue, 'deadline', (now() + interval '30 seconds')::text,
            'attempts', 0, 'buzzed_by', null, 'first_buzzer', null, 'revealed', false,
            'selected_by', v_slot
        );
        v_state := jsonb_set(v_state, '{active}', v_active, true);
        v_state := jsonb_set(v_state, '{phase}', '"buzz"'::jsonb, true);
        v_state := v_state - 'feedback';
        update public.jeopardy_pvp_matches set public_state = v_state, updated_at = now()
        where id = v_match.id returning * into v_match;
    elsif p_action = 'buzz' then
        if v_match.status <> 'in_progress' or v_state -> 'active' is null or v_state -> 'active' = 'null'::jsonb then raise exception 'There is no active clue'; end if;
        if v_state ->> 'phase' not in ('buzz', 'steal') then raise exception 'The buzzer is closed'; end if;
        if (v_state #>> '{active,deadline}')::timestamptz <= now() then raise exception 'The buzzer time has expired'; end if;
        select user_id into v_other_player from private.jeopardy_pvp_match_members
        where match_id = v_match.id and slot <> v_slot;
        if v_state ->> 'phase' = 'steal'
           and v_state #>> '{active,first_buzzer}' = v_slot then
            raise exception 'The other player has the steal opportunity';
        end if;
        if v_state ->> 'phase' = 'buzz' then
            v_state := jsonb_set(v_state, '{active,first_buzzer}', to_jsonb(v_slot), true);
        end if;
        v_state := jsonb_set(v_state, '{phase}', '"answer"'::jsonb, true);
        v_state := jsonb_set(v_state, '{active,buzzed_by}', to_jsonb(v_slot), true);
        v_state := jsonb_set(v_state, '{active,deadline}', to_jsonb((now() + interval '10 seconds')::text), true);
        update public.jeopardy_pvp_matches set public_state = v_state, updated_at = now()
        where id = v_match.id returning * into v_match;
    elsif p_action = 'answer' then
        if v_match.status <> 'in_progress' or v_state ->> 'phase' <> 'answer'
           or v_state #>> '{active,buzzed_by}' <> v_slot
           or (v_state #>> '{active,deadline}')::timestamptz <= now() then
            raise exception 'You do not have the active answer turn';
        end if;
        if coalesce(jsonb_typeof(p_payload -> 'answer'), '') <> 'string'
           or coalesce(length(btrim(p_payload ->> 'answer')), 0) not between 1 and 120 then
            raise exception 'Enter a valid answer';
        end if;
        v_position := (v_state #>> '{active,position}')::integer;
        select q.* into v_question from private.jeopardy_pvp_match_clues mc
        join private.jeopardy_pvp_question_bank q on q.question_id = mc.question_id
        where mc.match_id = v_match.id and mc.position = v_position;
        v_answer := lower(regexp_replace(btrim(p_payload ->> 'answer'), '[^[:alnum:]]', '', 'g'));
        if exists (
            select 1 from unnest(v_question.accepted_answers) accepted(answer)
            where lower(regexp_replace(btrim(accepted.answer), '[^[:alnum:]]', '', 'g')) = v_answer
        ) then
            v_state := jsonb_set(v_state, array['players',v_slot,'correct'],
                to_jsonb(coalesce((v_state #>> array['players',v_slot,'correct'])::integer,0)+1), true);
            v_state := jsonb_set(v_state, array['players',v_slot,'score'],
                to_jsonb(coalesce((v_state #>> array['players',v_slot,'score'])::integer,0)+(v_state #>> '{active,points}')::integer), true);
            v_state := jsonb_set(v_state, array['players',v_slot,'base_xp'],
                to_jsonb(coalesce((v_state #>> array['players',v_slot,'base_xp'])::integer,0)
                    + 4 + (v_state #>> '{active,points}')::integer / 400), true);
            v_state := jsonb_set(v_state, '{active,correct_answer}', to_jsonb(v_question.correct_answer), true);
            v_state := jsonb_set(v_state, '{active,revealed}', 'true'::jsonb, true);
            v_state := jsonb_set(v_state, '{active,was_correct}', 'true'::jsonb, true);
            v_state := jsonb_set(v_state, '{phase}', '"result"'::jsonb, true);
            v_state := jsonb_set(v_state, '{answered_positions}',
                case when coalesce(v_state -> 'answered_positions','[]'::jsonb) @> to_jsonb(v_position)
                     then coalesce(v_state -> 'answered_positions','[]'::jsonb)
                     else coalesce(v_state -> 'answered_positions','[]'::jsonb) || to_jsonb(v_position) end, true);
        else
            v_state := jsonb_set(v_state, array['players',v_slot,'incorrect'],
                to_jsonb(coalesce((v_state #>> array['players',v_slot,'incorrect'])::integer,0)+1), true);
            v_state := jsonb_set(v_state, array['players',v_slot,'score'],
                to_jsonb(coalesce((v_state #>> array['players',v_slot,'score'])::integer,0)-(v_state #>> '{active,points}')::integer), true);
            v_attempt_count := coalesce((v_state #>> '{active,attempts}')::integer,0);
            if v_attempt_count = 0 then
                v_state := jsonb_set(v_state, '{active,attempts}', '1'::jsonb, true);
                v_state := jsonb_set(v_state, '{active,first_buzzer}', to_jsonb(v_slot), true);
                v_state := jsonb_set(v_state, '{active,buzzed_by}', 'null'::jsonb, true);
                v_state := jsonb_set(v_state, '{active,deadline}', to_jsonb((now() + interval '10 seconds')::text), true);
                v_state := jsonb_set(v_state, '{phase}', '"steal"'::jsonb, true);
                v_state := jsonb_set(v_state, '{feedback}', to_jsonb(v_profile.display_name || ' missed. Opponent can steal.'), true);
            else
                v_state := jsonb_set(v_state, '{active,correct_answer}', to_jsonb(v_question.correct_answer), true);
                v_state := jsonb_set(v_state, '{active,revealed}', 'true'::jsonb, true);
                v_state := jsonb_set(v_state, '{active,was_correct}', 'false'::jsonb, true);
                v_state := jsonb_set(v_state, '{phase}', '"result"'::jsonb, true);
                v_state := jsonb_set(v_state, '{answered_positions}',
                    case when coalesce(v_state -> 'answered_positions','[]'::jsonb) @> to_jsonb(v_position)
                         then coalesce(v_state -> 'answered_positions','[]'::jsonb)
                         else coalesce(v_state -> 'answered_positions','[]'::jsonb) || to_jsonb(v_position) end, true);
            end if;
        end if;
        update public.jeopardy_pvp_matches set public_state = v_state, updated_at = now()
        where id = v_match.id returning * into v_match;
    elsif p_action = 'next' then
        if v_match.status <> 'in_progress' or v_state ->> 'phase' <> 'result' then raise exception 'Resolve the current clue first'; end if;
        v_state := jsonb_set(v_state, '{active}', 'null'::jsonb, true);
        v_state := jsonb_set(v_state, '{next_turn}', to_jsonb(
            case
                when v_state #>> '{active,was_correct}' = 'true' and v_state #>> '{active,buzzed_by}' in ('one', 'two')
                    then v_state #>> '{active,buzzed_by}'
                when v_state #>> '{active,selected_by}' = 'one'
                    then 'two'
                when v_state #>> '{active,selected_by}' = 'two'
                    then 'one'
                else case when v_slot = 'one' then 'two' else 'one' end
            end
        ), true);
        v_state := v_state - 'phase' - 'feedback';
        select count(*) into v_done
        from (select distinct value from jsonb_array_elements_text(coalesce(v_state -> 'answered_positions','[]'::jsonb))) completed;
        if v_done >= 25 then
            v_awards := private.jeopardy_pvp_award_match(v_match.id, v_state);
            v_state := jsonb_set(v_state, '{status}', '"finished"'::jsonb, true);
            v_state := jsonb_set(v_state, '{awards}', v_awards, true);
            update public.jeopardy_pvp_matches set status = 'finished', finished_at = now(),
                public_state = v_state, updated_at = now() where id = v_match.id returning * into v_match;
            delete from private.jeopardy_pvp_queue where user_id in (
                select user_id from private.jeopardy_pvp_match_members where match_id = v_match.id
            );
        else
            update public.jeopardy_pvp_matches set public_state = v_state, updated_at = now()
            where id = v_match.id returning * into v_match;
        end if;
    end if;

    return jsonb_build_object('queueStatus', 'matched', 'matchId', v_match.id,
        'status', v_match.status, 'state', v_match.public_state,
        'awards', v_match.public_state -> 'awards', 'playerSlot', v_slot);
end;
$$;

revoke all on function public.jeopardy_pvp_action(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.jeopardy_pvp_action(uuid, text, jsonb) to service_role;
