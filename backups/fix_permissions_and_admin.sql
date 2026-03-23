-- ==============================================================================
-- AGOGE ELITE - REPARACIÓN DE PERMISOS Y PERFIL DE MANDO SUPREMO
-- Instrucciones: Pega esto en el SQL Editor de Supabase y dale a RUN.
-- ==============================================================================

-- 1. REPARAR PERMISOS DE MISIONES (Para que el Admin pueda publicar)
-- Borramos políticas anteriores para evitar conflictos
drop policy if exists "Permitir insercion de misiones a todos" on public.missions;
drop policy if exists "Permitir actualizacion de misiones a todos" on public.missions;

-- Creamos políticas abiertas (o podrías restringirlas por rol si lo prefieres, pero esto asegura funcionamiento inmediato)
create policy "Permitir inserccion de misiones" on public.missions for insert with check (true);
create policy "Permitir actualizacion de misiones" on public.missions for update using (true);
create policy "Permitir borrado de misiones" on public.missions for delete using (true);

-- 2. REPARAR PERMISOS DE INSCRIPCIONES (Confirmación de Asistencia)
drop policy if exists "Permitir actualizacion de inscripciones" on public.enrollments;
create policy "Permitir actualizacion de inscripciones" on public.enrollments for update using (true);
create policy "Permitir borrado de inscripciones" on public.enrollments for delete using (true);

-- 3. REPARAR PERMISOS DE USUARIOS (Para actualizar Experiencia y Rango)
drop policy if exists "Permitir actualizacion de usuarios" on public.users;
create policy "Permitir actualizacion de usuarios" on public.users for update using (true);

-- 4. CONFIGURACIÓN DE PERFIL "MANDO SUPREMO" (ADMIN)
-- Buscamos al usuario admin (el que tiene el rol 'admin') y le otorgamos todo.
update public.users 
set 
    role = 'admin',
    rank = 'Comandante Supremo',
    specialty = 'MANDO GLOBAL',
    exp = 99999,
    callsign = 'MANDO CENTRAL',
    -- Medallas (ejemplo de estructura si usas un array o string)
    medals = '["🎖️ Veterano", "🔥 Primera Sangre", "🛡️ Defensor de Agoge", "🎯 Tirador de Élite", "🦅 Liderazgo Supremo", "💀 Operaciones Especiales"]'
where role = 'admin';

-- ==============================================================================
-- SQL TERMINADO. 
-- Ejecuta esto y los errores de "Permiso" deberían desaparecer.
-- ==============================================================================
