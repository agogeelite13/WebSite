-- Script para permitir la búsqueda de otros usuarios
-- Ejecutar en el SQL Editor de Supabase

-- 1. Asegurarse de que RLS está activo (normalmente ya lo está)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Crear una política que permita a CUALQUIER usuario autenticado 
-- ver la información básica de otros para poder buscarlos.
-- (id, callsign, name, specialty, faction, exp, avatar_url)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.users FOR SELECT 
USING (true); 

-- NOTA: Si ya existe una política de SELECT para 'users', 
-- puede que necesites borrarla o modificarla si es muy restrictiva.
-- Por ejemplo: DROP POLICY IF EXISTS "Users can only view their own profile" ON public.users;
