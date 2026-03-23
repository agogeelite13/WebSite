
# check_css.ps1 - Check CSS file for corruption indicators
param([string]$file = "styles.css")

$bytes = [System.IO.File]::ReadAllBytes($file)
$text = [System.Text.Encoding]::UTF8.GetString($bytes)

Write-Host "=== CSS File Analysis ==="
Write-Host "File: $file"
Write-Host "Bytes: $($bytes.Length)"
Write-Host "Chars: $($text.Length)"
Write-Host ""

# Check for null bytes
$nullCount = ($bytes | Where-Object { $_ -eq 0 }).Count
Write-Host "Null bytes: $nullCount"

# Check for lines with mixed content (very long single lines)
$lines = $text -split "`n"
Write-Host "Total lines: $($lines.Count)"

$longLines = $lines | Where-Object { $_.Length -gt 300 }
Write-Host "Lines > 300 chars: $($longLines.Count)"

if ($longLines.Count -gt 0) {
    Write-Host ""
    Write-Host "=== LONG LINES (first 3) ==="
    $longLines | Select-Object -First 3 | ForEach-Object {
        Write-Host "Length $($_.Length): $($_.Substring(0, [Math]::Min(200, $_.Length)))..."
    }
}

# Count key selectors
$navCount = ($lines | Select-String ".nav__" -SimpleMatch).Count
$drawerCount = ($lines | Select-String ".drawer" -SimpleMatch).Count
$bodyCount = ($lines | Select-String ":root" -SimpleMatch).Count
Write-Host ""
Write-Host "=== KEY SELECTORS ==="
Write-Host ".nav__ count: $navCount"
Write-Host ".drawer count: $drawerCount"
Write-Host ":root count: $bodyCount"
