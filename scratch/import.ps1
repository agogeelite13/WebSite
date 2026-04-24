$supabaseUrl = "https://vekyfzeiijhgjazwkdlk.supabase.co"
$adminKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3lmemVpaWpoZ2phendrZGxrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjUwODEwNCwiZXhwIjoyMDg4MDg0MTA0fQ.VQpeQjKc9NLT8n9zxqN_u2PZzAgU9jz6-85xIYMQ2dU"

$headers = @{
    "apikey" = $adminKey
    "Authorization" = "Bearer $adminKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=minimal"
}

$data = @"
[
  {"date": "2025-10-25", "type": "grupo", "name": "Sesión 10:00-13:30 (J1, J2, J3, J4)", "players": 4, "total_price": 60.00, "price_per_pax": 15.00},
  {"date": "2025-10-26", "type": "grupo", "name": "Sesión 9:00-13:30 (Lego, Explinter, Remora, Blackor, Berci, Athal, Panda)", "players": 7, "total_price": 105.00, "price_per_pax": 15.00},
  {"date": "2025-10-27", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 1/4]", "players": 5, "total_price": 50.00, "price_per_pax": 10.00},
  {"date": "2025-10-31", "type": "grupo", "name": "Sesión BONO 17:00-21:30 (J1-J4) [BONO]", "players": 4, "total_price": 0.00, "price_per_pax": 0.00},
  {"date": "2025-11-02", "type": "grupo", "name": "Sesión 9:00-13:30 (Pablo, Less, Cuco, Rubo, Adrián, Enano, Erik, Salo, Juan, Matey, Nallo)", "players": 11, "total_price": 85.00, "price_per_pax": 7.73},
  {"date": "2025-11-06", "type": "grupo", "name": "Sesión 17:45-20:45 (Chino, Pablo+3, Adri)", "players": 6, "total_price": 30.00, "price_per_pax": 5.00},
  {"date": "2025-11-20", "type": "grupo", "name": "Sesión 17:45-20:45 (Pablo, Pablo1, Adri, J1, J2, J3)", "players": 6, "total_price": 75.00, "price_per_pax": 12.50},
  {"date": "2025-11-23", "type": "grupo", "name": "Sesión 9:30-13:00 (Athal, Bercy, Pablo, Nano, Rodrigo, Hugo)", "players": 6, "total_price": 90.00, "price_per_pax": 15.00},
  {"date": "2025-11-30", "type": "grupo", "name": "Sesión 9:30-13:30 (Javier+alquiler, Alex, Franciscus, Drazziel, Samuel, Pablo, Enano, Alex, Alex)", "players": 9, "total_price": 145.00, "price_per_pax": 16.11},
  {"date": "2025-12-04", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J3) [BONO 2/4]", "players": 3, "total_price": 50.00, "price_per_pax": 16.67},
  {"date": "2025-12-12", "type": "grupo", "name": "Sesión 17:30-20:30 (J1-J7 BONO + J8 pago)", "players": 8, "total_price": 65.00, "price_per_pax": 8.13},
  {"date": "2025-12-19", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J4) [BONO 4/4]", "players": 4, "total_price": 50.00, "price_per_pax": 12.50},
  {"date": "2025-12-26", "type": "grupo", "name": "Sesión 17:30-20:30 (J1-J4)", "players": 4, "total_price": 60.00, "price_per_pax": 15.00},
  {"date": "2026-01-09", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 1/4]", "players": 5, "total_price": 47.50, "price_per_pax": 9.50},
  {"date": "2026-01-23", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 2/4]", "players": 5, "total_price": 47.50, "price_per_pax": 9.50},
  {"date": "2026-01-30", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 3/4]", "players": 5, "total_price": 47.50, "price_per_pax": 9.50},
  {"date": "2026-02-06", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 4/4]", "players": 5, "total_price": 47.50, "price_per_pax": 9.50},
  {"date": "2026-02-13", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 1/4]", "players": 5, "total_price": 31.25, "price_per_pax": 6.25},
  {"date": "2026-02-20", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 2/4]", "players": 5, "total_price": 31.25, "price_per_pax": 6.25},
  {"date": "2026-02-24", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 3/4]", "players": 5, "total_price": 31.25, "price_per_pax": 6.25},
  {"date": "2026-03-06", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 4/4]", "players": 5, "total_price": 31.25, "price_per_pax": 6.25},
  {"date": "2026-03-13", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 1/4]", "players": 5, "total_price": 37.50, "price_per_pax": 7.50},
  {"date": "2026-03-17", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 2/4]", "players": 5, "total_price": 37.50, "price_per_pax": 7.50},
  {"date": "2026-03-27", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 3/4]", "players": 5, "total_price": 37.50, "price_per_pax": 7.50},
  {"date": "2026-03-31", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 4/4]", "players": 5, "total_price": 37.50, "price_per_pax": 7.50},
  {"date": "2026-04-02", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 1/4]", "players": 5, "total_price": 56.25, "price_per_pax": 11.25},
  {"date": "2026-04-07", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 2/4]", "players": 5, "total_price": 56.25, "price_per_pax": 11.25},
  {"date": "2026-04-17", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 3/4]", "players": 5, "total_price": 56.25, "price_per_pax": 11.25},
  {"date": "2026-04-24", "type": "grupo", "name": "Sesión BONO 17:30-20:30 (J1-J5) [BONO 4/4]", "players": 5, "total_price": 56.25, "price_per_pax": 11.25}
]
"@

try {
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/attendance_logs" -Method Post -Headers $headers -Body $data
    Write-Host "Success!"
} catch {
    Write-Host "Error: $_"
}
