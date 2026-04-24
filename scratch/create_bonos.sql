-- Tabla para almacenar los Bonos Activos
CREATE TABLE public.group_bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_name TEXT NOT NULL,
    total_sessions INTEGER NOT NULL DEFAULT 4,
    sessions_used INTEGER NOT NULL DEFAULT 0,
    price_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    price_per_session NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS para lectura y escritura abierta temporal
ALTER TABLE public.group_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for all users" ON public.group_bonuses
    FOR ALL
    USING (true)
    WITH CHECK (true);
