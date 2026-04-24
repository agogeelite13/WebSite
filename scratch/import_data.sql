-- =============================================================
-- IMPORTACIÓN DE DATOS HISTÓRICOS DE ASISTENCIA
-- Fuente: Google Sheets de inscripciones
-- =============================================================

INSERT INTO attendance_logs (date, type, name, players, total_price, price_per_pax) VALUES

-- ===== OCTUBRE 2025 =====
('2025-10-25', 'grupo', 'Sesión 10:00-13:30 (J1, J2, J3, J4)', 4, 60.00, 15.00),
('2025-10-26', 'grupo', 'Sesión 9:00-13:30 (Lego, Explinter, Remora, Blackor, Berci, Athal, Panda)', 7, 105.00, 15.00),
('2025-10-27', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 1/4]', 5, 50.00, 10.00),
('2025-10-31', 'grupo', 'Sesión BONO 17:00-21:30 (J1-J4) [BONO]', 4, 0.00, 0.00),

-- ===== NOVIEMBRE 2025 =====
('2025-11-02', 'grupo', 'Sesión 9:00-13:30 (Pablo, Less, Cuco, Rubo, Adrián, Enano, Erik, Salo, Juan, Matey, Nallo)', 11, 85.00, 7.73),
('2025-11-06', 'grupo', 'Sesión 17:45-20:45 (Chino, Pablo+3, Adri)', 6, 30.00, 5.00),
('2025-11-20', 'grupo', 'Sesión 17:45-20:45 (Pablo, Pablo1, Adri, J1, J2, J3)', 6, 75.00, 12.50),
('2025-11-23', 'grupo', 'Sesión 9:30-13:00 (Athal, Bercy, Pablo, Nano, Rodrigo, Hugo)', 6, 90.00, 15.00),
('2025-11-30', 'grupo', 'Sesión 9:30-13:30 (Javier+alquiler, Alex, Franciscus, Drazziel, Samuel, Pablo, Enano, Alex, Alex)', 9, 145.00, 16.11),

-- ===== DICIEMBRE 2025 =====
('2025-12-04', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J3) [BONO 2/4]', 3, 50.00, 16.67),
('2025-12-12', 'grupo', 'Sesión 17:30-20:30 (J1-J7 BONO + J8 pago)', 8, 65.00, 8.13),
('2025-12-19', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J4) [BONO 4/4]', 4, 50.00, 12.50),
('2025-12-26', 'grupo', 'Sesión 17:30-20:30 (J1-J4)', 4, 60.00, 15.00),

-- ===== ENERO 2026 =====
('2026-01-09', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 1/4]', 5, 47.50, 9.50),
('2026-01-23', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 2/4]', 5, 47.50, 9.50),
('2026-01-30', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 3/4]', 5, 47.50, 9.50),

-- ===== FEBRERO 2026 =====
('2026-02-06', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 4/4]', 5, 47.50, 9.50),
('2026-02-13', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 1/4]', 5, 31.25, 6.25),
('2026-02-20', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 2/4]', 5, 31.25, 6.25),
('2026-02-24', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 3/4]', 5, 31.25, 6.25),

-- ===== MARZO 2026 =====
('2026-03-06', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 4/4]', 5, 31.25, 6.25),
('2026-03-13', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 1/4]', 5, 37.50, 7.50),
('2026-03-17', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 2/4]', 5, 37.50, 7.50),
('2026-03-27', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 3/4]', 5, 37.50, 7.50),
('2026-03-31', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 4/4]', 5, 37.50, 7.50),

-- ===== ABRIL 2026 =====
('2026-04-02', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 1/4]', 5, 56.25, 11.25),
('2026-04-07', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 2/4]', 5, 56.25, 11.25),
('2026-04-17', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 3/4]', 5, 56.25, 11.25),
('2026-04-24', 'grupo', 'Sesión BONO 17:30-20:30 (J1-J5) [BONO 4/4]', 5, 56.25, 11.25);
