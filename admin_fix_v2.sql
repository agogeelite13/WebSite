-- ==============================================================================
-- AGOGE ELITE - SETUP COMPLETO DE BASE DE DATOS (V4)
-- Instrucciones:
--   1. Supabase Dashboard → SQL Editor → New query
--   2. Pega este archivo completo y pulsa RUN
-- ==============================================================================

-- ── 1. CREAR TABLAS QUE FALTAN (IF NOT EXISTS = no rompe nada si ya existen) ──

create table if not exists public.missions (
    id         uuid    default gen_random_uuid() primary key,
    created_at timestamptz default now(),
    sun_key    text    not null unique,
    situation  text,
    mission    text,
    gear_rules text,
    map_url    text,
    game_mode  text    default 'tdm'
);

create table if not exists public.enrollments (
    id          uuid    default gen_random_uuid() primary key,
    created_at  timestamptz default now(),
    sun_key     text    not null,
    user_id     uuid,
    user_email  text,
    gear        text    default 'own',
    is_guest    boolean default false,
    guest_name  text,
    attended    boolean default false
);

create table if not exists public.users (
    id              uuid    primary key,
    created_at      timestamptz default now(),
    email           text,
    name            text,
    callsign        text,
    specialty       text    default 'assault',
    faction         text    default 'none',
    clan            text,
    exp             integer default 0,
    rank            text,
    role            text    default 'user',
    is_admin        boolean default false,
    gear            text    default 'own',
    "missionHistory" jsonb  default '[]'::jsonb,
    medals          jsonb   default '[]'::jsonb
);

create table if not exists public.clans (
    id           uuid    default gen_random_uuid() primary key,
    created_at   timestamptz default now(),
    name         text    not null unique,
    leader_id    uuid,
    leader_email text
);

create table if not exists public.votes (
    id         uuid    default gen_random_uuid() primary key,
    created_at timestamptz default now(),
    sun_key    text    not null,
    user_id    uuid,
    user_email text,
    mode       text,
    unique(sun_key, user_email)
);

create table if not exists public.community_photos (
    id         uuid    default gen_random_uuid() primary key,
    created_at timestamptz default now(),
    user_id    text    not null,
    image_url  text    not null,
    caption    text,
    status     text    default 'pending'
);

-- ── 2. HABILITAR RLS EN TODAS LAS TABLAS ──────────────────────────────────────
alter table public.users            enable row level security;
alter table public.enrollments      enable row level security;
alter table public.missions         enable row level security;
alter table public.community_photos enable row level security;
alter table public.clans            enable row level security;
alter table public.votes            enable row level security;

-- ── 3. BORRAR POLÍTICAS PREVIAS (evita conflictos de nombre) ─────────────────
do $$
declare r record;
begin
    for r in
        select policyname, tablename
        from pg_policies
        where schemaname = 'public'
          and tablename in ('users','enrollments','missions','community_photos','clans','votes')
    loop
        execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
    end loop;
end $$;

-- ── 4. CREAR POLÍTICAS ABIERTAS (admin + usuarios pueden leer y escribir) ─────
-- USERS
create policy "users_select" on public.users for select using (true);
create policy "users_insert" on public.users for insert with check (true);
create policy "users_update" on public.users for update using (true) with check (true);
create policy "users_delete" on public.users for delete using (true);

-- ENROLLMENTS
create policy "enroll_select" on public.enrollments for select using (true);
create policy "enroll_insert" on public.enrollments for insert with check (true);
create policy "enroll_update" on public.enrollments for update using (true) with check (true);
create policy "enroll_delete" on public.enrollments for delete using (true);

-- MISSIONS
create policy "missions_select" on public.missions for select using (true);
create policy "missions_insert" on public.missions for insert with check (true);
create policy "missions_update" on public.missions for update using (true) with check (true);
create policy "missions_delete" on public.missions for delete using (true);

-- COMMUNITY PHOTOS
create policy "photos_select" on public.community_photos for select using (true);
create policy "photos_insert" on public.community_photos for insert with check (true);
create policy "photos_update" on public.community_photos for update using (true) with check (true);
create policy "photos_delete" on public.community_photos for delete using (true);

-- CLANS
create policy "clans_select" on public.clans for select using (true);
create policy "clans_insert" on public.clans for insert with check (true);
create policy "clans_update" on public.clans for update using (true) with check (true);
create policy "clans_delete" on public.clans for delete using (true);

-- VOTES
create policy "votes_select" on public.votes for select using (true);
create policy "votes_insert" on public.votes for insert with check (true);
create policy "votes_update" on public.votes for update using (true) with check (true);
create policy "votes_delete" on public.votes for delete using (true);

-- ── 5. MARCAR CUENTA ADMIN ────────────────────────────────────────────────────
update public.users
set is_admin = true, role = 'admin'
where is_admin = true or role = 'admin';

-- Si quieres forzar por email (descomenta y pon TU email):
-- update public.users set is_admin = true, role = 'admin' where email = 'TU_EMAIL_AQUI';

-- ── VERIFICACIÓN FINAL ────────────────────────────────────────────────────────
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
-- Si ves filas = permisos activos ✔
-- ==============================================================================
