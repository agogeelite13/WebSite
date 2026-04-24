-- Script para crear la tabla de amistades (Friendships)
-- Ejecutar en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending' o 'accepted'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, friend_id) -- Evita duplicados
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view their own friendships" 
ON public.friendships FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create their own friend requests" 
ON public.friendships FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their received requests" 
ON public.friendships FOR UPDATE 
USING (auth.uid() = friend_id);

CREATE POLICY "Users can delete their own friendships" 
ON public.friendships FOR DELETE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);
