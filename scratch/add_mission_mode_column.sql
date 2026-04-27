-- Script para añadir la columna 'mode' a la tabla de misiones
-- Ejecutar en el SQL Editor de Supabase

ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'tdm';
