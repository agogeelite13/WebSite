
$cssPath = "c:/Users/sergiolopez/Desktop/Nueva carpeta/AgogeEliteAG/styles.css"
if (Test-Path $cssPath) {
    $content = [System.IO.File]::ReadAllText($cssPath)
    if ($content.Contains("`0")) {
        Write-Host "Detected Nulls. Fixing..."
        $clean = $content -replace "`0", ""
        [System.IO.File]::WriteAllText($cssPath, $clean, [System.Text.Encoding]::UTF8)
    } elseif ($content -match '( . ){10,}') {
        Write-Host "Detected Interleaved Spaces. Fixing..."
        $clean = $content -replace ' (?![ ])', ''
        [System.IO.File]::WriteAllText($cssPath, $clean, [System.Text.Encoding]::UTF8)
    } else {
        Write-Host "No artifacts detected. Re-saving as clean UTF8..."
        [System.IO.File]::WriteAllText($cssPath, $content, [System.Text.Encoding]::UTF8)
    }
    Write-Host "Encoding fix complete."
} else {
    Write-Host "File not found: $cssPath"
}
