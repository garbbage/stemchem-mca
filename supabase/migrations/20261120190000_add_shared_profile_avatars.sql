insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('student-avatars', 'student-avatars', false, 2097152, array['image/jpeg'])
on conflict (id) do update set
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

alter table public.profiles
    add column if not exists avatar_path text;

do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conrelid = 'public.profiles'::regclass
          and conname = 'profiles_avatar_path_valid'
    ) then
        alter table public.profiles
            add constraint profiles_avatar_path_valid check (
                avatar_path is null
                or avatar_path = any(array[
                    'preset:blue', 'preset:green', 'preset:orange',
                    'preset:pink', 'preset:purple', 'preset:red'
                ]::text[])
                or avatar_path ~ ('^avatars/' || id::text || '/[0-9a-f-]{36}[.]jpg$')
            );
    end if;
end;
$$;

alter table public.leaderboard_scores
    add column if not exists avatar_path text;

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
    v_avatar_path text;
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
        v_avatar_path := new.avatar_path;
        select total_xp into v_xp from public.student_progress where user_id = v_user_id;
    else
        v_user_id := new.user_id;
        select display_name, role, is_active, avatar_path
        into v_name, v_role, v_active, v_avatar_path
        from public.profiles where id = v_user_id;
        v_xp := new.total_xp;
    end if;

    if v_role = 'student' and v_active then
        insert into public.leaderboard_scores (user_id, display_name, total_xp, avatar_path)
        values (v_user_id, v_name, coalesce(v_xp, 0), v_avatar_path)
        on conflict (user_id) do update
        set display_name = excluded.display_name,
            total_xp = excluded.total_xp,
            avatar_path = excluded.avatar_path;
    else
        delete from public.leaderboard_scores where user_id = v_user_id;
    end if;
    if tg_op = 'DELETE' then
        return old;
    end if;
    return new;
end;
$$;

update public.leaderboard_scores as leaderboard
set avatar_path = profile.avatar_path
from public.profiles as profile
where profile.id = leaderboard.user_id
  and leaderboard.avatar_path is distinct from profile.avatar_path;

revoke update (display_name) on public.profiles from authenticated;
grant update (display_name, avatar_path) on public.profiles to authenticated;

drop policy if exists student_avatars_read_active_students on storage.objects;
create policy student_avatars_read_active_students on storage.objects
for select to authenticated
using (
    bucket_id = 'student-avatars'
    and private.is_active_student()
);

drop policy if exists student_avatars_insert_own on storage.objects;
create policy student_avatars_insert_own on storage.objects
for insert to authenticated
with check (
    bucket_id = 'student-avatars'
    and owner_id = (select auth.uid()::text)
    and name ~ ('^avatars/' || (select auth.uid()::text) || '/[0-9a-f-]{36}[.]jpg$')
    and private.is_active_student()
);

drop policy if exists student_avatars_update_own on storage.objects;
create policy student_avatars_update_own on storage.objects
for update to authenticated
using (
    bucket_id = 'student-avatars'
    and owner_id = (select auth.uid()::text)
    and name ~ ('^avatars/' || (select auth.uid()::text) || '/[0-9a-f-]{36}[.]jpg$')
    and private.is_active_student()
)
with check (
    bucket_id = 'student-avatars'
    and owner_id = (select auth.uid()::text)
    and name ~ ('^avatars/' || (select auth.uid()::text) || '/[0-9a-f-]{36}[.]jpg$')
    and private.is_active_student()
);

drop policy if exists student_avatars_delete_own on storage.objects;
create policy student_avatars_delete_own on storage.objects
for delete to authenticated
using (
    bucket_id = 'student-avatars'
    and owner_id = (select auth.uid()::text)
    and name ~ ('^avatars/' || (select auth.uid()::text) || '/[0-9a-f-]{36}[.]jpg$')
    and private.is_active_student()
);
