$path = "c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx"
$content = Get-Content $path -Raw

# Fix Legend style objects with duplicate width/padding/maxWidth
# Pattern: property: "...", (other props), property: isMobile ? ...
$content = $content -replace 'width:\s*([''"].*?['']|.*?),(\s*.*?)\s*width:\s*isMobile\s*\?\s*([''"].*?[''])\s*:\s*([''"].*?[''])', 'width: isMobile ? $3 : $4,$2'
$content = $content -replace 'padding:\s*([''"].*?['']|.*?),(\s*.*?)\s*padding:\s*isMobile\s*\?\s*([''"].*?[''])\s*:\s*([''"].*?[''])', 'padding: isMobile ? $3 : $4,$2'
$content = $content -replace 'maxWidth:\s*([''"].*?['']|.*?),(\s*.*?)\s*maxWidth:\s*isMobile\s*\?\s*([''"].*?[''])\s*:\s*([''"].*?[''])', 'maxWidth: isMobile ? $3 : $4,$2'

$content | Set-Content $path -NoNewline
