-- Añadir columna payment_method a attendance_logs
-- Valores: 'efectivo' (cartera) o 'banco' (transferencia)
ALTER TABLE public.attendance_logs 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'efectivo';
