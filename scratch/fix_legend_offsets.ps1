$path = "c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx"
$content = Get-Content $path -Raw

# Update all legend top values from 40 to 70 in the sensitivity section
$content = $content -replace 'top: \(chartSettings\.legendPosition === ''top'' \|\| chartSettings\.legendPosition === ''middle''\)\s*\?\s*40\s*:\s*undefined', 'top: (chartSettings.legendPosition === ''top'' || chartSettings.legendPosition === ''middle'') ? 70 : undefined'

$content | Set-Content $path -NoNewline
