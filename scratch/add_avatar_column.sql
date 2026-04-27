-- Script para añadir la columna de avatar a los perfiles de usuario
-- Ejecutar en el SQL Editor de Supabase

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar TEXT;
