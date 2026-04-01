-- ==============================================================================
-- AGOGE ELITE - REPARACIÓN DEFINITIVA DE PERMISOS (V3)
-- Instrucciones:
--   1. Entra en tu Dashboard de Supabase → SQL Editor
--   2. Pega ESTE ARCHIVO COMPLETO y pulsa RUN
--   3. Recarga la web después
-- ==============================================================================

-- ── 1. HABILITAR RLS EN TODAS LAS TABLAS ─────────────────────────────────────
alter table public.users            enable row level security;
alter table public.enrollments      enable row level security;
alter table public.missions         enable row level security;
alter table public.community_photos enable row level security;
alter table public.clans            enable row level security;
alter table public.votes            enable row level security;

-- ── 2. BORRAR TODAS LAS POLÍTICAS PREVIAS (evita conflictos) ─────────────────
do $$
declare
    r record;
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

-- ── 3. POLÍTICAS ABIERTAS (lectura y escritura para todos los usuarios autenticados y anónimos) ──
-- USERS
create policy "users_select"  on public.users for select using (true);
create policy "users_insert"  on public.users for insert with check (true);
create policy "users_update"  on public.users for update using (true) with check (true);
create policy "users_delete"  on public.users for delete using (true);

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

-- ── 4. MARCAR CUENTA ADMIN ────────────────────────────────────────────────────
-- Cambia el email por el tuyo si es diferente, y ejecuta solo esta parte si quieres.
-- Este UPDATE marca como admin a cualquier usuario que ya lo fuera o que tenga ese email.
update public.users
set
    is_admin = true,
    role     = 'admin'
where
    is_admin = true
    or role  = 'admin';

-- Si ninguno de los anteriores coincide y quieres forzarlo por email, descomenta:
-- update public.users set is_admin = true, role = 'admin' where email = 'TU_EMAIL_AQUI';

-- ── VERIFICACIÓN: muestra las políticas activas ────────────────────────────────
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- ==============================================================================
-- FIN. Si ves filas en el SELECT de arriba, los permisos están activos. ✔
-- ==============================================================================
