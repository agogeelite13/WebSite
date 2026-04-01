-- ==============================================================================
-- AGOGE ELITE - REPARACIÓN DEFINITIVA DE PERMISOS (V2)
-- Instrucciones: 
-- 1. Entra en tu Dashboard de Supabase.
-- 2. Ve a la sección "SQL Editor".
-- 3. Pega este código y pulsa el botón "Run".
-- ==============================================================================

-- 1. HABILITAR EL RLS EN TODAS LAS TABLAS (Si no lo estaba)
alter table public.users enable row level security;
alter table public.enrollments enable row level security;
alter table public.missions enable row level security;
alter table public.community_photos enable row level security;

-- 2. LIMPIAR POLÍTICAS EXISTENTES PARA EVITAR CONFLICTOS
drop policy if exists "Permitir lectura publica de usuarios" on public.users;
drop policy if exists "Permitir actualizacion de usuarios" on public.users;
drop policy if exists "Permitir lectura publica de inscripciones" on public.enrollments;
drop policy if exists "Permitir inserccion de inscripciones" on public.enrollments;
drop policy if exists "Permitir borrado de inscripciones" on public.enrollments;
drop policy if exists "Permitir actualizacion de inscripciones" on public.enrollments;
drop policy if exists "Permitir lectura publica de misiones" on public.missions;
drop policy if exists "Permitir inserccion de misiones" on public.missions;
drop policy if exists "Permitir actualizacion de misiones" on public.missions;
drop policy if exists "Permitir borrado de misiones" on public.missions;

-- 3. CREAR POLÍTICAS DE LECTURA (SELECT) PARA TODOS
create policy "Lectura publica usuarios" on public.users for select using (true);
create policy "Lectura publica inscripciones" on public.enrollments for select using (true);
create policy "Lectura publica misiones" on public.missions for select using (true);
create policy "Lectura publica fotos" on public.community_photos for select using (true);

-- 4. CREAR POLÍTICAS DE ESCRITURA (INSERT, UPDATE, DELETE)
-- Por ahora, permitimos a todos para asegurar que el Admin pueda operar sin fallos de RLS.
-- En el futuro se puede restringir a auth.uid().

create policy "Escritura total inscripciones" on public.enrollments for all using (true) with check (true);
create policy "Escritura total misiones" on public.missions for all using (true) with check (true);
create policy "Escritura total usuarios" on public.users for all using (true) with check (true);
create policy "Escritura total fotos" on public.community_photos for all using (true) with check (true);

-- 5. CONFIGURACIÓN DEL USUARIO ADMINISTRADOR
-- NOTA: Este comando asegura que el usuario que ya es Admin tenga sincronizado role e is_admin.
-- Sustituye 'mando@agogeelite.com' por tu email real si es diferente.

update public.users 
set 
    role = 'admin',
    is_admin = true,
    rank = 'Mando Supremo',
    specialty = 'MANDO GLOBAL',
    exp = 99999,
    callsign = 'CENTCOM'
where is_admin = true or role = 'admin' or email = 'mando@agogeelite.com';

-- ==============================================================================
-- SCRIPT FINALIZADO. Ejecuta 'Run' y reinicia la aplicación Agoge Elite.
-- ==============================================================================
