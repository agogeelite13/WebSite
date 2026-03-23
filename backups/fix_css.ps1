
# fix_css.ps1 - Repair styles.css corruption
$inputFile = "styles.css"
$outputFile = "styles_repaired.css"

# Read bytes and convert to UTF-8
$bytes = [System.IO.File]::ReadAllBytes($inputFile)
$text = [System.Text.Encoding]::UTF8.GetString($bytes)

Write-Host "Original length: $($text.Length) chars"

# Write clean version
[System.IO.File]::WriteAllText($outputFile, $text, [System.Text.Encoding]::UTF8)

Write-Host "Repair complete. Output: $outputFile"
Write-Host "Last 500 chars:"
Write-Host $text.Substring($text.Length - 500)
