alter table public.profiles
    drop constraint if exists profiles_avatar_path_valid;

alter table public.profiles
    add constraint profiles_avatar_path_valid check (
        avatar_path is null
        or avatar_path = any(array[
            'preset:blue', 'preset:green', 'preset:orange',
            'preset:pink', 'preset:purple', 'preset:red'
        ]::text[])
        or avatar_path = 'avatars/' || id::text || '/avatar.jpg'
        or avatar_path ~ ('^avatars/' || id::text || '/[0-9a-f-]{36}[.]jpg$')
    );
