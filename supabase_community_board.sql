-- ==============================================================================
-- AGOGE ELITE - FASE 37: TABLÓN COMUNITARIO Y STORAGE BUCKET
-- Instrucciones: Pega todo este código en el SQL Editor de Supabase y dale a RUN.
-- ==============================================================================

-- 1. Crear el cubo de almacenamiento (Bucket) llamado 'community_photos'
-- Esto permite el guardado de archivos (imágenes/fotos)
insert into storage.buckets (id, name, public)
values ('community_photos', 'community_photos', true)
on conflict (id) do update set public = true;

-- 2. Crear Política para permitir que cualquier usuario suba archivos (INSERT)
create policy "Cualquier usuario puede subir fotos" 
on storage.objects for insert 
with check ( bucket_id = 'community_photos' );

-- 3. Crear Política para permitir que cualquier usuario lea archivos (SELECT)
create policy "Cualquier usuario puede ver fotos" 
on storage.objects for select 
using ( bucket_id = 'community_photos' );

-- 4. Crear la tabla principal de fotos de la comunidad en la base de datos
create table if not exists public.community_photos (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id text not null,        -- El ID/callsign del operador
    image_url text not null,      -- La URL devuelta por Storage
    caption text,                 -- El comentario/título de la foto
    status text default 'pending' -- Estado: 'pending', 'approved', 'rejected'
);

-- 5. Configurar RLS (Seguridad de Nivel de Fila) para la tabla public.community_photos
alter table public.community_photos enable row level security;

-- 6. Política: Cualquiera puede Leer las fotos
create policy "Permitir lectura publica de registros de fotos"
on public.community_photos for select
using ( true );

-- 7. Política: Cualquiera puede Insertar fotos
create policy "Permitir inserccion de registros de fotos"
on public.community_photos for insert
with check ( true );

-- 8. Política: Cualquiera puede Actualizar/Borrar fotos (Para el Administrador)
create policy "Permitir actualizacion y borrado a todos"
on public.community_photos for update
using ( true );

create policy "Permitir borrado a todos"
on public.community_photos for delete
using ( true );

-- ==============================================================================
-- FIN DEL SCRIPT.
-- Si dice "Success", puedes cerrar Supabase y volver al operador.
