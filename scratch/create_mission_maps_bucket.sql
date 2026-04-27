-- Script para crear el bucket de Storage para Mapas Tácticos
-- Ejecutar en el SQL Editor de Supabase

-- 1. Insertar el bucket 'mission_maps' (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('mission_maps', 'mission_maps', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Crear política para que todo el mundo pueda ver las imágenes (SELECT)
CREATE POLICY "Mapas Tácticos Visibles Para Todos"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'mission_maps' );

-- 3. Crear política para permitir la subida (INSERT)
CREATE POLICY "Permitir Subida de Mapas Tácticos"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'mission_maps' );

-- 4. Crear política para permitir actualizaciones (UPDATE)
CREATE POLICY "Permitir Actualizacion de Mapas Tácticos"
ON storage.objects FOR UPDATE
TO public
WITH CHECK ( bucket_id = 'mission_maps' );
