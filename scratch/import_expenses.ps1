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
  {"date": "2026-04-24", "concept": "Bolsa de basura (3)", "category": "material", "amount": 2.70},
  {"date": "2026-04-24", "concept": "Cubo (1)", "category": "material", "amount": 4.50},
  {"date": "2026-04-24", "concept": "Fregona (1)", "category": "material", "amount": 1.20},
  {"date": "2026-04-24", "concept": "Palo de fregona (1)", "category": "material", "amount": 0.90},
  {"date": "2026-04-24", "concept": "Recogedor (1)", "category": "material", "amount": 3.50},
  {"date": "2026-04-24", "concept": "Reloj (1)", "category": "material", "amount": 29.95},
  {"date": "2026-04-24", "concept": "Candados (2)", "category": "material", "amount": 30.38},
  {"date": "2026-04-24", "concept": "Cronómetros (2)", "category": "material", "amount": 12.44},
  {"date": "2026-04-24", "concept": "Réplicas (3)", "category": "material", "amount": 412.17},
  {"date": "2026-04-24", "concept": "Cargadores (3)", "category": "material", "amount": 31.02},
  {"date": "2026-04-24", "concept": "Slings (3)", "category": "material", "amount": 25.62},
  {"date": "2026-04-24", "concept": "Gastos de envío", "category": "logistica", "amount": 24.00},
  {"date": "2026-04-24", "concept": "Lámpara (1)", "category": "material", "amount": 11.95}
]
"@

try {
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/expense_logs" -Method Post -Headers $headers -Body $data
    Write-Host "Success!"
} catch {
    Write-Host "Error: $_"
}
